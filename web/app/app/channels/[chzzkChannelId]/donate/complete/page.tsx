'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import Link from 'next/link'

export default function DonateCompletePage() {
  const params = useParams()
  const router = useRouter()
  const chzzkChannelId = params.chzzkChannelId as string
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // localStorage에서 Intent ID 확인
    const intentId = localStorage.getItem('melt_intent_id')

    if (!intentId) {
      // Intent ID가 없으면 채널 페이지로 이동
      router.push(`/app/channels/${chzzkChannelId}`)
    }
  }, [chzzkChannelId, router])

  const handleSubmit = async () => {
    if (!message.trim()) {
      alert('메시지를 입력해주세요')
      return
    }

    const intentId = localStorage.getItem('melt_intent_id')
    if (!intentId) {
      alert('후원 정보를 찾을 수 없습니다.')
      return
    }

    setIsSubmitting(true)
    try {
      // 후원 완료 후 메시지 등록 (자동으로 OCCURRED 상태로 변경)
      await api.post(`/donations/${intentId}/complete`, {
        message: message.trim(),
      })

      // localStorage 정리
      localStorage.removeItem('melt_intent_id')
      localStorage.removeItem('melt_donation_message')

      // 채널 페이지로 이동 (피드 새로고침)
      router.push(`/app/channels/${chzzkChannelId}`)
    } catch (error: any) {
      console.error('Register donation error:', error)
      alert(error.response?.data?.error || '메시지 등록에 실패했습니다.')
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold">후원 완료!</h1>
          <p className="text-neutral-400">
            이제 메시지를 입력하면 모두에게 공개됩니다
          </p>
        </div>

        {/* 메시지 입력 */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">공개 메시지</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="크리에이터와 팬들에게 전할 메시지를 입력하세요..."
            className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-neutral-600 resize-none"
            rows={5}
            maxLength={500}
          />
          <p className="text-xs text-neutral-500 text-right">
            {message.length}/500
          </p>
        </div>

        {/* 안내 */}
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
          <p className="text-sm text-green-400">
            💡 이 메시지는 공개 피드에 표시되어 모두가 볼 수 있습니다
          </p>
        </div>

        {/* 버튼 */}
        <div className="space-y-2">
          <button
            onClick={handleSubmit}
            disabled={!message.trim() || isSubmitting}
            className="w-full rounded-xl py-4 font-bold bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '등록 중...' : '메시지 공개하기'}
          </button>
          <Link
            href={`/app/channels/${chzzkChannelId}`}
            className="block w-full rounded-xl py-3 text-center text-neutral-400 hover:text-white transition-colors"
          >
            나중에 하기
          </Link>
        </div>
      </div>
    </main>
  )
}
