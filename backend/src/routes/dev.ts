/**
 * 개발 환경용 라우트
 * 더미 데이터 및 Mock 인증
 */

import express from 'express';
import { pool } from '../db/pool';
import jwt from 'jsonwebtoken';

const router = express.Router();

// 개발 환경에서만 활성화
if (process.env.NODE_ENV === 'development' || process.env.ENABLE_MOCK_AUTH) {
  // 더미 유저 목록
  router.get('/users', async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT chzzk_user_id, display_name, role FROM users ORDER BY role, display_name LIMIT 20'
      );
      res.json({ users: result.rows });
    } catch (error) {
      console.error('Get dev users error:', error);
      res.status(500).json({ error: 'Failed to get users' });
    }
  });

  // Mock 로그인
  router.post('/login', async (req, res) => {
    try {
      const { chzzk_user_id } = req.body;

      if (!chzzk_user_id) {
        return res.status(400).json({ error: 'chzzk_user_id is required' });
      }

      const userResult = await pool.query(
        'SELECT id, chzzk_user_id, display_name, role FROM users WHERE chzzk_user_id = $1',
        [chzzk_user_id]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = userResult.rows[0];

      // Mock JWT 생성
      const appJwt = jwt.sign(
        { sub: user.chzzk_user_id, name: user.display_name, userId: user.id },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      res
        .cookie('melt_session', appJwt, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .cookie('mock_user_id', chzzk_user_id, {
          httpOnly: false,
          secure: false,
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .json({ ok: true, user });
    } catch (error) {
      console.error('Mock login error:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  });
}

export default router;
