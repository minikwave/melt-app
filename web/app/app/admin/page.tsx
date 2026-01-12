'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminDashboard() {
  const router = useRouter()

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me'),
  })

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats'),
  })

  useEffect(() => {
    // 관리자 권한 확인
    if (user?.data?.user && user.data.user.role !== 'admin') {
      router.push('/app')
    }
  }, [user, router])

  if (isLoading) {
    return (
      <main className="min-h-screen p-4">
        <div className="text-center text-neutral-400 py-8">로딩 중...</div>
      </main>
    )
  }

  if (user?.data?.user?.role !== 'admin') {
    return null
  }

  const adminStats = stats?.data || {}

  return (
    <main className="min-h-screen p-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/app" className="text-neutral-400 hover:text-white">
            ← 뒤로
          </Link>
          <h1 className="text-xl font-bold">관리자 대시보드</h1>
          <div className="w-8" />
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
            <div className="text-sm text-neutral-400 mb-1">전체 사용자</div>
            <div className="text-2xl font-bold">{adminStats.totalUsers?.toLocaleString() || 0}</div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
            <div className="text-sm text-neutral-400 mb-1">크리에이터</div>
            <div className="text-2xl font-bold">
              {adminStats.totalCreators?.toLocaleString() || 0}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
            <div className="text-sm text-neutral-400 mb-1">전체 메시지</div>
            <div className="text-2xl font-bold">
              {adminStats.totalMessages?.toLocaleString() || 0}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
            <div className="text-sm text-neutral-400 mb-1">전체 후원</div>
            <div className="text-2xl font-bold">
              {adminStats.totalDonations?.toLocaleString() || 0}
            </div>
          </div>
        </div>

        {/* 총 후원액 */}
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
          <div className="text-sm text-green-400 mb-1">총 후원액</div>
          <div className="text-3xl font-bold text-green-400">
            {adminStats.totalDonationAmount?.toLocaleString() || 0}원
          </div>
        </div>

        {/* 최근 활동 */}
        {adminStats.recentActivity && adminStats.recentActivity.length > 0 && (
          <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
            <h2 className="font-bold mb-3">오늘의 활동</h2>
            <div className="space-y-2">
              {adminStats.recentActivity.map((activity: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg bg-neutral-900"
                >
                  <div>
                    <span className="font-semibold">
                      {activity.type === 'user_signup' && '신규 가입'}
                      {activity.type === 'message' && '메시지'}
                      {activity.type === 'donation' && '후원'}
                    </span>
                  </div>
                  <div className="text-sm text-neutral-400">{activity.count}건</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 관리 메뉴 */}
        <div className="space-y-2">
          <Link
            href="/app/admin/users"
            className="block p-4 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors"
          >
            <div className="font-semibold">유저 관리</div>
            <div className="text-sm text-neutral-400">유저 목록 및 관리</div>
          </Link>
          <Link
            href="/app/admin/channels"
            className="block p-4 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors"
          >
            <div className="font-semibold">채널 관리</div>
            <div className="text-sm text-neutral-400">채널 목록 및 관리</div>
          </Link>
          <Link
            href="/app/admin/messages"
            className="block p-4 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors"
          >
            <div className="font-semibold">메시지 모더레이션</div>
            <div className="text-sm text-neutral-400">신고된 메시지 관리</div>
          </Link>
        </div>
      </div>
    </main>
  )
}
