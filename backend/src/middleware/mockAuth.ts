/**
 * 개발 환경용 Mock 인증 미들웨어
 * 실제 OAuth 없이 테스트 가능하도록
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool';

export interface MockAuthRequest extends Request {
  user?: {
    sub: string;
    name?: string;
    userId?: string;
  };
}

export function mockAuthRequired(req: MockAuthRequest, res: Response, next: NextFunction) {
  // 개발 환경에서만 동작
  if (process.env.NODE_ENV !== 'development' && !process.env.ENABLE_MOCK_AUTH) {
    return next();
  }

  // 쿠키나 헤더에서 mock_user_id 확인
  const mockUserId = req.cookies?.mock_user_id || req.headers['x-mock-user-id'];

  if (mockUserId) {
    // DB에서 유저 조회
    pool.query(
      'SELECT id, chzzk_user_id, display_name FROM users WHERE chzzk_user_id = $1',
      [mockUserId]
    ).then((result) => {
      if (result.rows.length > 0) {
        const user = result.rows[0];
        req.user = {
          sub: user.chzzk_user_id,
          name: user.display_name,
          userId: user.id,
        };
        next();
      } else {
        res.status(401).json({ error: 'Mock user not found' });
      }
    }).catch(() => {
      res.status(500).json({ error: 'Database error' });
    });
  } else {
    res.status(401).json({ error: 'Mock authentication required. Set x-mock-user-id header or mock_user_id cookie' });
  }
}
