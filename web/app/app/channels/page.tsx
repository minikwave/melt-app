'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ChannelsPage() {
  const router = useRouter()
  const [channelId, setChannelId] = useState('')
  const [error, setError] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!channelId.trim()) {
      setError('채널 ID를 입력해주세요')
      return
    }
    router.push(`/app/channels/${channelId.trim()}`)
  }

  return (
    <main className="min-h-screen p-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">채널 찾기</h1>
          <p className="text-neutral-400 text-sm">
            치지직 채널 ID를 입력하세요
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <input
              type="text"
              value={channelId}
              onChange={(e) => {
                setChannelId(e.target.value)
                setError('')
              }}
              placeholder="예: abc123def456"
              className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-neutral-600"
            />
            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-xl py-3 font-bold bg-black text-white hover:bg-neutral-800 transition-colors"
          >
            채널 열기
          </button>
        </form>

        <div className="pt-4 border-t border-neutral-800">
          <p className="text-sm text-neutral-400 mb-2">팁</p>
          <ul className="text-sm text-neutral-500 space-y-1">
            <li>• 치지직 채널 페이지 URL에서 채널 ID를 확인할 수 있습니다</li>
            <li>• 예: chzzk.naver.com/live/[채널ID]</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
