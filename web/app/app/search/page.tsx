'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export default function SearchPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search-creators', searchQuery],
    queryFn: () => api.get('/search/creators', {
      params: { q: searchQuery, limit: 20 },
    }),
    enabled: searchQuery.trim().length > 0,
  })

  const followMutation = useMutation({
    mutationFn: (chzzkChannelId: string) => 
      api.post(`/channels/${chzzkChannelId}/follow`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followed-channels'] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  const unfollowMutation = useMutation({
    mutationFn: (chzzkChannelId: string) => 
      api.delete(`/channels/${chzzkChannelId}/follow`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followed-channels'] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  const handleFollow = (chzzkChannelId: string) => {
    followMutation.mutate(chzzkChannelId)
  }

  const handleUnfollow = (chzzkChannelId: string) => {
    unfollowMutation.mutate(chzzkChannelId)
  }

  return (
    <main className="min-h-screen p-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/app" className="text-neutral-400 hover:text-white">
            ← 뒤로
          </Link>
          <h1 className="text-xl font-bold">크리에이터 찾기</h1>
          <div className="w-8" />
        </div>

        {/* 검색 입력 */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="채널 ID 또는 이름으로 검색..."
            className="w-full px-4 py-3 pl-12 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-blue-500"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">
            🔍
          </div>
        </div>

        {/* 검색 결과 */}
        {searchQuery.trim().length > 0 && (
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center text-neutral-400 py-8">검색 중...</div>
            ) : searchResults?.data?.creators?.length === 0 ? (
              <div className="text-center text-neutral-400 py-8">
                검색 결과가 없습니다
              </div>
            ) : (
              searchResults?.data?.creators?.map((creator: any) => (
                <CreatorCard
                  key={creator.id}
                  creator={creator}
                  onFollow={handleFollow}
                  onUnfollow={handleUnfollow}
                />
              ))
            )}
          </div>
        )}

        {/* 검색 안내 */}
        {searchQuery.trim().length === 0 && (
          <div className="text-center py-12 space-y-4">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold">크리에이터를 찾아보세요</h2>
            <p className="text-neutral-400 text-sm">
              채널 ID 또는 이름으로 검색할 수 있습니다
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

function CreatorCard({ creator, onFollow, onUnfollow }: any) {
  const router = useRouter()
  const [isFollowing, setIsFollowing] = useState(false)

  const { data: followStatus } = useQuery({
    queryKey: ['follow-status', creator.chzzk_channel_id],
    queryFn: () => api.get(`/channels/${creator.chzzk_channel_id}/follow-status`),
  })

  useEffect(() => {
    if (followStatus?.data?.isFollowing !== undefined) {
      setIsFollowing(followStatus.data.isFollowing)
    }
  }, [followStatus])

  const handleToggleFollow = () => {
    if (isFollowing) {
      onUnfollow(creator.chzzk_channel_id)
      setIsFollowing(false)
    } else {
      onFollow(creator.chzzk_channel_id)
      setIsFollowing(true)
    }
  }

  return (
    <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold mb-1">{creator.name || creator.chzzk_channel_id}</h3>
          {creator.owner_name && (
            <p className="text-sm text-neutral-400">{creator.owner_name}</p>
          )}
          {creator.follower_count > 0 && (
            <p className="text-xs text-neutral-500 mt-1">
              팔로워 {creator.follower_count}명
            </p>
          )}
        </div>
        <button
          onClick={handleToggleFollow}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            isFollowing
              ? 'bg-neutral-700 text-white hover:bg-neutral-600'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isFollowing ? '팔로우 중' : '팔로우'}
        </button>
      </div>
      <button
        onClick={() => router.push(`/app/channels/${creator.chzzk_channel_id}`)}
        className="w-full py-2 rounded-lg bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 transition-colors text-sm"
      >
        채널 열기
      </button>
    </div>
  )
}
