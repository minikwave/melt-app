import express from 'express';
import { pool } from '../db/pool';
import { AuthRequest, authRequired } from '../middleware/auth';

const router = express.Router();

// 크리에이터 검색
router.get('/creators', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    const searchQuery = q as string;

    if (!searchQuery || searchQuery.trim().length === 0) {
      return res.json({ creators: [] });
    }

    // 채널 ID 또는 이름으로 검색
    // 실제로는 치지직 API를 사용하거나, DB에 저장된 채널 정보로 검색
    const result = await pool.query(
      `SELECT DISTINCT
        c.id,
        c.chzzk_channel_id,
        c.name,
        c.channel_url,
        u.display_name as owner_name,
        (SELECT COUNT(*) FROM user_follows WHERE channel_id = c.id) as follower_count
       FROM channels c
       LEFT JOIN users u ON c.owner_user_id = u.id
       WHERE c.chzzk_channel_id ILIKE $1
          OR c.name ILIKE $1
          OR u.display_name ILIKE $1
       ORDER BY follower_count DESC, c.name ASC
       LIMIT $2`,
      [`%${searchQuery.trim()}%`, parseInt(limit as string)]
    );

    res.json({ creators: result.rows });
  } catch (error) {
    console.error('Search creators error:', error);
    res.status(500).json({ error: 'Failed to search creators' });
  }
});

// 팔로우한 크리에이터 목록
router.get('/followed', authRequired, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        c.id,
        c.chzzk_channel_id,
        c.name,
        c.channel_url,
        u.display_name as owner_name,
        uf.created_at as followed_at,
        (SELECT COUNT(*) FROM messages 
         WHERE channel_id = c.id 
         AND visibility = 'public'
         AND created_at > COALESCE(
           (SELECT MAX(read_at) FROM message_reads mr
            JOIN messages m ON mr.message_id = m.id
            WHERE mr.user_id = $1 AND m.channel_id = c.id), 
           '1970-01-01'::timestamptz
         )) as unread_count
       FROM user_follows uf
       JOIN channels c ON uf.channel_id = c.id
       LEFT JOIN users u ON c.owner_user_id = u.id
       WHERE uf.user_id = (SELECT id FROM users WHERE chzzk_user_id = $1)
       ORDER BY uf.created_at DESC`,
      [req.user?.sub]
    );

    res.json({ channels: result.rows });
  } catch (error) {
    console.error('Get followed channels error:', error);
    res.status(500).json({ error: 'Failed to get followed channels' });
  }
});

export default router;
