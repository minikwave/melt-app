import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function decodeRedirectFromState(state: string): string | null {
  try {
    const base64 = state.replace(/-/g, '+').replace(/_/g, '/');
    const raw = Buffer.from(base64, 'base64').toString('utf8');
    const o = JSON.parse(raw) as { r?: string; t?: number };
    if (typeof o?.t !== 'number') return null;
    if (Date.now() - o.t > 10 * 60 * 1000) return null;
    const p = (o?.r ?? '').trim();
    if (!p.startsWith('/') || p.includes('//') || p.length > 400) return null;
    return p;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const url = new URL(request.url);
  const currentHost = `${url.protocol}//${url.host}`;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || currentHost;
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/auth/chzzk/callback?error=missing_params`);
  }

  const redirectFromState = decodeRedirectFromState(state);

  try {
    const clientId = process.env.CHZZK_CLIENT_ID;
    const clientSecret = process.env.CHZZK_CLIENT_SECRET;
    // 로그인 라우트와 동일한 값 사용(현재 호스트 = Vercel). Railway URL 사용 시 토큰 교환 실패.
    const redirectUri = `${currentHost}/api/auth/chzzk/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${baseUrl}/auth/chzzk/callback?error=config_error`);
    }
    const tokenResp = await fetch('https://api.chzzk.naver.com/auth/v1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });
    if (!tokenResp.ok) {
      return NextResponse.redirect(`${baseUrl}/auth/chzzk/callback?error=token_exchange_failed`);
    }
    const tokenData = await tokenResp.json();
    const { access_token, refresh_token, expires_in } = tokenData;
    const meResp = await fetch('https://api.chzzk.naver.com/open/v1/users/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!meResp.ok) {
      return NextResponse.redirect(`${baseUrl}/auth/chzzk/callback?error=user_fetch_failed`);
    }
    const meData = await meResp.json();
    const userData = meData?.content || {};
    const chzzkUserId = userData.userId || userData.channelId || null;
    const displayName = userData.nickname || userData.channelName || null;
    if (!chzzkUserId) {
      return NextResponse.redirect(`${baseUrl}/auth/chzzk/callback?error=no_user_id`);
    }

    const backendResp = await fetch(`${backendUrl}/auth/chzzk/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chzzkUserId,
        displayName,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresIn: expires_in,
        redirectPath: redirectFromState || undefined,
      }),
    });
    if (!backendResp.ok) {
      return NextResponse.redirect(`${baseUrl}/auth/chzzk/callback?error=backend_error`);
    }
    const backendData = await backendResp.json();
    let finalUrl = backendData.redirectUrl || `${baseUrl}/app`;

    // FRONTEND_URL가 백엔드(Railway)로 잘못 설정된 경우 보정: redirectUrl이 API 호스트를 가리키면
    // 사용자를 프론트(Vercel)로 보내야 쿠키가 적용된 도메인과 일치함.
    try {
      const apiHost = new URL(backendUrl).host;
      const toHost = new URL(finalUrl).host;
      if (apiHost && toHost && apiHost === toHost) {
        const path = new URL(finalUrl).pathname || '/app';
        finalUrl = `${baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : '/' + path}`;
      }
    } catch {
      /* ignore */
    }

    const response = NextResponse.redirect(finalUrl);
    
    // 실제 OAuth 로그인 시 Mock 쿠키 정리 (충돌 방지)
    response.cookies.delete('mock_user_id');
    response.cookies.delete('mock_user_role');
    response.cookies.delete('mock_user_name');
    response.cookies.delete('mock_onboarding_complete');
    
    response.cookies.set('melt_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    return response;
  } catch {
    return NextResponse.redirect(`${baseUrl}/auth/chzzk/callback?error=oauth_failed`);
  }
}
