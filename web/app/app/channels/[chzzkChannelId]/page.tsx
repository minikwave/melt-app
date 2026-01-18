'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../../lib/api'
import Messenger from '../../../../components/Messenger'
import Link from 'next/link'
import { useEffect } from 'react'

export default function ChannelPage() {
  const params = useParams()
  const router = useRouter()
  const chzzkChannelId = params.chzzkChannelId as string

  const { data: channel } = useQuery({
    queryKey: ['channel', chzzkChannelId],
    queryFn: () => api.get(`/channels/${chzzkChannelId}`),
  })

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me'),
    retry: false,
  })

  // 치즈 후원 완료 후 돌아왔는지 확인
  useEffect(() => {
    const intentId = localStorage.getItem('melt_intent_id')
    const donationMessage = localStorage.getItem('melt_donation_message')
    
    if (intentId && donationMessage) {
      // 완료 페이지로 이동
      router.push(`/app/channels/${chzzkChannelId}/donate/complete`)
    }
  }, [chzzkChannelId, router])

  // 응답 구조 확인: response.data.data.user 또는 response.data.user
  const userData = user?.data?.data?.user || user?.data?.user
  const currentUser = userData
  const isCreator = currentUser?.role === 'creator' || currentUser?.role === 'admin'
  const queryClient = useQueryClient()

  // 팔로우 상태 확인
  const { data: followStatus } = useQuery({
    queryKey: ['follow-status', chzzkChannelId],
    queryFn: () => api.get(`/channels/${chzzkChannelId}/follow-status`),
    enabled: !isCreator,
  })

  const followMutation = useMutation({
    mutationFn: () => api.post(`/channels/${chzzkChannelId}/follow`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-status', chzzkChannelId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  const unfollowMutation = useMutation({
    mutationFn: () => api.delete(`/channels/${chzzkChannelId}/follow`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-status', chzzkChannelId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  // 메시지 읽음 처리
  useEffect(() => {
    if (!isCreator && followStatus?.data?.isFollowing) {
      api.post(`/conversations/${chzzkChannelId}/read`).then(() => {
        queryClient.invalidateQueries({ queryKey: ['conversations'] })
      })
    }
  }, [chzzkChannelId, isCreator, followStatus, queryClient])

  return (
    <main className="h-screen flex flex-col bg-neutral-950">
      {/* Header */}
      <div className="flex-shrink-0 bg-neutral-900 border-b border-neutral-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <Link href={isCreator ? "/app/creator/dashboard" : "/app/conversations"} className="text-neutral-400 hover:text-white">
            ← 뒤로
          </Link>
          <h1 className="text-lg font-bold">
            {channel?.data?.channel?.name || chzzkChannelId}
          </h1>
          <div className="w-8" /> {/* Spacer */}
        </div>
        
        {/* 액션 버튼들 (시청자만) */}
        {!isCreator && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (followStatus?.data?.isFollowing) {
                  unfollowMutation.mutate()
                } else {
                  followMutation.mutate()
                }
              }}
              disabled={followMutation.isPending || unfollowMutation.isPending}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                followStatus?.data?.isFollowing
                  ? 'bg-neutral-700 text-white hover:bg-neutral-600'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              } disabled:opacity-50`}
            >
              {followStatus?.data?.isFollowing ? '팔로우 중' : '팔로우'}
            </button>
            <Link
              href={`/app/channels/${chzzkChannelId}/donate`}
              className="flex-1 py-2 rounded-lg text-sm font-semibold bg-[#03C75A] text-white hover:bg-[#02B350] transition-colors text-center"
            >
              💰 치즈 보내기
            </Link>
          </div>
        )}
      </div>

      {/* Messenger */}
      <div className="flex-1 overflow-hidden">
        <Messenger
          chzzkChannelId={chzzkChannelId}
          currentUserId={currentUser?.chzzk_user_id}
          isCreator={isCreator}
        />
      </div>
    </main>
  )
}
