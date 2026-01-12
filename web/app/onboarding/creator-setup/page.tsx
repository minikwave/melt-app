'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import Link from 'next/link'

export default function CreatorSetupPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const [step, setStep] = useState(1)
  const [chzzkChannelId, setChzzkChannelId] = useState('')
  const [channelUrl, setChannelUrl] = useState('')
  const [donateUrl, setDonateUrl] = useState('')
  const [chargeUrl, setChargeUrl] = useState('https://game.naver.com/profile#cash')

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me'),
  })

  const updateChannelMutation = useMutation({
    mutationFn: (data: any) => api.put(`/channels/${chzzkChannelId}/settings`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channel', chzzkChannelId] })
      // 개발 모드: 온보딩 완료 표시
      if (typeof window !== 'undefined') {
        const Cookies = require('js-cookie').default
        Cookies.set('mock_onboarding_complete', 'true', { path: '/' })
      }
      if (step < 3) {
        setStep(step + 1)
      } else {
        router.push('/app')
      }
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || '설정 저장에 실패했습니다.')
    },
  })

  const handleNext = () => {
    if (step === 1) {
      if (!chzzkChannelId.trim()) {
        alert('채널 ID를 입력해주세요')
        return
      }
      // 채널 URL 자동 생성
      const autoUrl = `https://chzzk.naver.com/live/${chzzkChannelId.trim()}`
      setChannelUrl(autoUrl)
      setStep(2)
    } else if (step === 2) {
      // 설정 저장
      updateChannelMutation.mutate({
        channelUrl: channelUrl.trim() || undefined,
        donateUrl: donateUrl.trim() || undefined,
        chargeUrl: chargeUrl.trim() || undefined,
      })
    }
  }

  const handleSkip = () => {
    if (step === 2) {
      // 설정 저장 (기본값만)
      updateChannelMutation.mutate({
        channelUrl: channelUrl.trim() || undefined,
        chargeUrl: chargeUrl.trim() || undefined,
      })
    } else {
      router.push('/app')
    }
  }

  return (
    <main className="min-h-screen p-4 bg-gradient-to-b from-neutral-950 to-neutral-900 onboarding-fullscreen">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 진행 표시 */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s <= step ? 'bg-blue-500 w-8' : 'bg-neutral-800 w-2'
              }`}
            />
          ))}
        </div>

        {/* 헤더 */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">스트리머 설정</h1>
          <p className="text-neutral-400 text-sm">
            {step === 1 && '기본 정보를 입력해주세요'}
            {step === 2 && '후원 링크를 설정해주세요 (선택사항)'}
            {step === 3 && '설정이 완료되었습니다!'}
          </p>
        </div>

        {/* Step 1: 채널 ID */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  치지직 채널 ID *
                </label>
                <input
                  type="text"
                  value={chzzkChannelId}
                  onChange={(e) => setChzzkChannelId(e.target.value)}
                  placeholder="예: abc123def456"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-neutral-500 mt-2">
                  채널 페이지 URL에서 확인할 수 있습니다
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                <p className="text-sm text-blue-400 font-semibold mb-2">💡 채널 ID 찾는 방법</p>
                <p className="text-xs text-neutral-400">
                  치지직 채널 페이지 URL의 마지막 부분이 채널 ID입니다.
                  <br />
                  예: chzzk.naver.com/live/<span className="text-yellow-400">abc123def456</span>
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push('/app')}
                className="flex-1 rounded-xl py-3 font-semibold bg-neutral-800 text-white hover:bg-neutral-700 transition-colors"
              >
                건너뛰기
              </button>
              <button
                onClick={handleNext}
                disabled={!chzzkChannelId.trim()}
                className="flex-1 rounded-xl py-3 font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 후원 링크 설정 */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  채널 페이지 URL
                </label>
                <input
                  type="url"
                  value={channelUrl}
                  onChange={(e) => setChannelUrl(e.target.value)}
                  placeholder="https://chzzk.naver.com/live/..."
                  className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  자동으로 생성되었습니다. 필요시 수정하세요.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  후원 딥링크 <span className="text-neutral-500 text-xs">(선택사항)</span>
                </label>
                <input
                  type="url"
                  value={donateUrl}
                  onChange={(e) => setDonateUrl(e.target.value)}
                  placeholder="https://chzzk.naver.com/live/.../donate"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  치즈 후원 페이지 직접 링크가 있다면 입력하세요.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  치즈 충전 링크
                </label>
                <input
                  type="url"
                  value={chargeUrl}
                  onChange={(e) => setChargeUrl(e.target.value)}
                  placeholder="https://game.naver.com/profile#cash"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  기본값: <a href="https://game.naver.com/profile#cash" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">네이버 프로필 페이지</a>
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="flex-1 rounded-xl py-3 font-semibold bg-neutral-800 text-white hover:bg-neutral-700 transition-colors"
              >
                건너뛰기
              </button>
              <button
                onClick={handleNext}
                disabled={updateChannelMutation.isPending}
                className="flex-1 rounded-xl py-3 font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateChannelMutation.isPending ? '저장 중...' : '완료'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 완료 */}
        {step === 3 && (
          <div className="text-center space-y-6 py-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold">설정이 완료되었습니다!</h2>
            <p className="text-neutral-400">
              이제 Melt를 사용할 준비가 되었습니다.
            </p>
            <button
              onClick={() => router.push('/app')}
              className="w-full rounded-xl py-4 font-bold bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              시작하기
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
