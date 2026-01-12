'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminChannelsPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me'),
  })

  const { data: channels, isLoading } = useQuery({
    queryKey: ['admin-channels', search],
    queryFn: () => api.get('/admin/channels', { params: { search } }),
  })

  useEffect(() => {
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

  const channelList = channels?.data?.channels || []

  return (
    <main className="min-h-screen p-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/app/admin" className="text-neutral-400 hover:text-white">
            ← 뒤로
          </Link>
          <h1 className="text-xl font-bold">채널 관리</h1>
          <div className="w-8" />
        </div>

        {/* 검색 */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="채널 ID 또는 이름으로 검색..."
          className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-blue-500"
        />

        {/* 채널 목록 */}
        <div className="space-y-2">
          {channelList.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">채널을 찾을 수 없습니다</div>
          ) : (
            channelList.map((channel: any) => (
              <Link
                key={channel.id || channel.chzzk_channel_id}
                href={`/app/channels/${channel.chzzk_channel_id}`}
                className="block p-4 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold mb-1">{channel.name || channel.chzzk_channel_id}</div>
                    <div className="text-sm text-neutral-400 mb-1 font-mono">
                      {channel.chzzk_channel_id}
                    </div>
                    <div className="flex items-center gap-2">
                      {channel.owner_name && (
                        <span className="text-sm text-neutral-400">{channel.owner_name}</span>
                      )}
                      {channel.follower_count !== undefined && (
                        <span className="text-sm text-neutral-500">
                          팔로워 {channel.follower_count.toLocaleString()}명
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* 총 채널 수 */}
        {channels?.data?.total !== undefined && (
          <div className="text-center text-sm text-neutral-400">
            총 {channels.data.total}개 채널
          </div>
        )}
      </div>
    </main>
  )
}
