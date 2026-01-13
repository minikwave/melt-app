import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { getAccessToken } from '../utils/refreshToken';
import { pool } from '../db/pool';

/**
 * 치지직 API 호출 전에 Access Token을 자동으로 갱신하고 req에 추가
 */
export async function ensureChzzkToken(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    // 유저 ID 조회
    const userResult = await pool.query(
      'SELECT id FROM users WHERE chzzk_user_id = $1',
      [req.user.sub]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Access Token 조회 (필요 시 자동 갱신)
    const accessToken = await getAccessToken(userResult.rows[0].id);

    if (!accessToken) {
      return res.status(401).json({ 
        error: 'OAuth token not available. Please re-authenticate.',
        requiresReauth: true 
      });
    }

    req.chzzkAccessToken = accessToken;
    next();
  } catch (error) {
    console.error('Ensure Chzzk token error:', error);
    return res.status(500).json({ error: 'Failed to get access token' });
  }
}
