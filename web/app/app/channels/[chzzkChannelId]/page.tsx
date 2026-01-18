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

  // 로그인 상태 확인 (선택적 - 로그인 없이도 접근 가능)
  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me'),
    retry: false,
  })

  // 치즈 후원 완료 후 돌아왔는지 확인 (로컬 체크 - 전역 핸들러가 있지만 이중 체크)
  useEffect(() => {
    const intentId = localStorage.getItem('melt_intent_id')
    const donationMessage = localStorage.getItem('melt_donation_message')
    const storedChannelId = localStorage.getItem('melt_donation_channel_id')
    
    // 현재 채널과 저장된 채널이 일치하고 Intent ID가 있으면 완료 페이지로 이동
    if (intentId && donationMessage && storedChannelId === chzzkChannelId) {
      // 약간의 지연을 두어 전역 핸들러와 충돌 방지
      const timer = setTimeout(() => {
        router.push(`/app/channels/${chzzkChannelId}/donate/complete`)
      }, 300)
      
      return () => clearTimeout(timer)
    }
  }, [chzzkChannelId, router])

  // 응답 구조 확인: response.data.data.user 또는 response.data.user
  const userData = user?.data?.data?.user || user?.data?.user
  const currentUser = userData
  const isCreator = currentUser?.role === 'creator' || currentUser?.role === 'admin'
  const isLoggedIn = !!currentUser
  const queryClient = useQueryClient()

  // 팔로우 상태 확인 (로그인한 시청자만)
  const { data: followStatus } = useQuery({
    queryKey: ['follow-status', chzzkChannelId],
    queryFn: () => api.get(`/channels/${chzzkChannelId}/follow-status`),
    enabled: isLoggedIn && !isCreator,
    retry: false,
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
          <Link 
            href={isLoggedIn ? (isCreator ? "/app/creator/dashboard" : "/app/conversations") : "/browse"} 
            className="text-neutral-400 hover:text-white"
          >
            ← 뒤로
          </Link>
          <h1 className="text-lg font-bold">
            {channel?.data?.channel?.name || chzzkChannelId}
          </h1>
          <div className="w-8" /> {/* Spacer */}
        </div>
        
        {/* 로그인 안내 (로그인하지 않은 경우) */}
        {!isLoggedIn && (
          <div className="mb-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <p className="text-xs text-blue-400 mb-2">
              💡 로그인하면 메시지를 보내고 팔로우할 수 있습니다
            </p>
            <Link
              href="/auth/naver"
              className="block w-full py-2 rounded-lg bg-[#03C75A] text-white hover:bg-[#02B350] transition-colors text-center text-sm font-semibold"
            >
              네이버로 시작하기
            </Link>
          </div>
        )}
        
        {/* 액션 버튼들 (로그인한 시청자만) */}
        {isLoggedIn && !isCreator && (
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
