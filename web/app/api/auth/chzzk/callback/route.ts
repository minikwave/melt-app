import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/auth/chzzk/callback?error=missing_params`);
  }
  
  try {
    // 백엔드로 코드 전달하여 토큰 교환 및 유저 생성 처리
    // 백엔드가 한국 외 지역이라 ECONNRESET 발생하므로, 
    // Vercel에서 직접 치지직 API 호출
    
    const clientId = process.env.CHZZK_CLIENT_ID;
    const clientSecret = process.env.CHZZK_CLIENT_SECRET;
    const redirectUri = process.env.CHZZK_REDIRECT_URI || `${backendUrl}/auth/chzzk/callback`;
    
    if (!clientId || !clientSecret) {
      console.error('Missing CHZZK credentials');
      return NextResponse.redirect(`${baseUrl}/auth/chzzk/callback?error=config_error`);
    }
    
    // 1. Token 교환 (Vercel 서버에서 직접 호출)
    console.log('Exchanging token with Chzzk API...');
    const tokenResp = await fetch('https://api.chzzk.naver.com/auth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });
    
    if (!tokenResp.ok) {
      const errorText = await tokenResp.text();
      console.error('Token exchange failed:', tokenResp.status, errorText);
      return NextResponse.redirect(`${baseUrl}/auth/chzzk/callback?error=token_exchange_failed`);
    }
    
    const tokenData = await tokenResp.json();
    const { access_token, refresh_token, expires_in } = tokenData;
    
    console.log('Token exchange successful');
    
    // 2. 유저 정보 조회
    console.log('Fetching user info from Chzzk API...');
    const meResp = await fetch('https://api.chzzk.naver.com/open/v1/users/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    
    if (!meResp.ok) {
      const errorText = await meResp.text();
      console.error('User info fetch failed:', meResp.status, errorText);
      return NextResponse.redirect(`${baseUrl}/auth/chzzk/callback?error=user_fetch_failed`);
    }
    
    const meData = await meResp.json();
    const userData = meData?.content || {};
    const chzzkUserId = userData.userId || userData.channelId || null;
    const displayName = userData.nickname || userData.channelName || null;
    
    console.log('User info fetched:', { chzzkUserId, displayName });
    
    if (!chzzkUserId) {
      console.error('Failed to get user ID from Chzzk response:', meData);
      return NextResponse.redirect(`${baseUrl}/auth/chzzk/callback?error=no_user_id`);
    }
    
    // 3. 백엔드에 유저 정보 전달하여 DB 저장 및 JWT 발급
    console.log('Sending user data to backend...');
    const backendResp = await fetch(`${backendUrl}/auth/chzzk/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chzzkUserId,
        displayName,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresIn: expires_in,
      }),
    });
    
    if (!backendResp.ok) {
      const errorText = await backendResp.text();
      console.error('Backend user creation failed:', backendResp.status, errorText);
      return NextResponse.redirect(`${baseUrl}/auth/chzzk/callback?error=backend_error`);
    }
    
    const backendData = await backendResp.json();
    const { token, redirectUrl } = backendData;
    
    console.log('Backend response successful, redirecting...');
    
    // 4. 쿠키 설정 후 리다이렉트
    const response = NextResponse.redirect(redirectUrl || `${baseUrl}/app`);
    
    response.cookies.set('melt_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7일
      path: '/',
    });
    
    return response;
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(`${baseUrl}/auth/chzzk/callback?error=oauth_failed`);
  }
}
