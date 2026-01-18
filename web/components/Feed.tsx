'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useState } from 'react'

interface FeedProps {
  chzzkChannelId: string
}

export default function Feed({ chzzkChannelId }: FeedProps) {
  const [cursor, setCursor] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['feed', chzzkChannelId, cursor],
    queryFn: () => api.get('/feed', {
      params: { chzzkChannelId, cursor },
    }),
  })

  if (isLoading) {
    return <div className="text-neutral-400 text-center py-8">로딩 중...</div>
  }

  const feed = data?.data?.feed || []

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">피드</h2>

      {feed.length === 0 ? (
        <div className="text-neutral-400 text-center py-8">
          아직 메시지가 없습니다
        </div>
      ) : (
        <div className="space-y-4">
          {feed.map((item: any) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-neutral-800 border border-neutral-700 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{item.author.displayName}</span>
                {item.donationAmount && (
                  <span className="text-sm text-yellow-400">
                    {item.donationAmount.toLocaleString()}원
                  </span>
                )}
              </div>
              <p className="text-neutral-300">{item.content}</p>
              {item.isRetweet && (
                <span className="text-xs text-neutral-500">RT</span>
              )}
              <div className="text-xs text-neutral-500">
                {new Date(item.createdAt).toLocaleString('ko-KR')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
