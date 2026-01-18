'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '../../../../lib/api'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'

export default function MyActivityPage() {
  const [activeTab, setActiveTab] = useState<'messages' | 'donations' | 'following'>('messages')

  const { data: activity, isLoading } = useQuery({
    queryKey: ['my-activity'],
    queryFn: () => api.get('/my/activity'),
  })

  if (isLoading) {
    return (
      <main className="min-h-screen p-4">
        <div className="text-center text-neutral-400 py-8">로딩 중...</div>
      </main>
    )
  }

  const messages = activity?.data?.messages || []
  const donations = activity?.data?.donations || []
  const following = activity?.data?.following || []

  return (
    <main className="min-h-screen p-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/app" className="text-neutral-400 hover:text-white">
            ← 뒤로
          </Link>
          <h1 className="text-xl font-bold">내 활동</h1>
          <div className="w-8" />
        </div>

        {/* 탭 */}
        <div className="flex gap-2">
          {(['messages', 'donations', 'following'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              {tab === 'messages' && `메시지 (${messages.length})`}
              {tab === 'donations' && `후원 (${donations.length})`}
              {tab === 'following' && `팔로우 (${following.length})`}
            </button>
          ))}
        </div>

        {/* 메시지 탭 */}
        {activeTab === 'messages' && (
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-neutral-400">
                보낸 메시지가 없습니다
              </div>
            ) : (
              messages.map((msg: any) => (
                <Link
                  key={msg.id}
                  href={`/app/channels/${msg.channel_id}`}
                  className="block p-4 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{msg.channel_name}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            msg.visibility === 'public'
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-purple-500/20 text-purple-300'
                          }`}
                        >
                          {msg.visibility === 'public' ? '공개' : '비공개'}
                        </span>
                        {msg.type === 'donation' && (
                          <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 text-xs font-semibold">
                            후원
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-300 mb-1">{msg.content}</p>
                      {msg.donation_amount && (
                        <p className="text-xs text-yellow-400 font-semibold">
                          {msg.donation_amount.toLocaleString()}원
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500">
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </p>
                </Link>
              ))
            )}
          </div>
        )}

        {/* 후원 탭 */}
        {activeTab === 'donations' && (
          <div className="space-y-3">
            {donations.length === 0 ? (
              <div className="text-center py-12 text-neutral-400">
                후원 내역이 없습니다
              </div>
            ) : (
              <>
                {/* 총 후원액 요약 */}
                <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
                  <div className="text-sm text-neutral-400 mb-1">총 후원액</div>
                  <div className="text-2xl font-bold">
                    {donations
                      .filter((d: any) => d.status === 'CONFIRMED')
                      .reduce((sum: number, d: any) => sum + d.amount, 0)
                      .toLocaleString()}
                    원
                  </div>
                </div>

                {donations.map((donation: any) => (
                  <Link
                    key={donation.id}
                    href={`/app/channels/${donation.channel_id}`}
                    className="block p-4 rounded-xl bg-neutral-800 border border-green-500/30 hover:bg-neutral-700 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{donation.channel_name}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              donation.status === 'CONFIRMED'
                                ? 'bg-green-500/20 text-green-300'
                                : donation.status === 'OCCURRED'
                                ? 'bg-yellow-500/20 text-yellow-300'
                                : 'bg-neutral-500/20 text-neutral-300'
                            }`}
                          >
                            {donation.status === 'CONFIRMED' && '확정'}
                            {donation.status === 'OCCURRED' && '대기'}
                            {donation.status === 'PENDING' && '대기'}
                          </span>
                        </div>
                        <p className="text-lg font-bold text-green-400 mb-1">
                          {donation.amount.toLocaleString()}원
                        </p>
                        {donation.message && (
                          <p className="text-sm text-neutral-300 mb-1">{donation.message}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500">
                      {formatDistanceToNow(new Date(donation.created_at), { addSuffix: true })}
                    </p>
                  </Link>
                ))}
              </>
            )}
          </div>
        )}

        {/* 팔로우 탭 */}
        {activeTab === 'following' && (
          <div className="space-y-3">
            {following.length === 0 ? (
              <div className="text-center py-12 text-neutral-400">
                팔로우한 크리에이터가 없습니다
              </div>
            ) : (
              following.map((channel: any) => (
                <Link
                  key={channel.chzzk_channel_id}
                  href={`/app/channels/${channel.chzzk_channel_id}`}
                  className="block p-4 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold mb-1">{channel.name}</div>
                      <div className="text-sm text-neutral-400 mb-1">{channel.owner_name}</div>
                      <div className="flex items-center gap-4 text-xs text-neutral-500">
                        <span>팔로워 {channel.follower_count.toLocaleString()}명</span>
                        <span>
                          {formatDistanceToNow(new Date(channel.followed_at), { addSuffix: true })}{' '}
                          팔로우
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  )
}
