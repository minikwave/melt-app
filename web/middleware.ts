import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 인증이 필요한 페이지 경로들
const PROTECTED_PATHS = [
  '/app',
  '/onboarding',
]

// 인증이 필요 없는 공개 페이지 경로들
const PUBLIC_PATHS = [
  '/',
  '/auth',
  '/browse',
  '/help',
  '/terms',
  '/privacy',
  '/contact',
  '/dev/login',
]

// 로그인한 사용자가 접근하면 안 되는 페이지들 (로그인 페이지 등)
const AUTH_REDIRECT_PATHS = [
  '/auth/naver',
  '/auth/login',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // API 라우트는 그대로 통과
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }
  
  // 세션 쿠키 확인
  const sessionToken = request.cookies.get('melt_session')?.value
  const isAuthenticated = !!sessionToken
  
  // 보호된 페이지 접근 시 인증 확인
  const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path))
  
  if (isProtectedPath && !isAuthenticated) {
    // 로그인되지 않은 사용자가 보호된 페이지에 접근 시
    // 원래 가려던 페이지를 기억하고 로그인 페이지로 리다이렉트
    const url = request.nextUrl.clone()
    url.pathname = '/auth/naver'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }
  
  // 로그인한 사용자가 로그인 페이지에 접근 시 메인으로 리다이렉트
  const isAuthRedirectPath = AUTH_REDIRECT_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'))
  
  if (isAuthRedirectPath && isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = '/app'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
