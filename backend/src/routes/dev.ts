/**
 * 개발 환경용 라우트
 * 더미 데이터 및 Mock 인증
 * 
 * 개발자 모드 활성화/비활성화:
 * - 환경 변수 ENABLE_DEV_MODE=true로 활성화
 * - 또는 NODE_ENV=development일 때 자동 활성화
 * - 활성화되면 누구나 목 데이터로 접근 가능
 * - 프로덕션에서는 ENABLE_DEV_MODE를 설정하지 않으면 비활성화됨
 */

import express from 'express';
import { pool } from '../db/pool';
import jwt from 'jsonwebtoken';

const router = express.Router();

// 개발자 모드 활성화 여부 확인
function isDevModeEnabled(): boolean {
  // 프로덕션 환경에서는 명시적으로 활성화하지 않으면 비활성화
  if (process.env.NODE_ENV === 'production') {
    return process.env.ENABLE_DEV_MODE === 'true';
  }
  // 개발 환경에서는 기본적으로 활성화 (ENABLE_DEV_MODE=false로 비활성화 가능)
  return process.env.ENABLE_DEV_MODE !== 'false';
}

// 더미 유저 목록 (프론트엔드와 동일하게 유지)
const DEFAULT_MOCK_USERS = [
  { chzzk_user_id: 'creator_1', display_name: '크리에이터1', role: 'creator' },
  { chzzk_user_id: 'creator_2', display_name: '크리에이터2', role: 'creator' },
  { chzzk_user_id: 'creator_3', display_name: '크리에이터3', role: 'creator' },
  { chzzk_user_id: 'viewer_1', display_name: '시청자1', role: 'viewer' },
  { chzzk_user_id: 'viewer_2', display_name: '시청자2', role: 'viewer' },
  { chzzk_user_id: 'viewer_3', display_name: '시청자3', role: 'viewer' },
];

// 개발자 모드가 활성화된 경우에만 라우트 등록
if (isDevModeEnabled()) {
  // 더미 유저 목록 조회
  router.get('/users', async (req, res) => {
    try {
      // DB에서 조회 시도
      const result = await pool.query(
        `SELECT chzzk_user_id, display_name, role 
         FROM users 
         WHERE chzzk_user_id = ANY($1::text[])
         ORDER BY role, display_name`,
        [DEFAULT_MOCK_USERS.map(u => u.chzzk_user_id)]
      );

      // DB에 있는 유저와 기본 목록 병합
      const dbUsers = result.rows;
      const allUsers = DEFAULT_MOCK_USERS.map(mockUser => {
        const dbUser = dbUsers.find(u => u.chzzk_user_id === mockUser.chzzk_user_id);
        return dbUser || mockUser;
      });

      res.json({ users: allUsers });
    } catch (error) {
      // DB 오류 시 기본 목록 반환
      console.warn('Get dev users from DB failed, using default list:', error);
      res.json({ users: DEFAULT_MOCK_USERS });
    }
  });

  // Mock 로그인 (목 데이터로 누구나 접근 가능)
  router.post('/login', async (req, res) => {
    try {
      const { chzzk_user_id } = req.body;

      if (!chzzk_user_id) {
        return res.status(400).json({ error: 'chzzk_user_id is required' });
      }

      // 기본 목록에 있는 유저인지 확인
      const mockUser = DEFAULT_MOCK_USERS.find(u => u.chzzk_user_id === chzzk_user_id);
      
      let user;
      let userId: string;

      if (mockUser) {
        // DB에서 조회 시도, 없으면 자동 생성
        try {
          const userResult = await pool.query(
            'SELECT id, chzzk_user_id, display_name, role FROM users WHERE chzzk_user_id = $1',
            [chzzk_user_id]
          );

          if (userResult.rows.length > 0) {
            user = userResult.rows[0];
            userId = user.id;
          } else {
            // DB에 없으면 자동 생성
            const insertResult = await pool.query(
              `INSERT INTO users (chzzk_user_id, display_name, role)
               VALUES ($1, $2, $3)
               RETURNING id, chzzk_user_id, display_name, role`,
              [mockUser.chzzk_user_id, mockUser.display_name, mockUser.role]
            );
            user = insertResult.rows[0];
            userId = user.id;
            console.log(`✅ Auto-created dev user: ${chzzk_user_id}`);
          }
        } catch (dbError) {
          // DB 오류 시에도 목 데이터로 로그인 가능 (로컬 쿠키 모드)
          console.warn('DB error, using mock user data:', dbError);
          user = mockUser;
          userId = chzzk_user_id; // 임시 ID
        }
      } else {
        // 기본 목록에 없는 유저는 DB에서만 조회
        const userResult = await pool.query(
          'SELECT id, chzzk_user_id, display_name, role FROM users WHERE chzzk_user_id = $1',
          [chzzk_user_id]
        );

        if (userResult.rows.length === 0) {
          return res.status(404).json({ 
            error: 'User not found',
            hint: 'Available mock users: ' + DEFAULT_MOCK_USERS.map(u => u.chzzk_user_id).join(', ')
          });
        }

        user = userResult.rows[0];
        userId = user.id;
      }

      // Mock JWT 생성
      const appJwt = jwt.sign(
        { sub: user.chzzk_user_id, name: user.display_name, userId: userId },
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
        .cookie('mock_user_id', user.chzzk_user_id, {
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
} else {
  // 개발자 모드가 비활성화된 경우
  router.get('/users', (req, res) => {
    res.status(403).json({ 
      error: 'Developer mode is disabled',
      hint: 'Set ENABLE_DEV_MODE=true to enable (development only)'
    });
  });

  router.post('/login', (req, res) => {
    res.status(403).json({ 
      error: 'Developer mode is disabled',
      hint: 'Set ENABLE_DEV_MODE=true to enable (development only)'
    });
  });
}

export default router;
