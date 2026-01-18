import express from 'express';
import { pool } from '../db/pool';
import { AuthRequest, authRequired } from '../middleware/auth';

const router = express.Router();

// Creator 인박스 (DM + 미확정 후원)
router.get('/inbox', authRequired, async (req: AuthRequest, res) => {
  try {
    const { chzzkChannelId } = req.query;

    if (!chzzkChannelId) {
      return res.status(400).json({ error: 'chzzkChannelId is required' });
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

    // 채널 조회
    const channelResult = await pool.query(
      'SELECT id, owner_user_id FROM channels WHERE chzzk_channel_id = $1',
      [chzzkChannelId]
    );

    if (channelResult.rows.length === 0) {
      return res.json({ dms: [], pendingDonations: [] });
    }

    const channelId = channelResult.rows[0].id;
    const isChannelOwner = channelResult.rows[0].owner_user_id === userId;

    // 비공개 메시지 조회 (DM, 크리에이터 답장, 비공개 치즈 후원)
    // 크리에이터가 자신의 방인 경우 모든 비공개 메시지를 볼 수 있음
    const dmResult = await pool.query(
      `SELECT m.*, u.display_name, u.chzzk_user_id, de.amount as donation_amount
       FROM messages m
       JOIN users u ON m.author_user_id = u.id
       LEFT JOIN donation_events de ON m.related_donation_id = de.id
       WHERE m.channel_id = $1
         AND m.visibility = 'private'
         AND (
           m.type IN ('dm', 'creator_reply', 'donation')
           OR (m.type = 'creator_reply' AND m.author_user_id = $2 AND $3 = true)
         )
       ORDER BY m.created_at DESC
       LIMIT 50`,
      [channelId, userId, isChannelOwner]
    );

    // 미확정 후원 조회
    const donationResult = await pool.query(
      `SELECT de.*, u.display_name, u.chzzk_user_id, m.content as message_content
       FROM donation_events de
       JOIN users u ON de.viewer_user_id = u.id
       LEFT JOIN messages m ON m.related_donation_id = de.id
       WHERE de.channel_id = $1
         AND de.status != 'CONFIRMED'
       ORDER BY de.occurred_at DESC
       LIMIT 50`,
      [channelId]
    );

    res.json({
      dms: dmResult.rows,
      pendingDonations: donationResult.rows,
    });
  } catch (error) {
    console.error('Get inbox error:', error);
    res.status(500).json({ error: 'Failed to get inbox' });
  }
});

// 통계 요약 (Phase 2) - /stats/summary 별칭
router.get('/stats/summary', authRequired, async (req: AuthRequest, res) => {
  try {
    const { chzzkChannelId, range = '30d' } = req.query;

    if (!chzzkChannelId) {
      return res.status(400).json({ error: 'chzzkChannelId is required' });
    }

    // 채널 조회
    const channelResult = await pool.query(
      'SELECT id FROM channels WHERE chzzk_channel_id = $1',
      [chzzkChannelId]
    );

    if (channelResult.rows.length === 0) {
      return res.json({ total: 0, confirmed: 0, pending: 0 });
    }

    const channelId = channelResult.rows[0].id;

    // 기간 계산
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    // 통계 조회
    const statsResult = await pool.query(
      `SELECT 
         COUNT(*) as total,
         COUNT(*) FILTER (WHERE status = 'CONFIRMED') as confirmed,
         COUNT(*) FILTER (WHERE status != 'CONFIRMED') as pending,
         COALESCE(SUM(amount) FILTER (WHERE status = 'CONFIRMED'), 0) as total_amount
       FROM donation_events
       WHERE channel_id = $1
         AND occurred_at >= $2`,
      [channelId, sinceDate]
    );

    res.json({
      total: parseInt(statsResult.rows[0].total),
      confirmed: parseInt(statsResult.rows[0].confirmed),
      pending: parseInt(statsResult.rows[0].pending),
      totalAmount: parseInt(statsResult.rows[0].total_amount),
      period: range,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// 통계 상세 (기간별 필터, Top Supporters 포함)
router.get('/stats', authRequired, async (req: AuthRequest, res) => {
  try {
    const { chzzkChannelId, period = 'week' } = req.query;

    if (!chzzkChannelId) {
      return res.status(400).json({ error: 'chzzkChannelId is required' });
    }

    // 채널 조회
    const channelResult = await pool.query(
      'SELECT id FROM channels WHERE chzzk_channel_id = $1',
      [chzzkChannelId]
    );

    if (channelResult.rows.length === 0) {
      return res.json({ 
        totalAmount: 0, 
        totalCount: 0, 
        averageAmount: 0,
        topSupporters: [],
        period 
      });
    }

    const channelId = channelResult.rows[0].id;

    // 기간 계산
    const days = period === 'day' ? 1 : period === 'week' ? 7 : 30;
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    // 기본 통계 조회 (CONFIRMED만)
    const statsResult = await pool.query(
      `SELECT 
         COUNT(*) as total_count,
         COALESCE(SUM(amount), 0) as total_amount,
         COALESCE(AVG(amount), 0) as average_amount
       FROM donation_events
       WHERE channel_id = $1
         AND status = 'CONFIRMED'
         AND occurred_at >= $2`,
      [channelId, sinceDate]
    );

    const totalCount = parseInt(statsResult.rows[0].total_count) || 0;
    const totalAmount = parseInt(statsResult.rows[0].total_amount) || 0;
    const averageAmount = totalCount > 0 ? Math.round(totalAmount / totalCount) : 0;

    // Top Supporters 조회
    const topSupportersResult = await pool.query(
      `SELECT 
         u.chzzk_user_id,
         u.display_name,
         COUNT(*) as count,
         COALESCE(SUM(de.amount), 0) as total_amount
       FROM donation_events de
       JOIN users u ON de.viewer_user_id = u.id
       WHERE de.channel_id = $1
         AND de.status = 'CONFIRMED'
         AND de.occurred_at >= $2
       GROUP BY u.id, u.chzzk_user_id, u.display_name
       ORDER BY total_amount DESC, count DESC
       LIMIT 10`,
      [channelId, sinceDate]
    );

    const topSupporters = topSupportersResult.rows.map((row) => ({
      chzzk_user_id: row.chzzk_user_id,
      display_name: row.display_name,
      count: parseInt(row.count),
      totalAmount: parseInt(row.total_amount),
    }));

    res.json({
      totalAmount,
      totalCount,
      averageAmount,
      topSupporters,
      period,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// 크리에이터 인박스 읽지 않은 메시지 수
router.get('/inbox/unread-count', authRequired, async (req: AuthRequest, res) => {
  try {
    const { chzzkChannelId } = req.query;

    if (!chzzkChannelId) {
      return res.status(400).json({ error: 'chzzkChannelId is required' });
    }

    // 채널 조회 및 소유자 확인
    const channelResult = await pool.query(
      `SELECT c.id, c.owner_user_id, u.chzzk_user_id as owner_chzzk_id
       FROM channels c
       LEFT JOIN users u ON c.owner_user_id = u.id
       WHERE c.chzzk_channel_id = $1`,
      [chzzkChannelId]
    );

    if (channelResult.rows.length === 0) {
      return res.json({ unreadDms: 0, pendingDonations: 0 });
    }

    const channel = channelResult.rows[0];

    // 크리에이터 확인
    const userResult = await pool.query(
      'SELECT id FROM users WHERE chzzk_user_id = $1',
      [req.user?.sub]
    );

    if (userResult.rows.length === 0 || userResult.rows[0].id !== channel.owner_user_id) {
      return res.status(403).json({ error: 'Not the channel owner' });
    }

    const channelId = channel.id;

    // 읽지 않은 DM 수
    const dmResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM messages m
       WHERE m.channel_id = $1
         AND m.visibility = 'private'
         AND m.type IN ('dm', 'creator_reply')
         AND NOT EXISTS (
           SELECT 1 FROM message_reads mr
           WHERE mr.message_id = m.id AND mr.user_id = $2
         )`,
      [channelId, channel.owner_user_id]
    );

    // 미확정 후원 수
    const donationResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM donation_events de
       WHERE de.channel_id = $1
         AND de.status != 'CONFIRMED'`,
      [channelId]
    );

    res.json({
      unreadDms: parseInt(dmResult.rows[0].count) || 0,
      pendingDonations: parseInt(donationResult.rows[0].count) || 0,
    });
  } catch (error) {
    console.error('Get inbox unread count error:', error);
    res.status(500).json({ error: 'Failed to get inbox unread count' });
  }
});

// 인기 크리에이터 목록 (인증 불필요 - 둘러보기용)
router.get('/popular', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // 팔로워 수 기준으로 정렬된 크리에이터 목록
    const result = await pool.query(
      `SELECT 
        c.id,
        c.chzzk_channel_id,
        c.name,
        c.channel_url,
        u.display_name as owner_name,
        (SELECT COUNT(*) FROM user_follows WHERE channel_id = c.id) as follower_count
       FROM channels c
       LEFT JOIN users u ON c.owner_user_id = u.id
       WHERE c.owner_user_id IS NOT NULL
       ORDER BY follower_count DESC, c.name ASC
       LIMIT $1`,
      [parseInt(limit as string)]
    );

    res.json({ creators: result.rows });
  } catch (error) {
    console.error('Get popular creators error:', error);
    res.status(500).json({ error: 'Failed to get popular creators' });
  }
});

export default router;
