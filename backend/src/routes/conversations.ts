import express from 'express';
import { pool } from '../db/pool';
import { AuthRequest, authRequired } from '../middleware/auth';

const router = express.Router();

// 대화방 목록 (팔로우한 채널별 최신 메시지 요약)
router.get('/', authRequired, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        c.id,
        c.chzzk_channel_id,
        c.name,
        c.channel_url,
        u.display_name as owner_name,
        -- 최신 메시지
        (SELECT m.content 
         FROM messages m 
         WHERE m.channel_id = c.id 
           AND (m.visibility = 'public' OR m.author_user_id = (SELECT id FROM users WHERE chzzk_user_id = $1))
         ORDER BY m.created_at DESC 
         LIMIT 1) as last_message,
        (SELECT m.created_at 
         FROM messages m 
         WHERE m.channel_id = c.id 
           AND (m.visibility = 'public' OR m.author_user_id = (SELECT id FROM users WHERE chzzk_user_id = $1))
         ORDER BY m.created_at DESC 
         LIMIT 1) as last_message_at,
        -- 안읽은 메시지 수
        (SELECT COUNT(*) 
         FROM messages m
         WHERE m.channel_id = c.id
           AND m.visibility = 'public'
           AND m.created_at > COALESCE(
             (SELECT MAX(read_at) FROM message_reads mr
              WHERE mr.user_id = (SELECT id FROM users WHERE chzzk_user_id = $1)
                AND mr.message_id IN (SELECT id FROM messages WHERE channel_id = c.id)),
             '1970-01-01'::timestamptz
           )) as unread_count,
        uf.created_at as followed_at
       FROM user_follows uf
       JOIN channels c ON uf.channel_id = c.id
       LEFT JOIN users u ON c.owner_user_id = u.id
       WHERE uf.user_id = (SELECT id FROM users WHERE chzzk_user_id = $1)
       ORDER BY 
         CASE WHEN (SELECT m.created_at FROM messages m 
                    WHERE m.channel_id = c.id 
                      AND (m.visibility = 'public' OR m.author_user_id = (SELECT id FROM users WHERE chzzk_user_id = $1))
                    ORDER BY m.created_at DESC LIMIT 1) IS NOT NULL
           THEN (SELECT m.created_at FROM messages m 
                 WHERE m.channel_id = c.id 
                   AND (m.visibility = 'public' OR m.author_user_id = (SELECT id FROM users WHERE chzzk_user_id = $1))
                 ORDER BY m.created_at DESC LIMIT 1)
           ELSE uf.created_at
         END DESC`,
      [req.user?.sub]
    );

    res.json({ conversations: result.rows });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// 읽지 않은 메시지 수 조회
router.get('/unread-count', authRequired, async (req: AuthRequest, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id FROM users WHERE chzzk_user_id = $1',
      [req.user?.sub]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userResult.rows[0].id;

    // 팔로우한 채널들의 읽지 않은 공개 메시지 수 집계
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_unread,
        COUNT(DISTINCT c.id) as channels_with_unread
       FROM user_follows uf
       JOIN channels c ON uf.channel_id = c.id
       JOIN messages m ON m.channel_id = c.id
       WHERE uf.user_id = $1
         AND m.visibility = 'public'
         AND m.created_at > COALESCE(
           (SELECT MAX(read_at) FROM message_reads mr
            WHERE mr.user_id = $1
              AND mr.message_id IN (SELECT id FROM messages WHERE channel_id = c.id)),
           '1970-01-01'::timestamptz
         )
         AND NOT EXISTS (
           SELECT 1 FROM message_reads mr
           WHERE mr.message_id = m.id AND mr.user_id = $1
         )`,
      [userId]
    );

    const total = parseInt(result.rows[0].total_unread) || 0;
    res.json({
      totalUnread: total,
      unreadCount: total,
      channelsWithUnread: parseInt(result.rows[0].channels_with_unread) || 0,
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// 메시지 읽음 처리
router.post('/:chzzkChannelId/read', authRequired, async (req: AuthRequest, res) => {
  try {
    const { chzzkChannelId } = req.params;

    const userResult = await pool.query(
      'SELECT id FROM users WHERE chzzk_user_id = $1',
      [req.user?.sub]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userResult.rows[0].id;

    const channelResult = await pool.query(
      'SELECT id FROM channels WHERE chzzk_channel_id = $1',
      [chzzkChannelId]
    );

    if (channelResult.rows.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const channelId = channelResult.rows[0].id;

    // 해당 채널의 모든 공개 메시지를 읽음 처리
    await pool.query(
      `INSERT INTO message_reads (message_id, user_id)
       SELECT m.id, $1
       FROM messages m
       WHERE m.channel_id = $2
         AND m.visibility = 'public'
         AND m.id NOT IN (SELECT message_id FROM message_reads WHERE user_id = $1)
       ON CONFLICT (message_id, user_id) DO NOTHING`,
      [userId, channelId]
    );

    res.json({ ok: true });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

export default router;
