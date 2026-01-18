import express from 'express';
import { pool } from '../db/pool';
import { AuthRequest, authRequired } from '../middleware/auth';

const router = express.Router();

// 채널의 뱃지 티어 목록 조회
router.get('/:chzzkChannelId/tiers', async (req, res) => {
  try {
    const { chzzkChannelId } = req.params;

    // 채널 조회
    const channelResult = await pool.query(
      'SELECT id FROM channels WHERE chzzk_channel_id = $1',
      [chzzkChannelId]
    );

    if (channelResult.rows.length === 0) {
      return res.json({ tiers: [] });
    }

    const channelId = channelResult.rows[0].id;

    // 뱃지 티어 조회
    const tiersResult = await pool.query(
      `SELECT id, tier, threshold_amount, created_at
       FROM badges
       WHERE channel_id = $1
       ORDER BY threshold_amount ASC`,
      [channelId]
    );

    res.json({ tiers: tiersResult.rows });
  } catch (error) {
    console.error('Get badge tiers error:', error);
    res.status(500).json({ error: 'Failed to get badge tiers' });
  }
});

// 뱃지 티어 설정 (크리에이터 전용)
router.post('/:chzzkChannelId/tiers', authRequired, async (req: AuthRequest, res) => {
  try {
    const { chzzkChannelId } = req.params;
    const { tiers } = req.body;

    // tiers: [{ tier: 'bronze', threshold_amount: 10000 }, ...]
    if (!tiers || !Array.isArray(tiers)) {
      return res.status(400).json({ error: 'tiers array is required' });
    }

    // 유저 조회
    const userResult = await pool.query(
      'SELECT id, role FROM users WHERE chzzk_user_id = $1',
      [req.user?.sub]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userResult.rows[0].id;
    const userRole = userResult.rows[0].role;

    // 채널 조회 및 소유자 확인
    const channelResult = await pool.query(
      'SELECT id, owner_user_id FROM channels WHERE chzzk_channel_id = $1',
      [chzzkChannelId]
    );

    if (channelResult.rows.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const channelId = channelResult.rows[0].id;
    const ownerId = channelResult.rows[0].owner_user_id;

    // 권한 확인 (채널 소유자 또는 관리자)
    if (ownerId !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to set badge tiers' });
    }

    // 트랜잭션으로 기존 티어 삭제 후 새로 추가
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 기존 티어 삭제 (user_badges가 참조하지 않는 것만)
      await client.query(
        `DELETE FROM badges 
         WHERE channel_id = $1 
         AND id NOT IN (SELECT DISTINCT badge_id FROM user_badges)`,
        [channelId]
      );

      // 새 티어 추가 (UPSERT)
      for (const tier of tiers) {
        if (!tier.tier || tier.threshold_amount === undefined) continue;

        await client.query(
          `INSERT INTO badges (channel_id, tier, threshold_amount)
           VALUES ($1, $2, $3)
           ON CONFLICT (channel_id, tier) DO UPDATE SET threshold_amount = $3`,
          [channelId, tier.tier, tier.threshold_amount]
        );
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    // 업데이트된 티어 목록 반환
    const updatedTiers = await pool.query(
      `SELECT id, tier, threshold_amount, created_at
       FROM badges
       WHERE channel_id = $1
       ORDER BY threshold_amount ASC`,
      [channelId]
    );

    res.json({ tiers: updatedTiers.rows });
  } catch (error) {
    console.error('Set badge tiers error:', error);
    res.status(500).json({ error: 'Failed to set badge tiers' });
  }
});

// 특정 유저의 특정 채널에서 뱃지 조회
router.get('/:chzzkChannelId/user/:chzzkUserId', async (req, res) => {
  try {
    const { chzzkChannelId, chzzkUserId } = req.params;

    // 채널 조회
    const channelResult = await pool.query(
      'SELECT id FROM channels WHERE chzzk_channel_id = $1',
      [chzzkChannelId]
    );

    if (channelResult.rows.length === 0) {
      return res.json({ badges: [], totalDonation: 0 });
    }

    const channelId = channelResult.rows[0].id;

    // 유저 조회
    const userResult = await pool.query(
      'SELECT id FROM users WHERE chzzk_user_id = $1',
      [chzzkUserId]
    );

    if (userResult.rows.length === 0) {
      return res.json({ badges: [], totalDonation: 0 });
    }

    const userId = userResult.rows[0].id;

    // 누적 후원액 계산
    const donationResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM donation_events
       WHERE channel_id = $1 AND viewer_user_id = $2 AND status = 'CONFIRMED'`,
      [channelId, userId]
    );

    const totalDonation = parseInt(donationResult.rows[0].total) || 0;

    // 유저가 획득한 뱃지 목록
    const badgesResult = await pool.query(
      `SELECT b.id, b.tier, b.threshold_amount, ub.achieved_at
       FROM user_badges ub
       JOIN badges b ON ub.badge_id = b.id
       WHERE ub.user_id = $1 AND ub.channel_id = $2
       ORDER BY b.threshold_amount DESC`,
      [userId, channelId]
    );

    res.json({
      badges: badgesResult.rows,
      totalDonation,
      highestBadge: badgesResult.rows[0] || null,
    });
  } catch (error) {
    console.error('Get user badges error:', error);
    res.status(500).json({ error: 'Failed to get user badges' });
  }
});

// 뱃지 자동 부여 (후원 확정 시 호출)
router.post('/:chzzkChannelId/check-and-grant', authRequired, async (req: AuthRequest, res) => {
  try {
    const { chzzkChannelId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // 채널 조회
    const channelResult = await pool.query(
      'SELECT id FROM channels WHERE chzzk_channel_id = $1',
      [chzzkChannelId]
    );

    if (channelResult.rows.length === 0) {
      return res.json({ newBadges: [] });
    }

    const channelId = channelResult.rows[0].id;

    // 유저의 누적 후원액 계산
    const donationResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM donation_events
       WHERE channel_id = $1 AND viewer_user_id = $2 AND status = 'CONFIRMED'`,
      [channelId, userId]
    );

    const totalDonation = parseInt(donationResult.rows[0].total) || 0;

    // 아직 획득하지 않은 뱃지 중 자격이 되는 것 찾기
    const eligibleBadges = await pool.query(
      `SELECT b.id, b.tier, b.threshold_amount
       FROM badges b
       WHERE b.channel_id = $1
         AND b.threshold_amount <= $2
         AND b.id NOT IN (
           SELECT badge_id FROM user_badges 
           WHERE user_id = $3 AND channel_id = $1
         )
       ORDER BY b.threshold_amount ASC`,
      [channelId, totalDonation, userId]
    );

    const newBadges = [];

    // 새 뱃지 부여
    for (const badge of eligibleBadges.rows) {
      await pool.query(
        `INSERT INTO user_badges (user_id, channel_id, badge_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, channel_id, badge_id) DO NOTHING`,
        [userId, channelId, badge.id]
      );
      newBadges.push(badge);
    }

    res.json({ newBadges, totalDonation });
  } catch (error) {
    console.error('Check and grant badges error:', error);
    res.status(500).json({ error: 'Failed to check and grant badges' });
  }
});

// 채널의 뱃지 보유자 목록 (VIP 리스트)
router.get('/:chzzkChannelId/holders', async (req, res) => {
  try {
    const { chzzkChannelId } = req.params;
    const { tier, limit = '50' } = req.query;

    // 채널 조회
    const channelResult = await pool.query(
      'SELECT id FROM channels WHERE chzzk_channel_id = $1',
      [chzzkChannelId]
    );

    if (channelResult.rows.length === 0) {
      return res.json({ holders: [] });
    }

    const channelId = channelResult.rows[0].id;

    let query = `
      SELECT DISTINCT ON (u.id)
        u.id, u.chzzk_user_id, u.display_name,
        b.tier, b.threshold_amount,
        ub.achieved_at,
        (
          SELECT COALESCE(SUM(amount), 0)
          FROM donation_events
          WHERE channel_id = $1 AND viewer_user_id = u.id AND status = 'CONFIRMED'
        ) as total_donation
      FROM user_badges ub
      JOIN users u ON ub.user_id = u.id
      JOIN badges b ON ub.badge_id = b.id
      WHERE ub.channel_id = $1
    `;

    const params: any[] = [channelId];
    let paramIndex = 2;

    if (tier) {
      query += ` AND b.tier = $${paramIndex}`;
      params.push(tier);
      paramIndex++;
    }

    query += `
      ORDER BY u.id, b.threshold_amount DESC
    `;

    const result = await pool.query(query, params);

    // 중복 제거 및 가장 높은 티어만 유지
    const holdersMap = new Map();
    for (const row of result.rows) {
      if (!holdersMap.has(row.id)) {
        holdersMap.set(row.id, row);
      }
    }

    const holders = Array.from(holdersMap.values())
      .sort((a, b) => parseInt(b.total_donation) - parseInt(a.total_donation))
      .slice(0, parseInt(limit as string));

    res.json({ holders });
  } catch (error) {
    console.error('Get badge holders error:', error);
    res.status(500).json({ error: 'Failed to get badge holders' });
  }
});

export default router;
