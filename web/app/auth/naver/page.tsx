'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Cookies from 'js-cookie'

// 개발자 모드 활성화 여부
const DEV_MODE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_DEV_MODE === 'true' || process.env.NODE_ENV === 'development'
// 강제 Mock 모드
const FORCE_MOCK_MODE = process.env.NEXT_PUBLIC_FORCE_MOCK === 'true'

export default function NaverLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  
  // 리다이렉트할 페이지 (로그인 후)
  const redirectTo = searchParams.get('redirect') || '/app'

  // 이미 로그인된 사용자인지 확인
  useEffect(() => {
    const sessionToken = Cookies.get('melt_session')
    if (sessionToken) {
      // 이미 로그인되어 있으면 리다이렉트
      router.push(redirectTo)
    } else {
      setIsCheckingAuth(false)
    }
  }, [router, redirectTo])

  const handleNaverLogin = () => {
    setIsLoading(true)
    
    // 강제 Mock 모드일 때만 개발 로그인으로 리다이렉트
    if (FORCE_MOCK_MODE) {
      router.push('/dev/login')
      return
    }
    
    // 프로덕션 환경: 항상 실제 OAuth 진행
    // Vercel API Route를 통해 치지직 OAuth 진행
    // (Railway 백엔드가 한국 외 지역이라 치지직 API 호출 시 ECONNRESET 발생)
    window.location.href = `/api/auth/chzzk/login`
  }

  // 인증 확인 중일 때 로딩 표시
  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-neutral-950 to-neutral-900">
        <div className="text-neutral-400">로딩 중...</div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-neutral-950 to-neutral-900">
      <div className="w-full max-w-sm space-y-6">
        {/* 뒤로가기 */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
        >
          <span>←</span>
          <span>홈으로</span>
        </Link>
        
        {/* 로고 */}
        <div className="flex justify-center">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 via-blue-500 via-green-500 to-yellow-500 rounded-xl transform rotate-12 opacity-90 blur-sm"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-pink-400 via-purple-400 via-blue-400 via-green-400 to-yellow-400 rounded-xl flex items-center justify-center shadow-2xl">
              <span className="text-4xl font-bold text-white drop-shadow-lg">M</span>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">로그인</h1>
          <p className="text-neutral-400">
            치지직 계정으로 시작하세요
          </p>
        </div>

        <button
          onClick={handleNaverLogin}
          disabled={isLoading}
          className="w-full rounded-xl py-4 font-bold bg-[#03C75A] text-white hover:bg-[#02B350] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              연결 중...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm5.5 7.5h-4.5V5h4.5v2.5zm0 5h-4.5v-2.5h4.5V12.5z"/>
              </svg>
              치지직 계정으로 로그인
            </>
          )}
        </button>

        {/* 안내 사항 */}
        <div className="bg-neutral-900/50 rounded-xl p-4 border border-neutral-800">
          <h3 className="font-semibold text-sm mb-2">처음이신가요?</h3>
          <p className="text-sm text-neutral-400">
            로그인하면 자동으로 회원가입이 진행됩니다. 
            추가 정보 입력 없이 바로 시작할 수 있어요.
          </p>
        </div>

        <div className="text-sm text-neutral-500 text-center space-y-2 pt-4 border-t border-neutral-800">
          <p>• 네이버/치지직 계정으로 간편 로그인</p>
          <p>• 처음 로그인 시 자동 회원가입</p>
          <p>• 기존 회원은 바로 로그인</p>
        </div>

        {/* 개발 모드 링크 - 개발자 모드가 활성화된 경우에만 표시 */}
        {DEV_MODE_ENABLED && (
          <div className="text-center pt-4">
            <Link
              href="/dev/login"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              🧪 개발 모드로 테스트하기
            </Link>
          </div>
        )}
        
        {/* 약관 안내 */}
        <p className="text-xs text-neutral-600 text-center">
          로그인 시 <Link href="/terms" className="text-neutral-400 hover:text-white">이용약관</Link> 및{' '}
          <Link href="/privacy" className="text-neutral-400 hover:text-white">개인정보처리방침</Link>에 동의하게 됩니다.
        </p>
      </div>
    </main>
  )
}
