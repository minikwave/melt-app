'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// 개발자 모드 활성화 여부
const DEV_MODE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_DEV_MODE === 'true' || process.env.NODE_ENV === 'development'
// 강제 Mock 모드
const FORCE_MOCK_MODE = process.env.NEXT_PUBLIC_FORCE_MOCK === 'true'

export default function NaverLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Melt 로그인</h1>
          <p className="text-neutral-400">
            네이버 계정으로 시작하세요
          </p>
        </div>

        <button
          onClick={handleNaverLogin}
          disabled={isLoading}
          className="w-full rounded-xl py-4 font-bold bg-[#03C75A] text-white hover:bg-[#02B350] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            '연결 중...'
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm5.5 7.5h-4.5V5h4.5v2.5zm0 5h-4.5v-2.5h4.5V12.5z"/>
              </svg>
              네이버로 시작하기
            </>
          )}
        </button>

        <div className="text-sm text-neutral-500 text-center space-y-2 pt-4 border-t border-neutral-800">
          <p>• 네이버 계정으로 간편 로그인</p>
          <p>• 치지직 계정 자동 연동</p>
          <p>• 방송 외 시간에도 후원 가능</p>
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
      </div>
    </main>
  )
}
