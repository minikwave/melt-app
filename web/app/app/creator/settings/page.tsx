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
  
  // 치지직 API 연동 관련
  const [nidAuth, setNidAuth] = useState('')
  const [nidSession, setNidSession] = useState('')
  const [showApiSettings, setShowApiSettings] = useState(false)

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

  // 세션 상태 조회
  const { data: sessionStatus, refetch: refetchSessionStatus } = useQuery({
    queryKey: ['session-status', chzzkChannelId],
    queryFn: () => api.get(`/channels/${chzzkChannelId}/session-status`),
    enabled: !!chzzkChannelId,
    refetchInterval: 30000, // 30초마다 상태 확인
  })

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

  // API 자격 증명 저장
  const apiCredentialsMutation = useMutation({
    mutationFn: (data: { nidAuth: string; nidSession: string }) => 
      api.put(`/channels/${chzzkChannelId}/api-credentials`, data),
    onSuccess: (response: any) => {
      const data = response.data
      if (data.sessionActive) {
        alert('치지직 연동이 완료되었습니다! 이제 후원을 실시간으로 수신합니다.')
      } else {
        alert(`자격 증명이 저장되었지만 연결에 실패했습니다: ${data.sessionError || '알 수 없는 오류'}`)
      }
      queryClient.invalidateQueries({ queryKey: ['session-status', chzzkChannelId] })
      setNidAuth('')
      setNidSession('')
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || '치지직 연동에 실패했습니다.')
    },
  })

  // 세션 재시작
  const restartSessionMutation = useMutation({
    mutationFn: () => api.post(`/channels/${chzzkChannelId}/restart-session`),
    onSuccess: () => {
      alert('세션이 재시작되었습니다.')
      refetchSessionStatus()
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || '세션 재시작에 실패했습니다.')
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

  const handleApiCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chzzkChannelId.trim()) {
      alert('먼저 채널 ID를 입력해주세요')
      return
    }
    if (!nidAuth.trim() || !nidSession.trim()) {
      alert('NID_AUT와 NID_SES 쿠키 값을 모두 입력해주세요')
      return
    }

    apiCredentialsMutation.mutate({
      nidAuth: nidAuth.trim(),
      nidSession: nidSession.trim(),
    })
  }

  const sessionData = sessionStatus?.data

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

        {/* 치지직 API 연동 섹션 */}
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-green-400">치지직 실시간 후원 연동</h3>
              <p className="text-xs text-neutral-400 mt-1">
                연동하면 치지직에서 발생하는 후원을 자동으로 수신합니다
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowApiSettings(!showApiSettings)}
              className="text-sm text-green-400 hover:text-green-300"
            >
              {showApiSettings ? '접기' : '설정하기'}
            </button>
          </div>

          {/* 연동 상태 표시 */}
          {sessionData && (
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${sessionData.sessionActive ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">
                {sessionData.sessionActive ? (
                  <span className="text-green-400">연결됨 - 실시간 수신 중</span>
                ) : sessionData.hasCredentials ? (
                  <span className="text-yellow-400">연결 끊김 - 재연결 필요</span>
                ) : (
                  <span className="text-neutral-400">미연동</span>
                )}
              </span>
              {sessionData.hasCredentials && !sessionData.sessionActive && (
                <button
                  type="button"
                  onClick={() => restartSessionMutation.mutate()}
                  disabled={restartSessionMutation.isPending}
                  className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                >
                  {restartSessionMutation.isPending ? '재연결 중...' : '재연결'}
                </button>
              )}
            </div>
          )}

          {showApiSettings && (
            <form onSubmit={handleApiCredentialsSubmit} className="space-y-4 mt-4 pt-4 border-t border-green-500/20">
              {/* 중요 안내 */}
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <p className="text-xs text-yellow-400 font-semibold mb-2">보안 안내</p>
                <ul className="text-xs text-neutral-400 space-y-1">
                  <li>• 쿠키 값은 절대 타인과 공유하지 마세요</li>
                  <li>• 이 기능은 kimcore/chzzk 라이브러리를 사용합니다</li>
                  <li>• 연동하면 후원 금액이 자동으로 기록됩니다</li>
                </ul>
              </div>

              {/* NID_AUT */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  NID_AUT 쿠키 값
                </label>
                <input
                  type="password"
                  value={nidAuth}
                  onChange={(e) => setNidAuth(e.target.value)}
                  placeholder="브라우저 개발자 도구에서 복사"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-green-500"
                />
              </div>

              {/* NID_SES */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  NID_SES 쿠키 값
                </label>
                <input
                  type="password"
                  value={nidSession}
                  onChange={(e) => setNidSession(e.target.value)}
                  placeholder="브라우저 개발자 도구에서 복사"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-green-500"
                />
              </div>

              {/* 쿠키 찾는 방법 안내 */}
              <div className="p-3 rounded-lg bg-neutral-800">
                <p className="text-xs text-neutral-400 font-semibold mb-2">쿠키 찾는 방법</p>
                <ol className="text-xs text-neutral-500 space-y-1 list-decimal list-inside">
                  <li>치지직(chzzk.naver.com)에 로그인합니다</li>
                  <li>개발자 도구 열기 (F12 또는 Ctrl+Shift+I)</li>
                  <li>Application(애플리케이션) 탭 선택</li>
                  <li>좌측 Storage &gt; Cookies &gt; https://chzzk.naver.com</li>
                  <li>NID_AUT와 NID_SES 값을 복사합니다</li>
                </ol>
              </div>

              <button
                type="submit"
                disabled={apiCredentialsMutation.isPending || !chzzkChannelId.trim()}
                className="w-full rounded-xl py-3 font-bold bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {apiCredentialsMutation.isPending ? '연동 중...' : '치지직 연동하기'}
              </button>
            </form>
          )}
        </div>

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
              <strong>실시간 후원 연동:</strong> 치지직 계정의 쿠키를 사용하여 후원 이벤트를 실시간으로 수신합니다.
              <br />
              <span className="text-green-400">연동하면 후원 금액이 자동으로 기록되어 조작이 불가능합니다.</span>
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
