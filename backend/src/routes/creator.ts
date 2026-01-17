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

    // 채널 조회
    const channelResult = await pool.query(
      'SELECT id FROM channels WHERE chzzk_channel_id = $1',
      [chzzkChannelId]
    );

    if (channelResult.rows.length === 0) {
      return res.json({ dms: [], pendingDonations: [] });
    }

    const channelId = channelResult.rows[0].id;

    // 비공개 DM 조회
    const dmResult = await pool.query(
      `SELECT m.*, u.display_name, u.chzzk_user_id
       FROM messages m
       JOIN users u ON m.author_user_id = u.id
       WHERE m.channel_id = $1
         AND m.visibility = 'private'
         AND m.type IN ('dm', 'creator_reply')
       ORDER BY m.created_at DESC
       LIMIT 50`,
      [channelId]
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

// 통계 요약 (Phase 2)
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

export default router;
