import express from 'express';
import { pool } from '../db/pool';
import { AuthRequest, authRequired } from '../middleware/auth';

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

    // 현재 사용자 ID (선택적 - 로그인한 경우에만 읽음 상태 포함)
    const currentUserId = (req as any).user?.sub || null;
    let userIdForReadCheck: string | null = null;
    let currentUserRole: string | null = null;
    let isChannelOwner: boolean = false;
    
    if (currentUserId) {
      const userResult = await pool.query(
        'SELECT id, role FROM users WHERE chzzk_user_id = $1',
        [currentUserId]
      );
      if (userResult.rows.length > 0) {
        userIdForReadCheck = userResult.rows[0].id;
        currentUserRole = userResult.rows[0].role;
        
        // 채널 소유자 확인 (크리에이터가 자신의 방인지 확인)
        const ownerCheck = await pool.query(
          'SELECT owner_user_id FROM channels WHERE id = $1',
          [channelId]
        );
        if (ownerCheck.rows.length > 0 && ownerCheck.rows[0].owner_user_id === userIdForReadCheck) {
          isChannelOwner = true;
        }
      }
    }

    const params: any[] = [channelId];
    let paramIndex = 2;

    let query = `
      SELECT
        m.*,
        u.display_name,
        u.chzzk_user_id,
        rt.id as retweet_id,
        de.amount as donation_amount,
        de.status as donation_status,
        CASE 
          WHEN $${paramIndex} IS NOT NULL THEN 
            EXISTS (
              SELECT 1 FROM message_reads mr 
              WHERE mr.message_id = m.id AND mr.user_id = $${paramIndex}
            )
          ELSE false
        END as is_read
      FROM messages m
      JOIN users u ON m.author_user_id = u.id
      LEFT JOIN retweets rt ON m.id = rt.message_id
      LEFT JOIN donation_events de ON m.related_donation_id = de.id
      WHERE m.channel_id = $1
        AND (
          m.visibility = 'public'
          OR rt.id IS NOT NULL
          OR (
            $${paramIndex + 1} = true
            AND m.type = 'creator_reply'
            AND m.author_user_id = $${paramIndex}
            AND m.visibility = 'private'
          )
          OR (
            m.type = 'donation'
            AND m.visibility = 'private'
            AND m.author_user_id = $${paramIndex}
          )
        )
    `;
    
    params.push(userIdForReadCheck);
    paramIndex++;
    params.push(isChannelOwner);
    paramIndex++;

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
      isRead: row.is_read || false,
      createdAt: row.created_at,
    }));

    const nextCursor = feed.length > 0 ? feed[feed.length - 1].createdAt : null;

    res.json({ feed, nextCursor });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ error: 'Failed to get feed' });
  }
});

// 메시지 읽음 처리
router.post('/:messageId/read', authRequired, async (req: AuthRequest, res) => {
  try {
    const { messageId } = req.params;

    // 유저 조회
    const userResult = await pool.query(
      'SELECT id FROM users WHERE chzzk_user_id = $1',
      [req.user?.sub]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userResult.rows[0].id;

    // 메시지 읽음 처리 (중복 방지)
    await pool.query(
      `INSERT INTO message_reads (message_id, user_id, read_at)
       VALUES ($1, $2, now())
       ON CONFLICT (message_id, user_id) DO UPDATE SET read_at = now()`,
      [messageId, userId]
    );

    res.json({ ok: true });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

export default router;
