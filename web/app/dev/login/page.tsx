'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
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

  const handleLogin = async (userId: string) => {
    const user = userList.find(u => u.chzzk_user_id === userId)
    if (!user) return

    // 백엔드 API를 통해 로그인 시도
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/dev/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ chzzk_user_id: userId }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 403) {
          // 개발자 모드가 비활성화된 경우
          alert('개발자 모드가 비활성화되어 있습니다.\n백엔드 환경 변수 ENABLE_DEV_MODE=true로 설정하세요.')
          return
        }
        throw new Error(data.error || '로그인 실패')
      }

      // 로그인 성공
      // 백엔드에서 쿠키가 설정되므로, 프론트엔드에서도 추가 정보 저장
      Cookies.set('mock_user_id', userId, { path: '/' })
      Cookies.set('mock_user_role', user.role, { path: '/' })
      Cookies.set('mock_user_name', user.display_name, { path: '/' })
      Cookies.remove('mock_onboarding_complete', { path: '/' })
      
      // 온보딩 페이지로 이동
      router.push('/onboarding')
    } catch (error: any) {
      console.error('Dev login error:', error)
      
      // 네트워크 오류 등으로 백엔드에 연결할 수 없는 경우
      // 개발 환경에서만 로컬 쿠키 모드로 폴백
      if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_FORCE_MOCK === 'true') {
        console.warn('⚠️ Backend not available, using local cookie mode')
        const mockToken = `mock_${userId}_${Date.now()}`
        Cookies.set('melt_session', mockToken, { path: '/', expires: 7 })
        Cookies.set('mock_user_id', userId, { path: '/' })
        Cookies.set('mock_user_role', user.role, { path: '/' })
        Cookies.set('mock_user_name', user.display_name, { path: '/' })
        Cookies.remove('mock_onboarding_complete', { path: '/' })
        router.push('/onboarding')
      } else {
        alert(error.message || '로그인에 실패했습니다.')
      }
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-neutral-950 to-neutral-900">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">개발 모드 로그인</h1>
          <p className="text-neutral-400 text-sm">
            목 데이터로 테스트하세요
          </p>
          <p className="text-blue-400 text-xs mt-2">
            💡 실제 네이버 계정 없이도 테스트 가능합니다
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
