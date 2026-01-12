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

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me'),
  })

  const logoutMutation = useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSuccess: () => {
      router.push('/')
    },
  })

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
            <label className="text-sm text-neutral-400">닉네임</label>
            <p className="text-lg font-semibold mt-1">
              {currentUser.display_name || currentUser.chzzk_user_id}
            </p>
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
