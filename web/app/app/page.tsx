'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Cookies from 'js-cookie'

export default function AppPage() {
  const router = useRouter()
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      console.log('🔧 AppPage: Fetching /auth/me')
      const response = await api.get('/auth/me')
      console.log('🔧 AppPage: /auth/me response:', response)
      console.log('🔧 AppPage: response.data:', response.data)
      console.log('🔧 AppPage: response.data.data:', response.data?.data)
      console.log('🔧 AppPage: response.data.data.user:', response.data?.data?.user)
      return response
    },
    retry: false,
  })

  const { data: onboardingStatus } = useQuery({
    queryKey: ['onboarding-status'],
    queryFn: () => api.get('/onboarding/status'),
    retry: false,
    enabled: !!user?.data?.user,
  })

  // 인기 크리에이터 목록
  const { data: popularCreators } = useQuery({
    queryKey: ['popular-creators'],
    queryFn: () => api.get('/creators/popular', { params: { limit: 6 } }),
    enabled: !!user?.data?.user,
  })

  useEffect(() => {
    // 에러가 있고 로딩이 완료된 경우에만 리다이렉트
    if (error && !isLoading) {
      // Mock 모드에서는 에러를 무시하고 기본 유저 사용
      console.warn('Auth error (ignored in mock mode):', error)
      // Mock 모드에서는 리다이렉트하지 않음
      return
    }

    // 온보딩이 필요한 경우
    if (user?.data?.user && onboardingStatus?.data) {
      if (onboardingStatus.data.needsOnboarding || onboardingStatus.data.needsCreatorSetup) {
        router.push('/onboarding')
      }
    }
  }, [error, isLoading, router, user, onboardingStatus])

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-neutral-400">로딩 중...</div>
      </main>
    )
  }

  // Mock 모드에서는 유저가 없어도 기본 유저로 표시
  console.log('🔧 AppPage: user data:', user)
  console.log('🔧 AppPage: user?.data:', user?.data)
  console.log('🔧 AppPage: user?.data?.data:', user?.data?.data)
  console.log('🔧 AppPage: user?.data?.data?.user:', user?.data?.data?.user)
  console.log('🔧 AppPage: user?.data?.user:', user?.data?.user)
  
  // 응답 구조 확인: response.data.data.user 또는 response.data.user
  const userData = user?.data?.data?.user || user?.data?.user
  
  if (!userData) {
    console.warn('🔧 AppPage: No user data found, checking cookies...')
    // Mock 모드에서 쿠키가 없으면 개발 로그인 페이지로 안내
    if (typeof window !== 'undefined') {
      try {
        const mockUserId = Cookies.get('mock_user_id')
        console.log('🔧 AppPage: mockUserId from cookie:', mockUserId)
        if (!mockUserId) {
          return (
            <main className="flex min-h-screen items-center justify-center p-4">
              <div className="text-center space-y-4">
                <p className="text-neutral-400">로그인이 필요합니다</p>
                <Link
                  href="/dev/login"
                  className="inline-block px-6 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  개발 모드로 로그인
                </Link>
              </div>
            </main>
          )
        }
      } catch (error) {
        console.error('🔧 AppPage: Cookie read error:', error)
        return (
          <main className="flex min-h-screen items-center justify-center p-4">
            <div className="text-center space-y-4">
              <p className="text-neutral-400">로그인이 필요합니다</p>
              <Link
                href="/dev/login"
                className="inline-block px-6 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                개발 모드로 로그인
              </Link>
            </div>
          </main>
        )
      }
    }
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-neutral-400">사용자 정보를 불러오는 중...</div>
      </main>
    )
  }

  const currentUser = userData
  const isCreator = currentUser.role === 'creator' || currentUser.role === 'admin'
  
  console.log('🔧 AppPage: currentUser:', currentUser)
  console.log('🔧 AppPage: isCreator:', isCreator)

  return (
    <main className="min-h-screen p-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Melt</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-400">
              {currentUser.display_name || currentUser.chzzk_user_id}
            </span>
            {isCreator && (
              <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
                크리에이터
              </span>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          {/* 알림 링크 */}
          <Link
            href="/app/notifications"
            className="block w-full rounded-xl py-4 px-4 bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors relative"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold mb-1">알림</div>
                <div className="text-sm text-neutral-400">메시지 및 후원 알림</div>
              </div>
            </div>
          </Link>

          {!isCreator && (
            <>
              <Link
                href="/app/conversations"
                className="block w-full rounded-xl py-4 px-4 bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors relative"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold mb-1">대화방</div>
                    <div className="text-sm text-neutral-400">팔로우한 크리에이터와의 대화</div>
                  </div>
                  <span className="text-2xl">💬</span>
                </div>
              </Link>
              <Link
                href="/app/search"
                className="block w-full rounded-xl py-4 px-4 bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold mb-1">크리에이터 찾기</div>
                    <div className="text-sm text-neutral-400">검색 및 팔로우</div>
                  </div>
                  <span className="text-2xl">🔍</span>
                </div>
              </Link>
            </>
          )}

          {/* 관리자 메뉴 */}
          {currentUser.role === 'admin' && (
            <Link
              href="/app/admin"
              className="block w-full rounded-xl py-4 px-4 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors"
            >
              <div className="font-semibold mb-1">관리자 대시보드</div>
              <div className="text-sm text-neutral-400">시스템 관리</div>
            </Link>
          )}

          {isCreator && (
            <>
              <Link
                href="/app/creator/messages"
                className="block w-full rounded-xl py-4 px-4 bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors"
              >
                <div className="font-semibold mb-1">메시지 관리</div>
                <div className="text-sm text-neutral-400">DM 및 후원 메시지 확인</div>
              </Link>
              <Link
                href="/app/creator/dashboard"
                className="block w-full rounded-xl py-4 px-4 bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors"
              >
                <div className="font-semibold mb-1">크리에이터 대시보드</div>
                <div className="text-sm text-neutral-400">후원 관리 및 통계</div>
              </Link>
            </>
          )}
        </div>

        {/* 인기 크리에이터 목록 (시청자만) */}
        {!isCreator && popularCreators?.data?.creators && popularCreators.data.creators.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">인기 크리에이터</h2>
              <Link
                href="/app/search"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                더보기 →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {popularCreators.data.creators.slice(0, 4).map((creator: any) => (
                <Link
                  key={creator.id || creator.chzzk_channel_id}
                  href={`/app/channels/${creator.chzzk_channel_id}`}
                  className="p-4 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors"
                >
                  <div className="font-semibold text-sm mb-1 truncate">
                    {creator.name || creator.chzzk_channel_id}
                  </div>
                  {creator.owner_name && (
                    <div className="text-xs text-neutral-400 truncate mb-2">
                      {creator.owner_name}
                    </div>
                  )}
                  {creator.follower_count > 0 && (
                    <div className="text-xs text-neutral-500">
                      팔로워 {creator.follower_count.toLocaleString()}명
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="pt-4 border-t border-neutral-800">
          <p className="text-sm text-neutral-400 mb-2">Melt 사용법</p>
          <ul className="text-sm text-neutral-500 space-y-1">
            <li>• 채널을 찾아 메시지를 보낼 수 있습니다</li>
            <li>• 일반 유저 메시지는 크리에이터에게만 전달됩니다</li>
            <li>• 크리에이터 메시지는 모두에게 공개됩니다</li>
            {isCreator && (
              <li>• 크리에이터는 DM을 RT하여 공개할 수 있습니다</li>
            )}
          </ul>
        </div>

        {/* 프로필 링크 */}
        <div className="pt-4 space-y-2">
          <Link
            href="/app/profile"
            className="block p-3 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors text-center text-sm"
          >
            프로필 설정
          </Link>
          <Link
            href="/help"
            className="block p-3 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors text-center text-sm"
          >
            도움말
          </Link>
        </div>
      </div>
    </main>
  )
}
