import express from 'express';
import { pool } from '../db/pool';
import { AuthRequest, authRequired, creatorOnly } from '../middleware/auth';

const router = express.Router();

// 후원 Intent 생성 (치즈 보내기 버튼 클릭 시)
router.post('/intent', authRequired, async (req: AuthRequest, res) => {
  try {
    const { chzzkChannelId, amount } = req.body;

    if (!chzzkChannelId) {
      return res.status(400).json({ error: 'chzzkChannelId is required' });
    }

    // 유저 조회
    const userResult = await pool.query(
      'SELECT id FROM users WHERE chzzk_user_id = $1',
      [req.user?.sub]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const viewerUserId = userResult.rows[0].id;

    // 채널 조회/생성
    let channelResult = await pool.query(
      'SELECT id FROM channels WHERE chzzk_channel_id = $1',
      [chzzkChannelId]
    );

    let channelId: string;
    if (channelResult.rows.length === 0) {
      const insertResult = await pool.query(
        'INSERT INTO channels (chzzk_channel_id, name) VALUES ($1, $2) RETURNING id',
        [chzzkChannelId, chzzkChannelId]
      );
      channelId = insertResult.rows[0].id;
    } else {
      channelId = channelResult.rows[0].id;
    }

    // Intent 생성 (금액 포함)
    const intentResult = await pool.query(
      'INSERT INTO donation_intents (viewer_user_id, channel_id, intended_amount) VALUES ($1, $2, $3) RETURNING id',
      [viewerUserId, channelId, amount || null]
    );

    res.json({
      intentId: intentResult.rows[0].id,
      chzzkChannelId,
      amount: amount || null,
    });
  } catch (error) {
    console.error('Create intent error:', error);
    res.status(500).json({ error: 'Failed to create intent' });
  }
});

// 후원 발생 등록 (OCCURRED)
router.post('/occurred', authRequired, async (req: AuthRequest, res) => {
  try {
    const { intentId, message, amount } = req.body;

    if (!intentId || !message) {
      return res.status(400).json({ error: 'intentId and message are required' });
    }

    // Intent 조회
    const intentResult = await pool.query(
      `SELECT di.*, c.chzzk_channel_id 
       FROM donation_intents di
       JOIN channels c ON di.channel_id = c.id
       WHERE di.id = $1 AND di.viewer_user_id = (SELECT id FROM users WHERE chzzk_user_id = $2)`,
      [intentId, req.user?.sub]
    );

    if (intentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Intent not found' });
    }

    const intent = intentResult.rows[0];

    // Donation Event 생성
    const donationResult = await pool.query(
      `INSERT INTO donation_events 
       (intent_id, channel_id, viewer_user_id, amount, status, source)
       VALUES ($1, $2, $3, $4, 'OCCURRED', 'user_flow')
       RETURNING id`,
      [intentId, intent.channel_id, intent.viewer_user_id, amount || null]
    );

    const donationEventId = donationResult.rows[0].id;

    // Public Donation Message 생성
    await pool.query(
      `INSERT INTO messages 
       (channel_id, author_user_id, type, visibility, content, related_donation_id)
       VALUES ($1, $2, 'donation', 'public', $3, $4)`,
      [intent.channel_id, intent.viewer_user_id, message, donationEventId]
    );

    res.json({ ok: true, donationEventId });
  } catch (error) {
    console.error('Register occurred error:', error);
    res.status(500).json({ error: 'Failed to register donation' });
  }
});

// 후원 확정 (CONFIRMED) - Creator only
router.post('/:donationEventId/confirm', authRequired, async (req: AuthRequest, res) => {
  try {
    const { donationEventId } = req.params;
    const { amount } = req.body;

    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({ error: 'amount is required and must be a number' });
    }

    // Creator 권한 확인
    const userResult = await pool.query(
      'SELECT id, role FROM users WHERE chzzk_user_id = $1',
      [req.user?.sub]
    );

    if (userResult.rows[0]?.role !== 'creator' && userResult.rows[0]?.role !== 'admin') {
      return res.status(403).json({ error: 'Creator access required' });
    }

    const creatorId = userResult.rows[0].id;

    // Donation Event 확인 및 업데이트
    const donationResult = await pool.query(
      `UPDATE donation_events
       SET status = 'CONFIRMED',
           amount = $1,
           confirmed_at = now(),
           confirmed_by = $2
       WHERE id = $3
       RETURNING *`,
      [amount, creatorId, donationEventId]
    );

    if (donationResult.rows.length === 0) {
      return res.status(404).json({ error: 'Donation event not found' });
    }

    const donation = donationResult.rows[0];
    const viewerUserId = donation.viewer_user_id;
    const channelId = donation.channel_id;

    // 뱃지 자동 부여 로직
    let newBadges: any[] = [];
    try {
      // 유저의 누적 후원액 계산
      const totalResult = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) as total
         FROM donation_events
         WHERE channel_id = $1 AND viewer_user_id = $2 AND status = 'CONFIRMED'`,
        [channelId, viewerUserId]
      );

      const totalDonation = parseInt(totalResult.rows[0].total) || 0;

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
        [channelId, totalDonation, viewerUserId]
      );

      // 새 뱃지 부여
      for (const badge of eligibleBadges.rows) {
        await pool.query(
          `INSERT INTO user_badges (user_id, channel_id, badge_id)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, channel_id, badge_id) DO NOTHING`,
          [viewerUserId, channelId, badge.id]
        );
        newBadges.push(badge);
      }
    } catch (badgeError) {
      console.error('Badge grant error (non-critical):', badgeError);
      // 뱃지 부여 실패해도 후원 확정은 성공으로 처리
    }

    res.json({ 
      ok: true, 
      donation: donation,
      newBadges: newBadges,
    });
  } catch (error) {
    console.error('Confirm donation error:', error);
    res.status(500).json({ error: 'Failed to confirm donation' });
  }
});

// 후원 완료 후 메시지 등록 (OCCURRED 상태로 변경 및 메시지 생성)
router.post('/:intentId/complete', authRequired, async (req: AuthRequest, res) => {
  try {
    const { intentId } = req.params;
    const { message, amount, visibility = 'public' } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'message is required' });
    }

    // visibility 검증
    const messageVisibility = visibility === 'private' ? 'private' : 'public';

    // 유저 조회
    const userResult = await pool.query(
      'SELECT id FROM users WHERE chzzk_user_id = $1',
      [req.user?.sub]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const viewerUserId = userResult.rows[0].id;

    // Intent 조회 및 소유자 확인
    const intentResult = await pool.query(
      `SELECT di.*, c.chzzk_channel_id 
       FROM donation_intents di
       JOIN channels c ON di.channel_id = c.id
       WHERE di.id = $1 AND di.viewer_user_id = $2`,
      [intentId, viewerUserId]
    );

    if (intentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Intent not found' });
    }

    const intent = intentResult.rows[0];
    // Intent에 저장된 금액 또는 요청으로 받은 금액 사용
    const finalAmount = amount || intent.intended_amount || null;

    // 이미 완료된 Intent인지 확인
    const existingDonation = await pool.query(
      'SELECT id FROM donation_events WHERE intent_id = $1',
      [intentId]
    );

    let donationEventId: string;

    if (existingDonation.rows.length > 0) {
      // 이미 존재하는 경우 업데이트 (금액 포함)
      donationEventId = existingDonation.rows[0].id;
      await pool.query(
        `UPDATE donation_events 
         SET status = 'OCCURRED', 
             amount = COALESCE($2, amount),
             occurred_at = COALESCE(occurred_at, now())
         WHERE id = $1`,
        [donationEventId, finalAmount]
      );
    } else {
      // 새로 생성 (금액 포함)
      const donationResult = await pool.query(
        `INSERT INTO donation_events 
         (intent_id, channel_id, viewer_user_id, amount, status, source)
         VALUES ($1, $2, $3, $4, 'OCCURRED', 'user_flow')
         RETURNING id`,
        [intentId, intent.channel_id, intent.viewer_user_id, finalAmount]
      );
      donationEventId = donationResult.rows[0].id;
    }

    // 메시지가 이미 존재하는지 확인
    const existingMessage = await pool.query(
      'SELECT id FROM messages WHERE related_donation_id = $1',
      [donationEventId]
    );

    if (existingMessage.rows.length === 0) {
      // Donation Message 생성 (공개 또는 비공개)
      await pool.query(
        `INSERT INTO messages 
         (channel_id, author_user_id, type, visibility, content, related_donation_id)
         VALUES ($1, $2, 'donation', $3, $4, $5)`,
        [intent.channel_id, intent.viewer_user_id, messageVisibility, message.trim(), donationEventId]
      );
    } else {
      // 기존 메시지 업데이트 (visibility 포함)
      await pool.query(
        `UPDATE messages 
         SET content = $1, visibility = $2, updated_at = now()
         WHERE related_donation_id = $3`,
        [message.trim(), messageVisibility, donationEventId]
      );
    }

    res.json({ 
      ok: true, 
      donationEventId,
      amount: finalAmount,
      visibility: messageVisibility,
      message: messageVisibility === 'public' 
        ? '후원 메시지가 공개로 등록되었습니다.' 
        : '후원 메시지가 크리에이터에게만 비공개로 전달되었습니다.'
    });
  } catch (error) {
    console.error('Complete donation error:', error);
    res.status(500).json({ error: 'Failed to complete donation' });
  }
});

// 후원 목록 조회 (Creator 대시보드용)
router.get('/', authRequired, async (req: AuthRequest, res) => {
  try {
    const { chzzkChannelId, status } = req.query;

    let query = `
      SELECT de.*, u.display_name, u.chzzk_user_id, c.chzzk_channel_id
      FROM donation_events de
      JOIN users u ON de.viewer_user_id = u.id
      JOIN channels c ON de.channel_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (chzzkChannelId) {
      query += ` AND c.chzzk_channel_id = $${paramIndex}`;
      params.push(chzzkChannelId);
      paramIndex++;
    }

    if (status) {
      query += ` AND de.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY de.occurred_at DESC LIMIT 50`;

    const result = await pool.query(query, params);
    res.json({ donations: result.rows });
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ error: 'Failed to get donations' });
  }
});

export default router;
