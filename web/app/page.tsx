'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

// 개발자 모드 비밀번호는 환경변수에서 가져옴 (프로덕션에서는 설정하지 않으면 비활성화)
const DEV_MODE_PASSWORD = process.env.NEXT_PUBLIC_DEV_PASSWORD || ''
// 개발자 모드 활성화 여부 (프로덕션에서는 명시적으로 활성화해야 함)
const DEV_MODE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_DEV_MODE === 'true' || process.env.NODE_ENV === 'development'

export default function Home() {
  const router = useRouter()
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // 이미 로그인된 사용자인지 확인
  useEffect(() => {
    const sessionToken = Cookies.get('melt_session')
    if (sessionToken) {
      // 이미 로그인되어 있으면 앱 페이지로 리다이렉트
      router.push('/app')
    } else {
      setIsCheckingAuth(false)
    }
  }, [router])

  const handleDevModeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    // 개발자 모드가 비활성화되어 있으면 차단
    if (!DEV_MODE_ENABLED) {
      alert('개발자 모드가 비활성화되어 있습니다.')
      return
    }
    
    // 비밀번호가 설정되지 않았으면 바로 이동 (개발 환경)
    if (!DEV_MODE_PASSWORD) {
      router.push('/dev/login')
      return
    }
    
    setShowPasswordModal(true)
    setPassword('')
    setPasswordError('')
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === DEV_MODE_PASSWORD) {
      router.push('/dev/login')
    } else {
      setPasswordError('비밀번호가 올바르지 않습니다.')
      setPassword('')
    }
  }

  const handleCloseModal = () => {
    setShowPasswordModal(false)
    setPassword('')
    setPasswordError('')
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
    <>
      <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-neutral-950 to-neutral-900">
        <div className="text-center space-y-6 w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 via-blue-500 via-green-500 to-yellow-500 rounded-2xl transform rotate-12 opacity-90 blur-sm"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-pink-400 via-purple-400 via-blue-400 via-green-400 to-yellow-400 rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-6xl font-bold text-white drop-shadow-lg">M</span>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-400 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-teal-400 rounded-full animate-pulse delay-300"></div>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 via-blue-400 via-green-400 to-yellow-400 bg-clip-text text-transparent">Melt</h1>
          <p className="text-neutral-400">방송이 꺼진 뒤에도 후원이 흐르도록</p>
          
          {/* 서비스 소개 카드 */}
          <div className="bg-neutral-900/50 rounded-2xl p-6 border border-neutral-800 text-left space-y-4">
            <h2 className="text-lg font-semibold text-center">Melt란?</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎁</span>
                <div>
                  <p className="font-medium text-white">언제든지 후원</p>
                  <p className="text-neutral-400">방송이 꺼져 있어도 좋아하는 크리에이터에게 후원할 수 있어요</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">💬</span>
                <div>
                  <p className="font-medium text-white">비공개 메시지</p>
                  <p className="text-neutral-400">크리에이터에게 직접 메시지를 보내고 답장을 받을 수 있어요</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🏆</span>
                <div>
                  <p className="font-medium text-white">뱃지 수집</p>
                  <p className="text-neutral-400">후원 금액에 따라 특별한 뱃지를 획득할 수 있어요</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Link
              href="/auth/naver"
              className="block w-full rounded-xl py-4 font-bold bg-[#03C75A] text-white text-center hover:bg-[#02B350] transition-colors shadow-lg"
            >
              치지직 계정으로 시작하기
            </Link>
            
            <Link
              href="/browse"
              className="block w-full rounded-xl py-4 font-bold bg-neutral-800 text-white text-center border border-neutral-700 hover:bg-neutral-700 transition-colors"
            >
              로그인 없이 둘러보기
            </Link>
            
            {DEV_MODE_ENABLED && (
              <button
                onClick={handleDevModeClick}
                className="w-full rounded-xl py-4 font-bold bg-blue-600 text-white text-center hover:bg-blue-700 transition-colors"
              >
                🧪 개발 모드로 테스트하기
              </button>
            )}
          </div>

          <div className="pt-4 text-xs text-neutral-500 space-y-1">
            <p>치지직 계정으로 간편하게 로그인하고</p>
            <p>방송 외 시간에도 크리에이터와 소통하세요</p>
          </div>
          
          {/* 약관 링크 */}
          <div className="pt-4 flex justify-center gap-4 text-xs text-neutral-600">
            <Link href="/terms" className="hover:text-neutral-400 transition-colors">이용약관</Link>
            <Link href="/privacy" className="hover:text-neutral-400 transition-colors">개인정보처리방침</Link>
            <Link href="/help" className="hover:text-neutral-400 transition-colors">도움말</Link>
          </div>
        </div>
      </main>

      {/* 비밀번호 입력 모달 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 rounded-2xl p-6 w-full max-w-md border border-neutral-800">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold mb-2">개발자 모드 접근</h2>
                <p className="text-sm text-neutral-400">
                  개발자 모드에 접근하려면 비밀번호를 입력하세요.
                </p>
              </div>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setPasswordError('')
                    }}
                    placeholder="비밀번호 입력"
                    className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                  {passwordError && (
                    <p className="text-sm text-red-400 mt-2">{passwordError}</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold"
                  >
                    확인
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
