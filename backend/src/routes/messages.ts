import express from 'express';
import { pool } from '../db/pool';
import { AuthRequest, authRequired, creatorOnly } from '../middleware/auth';

const router = express.Router();

// 크리에이터 공개 메시지 (Creator → All)
router.post('/creator-post', authRequired, async (req: AuthRequest, res) => {
  try {
    const { chzzkChannelId, content } = req.body;

    if (!chzzkChannelId || !content) {
      return res.status(400).json({ error: 'chzzkChannelId and content are required' });
    }

    // Creator 권한 확인
    const userResult = await pool.query(
      'SELECT id, role FROM users WHERE chzzk_user_id = $1',
      [req.user?.sub]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userResult.rows[0].role !== 'creator' && userResult.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Creator access required' });
    }

    const creatorId = userResult.rows[0].id;

    // 채널 조회/생성
    let channelResult = await pool.query(
      'SELECT id, owner_user_id FROM channels WHERE chzzk_channel_id = $1',
      [chzzkChannelId]
    );

    let channelId: string;
    if (channelResult.rows.length === 0) {
      // 채널이 없으면 생성하고 owner_user_id 설정
      const insertResult = await pool.query(
        `INSERT INTO channels (chzzk_channel_id, name, owner_user_id, channel_url, charge_url) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [
          chzzkChannelId,
          chzzkChannelId,
          creatorId,
          `https://chzzk.naver.com/live/${chzzkChannelId}`,
          'https://game.naver.com/profile#cash'
        ]
      );
      channelId = insertResult.rows[0].id;
    } else {
      channelId = channelResult.rows[0].id;
      // owner_user_id가 없으면 설정
      if (!channelResult.rows[0].owner_user_id) {
        await pool.query(
          'UPDATE channels SET owner_user_id = $1 WHERE id = $2',
          [creatorId, channelId]
        );
      }
    }

    // 크리에이터 공개 메시지 생성
    const messageResult = await pool.query(
      `INSERT INTO messages (channel_id, author_user_id, type, visibility, content)
       VALUES ($1, $2, 'creator_post', 'public', $3)
       RETURNING *`,
      [channelId, creatorId, content]
    );

    res.json({ message: messageResult.rows[0] });
  } catch (error) {
    console.error('Create creator post error:', error);
    res.status(500).json({ error: 'Failed to create creator post' });
  }
});

// DM 생성 (Viewer → Creator)
router.post('/dm', authRequired, async (req: AuthRequest, res) => {
  try {
    const { chzzkChannelId, content } = req.body;

    if (!chzzkChannelId || !content) {
      return res.status(400).json({ error: 'chzzkChannelId and content are required' });
    }

    // 유저 조회
    const userResult = await pool.query(
      'SELECT id FROM users WHERE chzzk_user_id = $1',
      [req.user?.sub]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const authorUserId = userResult.rows[0].id;

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

    // DM 생성 (private)
    const messageResult = await pool.query(
      `INSERT INTO messages (channel_id, author_user_id, type, visibility, content)
       VALUES ($1, $2, 'dm', 'private', $3)
       RETURNING *`,
      [channelId, authorUserId, content]
    );

    res.json({ message: messageResult.rows[0] });
  } catch (error) {
    console.error('Create DM error:', error);
    res.status(500).json({ error: 'Failed to create DM' });
  }
});

// 답장 (Creator → Viewer)
router.post('/:messageId/reply', authRequired, async (req: AuthRequest, res) => {
  try {
    const { messageId } = req.params;
    const { content, visibility = 'private' } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'content is required' });
    }

    if (visibility !== 'private' && visibility !== 'public') {
      return res.status(400).json({ error: 'visibility must be private or public' });
    }

    // 원본 메시지 조회
    const originalResult = await pool.query(
      'SELECT * FROM messages WHERE id = $1',
      [messageId]
    );

    if (originalResult.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const original = originalResult.rows[0];

    // Creator 권한 확인
    const userResult = await pool.query(
      'SELECT id, role FROM users WHERE chzzk_user_id = $1',
      [req.user?.sub]
    );

    if (userResult.rows[0]?.role !== 'creator' && userResult.rows[0]?.role !== 'admin') {
      return res.status(403).json({ error: 'Creator access required' });
    }

    const creatorId = userResult.rows[0].id;

    // 답장 생성
    const replyResult = await pool.query(
      `INSERT INTO messages 
       (channel_id, author_user_id, type, visibility, content, reply_to_message_id)
       VALUES ($1, $2, 'creator_reply', $3, $4, $5)
       RETURNING *`,
      [original.channel_id, creatorId, visibility, content, messageId]
    );

    res.json({ message: replyResult.rows[0] });
  } catch (error) {
    console.error('Reply error:', error);
    res.status(500).json({ error: 'Failed to reply' });
  }
});

// RT (DM을 공개로 전환)
router.post('/:messageId/retweet', authRequired, async (req: AuthRequest, res) => {
  try {
    const { messageId } = req.params;

    // 메시지 조회
    const messageResult = await pool.query(
      'SELECT * FROM messages WHERE id = $1',
      [messageId]
    );

    if (messageResult.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const message = messageResult.rows[0];

    // Creator 권한 확인
    const userResult = await pool.query(
      'SELECT id, role FROM users WHERE chzzk_user_id = $1',
      [req.user?.sub]
    );

    if (userResult.rows[0]?.role !== 'creator' && userResult.rows[0]?.role !== 'admin') {
      return res.status(403).json({ error: 'Creator access required' });
    }

    const creatorId = userResult.rows[0].id;

    // RT 레코드 생성 (중복 방지)
    const rtResult = await pool.query(
      `INSERT INTO retweets (channel_id, message_id, creator_user_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (message_id) DO NOTHING
       RETURNING *`,
      [message.channel_id, messageId, creatorId]
    );

    if (rtResult.rows.length === 0) {
      return res.status(409).json({ error: 'Already retweeted' });
    }

    res.json({ retweet: rtResult.rows[0] });
  } catch (error) {
    console.error('Retweet error:', error);
    res.status(500).json({ error: 'Failed to retweet' });
  }
});

export default router;
