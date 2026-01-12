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

export default router;
