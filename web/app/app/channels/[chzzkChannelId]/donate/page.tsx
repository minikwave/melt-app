'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { api } from '@/lib/api'
import Link from 'next/link'

const FORCE_MOCK_MODE = process.env.NEXT_PUBLIC_FORCE_MOCK === 'true'

export default function DonatePage() {
  const params = useParams()
  const router = useRouter()
  const chzzkChannelId = params.chzzkChannelId as string
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleDonate = async () => {
    if (!message.trim()) {
      alert('메시지를 입력해주세요')
      return
    }

    setIsSubmitting(true)
    try {
      // Intent 생성
      const intentRes = await api.post('/donations/intent', {
        chzzkChannelId,
      })

      const { intentId } = intentRes.data

      // localStorage에 저장
      localStorage.setItem('melt_intent_id', intentId)
      localStorage.setItem('melt_donation_message', message)

      // 채널 정보 조회 (후원 링크 확인)
      const channelRes = await api.get(`/channels/${chzzkChannelId}`)
      const channel = channelRes.data.channel
      
      // 후원 딥링크가 있으면 사용, 없으면 채널 페이지로
      const targetUrl = channel?.donate_url || channel?.channel_url || `https://chzzk.naver.com/live/${chzzkChannelId}`
      
      // Mock 모드에서는 바로 완료 페이지로 이동 (치즈 충전 플로우 간편화)
      if (FORCE_MOCK_MODE || typeof window === 'undefined' || !window.location.href.includes('localhost:3001')) {
        // Mock 모드: 치즈 충전 없이 바로 완료 페이지로
        router.push(`/app/channels/${chzzkChannelId}/donate/complete`)
      } else {
        // 실제 모드: 치지직 채널 페이지로 이동
        window.location.href = targetUrl
      }
    } catch (error: any) {
      console.error('Donate intent error:', error)
      alert(error.response?.data?.error || '후원 준비 중 오류가 발생했습니다.')
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href={`/app/channels/${chzzkChannelId}`}
            className="text-neutral-400 hover:text-white"
          >
            ← 뒤로
          </Link>
          <h1 className="text-xl font-bold">치즈 보내기</h1>
          <div className="w-8" />
        </div>

        {/* 안내 */}
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
          <p className="text-sm text-green-400 font-semibold mb-2">
            💰 치즈와 함께 보낸 메시지는 모두에게 공개됩니다
          </p>
          <p className="text-xs text-neutral-400">
            치지직에서 치즈를 보낸 후, 아래 메시지가 공개 피드에 표시됩니다.
          </p>
        </div>

        {/* 메시지 입력 */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">메시지</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="크리에이터에게 전할 메시지를 입력하세요..."
            className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-neutral-600 resize-none"
            rows={5}
            maxLength={500}
          />
          <p className="text-xs text-neutral-500 text-right">
            {message.length}/500
          </p>
        </div>

        {/* 안내 */}
        <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
          <p className="text-sm text-neutral-400 mb-2">후원 절차:</p>
          <ol className="text-xs text-neutral-500 space-y-1 list-decimal list-inside">
            <li>메시지를 입력하고 "치지직에서 후원하기" 클릭</li>
            <li>치지직 페이지에서 치즈 충전 및 후원</li>
            <li>후원 완료 후 Melt로 돌아와서 메시지 확인</li>
          </ol>
        </div>

        {/* 버튼 */}
        <button
          onClick={handleDonate}
          disabled={!message.trim() || isSubmitting}
          className="w-full rounded-xl py-4 font-bold bg-[#03C75A] text-white hover:bg-[#02B350] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '준비 중...' : '치지직에서 후원하기'}
        </button>
      </div>
    </main>
  )
}
