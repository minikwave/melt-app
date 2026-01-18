import express from 'express';
import crypto from 'crypto';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool';
import { AuthRequest, authRequired } from '../middleware/auth';
import { saveState, verifyAndDeleteState } from '../utils/oauthState';
import { encrypt } from '../utils/encryption';
import { checkEncryptionKey } from '../utils/encryption';

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
  // State 저장 (CSRF 방지)
  saveState(state);
  
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
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/auth/chzzk/callback?error=missing_params`);
  }

  // State 검증 (CSRF 방지)
  if (!verifyAndDeleteState(state)) {
    console.error('Invalid or expired OAuth state:', state);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/auth/chzzk/callback?error=invalid_state`);
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

    // OAuth 토큰 암호화하여 저장
    const encryptedAccessToken = encrypt(access_token);
    const encryptedRefreshToken = refresh_token ? encrypt(refresh_token) : null;
    
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
        encryptedAccessToken,
        encryptedRefreshToken,
        new Date(Date.now() + expires_in * 1000),
      ]
    );

    // Melt 세션 JWT 생성
    const appJwt = jwt.sign(
      { sub: chzzkUserId, name: displayName, userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // 쿠키에 세션 저장
    // 온보딩 상태 확인 후 적절한 페이지로 리다이렉트
    let needsOnboarding = true;
    try {
      const onboardingResult = await pool.query(
        `SELECT onboarding_complete, role FROM users WHERE id = $1`,
        [user.id]
      );
      
      // onboarding_complete 컬럼이 없을 수 있으므로 안전하게 처리
      const row = onboardingResult.rows[0];
      if (row) {
        // role이 viewer가 아니거나 onboarding_complete가 true면 온보딩 완료로 간주
        needsOnboarding = row.onboarding_complete === false && row.role === 'viewer';
      }
    } catch (onboardingError) {
      console.warn('Onboarding check failed (column may not exist):', onboardingError);
      // 에러 발생 시 기본적으로 온보딩 페이지로 이동
      needsOnboarding = true;
    }
    
    let redirectUrl = `${process.env.FRONTEND_URL}/app`;
    if (needsOnboarding) {
      redirectUrl = `${process.env.FRONTEND_URL}/onboarding`;
    }
    
    res
      // 실제 OAuth 로그인 시 Mock 쿠키 정리 (충돌 방지)
      .clearCookie('mock_user_id')
      .clearCookie('mock_user_role')
      .clearCookie('mock_user_name')
      .clearCookie('mock_onboarding_complete')
      // 실제 세션 쿠키 설정
      .cookie('melt_session', appJwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
      })
      .redirect(redirectUrl);
  } catch (error: any) {
    console.error('=== OAuth Error Details ===');
    console.error('Error message:', error?.message);
    console.error('Error response status:', error?.response?.status);
    console.error('Error response data:', JSON.stringify(error?.response?.data, null, 2));
    console.error('Error code:', error?.code);
    console.error('Full error:', error);
    
    // 에러 타입별 처리
    let errorCode = 'oauth_failed';
    let errorDetail = '';
    
    if (error?.response?.status === 400) {
      errorCode = 'invalid_code';
      errorDetail = 'Token exchange failed';
    } else if (error?.response?.status === 401) {
      errorCode = 'unauthorized';
      errorDetail = 'Invalid credentials';
    } else if (error?.code === 'ECONNREFUSED') {
      errorCode = 'connection_error';
      errorDetail = 'Cannot connect to Chzzk API';
    } else if (error?.message?.includes('User')) {
      errorCode = 'user_creation_failed';
      errorDetail = 'Database error';
    }
    
    console.error(`OAuth failed with code: ${errorCode}, detail: ${errorDetail}`);
    
    // 에러 시 프론트엔드 에러 페이지로 리다이렉트
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/chzzk/callback?error=${errorCode}`);
  }
});

// Vercel에서 OAuth 완료 후 유저 정보 전달받아 처리
// (치지직 API가 한국 외 지역에서 ECONNRESET 발생하므로 Vercel에서 토큰 교환)
router.post('/chzzk/complete', async (req, res) => {
  try {
    const { chzzkUserId, displayName, accessToken, refreshToken, expiresIn, redirectPath } = req.body;

    if (!chzzkUserId) {
      return res.status(400).json({ error: 'chzzkUserId is required' });
    }
    
    // DB에 유저 저장/업데이트
    const userResult = await pool.query(
      `INSERT INTO users (chzzk_user_id, display_name, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (chzzk_user_id) 
       DO UPDATE SET display_name = $2, updated_at = now()
       RETURNING id, chzzk_user_id, display_name, role, onboarding_complete`,
      [chzzkUserId, displayName, 'viewer']
    );
    
    const user = userResult.rows[0];
    
    // OAuth 토큰 암호화하여 저장
    if (accessToken) {
      try {
        const encryptedAccessToken = encrypt(accessToken);
        const encryptedRefreshToken = refreshToken ? encrypt(refreshToken) : null;
        
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
            encryptedAccessToken,
            encryptedRefreshToken,
            expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
          ]
        );
      } catch (tokenError) {
        console.warn('Failed to save OAuth tokens (non-critical):', tokenError);
      }
    }
    
    // Melt 세션 JWT 생성
    const appJwt = jwt.sign(
      { sub: chzzkUserId, name: displayName, userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    const needsOnboarding = !user.onboarding_complete && user.role === 'viewer';
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

    let redirectUrl = `${frontendUrl}/app`;
    if (needsOnboarding) {
      redirectUrl = `${frontendUrl}/onboarding`;
    } else if (redirectPath && typeof redirectPath === 'string') {
      const p = redirectPath.trim();
      if (p.startsWith('/') && !p.includes('//') && p.length < 500) {
        redirectUrl = `${frontendUrl}${p}`;
      }
    }

    res.json({
      token: appJwt,
      redirectUrl,
      user: {
        id: user.id,
        chzzkUserId: user.chzzk_user_id,
        displayName: user.display_name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Complete OAuth error:', error);
    res.status(500).json({ error: 'Failed to complete OAuth' });
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
