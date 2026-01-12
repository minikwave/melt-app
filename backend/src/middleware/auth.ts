import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    sub: string;
    name?: string;
    userId?: string;
  };
}

export function authRequired(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.melt_session || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = {
      sub: decoded.sub,
      name: decoded.name,
      userId: decoded.sub,
    };
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
