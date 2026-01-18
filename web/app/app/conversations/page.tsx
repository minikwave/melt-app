'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import Skeleton, { ChannelCardSkeleton } from '../../../components/Skeleton'
import ErrorDisplay from '../../../components/ErrorDisplay'

export default function ConversationsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: conversations, isLoading, error, refetch } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      console.log('🔧 ConversationsPage: Fetching /conversations')
      const response = await api.get('/conversations')
      console.log('🔧 ConversationsPage: /conversations response:', response)
      console.log('🔧 ConversationsPage: response.data:', response.data)
      console.log('🔧 ConversationsPage: response.data.data:', response.data?.data)
      console.log('🔧 ConversationsPage: response.data.data.conversations:', response.data?.data?.conversations)
      return response
    },
    refetchInterval: 10000, // 10초마다 새로고침
  })

  // 전체 읽지 않은 메시지 수
  const { data: unreadCount } = useQuery({
    queryKey: ['conversations-unread-count'],
    queryFn: () => api.get('/conversations/unread-count'),
    refetchInterval: 10000,
  })

  const markAsReadMutation = useMutation({
    mutationFn: (chzzkChannelId: string) =>
      api.post(`/conversations/${chzzkChannelId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['conversations-unread-count'] })
    },
  })

  const handleChannelClick = (chzzkChannelId: string, unreadCount: number) => {
    if (unreadCount > 0) {
      markAsReadMutation.mutate(chzzkChannelId)
    }
    router.push(`/app/channels/${chzzkChannelId}`)
  }

  // 응답 구조 확인: response.data.data.conversations 또는 response.data.conversations
  const channels = conversations?.data?.data?.conversations || conversations?.data?.conversations || []

  if (isLoading) {
    return (
      <main className="min-h-screen p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton variant="text" width={60} height={24} />
            <Skeleton variant="text" width={120} height={24} />
            <Skeleton variant="text" width={80} height={32} />
          </div>
          {[1, 2, 3].map((i) => (
            <ChannelCardSkeleton key={i} />
          ))}
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen p-4">
        <ErrorDisplay 
          error={error as Error} 
          onRetry={() => refetch()}
          title="대화방 목록을 불러올 수 없습니다"
        />
      </main>
    )
  }

  console.log('🔧 ConversationsPage: channels:', channels)

  return (
    <main className="min-h-screen p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/app" className="text-neutral-400 hover:text-white">
            ← 뒤로
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">대화방</h1>
            {(unreadCount?.data?.data?.totalUnread || unreadCount?.data?.totalUnread || 0) > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs font-semibold">
                {unreadCount?.data?.data?.totalUnread || unreadCount?.data?.totalUnread || 0}
              </span>
            )}
          </div>
          <Link
            href="/app/search"
            className="px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-sm"
          >
            + 크리에이터 찾기
          </Link>
        </div>

        {/* 대화방 목록 */}
        {channels.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-xl font-semibold">팔로우한 크리에이터가 없습니다</h2>
            <p className="text-neutral-400 text-sm mb-6">
              크리에이터를 찾아 팔로우하면 여기에 표시됩니다
            </p>
            <Link
              href="/app/search"
              className="inline-block px-6 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors font-semibold"
            >
              크리에이터 찾기
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {channels.map((conv: any) => (
              <button
                key={conv.id}
                onClick={() => handleChannelClick(conv.chzzk_channel_id, parseInt(conv.unread_count || 0))}
                className="w-full p-4 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors text-left"
              >
                <div className="flex items-start gap-3">
                  {/* 채널 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">
                        {conv.name || conv.chzzk_channel_id}
                      </h3>
                      {parseInt(conv.unread_count || 0) > 0 && (
                        <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs font-semibold">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    {conv.last_message && (
                      <p className="text-sm text-neutral-400 truncate mb-1">
                        {conv.last_message}
                      </p>
                    )}
                    {conv.last_message_at && (
                      <p className="text-xs text-neutral-500">
                        {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
