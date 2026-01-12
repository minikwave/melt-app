import express from 'express';
import { pool } from '../db/pool';
import { AuthRequest, authRequired, creatorOnly } from '../middleware/auth';

const router = express.Router();

// 채널 정보 조회
router.get('/:chzzkChannelId', async (req, res) => {
  try {
    const { chzzkChannelId } = req.params;

    const result = await pool.query(
      `SELECT id, chzzk_channel_id, name, owner_user_id, channel_url, donate_url, charge_url 
       FROM channels WHERE chzzk_channel_id = $1`,
      [chzzkChannelId]
    );

    if (result.rows.length === 0) {
      // 채널이 없으면 생성 (기본값 설정)
      const defaultChannelUrl = `https://chzzk.naver.com/live/${chzzkChannelId}`;
      const defaultChargeUrl = 'https://game.naver.com/profile#cash';
      
      const insertResult = await pool.query(
        `INSERT INTO channels (chzzk_channel_id, name, channel_url, charge_url) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [chzzkChannelId, chzzkChannelId, defaultChannelUrl, defaultChargeUrl]
      );
      return res.json({ channel: insertResult.rows[0] });
    }

    // 기본값 설정 (없는 경우)
    const channel = result.rows[0];
    if (!channel.channel_url) {
      channel.channel_url = `https://chzzk.naver.com/live/${chzzkChannelId}`;
    }
    if (!channel.charge_url) {
      channel.charge_url = 'https://game.naver.com/profile#cash';
    }

    res.json({ channel });
  } catch (error) {
    console.error('Get channel error:', error);
    res.status(500).json({ error: 'Failed to get channel' });
  }
});

// 채널 설정 업데이트 (Creator only)
router.put('/:chzzkChannelId/settings', authRequired, async (req: AuthRequest, res) => {
  try {
    const { chzzkChannelId } = req.params;
    const { channelUrl, donateUrl, chargeUrl } = req.body;

    // 채널 소유자 확인
    const channelResult = await pool.query(
      'SELECT owner_user_id FROM channels WHERE chzzk_channel_id = $1',
      [chzzkChannelId]
    );

    if (channelResult.rows.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const channel = channelResult.rows[0];
    
    // 소유자 확인
    const userResult = await pool.query(
      'SELECT id, role FROM users WHERE chzzk_user_id = $1',
      [req.user?.sub]
    );

    if (userResult.rows[0]?.id !== channel.owner_user_id && 
        userResult.rows[0]?.role !== 'admin') {
      return res.status(403).json({ error: 'Not channel owner' });
    }

    // 업데이트
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (channelUrl !== undefined) {
      updateFields.push(`channel_url = $${paramIndex}`);
      updateValues.push(channelUrl);
      paramIndex++;
    }

    if (donateUrl !== undefined) {
      updateFields.push(`donate_url = $${paramIndex}`);
      updateValues.push(donateUrl);
      paramIndex++;
    }

    if (chargeUrl !== undefined) {
      updateFields.push(`charge_url = $${paramIndex}`);
      updateValues.push(chargeUrl);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.push(`updated_at = now()`);
    updateValues.push(chzzkChannelId);

    const updateQuery = `
      UPDATE channels 
      SET ${updateFields.join(', ')}
      WHERE chzzk_channel_id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, updateValues);

    res.json({ channel: result.rows[0] });
  } catch (error) {
    console.error('Update channel settings error:', error);
    res.status(500).json({ error: 'Failed to update channel settings' });
  }
});

// 채널 팔로우 (Melt 내부 즐겨찾기)
router.post('/:chzzkChannelId/follow', authRequired, async (req: AuthRequest, res) => {
  try {
    const { chzzkChannelId } = req.params;

    // 유저 조회
    const userResult = await pool.query(
      'SELECT id FROM users WHERE chzzk_user_id = $1',
      [req.user?.sub]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userResult.rows[0].id;

    // 채널 조회/생성
    let channelResult = await pool.query(
      'SELECT id FROM channels WHERE chzzk_channel_id = $1',
      [chzzkChannelId]
    );

    let channelId: string;
    if (channelResult.rows.length === 0) {
      const defaultChannelUrl = `https://chzzk.naver.com/live/${chzzkChannelId}`;
      const defaultChargeUrl = 'https://game.naver.com/profile#cash';
      
      const insertResult = await pool.query(
        `INSERT INTO channels (chzzk_channel_id, name, channel_url, charge_url) 
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [chzzkChannelId, chzzkChannelId, defaultChannelUrl, defaultChargeUrl]
      );
      channelId = insertResult.rows[0].id;
    } else {
      channelId = channelResult.rows[0].id;
    }

    // 팔로우 추가
    await pool.query(
      `INSERT INTO user_follows (user_id, channel_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, channel_id) DO NOTHING`,
      [userId, channelId]
    );

    res.json({ ok: true, message: 'Followed successfully' });
  } catch (error) {
    console.error('Follow channel error:', error);
    res.status(500).json({ error: 'Failed to follow channel' });
  }
});

// 채널 언팔로우
router.delete('/:chzzkChannelId/follow', authRequired, async (req: AuthRequest, res) => {
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

    await pool.query(
      'DELETE FROM user_follows WHERE user_id = $1 AND channel_id = $2',
      [userId, channelId]
    );

    res.json({ ok: true, message: 'Unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow channel error:', error);
    res.status(500).json({ error: 'Failed to unfollow channel' });
  }
});

// 팔로우 상태 확인
router.get('/:chzzkChannelId/follow-status', authRequired, async (req: AuthRequest, res) => {
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
      return res.json({ isFollowing: false });
    }

    const channelId = channelResult.rows[0].id;

    const followResult = await pool.query(
      'SELECT id FROM user_follows WHERE user_id = $1 AND channel_id = $2',
      [userId, channelId]
    );

    res.json({ isFollowing: followResult.rows.length > 0 });
  } catch (error) {
    console.error('Get follow status error:', error);
    res.status(500).json({ error: 'Failed to get follow status' });
  }
});

export default router;
