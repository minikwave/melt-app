'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../../lib/api'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreatorSettingsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [chzzkChannelId, setChzzkChannelId] = useState('')
  const [channelUrl, setChannelUrl] = useState('')
  const [donateUrl, setDonateUrl] = useState('')
  const [chargeUrl, setChargeUrl] = useState('https://game.naver.com/profile#cash')

  // 사용자 정보 확인
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me'),
  })

  const { data: channel } = useQuery({
    queryKey: ['channel', chzzkChannelId],
    queryFn: () => api.get(`/channels/${chzzkChannelId}`),
    enabled: !!chzzkChannelId,
  })

  // 크리에이터가 아니면 리다이렉트
  useEffect(() => {
    if (!isLoadingUser && user?.data) {
      const userData = user.data.data?.user || user.data.user
      if (userData && userData.role !== 'creator' && userData.role !== 'admin') {
        router.push('/app')
      }
    }
  }, [user, isLoadingUser, router])

  useEffect(() => {
    if (channel?.data?.channel) {
      const ch = channel.data.channel
      setChannelUrl(ch.channel_url || `https://chzzk.naver.com/live/${chzzkChannelId}`)
      setDonateUrl(ch.donate_url || '')
      setChargeUrl(ch.charge_url || 'https://game.naver.com/profile#cash')
    }
  }, [channel, chzzkChannelId])

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put(`/channels/${chzzkChannelId}/settings`, data),
    onSuccess: () => {
      alert('설정이 저장되었습니다!')
      queryClient.invalidateQueries({ queryKey: ['channel', chzzkChannelId] })
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || '설정 저장에 실패했습니다.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chzzkChannelId.trim()) {
      alert('채널 ID를 입력해주세요')
      return
    }

    updateMutation.mutate({
      channelUrl: channelUrl.trim() || undefined,
      donateUrl: donateUrl.trim() || undefined,
      chargeUrl: chargeUrl.trim() || undefined,
    })
  }

  if (isLoadingUser) {
    return (
      <main className="min-h-screen p-4">
        <div className="text-center text-neutral-400 py-8">로딩 중...</div>
      </main>
    )
  }

  const userData = user?.data?.data?.user || user?.data?.user
  if (!userData || (userData.role !== 'creator' && userData.role !== 'admin')) {
    return (
      <main className="min-h-screen p-4">
        <div className="text-center text-neutral-400 py-8">
          크리에이터만 접근할 수 있습니다.
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/app/creator/dashboard" className="text-neutral-400 hover:text-white">
            ← 뒤로
          </Link>
          <h1 className="text-2xl font-bold">채널 설정</h1>
          <div className="w-8" />
        </div>

        {/* 안내 */}
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <p className="text-sm text-blue-400 font-semibold mb-2">💡 후원 링크 설정</p>
          <ul className="text-xs text-neutral-400 space-y-1">
            <li>• 채널 URL: 치지직 채널 페이지 주소</li>
            <li>• 후원 딥링크: 치즈 후원 페이지 직접 링크 (선택사항)</li>
            <li>• 치즈 충전 링크: 기본값은 네이버 프로필 페이지입니다</li>
          </ul>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 채널 ID */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              치지직 채널 ID *
            </label>
            <input
              type="text"
              value={chzzkChannelId}
              onChange={(e) => setChzzkChannelId(e.target.value)}
              placeholder="예: abc123def456"
              className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-neutral-600"
              required
            />
            <p className="text-xs text-neutral-500 mt-1">
              채널 페이지 URL에서 확인할 수 있습니다
            </p>
          </div>

          {/* 채널 URL */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              채널 페이지 URL
            </label>
            <input
              type="url"
              value={channelUrl}
              onChange={(e) => setChannelUrl(e.target.value)}
              placeholder="https://chzzk.naver.com/live/..."
              className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-neutral-600"
            />
            <p className="text-xs text-neutral-500 mt-1">
              비워두면 자동으로 생성됩니다
            </p>
          </div>

          {/* 후원 딥링크 */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              후원 딥링크 (선택사항)
            </label>
            <input
              type="url"
              value={donateUrl}
              onChange={(e) => setDonateUrl(e.target.value)}
              placeholder="https://chzzk.naver.com/live/.../donate 또는 딥링크"
              className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-neutral-600"
            />
            <p className="text-xs text-neutral-500 mt-1">
              치즈 후원 페이지 직접 링크를 입력하세요. 비워두면 채널 페이지로 이동합니다.
            </p>
          </div>

          {/* 치즈 충전 링크 */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              치즈 충전 링크
            </label>
            <input
              type="url"
              value={chargeUrl}
              onChange={(e) => setChargeUrl(e.target.value)}
              placeholder="https://game.naver.com/profile#cash"
              className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-neutral-600"
            />
            <p className="text-xs text-neutral-500 mt-1">
              기본값: 네이버 프로필 페이지의 치즈 충전 링크
            </p>
          </div>

          {/* 저장 버튼 */}
          <button
            type="submit"
            disabled={updateMutation.isPending || !chzzkChannelId.trim()}
            className="w-full rounded-xl py-4 font-bold bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? '저장 중...' : '설정 저장'}
          </button>
        </form>

        {/* 도움말 */}
        <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
          <h3 className="font-semibold mb-2">도움말</h3>
          <ul className="text-sm text-neutral-400 space-y-2">
            <li>
              <strong>채널 ID 찾기:</strong> 치지직 채널 페이지 URL에서 마지막 부분이 채널 ID입니다.
              <br />
              예: chzzk.naver.com/live/<span className="text-yellow-400">abc123def456</span>
            </li>
            <li>
              <strong>후원 딥링크:</strong> 치지직에서 제공하는 후원 페이지 직접 링크가 있다면 입력하세요.
              <br />
              없으면 채널 페이지로 이동한 후 사용자가 수동으로 후원 버튼을 클릭합니다.
            </li>
            <li>
              <strong>치즈 충전:</strong> 기본값은{' '}
              <a 
                href="https://game.naver.com/profile#cash" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                네이버 프로필 페이지
              </a>
              입니다.
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}
