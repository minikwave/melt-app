import { NextResponse } from 'next/server';
import crypto from 'crypto';

// State 저장 (메모리 - 프로덕션에서는 Redis 등 사용 권장)
const stateStore = new Map<string, number>();

function base64url(input: Buffer): string {
  return input.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function createState(): string {
  return base64url(crypto.randomBytes(24));
}

export async function GET() {
  const state = createState();
  
  // State 저장 (5분 유효)
  stateStore.set(state, Date.now() + 5 * 60 * 1000);
  
  // 오래된 state 정리
  const now = Date.now();
  for (const [key, expiry] of stateStore.entries()) {
    if (expiry < now) {
      stateStore.delete(key);
    }
  }
  
  const clientId = process.env.CHZZK_CLIENT_ID;
  const redirectUri = process.env.CHZZK_REDIRECT_URI || `${process.env.NEXT_PUBLIC_API_URL}/auth/chzzk/callback`;
  
  if (!clientId) {
    return NextResponse.json({ error: 'CHZZK_CLIENT_ID not configured' }, { status: 500 });
  }
  
  const authorizeUrl = new URL('https://chzzk.naver.com/account-interlock');
  authorizeUrl.searchParams.set('clientId', clientId);
  authorizeUrl.searchParams.set('redirectUri', redirectUri);
  authorizeUrl.searchParams.set('state', state);
  
  return NextResponse.redirect(authorizeUrl.toString());
}

// State 검증 함수 (callback에서 사용)
export function verifyState(state: string): boolean {
  const expiry = stateStore.get(state);
  if (!expiry) return false;
  
  stateStore.delete(state);
  return expiry > Date.now();
}
