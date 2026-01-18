'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useState } from 'react'

interface DonateButtonProps {
  chzzkChannelId: string
}

export default function DonateButton({ chzzkChannelId }: DonateButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const { data: channel } = useQuery({
    queryKey: ['channel', chzzkChannelId],
    queryFn: () => api.get(`/channels/${chzzkChannelId}`),
  })

  const channelUrl = channel?.data?.channel?.channel_url || `https://chzzk.naver.com/live/${chzzkChannelId}`

  const handleDonate = async () => {
    if (isProcessing) return

    setIsProcessing(true)
    try {
      // Intent 생성
      const intentRes = await api.post('/donations/intent', {
        chzzkChannelId,
      })

      const { intentId } = intentRes.data

      // localStorage에 저장 (후원 완료 후 메시지 등록용)
      localStorage.setItem('melt_intent_id', intentId)

      // 치지직 채널 페이지로 이동
      window.location.href = channelUrl
    } catch (error: any) {
      console.error('Donate intent error:', error)
      alert(error.response?.data?.error || '후원 준비 중 오류가 발생했습니다.')
      setIsProcessing(false)
    }
  }

  return (
    <button
      onClick={handleDonate}
      disabled={isProcessing}
      className="block w-full rounded-xl py-3 px-4 font-bold bg-[#03C75A] text-white hover:bg-[#02B350] transition-colors text-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isProcessing ? '준비 중...' : '💰 치즈 보내기'}
    </button>
  )
}
