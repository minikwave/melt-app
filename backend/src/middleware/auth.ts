import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool';
import { getAccessToken } from '../utils/refreshToken';

export interface AuthRequest extends Request {
  user?: {
    sub: string;
    name?: string;
    userId?: string;
  };
  chzzkAccessToken?: string; // 치지직 API 호출용 Access Token
}

export async function authRequired(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.melt_session || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = {
      sub: decoded.sub,
      name: decoded.name,
      userId: decoded.userId || decoded.sub,
    };
    
    // 치지직 API 호출이 필요한 경우 Access Token 로드
    // (필요한 엔드포인트에서만 사용)
    if (req.path.includes('/chzzk') || req.headers['x-require-chzzk-token'] === 'true') {
      const userResult = await pool.query(
        'SELECT id FROM users WHERE chzzk_user_id = $1',
        [decoded.sub]
      );
      
      if (userResult.rows.length > 0) {
        const accessToken = await getAccessToken(userResult.rows[0].id);
        if (accessToken) {
          req.chzzkAccessToken = accessToken;
        }
      }
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export async function creatorOnly(req: AuthRequest, res: Response, next: NextFunction) {
  await authRequired(req, res, async () => {
    const { pool } = await import('../db/pool');
    const result = await pool.query(
      'SELECT role FROM users WHERE chzzk_user_id = $1',
      [req.user?.sub]
    );

    if (result.rows[0]?.role !== 'creator' && result.rows[0]?.role !== 'admin') {
      return res.status(403).json({ error: 'Creator access required' });
    }

    next();
  });
}
