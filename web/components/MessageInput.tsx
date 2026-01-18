'use client'

import { useState } from 'react'
import { api } from '../lib/api'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'

interface MessageInputProps {
  chzzkChannelId: string
  isCreator?: boolean
  onMessageSent?: () => void
}

export default function MessageInput({ chzzkChannelId, isCreator, onMessageSent }: MessageInputProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      if (isCreator) {
        // 크리에이터는 공개 메시지
        await api.post('/messages/creator-post', {
          chzzkChannelId,
          content: content.trim(),
        })
      } else {
        // 일반 유저는 DM (비공개)
        await api.post('/messages/dm', {
          chzzkChannelId,
          content: content.trim(),
        })
      }

      setContent('')
      // 피드/인박스 새로고침
      queryClient.invalidateQueries({ queryKey: ['feed', chzzkChannelId] })
      queryClient.invalidateQueries({ queryKey: ['creator-inbox', chzzkChannelId] })
      onMessageSent?.()
    } catch (error: any) {
      console.error('Send message error:', error)
      alert(error.response?.data?.error || '메시지 전송에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-neutral-900 border-t border-neutral-800">
      {/* 치즈 보내기 안내 (일반 유저만) */}
      {!isCreator && (
        <div className="px-4 pt-3 pb-2">
          <Link
            href={`/app/channels/${chzzkChannelId}/donate`}
            className="block w-full rounded-xl py-2.5 px-4 font-bold bg-[#03C75A] text-white text-center hover:bg-[#02B350] transition-colors text-sm"
          >
            💰 치즈 보내기 (모두에게 공개)
          </Link>
          <p className="text-xs text-neutral-500 mt-1.5 text-center">
            치즈와 함께 보낸 메시지는 모두에게 공개됩니다
          </p>
        </div>
      )}

      {/* 메시지 입력 */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={isCreator ? "공개 메시지 입력..." : "크리에이터에게 비공개 메시지 보내기"}
            className="flex-1 px-4 py-3 rounded-2xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-neutral-600 text-sm"
            disabled={isSubmitting}
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="px-5 py-3 rounded-2xl bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {isSubmitting ? '...' : '전송'}
          </button>
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          {isCreator
            ? '크리에이터 메시지는 모두에게 공개됩니다'
            : '일반 메시지는 크리에이터에게만 전달됩니다'}
        </p>
      </form>
    </div>
  )
}
