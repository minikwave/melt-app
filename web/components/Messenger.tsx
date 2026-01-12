'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'
import { useState, useEffect, useRef } from 'react'
import MessageInput from './MessageInput'

interface MessengerProps {
  chzzkChannelId: string
  currentUserId?: string
  isCreator?: boolean
}

export default function Messenger({ chzzkChannelId, currentUserId, isCreator }: MessengerProps) {
  const [showDmOnly, setShowDmOnly] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  // 공개 피드 (치즈 메시지 + 크리에이터 메시지 + RT 메시지)
  const { data: feed } = useQuery({
    queryKey: ['feed', chzzkChannelId],
    queryFn: () => api.get('/feed', {
      params: { chzzkChannelId },
    }),
    enabled: !showDmOnly,
    refetchInterval: 5000, // 5초마다 새로고침
  })

  // 크리에이터 인박스 (DM만)
  const { data: inbox } = useQuery({
    queryKey: ['creator-inbox', chzzkChannelId],
    queryFn: () => api.get('/creator/inbox', {
      params: { chzzkChannelId },
    }),
    enabled: isCreator && showDmOnly,
    refetchInterval: 5000,
  })

  // 스크롤을 맨 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [feed, inbox, showDmOnly])

  // 메시지 전송 후 새로고침
  const handleMessageSent = () => {
    queryClient.invalidateQueries({ queryKey: ['feed', chzzkChannelId] })
    queryClient.invalidateQueries({ queryKey: ['creator-inbox', chzzkChannelId] })
  }

  if (isCreator && showDmOnly) {
    return (
      <div className="flex flex-col h-full bg-neutral-950">
        {/* DM 헤더 */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900">
          <h2 className="font-bold text-lg">비공개 메시지</h2>
          <button
            onClick={() => setShowDmOnly(false)}
            className="text-sm px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors"
          >
            전체 보기
          </button>
        </div>

        {/* DM 목록 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {inbox?.data?.dms?.length === 0 ? (
            <div className="text-center text-neutral-400 py-8">
              받은 비공개 메시지가 없습니다
            </div>
          ) : (
            inbox?.data?.dms?.map((dm: any) => (
              <DmBubble key={dm.id} dm={dm} chzzkChannelId={chzzkChannelId} queryClient={queryClient} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    )
  }

  // 공개 메시지 (치즈 메시지 + 크리에이터 메시지 + RT 메시지)
  const publicMessages = feed?.data?.feed || []

  return (
    <div className="flex flex-col h-full bg-neutral-950">
      {/* 헤더 */}
      {isCreator && (
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900">
          <h2 className="font-bold text-lg">공개 메시지</h2>
          <button
            onClick={() => setShowDmOnly(true)}
            className="text-sm px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors"
          >
            DM만 보기
          </button>
        </div>
      )}

      {/* 메시지 목록 - 내부 메신저 형태 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {publicMessages.length === 0 ? (
          <div className="text-center text-neutral-400 py-8">
            아직 메시지가 없습니다
          </div>
        ) : (
          publicMessages.map((msg: any) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              currentUserId={currentUserId}
              isCreator={isCreator}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <MessageInput
        chzzkChannelId={chzzkChannelId}
        isCreator={isCreator}
        onMessageSent={handleMessageSent}
      />
    </div>
  )
}

// 메시지 버블 - 타입별로 다르게 표시
function MessageBubble({ message, currentUserId, isCreator }: any) {
  const isMyMessage = message.author?.chzzkUserId === currentUserId || message.author?.chzzk_user_id === currentUserId
  const isCreatorMessage = message.type === 'creator_post' || message.type === 'creator_reply'
  const isDonationMessage = message.type === 'donation' || message.donationAmount
  const isRetweetMessage = message.isRetweet || message.type === 'retweet'
  const isRead = message.read !== false // 기본값은 true
  const isSent = message.sent !== false // 기본값은 true
  
  // 메시지 타입별 스타일 결정
  let bubbleStyle = ''
  let badgeText = ''
  let badgeColor = ''
  
  if (isCreatorMessage) {
    // 크리에이터 메시지
    bubbleStyle = 'bg-yellow-500/20 border border-yellow-500/30'
    badgeText = '크리에이터'
    badgeColor = 'bg-yellow-500/30 text-yellow-300'
  } else if (isDonationMessage && !isRetweetMessage) {
    // 전체공개 시청자 메시지(치즈)
    bubbleStyle = 'bg-green-500/20 border border-green-500/30'
    badgeText = `치즈 ${message.donationAmount?.toLocaleString() || 0}원`
    badgeColor = 'bg-green-500/30 text-green-300'
  } else if (isRetweetMessage) {
    // 전체공개 시청자 메시지(크리에이터 RT)
    bubbleStyle = 'bg-blue-500/20 border border-blue-500/30'
    badgeText = 'RT'
    badgeColor = 'bg-blue-500/30 text-blue-300'
  } else {
    // 일반 메시지 (공개 피드에는 나타나지 않아야 하지만 혹시 모르니)
    bubbleStyle = 'bg-neutral-800 border border-neutral-700'
  }

  return (
    <div
      className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 space-y-1.5 ${bubbleStyle}`}
      >
        {/* 헤더 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm">
            {message.author?.displayName || message.author?.display_name || message.author?.chzzkUserId || message.author?.chzzk_user_id || '알 수 없음'}
          </span>
          {badgeText && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${badgeColor}`}>
              {badgeText}
            </span>
          )}
        </div>

        {/* 메시지 내용 */}
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </p>

        {/* 시간 및 상태 */}
        <div className="flex items-center justify-between">
          <div className="text-xs opacity-70">
            {formatDistanceToNow(new Date(message.createdAt || message.created_at), { addSuffix: true })}
          </div>
          {isMyMessage && (
            <div className="flex items-center gap-1">
              {!isSent && (
                <span className="text-xs opacity-50">전송 중...</span>
              )}
              {isSent && !isRead && (
                <span className="text-xs opacity-50">✓</span>
              )}
              {isSent && isRead && (
                <span className="text-xs opacity-70">✓✓</span>
              )}
            </div>
          )}
          {!isMyMessage && !isRead && (
            <span className="px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-300 text-[10px] font-semibold">
              새 메시지
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// DM 버블 (크리에이터만 보는 비공개 메시지)
function DmBubble({ dm, chzzkChannelId, queryClient }: any) {
  const isRead = dm.read !== false
  const isSent = dm.sent !== false
  
  return (
    <div className="flex justify-start">
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 space-y-1.5 bg-neutral-800 border ${
        !isRead ? 'border-purple-500/50' : 'border-neutral-700'
      }`}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm">{dm.display_name || dm.author?.displayName}</span>
          <span className="px-2 py-0.5 rounded bg-purple-500/30 text-purple-300 text-[10px] font-semibold">
            비공개
          </span>
          {!isRead && (
            <span className="px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-300 text-[10px] font-semibold">
              새 메시지
            </span>
          )}
        </div>
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{dm.content}</p>
        <div className="flex items-center justify-between">
          <div className="text-xs opacity-70">
            {formatDistanceToNow(new Date(dm.created_at || dm.createdAt), { addSuffix: true })}
          </div>
          {!isSent && (
            <span className="text-xs opacity-50">전송 중...</span>
          )}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={async () => {
              const content = prompt('답장 내용을 입력하세요')
              if (content) {
                try {
                  await api.post(`/messages/${dm.id}/reply`, {
                    content,
                    visibility: 'private',
                  })
                  queryClient.invalidateQueries({ queryKey: ['creator-inbox', chzzkChannelId] })
                  queryClient.invalidateQueries({ queryKey: ['feed', chzzkChannelId] })
                } catch (error: any) {
                  alert(error.response?.data?.error || '답장 전송에 실패했습니다.')
                }
              }
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-neutral-700 hover:bg-neutral-600 transition-colors font-semibold"
          >
            답장
          </button>
          <button
            onClick={async () => {
              if (confirm('이 메시지를 공개 피드에 올리시겠습니까?')) {
                try {
                  await api.post(`/messages/${dm.id}/retweet`)
                  queryClient.invalidateQueries({ queryKey: ['creator-inbox', chzzkChannelId] })
                  queryClient.invalidateQueries({ queryKey: ['feed', chzzkChannelId] })
                } catch (error: any) {
                  alert(error.response?.data?.error || 'RT에 실패했습니다.')
                }
              }
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors font-semibold"
          >
            RT (공개)
          </button>
        </div>
      </div>
    </div>
  )
}
