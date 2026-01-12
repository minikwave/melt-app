import express from 'express';
import crypto from 'crypto';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool';
import { AuthRequest, authRequired } from '../middleware/auth';

const router = express.Router();

function base64url(input: Buffer): string {
  return input.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function createState(): string {
  return base64url(crypto.randomBytes(24));
}

// 치지직 OAuth 로그인 시작
router.get('/chzzk/login', (req, res) => {
  const state = createState();
  // TODO: state를 Redis/세션에 저장 (CSRF 방지)
  
  const authorizeUrl = new URL('https://chzzk.naver.com/account-interlock');
  authorizeUrl.searchParams.set('clientId', process.env.CHZZK_CLIENT_ID!);
  authorizeUrl.searchParams.set('redirectUri', process.env.CHZZK_REDIRECT_URI!);
  authorizeUrl.searchParams.set('state', state);
  
  res.redirect(authorizeUrl.toString());
});

// 치지직 OAuth 콜백
router.get('/chzzk/callback', async (req, res) => {
  const { code, state } = req.query as { code?: string; state?: string };

  if (!code || !state) {
    return res.status(400).send('Missing code or state');
  }

  try {
    // Token 교환
    const tokenResp = await axios.post(
      'https://api.chzzk.naver.com/auth/v1/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.CHZZK_CLIENT_ID!,
        client_secret: process.env.CHZZK_CLIENT_SECRET!,
        code,
        redirect_uri: process.env.CHZZK_REDIRECT_URI!,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token, refresh_token, expires_in } = tokenResp.data;

    // 유저 정보 조회
    const meResp = await axios.get('https://api.chzzk.naver.com/open/v1/users/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const userData = meResp.data?.content || {};
    const chzzkUserId = userData.userId || userData.channelId || null;
    const displayName = userData.nickname || userData.channelName || null;

    if (!chzzkUserId) {
      return res.status(400).send('Failed to get user ID');
    }

    // DB에 유저 저장/업데이트 (기본값은 viewer, 온보딩에서 변경 가능)
    const userResult = await pool.query(
      `INSERT INTO users (chzzk_user_id, display_name, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (chzzk_user_id) 
       DO UPDATE SET display_name = $2, updated_at = now()
       RETURNING id, chzzk_user_id, display_name, role`,
      [chzzkUserId, displayName, 'viewer']
    );

    const user = userResult.rows[0];

    // OAuth 토큰 저장 (실제 운영에서는 암호화 필요)
    await pool.query(
      `INSERT INTO oauth_tokens (user_id, access_token, refresh_token, expires_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id)
       DO UPDATE SET 
         access_token = $2,
         refresh_token = $3,
         expires_at = $4,
         updated_at = now()`,
      [
        user.id,
        access_token,
        refresh_token,
        new Date(Date.now() + expires_in * 1000),
      ]
    );

    // Melt 세션 JWT 생성
    const appJwt = jwt.sign(
      { sub: chzzkUserId, name: displayName, userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // 쿠키에 세션 저장
    res
      .cookie('melt_session', appJwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
      })
      .redirect(`${process.env.FRONTEND_URL}/app`);
  } catch (error: any) {
    console.error('OAuth error:', error?.response?.data || error);
    res.status(500).send('OAuth failed');
  }
});

// 로그아웃
router.post('/logout', authRequired, (req, res) => {
  res.clearCookie('melt_session');
  res.json({ ok: true });
});

// 현재 유저 정보
router.get('/me', authRequired, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      'SELECT id, chzzk_user_id, display_name, role FROM users WHERE chzzk_user_id = $1',
      [req.user?.sub]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
