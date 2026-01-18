import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Node.js runtime 사용 (Edge에서 crypto 모듈 문제 방지)
export const runtime = 'nodejs';

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

export async function GET(request: Request) {
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
  
  // 리다이렉트 URI 결정 (우선순위: 환경변수 > 현재 호스트 기반 자동 생성)
  // 반드시 치지직 Developer 콘솔에 등록된 URL과 일치해야 함
  let redirectUri = process.env.CHZZK_REDIRECT_URI;
  
  if (!redirectUri) {
    // 환경변수가 없으면 현재 요청의 호스트를 기반으로 생성
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    redirectUri = `${baseUrl}/api/auth/chzzk/callback`;
    console.log('⚠️ CHZZK_REDIRECT_URI not set, using auto-generated:', redirectUri);
  }
  
  if (!clientId) {
    console.error('❌ CHZZK_CLIENT_ID not configured');
    return NextResponse.json({ error: 'CHZZK_CLIENT_ID not configured' }, { status: 500 });
  }
  
  console.log('🔐 OAuth Login - clientId:', clientId);
  console.log('🔐 OAuth Login - redirectUri:', redirectUri);
  console.log('🔐 OAuth Login - state:', state);
  
  const authorizeUrl = new URL('https://chzzk.naver.com/account-interlock');
  authorizeUrl.searchParams.set('clientId', clientId);
  authorizeUrl.searchParams.set('redirectUri', redirectUri);
  authorizeUrl.searchParams.set('state', state);
  
  console.log('🔐 OAuth Login - Full authorize URL:', authorizeUrl.toString());
  
  return NextResponse.redirect(authorizeUrl.toString());
}

// State 검증 함수 (callback에서 사용)
export function verifyState(state: string): boolean {
  const expiry = stateStore.get(state);
  if (!expiry) return false;
  
  stateStore.delete(state);
  return expiry > Date.now();
}
