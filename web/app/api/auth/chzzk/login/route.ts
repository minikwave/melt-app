import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function base64urlEncode(s: string): string {
  return Buffer.from(s, 'utf8').toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function safeRedirectPath(raw: string | null): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const p = raw.trim();
  if (!p.startsWith('/') || p.includes('//') || p.length > 400) return null;
  return p;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectParam = safeRedirectPath(url.searchParams.get('redirect') || null);

  const statePayload = {
    r: redirectParam || '',
    t: Date.now(),
    n: crypto.randomBytes(8).toString('hex'),
  };
  const state = base64urlEncode(JSON.stringify(statePayload));

  const clientId = process.env.CHZZK_CLIENT_ID;
  // 반드시 현재 요청 호스트(Vercel) 사용. CHZZK_REDIRECT_URI를 Railway로 두면
  // 치지직이 Railway로 되돌려 보내 로그인 루프/쿠키 불일치가 발생함.
  const redirectUri = `${url.protocol}//${url.host}/api/auth/chzzk/callback`;

  if (!clientId) {
    return NextResponse.json({ error: 'CHZZK_CLIENT_ID not configured' }, { status: 500 });
  }

  const authorizeUrl = new URL('https://chzzk.naver.com/account-interlock');
  authorizeUrl.searchParams.set('clientId', clientId);
  authorizeUrl.searchParams.set('redirectUri', redirectUri);
  authorizeUrl.searchParams.set('state', state);

  return NextResponse.redirect(authorizeUrl.toString());
}

