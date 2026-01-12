'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

export default function ProfilePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me'),
  })

  const updateProfileMutation = useMutation({
    mutationFn: (displayName: string) => api.put('/profile', { display_name: displayName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      setIsEditing(false)
      alert('프로필이 업데이트되었습니다.')
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || '프로필 업데이트에 실패했습니다.')
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSuccess: () => {
      // 개발 모드: 쿠키 정리
      if (typeof window !== 'undefined') {
        const Cookies = require('js-cookie').default
        Cookies.remove('melt_session', { path: '/' })
        Cookies.remove('mock_user_id', { path: '/' })
        Cookies.remove('mock_user_role', { path: '/' })
        Cookies.remove('mock_user_name', { path: '/' })
        Cookies.remove('mock_onboarding_complete', { path: '/' })
      }
      router.push('/')
    },
  })

  const handleEdit = () => {
    if (user?.data?.user) {
      setDisplayName(user.data.user.display_name || user.data.user.chzzk_user_id)
      setIsEditing(true)
    }
  }

  const handleSave = () => {
    if (!displayName.trim()) {
      alert('이름을 입력해주세요')
      return
    }
    updateProfileMutation.mutate(displayName.trim())
  }

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      setIsLoggingOut(true)
      logoutMutation.mutate()
    }
  }

  if (!user?.data?.user) {
    return null
  }

  const currentUser = user.data.user
  const isCreator = currentUser.role === 'creator' || currentUser.role === 'admin'

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/app" className="text-neutral-400 hover:text-white">
            ← 뒤로
          </Link>
          <h1 className="text-xl font-bold">프로필</h1>
          <div className="w-8" />
        </div>

        {/* 프로필 정보 */}
        <div className="p-6 rounded-xl bg-neutral-800 border border-neutral-700 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-neutral-400">닉네임</label>
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="text-xs px-3 py-1 rounded-lg bg-neutral-700 hover:bg-neutral-600 transition-colors"
                >
                  수정
                </button>
              )}
            </div>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-700 focus:outline-none focus:border-blue-500"
                  placeholder="닉네임을 입력하세요"
                  maxLength={20}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending}
                    className="flex-1 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm font-semibold"
                  >
                    {updateProfileMutation.isPending ? '저장 중...' : '저장'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setDisplayName('')
                    }}
                    className="px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 transition-colors text-sm"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-lg font-semibold mt-1">
                {currentUser.display_name || currentUser.chzzk_user_id}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-neutral-400">치지직 유저 ID</label>
            <p className="text-sm text-neutral-300 mt-1 font-mono">
              {currentUser.chzzk_user_id}
            </p>
          </div>

          <div>
            <label className="text-sm text-neutral-400">역할</label>
            <div className="mt-1">
              <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                isCreator
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}>
                {isCreator ? '크리에이터' : '시청자'}
              </span>
            </div>
          </div>
        </div>

        {/* 메뉴 */}
        <div className="space-y-2">
          {isCreator && (
            <Link
              href="/app/creator/settings"
              className="block p-4 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors"
            >
              <div className="font-semibold">채널 설정</div>
              <div className="text-sm text-neutral-400">후원 링크 및 채널 정보</div>
            </Link>
          )}

          <Link
            href="/onboarding"
            className="block p-4 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors"
          >
            <div className="font-semibold">온보딩 다시 보기</div>
            <div className="text-sm text-neutral-400">역할 선택 및 초기 설정</div>
          </Link>
        </div>

        {/* 로그아웃 */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full py-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50 font-semibold"
        >
          {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
        </button>
      </div>
    </main>
  )
}
