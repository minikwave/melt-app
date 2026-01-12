'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useState } from 'react'

export default function CreatorDashboard() {
  const [selectedChannel, setSelectedChannel] = useState<string>('')

  const { data: inbox } = useQuery({
    queryKey: ['creator-inbox', selectedChannel],
    queryFn: () => api.get('/creator/inbox', {
      params: { chzzkChannelId: selectedChannel },
    }),
    enabled: !!selectedChannel,
  })

  const { data: stats } = useQuery({
    queryKey: ['creator-stats', selectedChannel],
    queryFn: () => api.get('/creator/stats/summary', {
      params: { chzzkChannelId: selectedChannel, range: '30d' },
    }),
    enabled: !!selectedChannel,
  })

  return (
    <main className="min-h-screen p-4">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">크리에이터 대시보드</h1>

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

          {stats?.data && (
            <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700 space-y-2">
              <h2 className="font-bold">통계 (최근 30일)</h2>
              <div className="text-sm space-y-1">
                <p>확정 후원: {stats.data.confirmed}건</p>
                <p>미확정: {stats.data.pending}건</p>
                <p>총액: {stats.data.totalAmount?.toLocaleString()}원</p>
              </div>
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
