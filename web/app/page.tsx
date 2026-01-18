'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// 정적 생성 허용 (빌드 시 미리 생성)
// export const dynamic = 'force-dynamic' // 제거하여 정적 생성 허용

const DEV_MODE_PASSWORD = '098765'

export default function Home() {
  const router = useRouter()
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handleDevModeClick = (e: React.MouseEvent) => {
    e.preventDefault()
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
          
          <div className="mt-8 space-y-4">
            <Link
              href="/auth/naver"
              className="block w-full rounded-xl py-4 font-bold bg-[#03C75A] text-white text-center hover:bg-[#02B350] transition-colors"
            >
              네이버로 시작하기
            </Link>
            
            <Link
              href="/browse"
              className="block w-full rounded-xl py-4 font-bold bg-neutral-800 text-white text-center border border-neutral-700 hover:bg-neutral-700 transition-colors"
            >
              둘러보기
            </Link>
            
            <button
              onClick={handleDevModeClick}
              className="w-full rounded-xl py-4 font-bold bg-blue-600 text-white text-center hover:bg-blue-700 transition-colors"
            >
              🧪 개발 모드로 테스트하기
            </button>
          </div>

          <div className="pt-8 text-sm text-neutral-500 space-y-2">
            <p>• 방송 중이 아니어도 후원 가능</p>
            <p>• 크리에이터와 비공개 메시지</p>
            <p>• 공개 피드로 소통</p>
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
