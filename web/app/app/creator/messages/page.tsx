'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export default function CreatorMessagesPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedChannel, setSelectedChannel] = useState('')
  const [filter, setFilter] = useState<'all' | 'dms' | 'donations'>('all')

  const { data: inbox } = useQuery({
    queryKey: ['creator-inbox', selectedChannel, filter],
    queryFn: () => api.get('/creator/inbox', {
      params: { chzzkChannelId: selectedChannel },
    }),
    enabled: !!selectedChannel,
  })

  // 읽지 않은 DM 수
  const { data: unreadCount } = useQuery({
    queryKey: ['creator-inbox-unread-count', selectedChannel],
    queryFn: () => api.get('/creator/inbox/unread-count', {
      params: { chzzkChannelId: selectedChannel },
    }),
    enabled: !!selectedChannel,
    refetchInterval: 10000,
  })

  const replyMutation = useMutation({
    mutationFn: ({ messageId, content, visibility }: any) =>
      api.post(`/messages/${messageId}/reply`, { content, visibility }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-inbox', selectedChannel] })
      queryClient.invalidateQueries({ queryKey: ['creator-inbox-unread-count', selectedChannel] })
    },
  })

  const retweetMutation = useMutation({
    mutationFn: (messageId: string) =>
      api.post(`/messages/${messageId}/retweet`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-inbox', selectedChannel] })
      queryClient.invalidateQueries({ queryKey: ['creator-inbox-unread-count', selectedChannel] })
      queryClient.invalidateQueries({ queryKey: ['feed', selectedChannel] })
    },
  })

  const confirmDonationMutation = useMutation({
    mutationFn: ({ donationId, amount }: any) =>
      api.post(`/donations/${donationId}/confirm`, { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-inbox', selectedChannel] })
      queryClient.invalidateQueries({ queryKey: ['creator-stats', selectedChannel] })
    },
  })

  const dms = inbox?.data?.dms || []
  const pendingDonations = inbox?.data?.pendingDonations || []

  const filteredDms = filter === 'dms' ? dms : filter === 'donations' ? [] : dms
  const filteredDonations = filter === 'donations' ? pendingDonations : filter === 'dms' ? [] : pendingDonations

  return (
    <main className="min-h-screen p-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/app/creator/dashboard" className="text-neutral-400 hover:text-white">
            ← 뒤로
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">메시지 관리</h1>
            {unreadCount?.data?.unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-purple-500 text-white text-xs font-semibold">
                {unreadCount.data.unreadCount}
              </span>
            )}
          </div>
          <div className="w-8" />
        </div>

        {/* 채널 선택 */}
        <div>
          <input
            type="text"
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            placeholder="치지직 채널 ID 입력"
            className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-blue-500"
          />
        </div>

        {selectedChannel && (
          <>
            {/* 필터 */}
            <div className="flex gap-2">
              {(['all', 'dms', 'donations'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    filter === f
                      ? 'bg-blue-500 text-white'
                      : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                  }`}
                >
                  {f === 'all' && '전체'}
                  {f === 'dms' && `DM (${dms.length})`}
                  {f === 'donations' && `후원 (${pendingDonations.length})`}
                </button>
              ))}
            </div>

            {/* DM 목록 */}
            {filteredDms.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-semibold text-sm text-neutral-400">비공개 메시지</h2>
                {filteredDms.map((dm: any) => (
                  <DMCard
                    key={dm.id}
                    dm={dm}
                    onReply={replyMutation.mutate}
                    onRetweet={retweetMutation.mutate}
                  />
                ))}
              </div>
            )}

            {/* 미확정 후원 목록 */}
            {filteredDonations.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-semibold text-sm text-neutral-400">미확정 후원</h2>
                {filteredDonations.map((donation: any) => (
                  <DonationCard
                    key={donation.id}
                    donation={donation}
                    onConfirm={confirmDonationMutation.mutate}
                  />
                ))}
              </div>
            )}

            {/* 빈 상태 */}
            {filteredDms.length === 0 && filteredDonations.length === 0 && (
              <div className="text-center py-12 text-neutral-400">
                {filter === 'dms' && '받은 비공개 메시지가 없습니다'}
                {filter === 'donations' && '미확정 후원이 없습니다'}
                {filter === 'all' && '메시지가 없습니다'}
              </div>
            )}
          </>
        )}

        {!selectedChannel && (
          <div className="text-center py-12 text-neutral-400">
            채널 ID를 입력하여 메시지를 확인하세요
          </div>
        )}
      </div>
    </main>
  )
}

function DMCard({ dm, onReply, onRetweet }: any) {
  const [showReply, setShowReply] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [replyVisibility, setReplyVisibility] = useState<'private' | 'public'>('private')

  const handleReply = () => {
    if (!replyContent.trim()) return
    onReply({
      messageId: dm.id,
      content: replyContent.trim(),
      visibility: replyVisibility,
    })
    setReplyContent('')
    setShowReply(false)
  }

  return (
    <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">{dm.display_name}</span>
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs">
              비공개
            </span>
          </div>
          <p className="text-sm text-neutral-300 mb-2">{dm.content}</p>
          <p className="text-xs text-neutral-500">
            {formatDistanceToNow(new Date(dm.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      {showReply ? (
        <div className="space-y-2 pt-2 border-t border-neutral-700">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="답장 내용을 입력하세요..."
            className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm resize-none"
            rows={3}
          />
          <div className="flex items-center gap-2">
            <select
              value={replyVisibility}
              onChange={(e) => setReplyVisibility(e.target.value as 'private' | 'public')}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-sm"
            >
              <option value="private">비공개 답장</option>
              <option value="public">공개 답장</option>
            </select>
            <button
              onClick={handleReply}
              className="flex-1 py-1.5 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600"
            >
              전송
            </button>
            <button
              onClick={() => {
                setShowReply(false)
                setReplyContent('')
              }}
              className="px-4 py-1.5 rounded-lg bg-neutral-700 text-sm"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setShowReply(true)}
            className="flex-1 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-sm font-semibold"
          >
            답장
          </button>
          <button
            onClick={() => {
              if (confirm('이 메시지를 공개 피드에 올리시겠습니까?')) {
                onRetweet(dm.id)
              }
            }}
            className="flex-1 py-2 rounded-lg bg-black hover:bg-neutral-800 text-sm font-semibold"
          >
            RT (공개)
          </button>
        </div>
      )}
    </div>
  )
}

function DonationCard({ donation, onConfirm }: any) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [amount, setAmount] = useState('')

  const handleConfirm = () => {
    if (!amount || isNaN(parseInt(amount))) {
      alert('올바른 금액을 입력해주세요')
      return
    }
    onConfirm({
      donationId: donation.id,
      amount: parseInt(amount),
    })
    setShowConfirm(false)
    setAmount('')
  }

  return (
    <div className="p-4 rounded-xl bg-neutral-800 border border-green-500/30 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">{donation.display_name}</span>
            <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-300 text-xs">
              후원
            </span>
          </div>
          {donation.message_content && (
            <p className="text-sm text-neutral-300 mb-2">{donation.message_content}</p>
          )}
          <p className="text-xs text-neutral-500">
            {formatDistanceToNow(new Date(donation.occurred_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      {showConfirm ? (
        <div className="space-y-2 pt-2 border-t border-neutral-700">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="후원 금액 (원)"
            className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              className="flex-1 py-2 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600"
            >
              확정
            </button>
            <button
              onClick={() => {
                setShowConfirm(false)
                setAmount('')
              }}
              className="px-4 py-2 rounded-lg bg-neutral-700 text-sm"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 text-sm font-semibold"
        >
          후원 확정하기
        </button>
      )}
    </div>
  )
}
