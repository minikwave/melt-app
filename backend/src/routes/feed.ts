import express from 'express';
import { pool } from '../db/pool';

const router = express.Router();

// 공개 피드 조회
router.get('/', async (req, res) => {
  try {
    const { chzzkChannelId, cursor } = req.query;

    if (!chzzkChannelId) {
      return res.status(400).json({ error: 'chzzkChannelId is required' });
    }

    // 채널 조회
    const channelResult = await pool.query(
      'SELECT id FROM channels WHERE chzzk_channel_id = $1',
      [chzzkChannelId]
    );

    if (channelResult.rows.length === 0) {
      return res.json({ feed: [], nextCursor: null });
    }

    const channelId = channelResult.rows[0].id;

    // 공개 피드 조회:
    // 1. DonationMessage (public)
    // 2. CreatorPost (public)
    // 3. RT된 DM (retweets join)
    // 4. CreatorReply (public)

    let query = `
      SELECT DISTINCT ON (m.id)
        m.*,
        u.display_name,
        u.chzzk_user_id,
        rt.id as retweet_id,
        de.amount as donation_amount,
        de.status as donation_status
      FROM messages m
      JOIN users u ON m.author_user_id = u.id
      LEFT JOIN retweets rt ON m.id = rt.message_id
      LEFT JOIN donation_events de ON m.related_donation_id = de.id
      WHERE m.channel_id = $1
        AND (
          m.visibility = 'public'
          OR rt.id IS NOT NULL
        )
    `;

    const params: any[] = [channelId];
    let paramIndex = 2;

    if (cursor) {
      query += ` AND m.created_at < $${paramIndex}`;
      params.push(cursor);
      paramIndex++;
    }

    query += ` ORDER BY m.created_at DESC LIMIT 20`;

    const result = await pool.query(query, params);

    const feed = result.rows.map((row) => ({
      id: row.id,
      type: row.type,
      content: row.content,
      author: {
        chzzkUserId: row.chzzk_user_id,
        displayName: row.display_name,
      },
      donationAmount: row.donation_amount,
      donationStatus: row.donation_status,
      isRetweet: !!row.retweet_id,
      createdAt: row.created_at,
    }));

    const nextCursor = feed.length > 0 ? feed[feed.length - 1].createdAt : null;

    res.json({ feed, nextCursor });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ error: 'Failed to get feed' });
  }
});

export default router;
