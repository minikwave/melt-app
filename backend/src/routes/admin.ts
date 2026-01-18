import express from 'express';
import { pool } from '../db/pool';
import { AuthRequest, authRequired } from '../middleware/auth';

const router = express.Router();

// Admin 권한 확인 미들웨어
const adminOnly = async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  try {
    if (!req.user?.sub) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(
      'SELECT role FROM users WHERE chzzk_user_id = $1',
      [req.user.sub]
    );

    if (result.rows.length === 0 || result.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Failed to verify admin access' });
  }
};

// 전체 통계
router.get('/stats', authRequired, adminOnly, async (req: AuthRequest, res) => {
  try {
    // 전체 사용자 수
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(usersResult.rows[0].count);

    // 크리에이터 수
    const creatorsResult = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'creator'"
    );
    const totalCreators = parseInt(creatorsResult.rows[0].count);

    // 관리자 수
    const adminsResult = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'admin'"
    );
    const totalAdmins = parseInt(adminsResult.rows[0].count);

    // 전체 메시지 수
    const messagesResult = await pool.query('SELECT COUNT(*) as count FROM messages');
    const totalMessages = parseInt(messagesResult.rows[0].count);

    // 전체 후원 수
    const donationsResult = await pool.query('SELECT COUNT(*) as count FROM donation_events');
    const totalDonations = parseInt(donationsResult.rows[0].count);

    // 전체 후원액
    const donationAmountResult = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM donation_events WHERE status IN ('OCCURRED', 'CONFIRMED')"
    );
    const totalDonationAmount = parseInt(donationAmountResult.rows[0].total);

    // 오늘의 활동
    const todayUsersResult = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE created_at >= CURRENT_DATE"
    );
    const todayMessagesResult = await pool.query(
      "SELECT COUNT(*) as count FROM messages WHERE created_at >= CURRENT_DATE"
    );
    const todayDonationsResult = await pool.query(
      "SELECT COUNT(*) as count FROM donation_events WHERE occurred_at >= CURRENT_DATE"
    );

    const recentActivity = [
      { type: 'user_signup', count: parseInt(todayUsersResult.rows[0].count) },
      { type: 'message', count: parseInt(todayMessagesResult.rows[0].count) },
      { type: 'donation', count: parseInt(todayDonationsResult.rows[0].count) },
    ];

    res.json({
      totalUsers,
      totalCreators,
      totalAdmins,
      totalMessages,
      totalDonations,
      totalDonationAmount,
      recentActivity,
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// 유저 목록
router.get('/users', authRequired, adminOnly, async (req: AuthRequest, res) => {
  try {
    const { search, role, limit = '50', offset = '0' } = req.query;

    let query = `
      SELECT id, chzzk_user_id, display_name, role, profile_image, created_at, updated_at
      FROM users
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (chzzk_user_id ILIKE $${paramIndex} OR display_name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (role && ['viewer', 'creator', 'admin'].includes(role as string)) {
      query += ` AND role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }

    // 총 개수
    const countQuery = query.replace('SELECT id, chzzk_user_id, display_name, role, profile_image, created_at, updated_at', 'SELECT COUNT(*) as count');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // 페이지네이션
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await pool.query(query, params);

    res.json({
      users: result.rows,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// 유저 역할 변경
router.put('/users/:userId/role', authRequired, adminOnly, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['viewer', 'creator', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be viewer, creator, or admin' });
    }

    // 자기 자신의 역할은 변경 불가
    const currentUserResult = await pool.query(
      'SELECT id FROM users WHERE chzzk_user_id = $1',
      [req.user?.sub]
    );
    if (currentUserResult.rows[0]?.id === userId) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    const result = await pool.query(
      'UPDATE users SET role = $1, updated_at = now() WHERE id = $2 RETURNING *',
      [role, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0], message: `User role changed to ${role}` });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// 특정 치지직 유저 ID로 역할 변경 (초기 admin 설정용)
router.put('/users/by-chzzk-id/:chzzkUserId/role', authRequired, adminOnly, async (req: AuthRequest, res) => {
  try {
    const { chzzkUserId } = req.params;
    const { role } = req.body;

    if (!['viewer', 'creator', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be viewer, creator, or admin' });
    }

    // 자기 자신의 역할은 변경 불가
    if (chzzkUserId === req.user?.sub) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    const result = await pool.query(
      'UPDATE users SET role = $1, updated_at = now() WHERE chzzk_user_id = $2 RETURNING *',
      [role, chzzkUserId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0], message: `User role changed to ${role}` });
  } catch (error) {
    console.error('Update user role by chzzk id error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// 채널 목록
router.get('/channels', authRequired, adminOnly, async (req: AuthRequest, res) => {
  try {
    const { search, limit = '50', offset = '0' } = req.query;

    let query = `
      SELECT c.*, u.display_name as owner_name,
             (SELECT COUNT(*) FROM user_follows WHERE channel_id = c.id) as follower_count
      FROM channels c
      LEFT JOIN users u ON c.owner_user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (c.chzzk_channel_id ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // 총 개수
    const countQuery = `SELECT COUNT(*) as count FROM channels c WHERE 1=1` + 
      (search ? ` AND (c.chzzk_channel_id ILIKE $1 OR c.name ILIKE $1)` : '');
    const countResult = await pool.query(countQuery, search ? [`%${search}%`] : []);
    const total = parseInt(countResult.rows[0].count);

    // 페이지네이션
    query += ` ORDER BY c.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await pool.query(query, params);

    res.json({
      channels: result.rows,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    console.error('Get admin channels error:', error);
    res.status(500).json({ error: 'Failed to get channels' });
  }
});

// 메시지 목록 (모더레이션용)
router.get('/messages', authRequired, adminOnly, async (req: AuthRequest, res) => {
  try {
    const { search, type, limit = '50', offset = '0' } = req.query;

    let query = `
      SELECT m.*, 
             u.display_name as author_name, 
             u.chzzk_user_id as author_chzzk_id,
             c.name as channel_name,
             c.chzzk_channel_id
      FROM messages m
      LEFT JOIN users u ON m.author_user_id = u.id
      LEFT JOIN channels c ON m.channel_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND m.content ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (type && ['donation', 'dm', 'creator_post', 'creator_reply'].includes(type as string)) {
      query += ` AND m.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    // 총 개수
    const countQuery = query.replace(/SELECT m\.\*.*FROM messages m/, 'SELECT COUNT(*) as count FROM messages m');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // 페이지네이션
    query += ` ORDER BY m.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await pool.query(query, params);

    res.json({
      messages: result.rows,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    console.error('Get admin messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// 메시지 삭제 (모더레이션)
router.delete('/messages/:messageId', authRequired, adminOnly, async (req: AuthRequest, res) => {
  try {
    const { messageId } = req.params;

    const result = await pool.query(
      'DELETE FROM messages WHERE id = $1 RETURNING id',
      [messageId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ ok: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

export default router;
