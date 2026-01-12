import express from 'express';
import { pool } from '../db/pool';
import { AuthRequest, authRequired } from '../middleware/auth';

const router = express.Router();

// 역할 선택 (온보딩)
router.post('/role', authRequired, async (req: AuthRequest, res) => {
  try {
    const { role } = req.body;

    if (!role || !['viewer', 'creator'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be viewer or creator' });
    }

    // 유저 역할 업데이트
    const result = await pool.query(
      `UPDATE users 
       SET role = $1, updated_at = now()
       WHERE chzzk_user_id = $2
       RETURNING id, chzzk_user_id, display_name, role`,
      [role, req.user?.sub]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// 온보딩 완료 확인
router.get('/status', authRequired, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT role, 
              (SELECT COUNT(*) FROM channels WHERE owner_user_id = users.id) as channel_count
       FROM users 
       WHERE chzzk_user_id = $1`,
      [req.user?.sub]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const needsOnboarding = user.role === 'viewer' && user.channel_count === '0';
    const needsCreatorSetup = user.role === 'creator' && user.channel_count === '0';

    res.json({
      role: user.role,
      needsOnboarding,
      needsCreatorSetup,
      onboardingComplete: !needsOnboarding && !needsCreatorSetup,
    });
  } catch (error) {
    console.error('Get onboarding status error:', error);
    res.status(500).json({ error: 'Failed to get onboarding status' });
  }
});

export default router;
