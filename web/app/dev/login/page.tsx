'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

export default function DevLoginPage() {
  const router = useRouter()
  const [selectedUserId, setSelectedUserId] = useState('')

  // 더미 유저 목록 (서버 없이도 작동)
  const userList = [
    { chzzk_user_id: 'creator_1', display_name: '크리에이터1', role: 'creator' },
    { chzzk_user_id: 'creator_2', display_name: '크리에이터2', role: 'creator' },
    { chzzk_user_id: 'creator_3', display_name: '크리에이터3', role: 'creator' },
    { chzzk_user_id: 'viewer_1', display_name: '시청자1', role: 'viewer' },
    { chzzk_user_id: 'viewer_2', display_name: '시청자2', role: 'viewer' },
    { chzzk_user_id: 'viewer_3', display_name: '시청자3', role: 'viewer' },
  ]

  const handleLogin = (userId: string) => {
    // 더미 데이터 모드: 쿠키만 설정하고 바로 이동
    const user = userList.find(u => u.chzzk_user_id === userId)
    if (!user) return

    // 더미 세션 토큰 생성 (JWT 형식이지만 간단한 더미)
    const mockToken = `mock_${userId}_${Date.now()}`
    Cookies.set('melt_session', mockToken, { path: '/', expires: 7 })
    Cookies.set('mock_user_id', userId, { path: '/' })
    Cookies.set('mock_user_role', user.role, { path: '/' })
    Cookies.set('mock_user_name', user.display_name, { path: '/' })
    // 온보딩 상태 초기화 (새 로그인 시 온보딩 필요)
    Cookies.remove('mock_onboarding_complete', { path: '/' })
    
    // 온보딩 페이지로 이동 (온보딩이 완료되면 자동으로 /app으로 이동)
    router.push('/onboarding')
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-neutral-950 to-neutral-900">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">개발 모드 로그인</h1>
          <p className="text-neutral-400 text-sm">
            더미 데이터로 테스트하세요
          </p>
        </div>

        <div className="space-y-2">
          {userList.map((user: any) => (
            <button
              key={user.chzzk_user_id}
              onClick={() => handleLogin(user.chzzk_user_id)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                selectedUserId === user.chzzk_user_id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{user.display_name}</div>
                  <div className="text-sm text-neutral-400">{user.chzzk_user_id}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  user.role === 'creator'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {user.role === 'creator' ? '크리에이터' : '시청자'}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center">
          <a
            href="/auth/naver"
            className="text-sm text-neutral-500 hover:text-neutral-300"
          >
            실제 로그인으로 전환
          </a>
        </div>
      </div>
    </main>
  )
}
