'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface DonateButtonProps {
  chzzkChannelId: string
}

export default function DonateButton({ chzzkChannelId }: DonateButtonProps) {
  const { data: channel } = useQuery({
    queryKey: ['channel', chzzkChannelId],
    queryFn: () => api.get(`/channels/${chzzkChannelId}`),
  })

  const donateUrl = channel?.data?.channel?.donate_url
  const channelUrl = channel?.data?.channel?.channel_url || `https://chzzk.naver.com/live/${chzzkChannelId}`

  // 후원 딥링크가 있으면 직접 사용, 없으면 Melt 후원 페이지로
  if (donateUrl) {
    return (
      <a
        href={donateUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full rounded-xl py-3 px-4 font-bold bg-[#03C75A] text-white hover:bg-[#02B350] transition-colors text-center text-sm"
      >
        💰 치즈 보내기
      </a>
    )
  }

  return (
    <Link
      href={`/app/channels/${chzzkChannelId}/donate`}
      className="block w-full rounded-xl py-3 px-4 font-bold bg-[#03C75A] text-white hover:bg-[#02B350] transition-colors text-center text-sm"
    >
      💰 치즈 보내기
    </Link>
  )
}
