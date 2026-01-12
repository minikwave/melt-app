import express from 'express';
import { pool } from '../db/pool';
import { AuthRequest, authRequired, creatorOnly } from '../middleware/auth';

const router = express.Router();

// 후원 Intent 생성 (치즈 보내기 버튼 클릭 시)
router.post('/intent', authRequired, async (req: AuthRequest, res) => {
  try {
    const { chzzkChannelId } = req.body;

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

    // Intent 생성
    const intentResult = await pool.query(
      'INSERT INTO donation_intents (viewer_user_id, channel_id) VALUES ($1, $2) RETURNING id',
      [viewerUserId, channelId]
    );

    res.json({
      intentId: intentResult.rows[0].id,
      chzzkChannelId,
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

    res.json({ ok: true, donation: donationResult.rows[0] });
  } catch (error) {
    console.error('Confirm donation error:', error);
    res.status(500).json({ error: 'Failed to confirm donation' });
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
