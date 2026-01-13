'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CreatorDashboard() {
  const router = useRouter()
  const [selectedChannel, setSelectedChannel] = useState<string>('channel_creator_1')
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week')

  // 사용자 정보 확인
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me'),
  })

  // 크리에이터가 아니면 리다이렉트
  useEffect(() => {
    if (!isLoadingUser && user?.data) {
      const userData = user.data.data?.user || user.data.user
      if (userData && userData.role !== 'creator' && userData.role !== 'admin') {
        router.push('/app')
      }
    }
  }, [user, isLoadingUser, router])

  const { data: inbox } = useQuery({
    queryKey: ['creator-inbox', selectedChannel],
    queryFn: () => api.get('/creator/inbox', {
      params: { chzzkChannelId: selectedChannel },
    }),
    enabled: !!selectedChannel,
  })

  const { data: stats } = useQuery({
    queryKey: ['creator-stats', selectedChannel, period],
    queryFn: () => api.get('/creator/stats', {
      params: { chzzkChannelId: selectedChannel, period },
    }),
    enabled: !!selectedChannel,
  })

  if (isLoadingUser) {
    return (
      <main className="min-h-screen p-4">
        <div className="text-center text-neutral-400 py-8">로딩 중...</div>
      </main>
    )
  }

  const userData = user?.data?.data?.user || user?.data?.user
  if (!userData || (userData.role !== 'creator' && userData.role !== 'admin')) {
    return (
      <main className="min-h-screen p-4">
        <div className="text-center text-neutral-400 py-8">
          크리에이터만 접근할 수 있습니다.
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/app" className="text-neutral-400 hover:text-white">
            ← 뒤로
          </Link>
          <h1 className="text-2xl font-bold">크리에이터 대시보드</h1>
          <div className="w-8" />
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="치지직 채널 ID 입력"
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700"
            />
            <Link
              href="/app/creator/settings"
              className="px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-sm whitespace-nowrap"
            >
              채널 설정
            </Link>
          </div>

          {/* 통계 섹션 */}
          {stats?.data && (
            <div className="space-y-4">
              {/* 기간 선택 */}
              <div className="flex gap-2">
                {(['day', 'week', 'month'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      period === p
                        ? 'bg-blue-500 text-white'
                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                    }`}
                  >
                    {p === 'day' && '오늘'}
                    {p === 'week' && '이번 주'}
                    {p === 'month' && '이번 달'}
                  </button>
                ))}
              </div>

              {/* 통계 카드 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
                  <div className="text-sm text-neutral-400 mb-1">총 후원액</div>
                  <div className="text-2xl font-bold">
                    {stats.data.totalAmount?.toLocaleString()}원
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
                  <div className="text-sm text-neutral-400 mb-1">후원 건수</div>
                  <div className="text-2xl font-bold">{stats.data.totalCount}건</div>
                </div>
                <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
                  <div className="text-sm text-neutral-400 mb-1">평균 후원액</div>
                  <div className="text-2xl font-bold">
                    {stats.data.averageAmount?.toLocaleString()}원
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
                  <div className="text-sm text-neutral-400 mb-1">기간</div>
                  <div className="text-lg font-semibold">
                    {period === 'day' && '오늘'}
                    {period === 'week' && '이번 주'}
                    {period === 'month' && '이번 달'}
                  </div>
                </div>
              </div>

              {/* Top Supporters */}
              {stats.data.topSupporters && stats.data.topSupporters.length > 0 && (
                <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
                  <h3 className="font-bold mb-3">Top Supporters</h3>
                  <div className="space-y-2">
                    {stats.data.topSupporters.map((supporter: any, index: number) => (
                      <div
                        key={supporter.chzzk_user_id}
                        className="flex items-center justify-between p-2 rounded-lg bg-neutral-900"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-neutral-400">
                            #{index + 1}
                          </span>
                          <span className="font-semibold">
                            {supporter.display_name || supporter.chzzk_user_id}
                          </span>
                        </div>
                        <div className="text-sm text-neutral-400">
                          {supporter.totalAmount?.toLocaleString()}원 ({supporter.count}건)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {inbox?.data && (
            <div className="space-y-4">
              <h2 className="font-bold">인박스</h2>

              {inbox.data.pendingDonations?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm text-neutral-400">미확정 후원</h3>
                  {inbox.data.pendingDonations.map((donation: any) => (
                    <div
                      key={donation.id}
                      className="p-4 rounded-xl bg-neutral-800 border border-neutral-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span>{donation.display_name}</span>
                        <button
                          onClick={async () => {
                            const amount = prompt('후원 금액을 입력하세요 (원)')
                            if (amount) {
                              await api.post(`/donations/${donation.id}/confirm`, {
                                amount: parseInt(amount),
                              })
                              // Refetch
                            }
                          }}
                          className="text-sm px-3 py-1 rounded bg-black text-white"
                        >
                          확정
                        </button>
                      </div>
                      {donation.message_content && (
                        <p className="text-sm text-neutral-300">
                          {donation.message_content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {inbox.data.dms?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm text-neutral-400">비공개 메시지</h3>
                  {inbox.data.dms.map((dm: any) => (
                    <div
                      key={dm.id}
                      className="p-4 rounded-xl bg-neutral-800 border border-neutral-700"
                    >
                      <div className="mb-2">
                        <span className="font-semibold">{dm.display_name}</span>
                      </div>
                      <p className="text-neutral-300 mb-2">{dm.content}</p>
                      <button
                        onClick={async () => {
                          const content = prompt('답장 내용을 입력하세요')
                          if (content) {
                            await api.post(`/messages/${dm.id}/reply`, {
                              content,
                              visibility: 'private',
                            })
                          }
                        }}
                        className="text-sm px-3 py-1 rounded bg-neutral-700"
                      >
                        답장
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
