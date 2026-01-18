'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../../../lib/api'
import Link from 'next/link'

const FORCE_MOCK_MODE = process.env.NEXT_PUBLIC_FORCE_MOCK === 'true'

// 치즈 금액 옵션 (연동 안 된 채널에서만 사용)
const CHEESE_AMOUNTS = [1000, 2000, 3000, 5000, 10000, 20000, 30000, 50000]

export default function DonatePage() {
  const params = useParams()
  const router = useRouter()
  const chzzkChannelId = params.chzzkChannelId as string
  const [message, setMessage] = useState('')
  const [amount, setAmount] = useState(1000)
  const [customAmount, setCustomAmount] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [chzzkTabOpened, setChzzkTabOpened] = useState(false)

  // 채널의 실시간 연동 상태 확인
  const { data: sessionStatus } = useQuery({
    queryKey: ['session-status', chzzkChannelId],
    queryFn: async () => {
      try {
        const res = await api.get(`/channels/${chzzkChannelId}/session-status`)
        return res.data
      } catch {
        return { sessionActive: false, hasCredentials: false }
      }
    },
  })

  // 채널이 실시간 연동 중인지 여부
  const isRealtimeConnected = sessionStatus?.sessionActive === true

  // 탭 전환 감지 (치지직에서 돌아왔을 때)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && chzzkTabOpened) {
        // 치지직에서 돌아왔을 때 자동으로 완료 페이지로 이동
        const intentId = localStorage.getItem('melt_intent_id')
        if (intentId) {
          router.push(`/app/channels/${chzzkChannelId}/donate/complete`)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [chzzkTabOpened, chzzkChannelId, router])

  const finalAmount = isCustom ? (parseInt(customAmount) || 0) : amount

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('클립보드 복사 실패:', err)
    }
  }

  const handleDonate = async () => {
    // 실시간 연동이 안 된 채널에서만 메시지/금액 검증
    if (!isRealtimeConnected) {
      if (!message.trim()) {
        alert('메시지를 입력해주세요')
        return
      }

      if (finalAmount < 1000) {
        alert('최소 1,000원 이상 입력해주세요')
        return
      }
    }

    setIsSubmitting(true)
    try {
      // 채널 정보 조회
      const channelRes = await api.get(`/channels/${chzzkChannelId}`)
      const channel = channelRes.data.channel
      
      if (isRealtimeConnected) {
        // 실시간 연동 채널: 바로 치지직으로 이동
        // Intent 생성 없음 - 후원은 치지직에서 자동 감지됨
        const targetUrl = channel?.channel_url || `https://chzzk.naver.com/live/${chzzkChannelId}`
        
        // 새 탭으로 치지직 열기
        setChzzkTabOpened(true)
        window.open(targetUrl, '_blank')
        setIsSubmitting(false)
      } else {
        // 비연동 채널: 기존 플로우 (Intent 생성 + 메시지 복사)
        const intentRes = await api.post('/donations/intent', {
          chzzkChannelId,
          amount: finalAmount,
        })

        const { intentId } = intentRes.data

        // localStorage에 저장
        localStorage.setItem('melt_intent_id', intentId)
        localStorage.setItem('melt_donation_message', message)
        localStorage.setItem('melt_donation_amount', finalAmount.toString())
        localStorage.setItem('melt_donation_channel_id', chzzkChannelId)

        // 클립보드에 메시지 복사
        try {
          await navigator.clipboard.writeText(message)
        } catch (err) {
          console.error('클립보드 복사 실패:', err)
        }

        // 치지직 채널 페이지 URL
        const targetUrl = channel?.donate_url || channel?.channel_url || `https://chzzk.naver.com/live/${chzzkChannelId}`
        
        // Mock 모드
        if (FORCE_MOCK_MODE) {
          router.push(`/app/channels/${chzzkChannelId}/donate/complete`)
          return
        }

        // 새 탭으로 치지직 열기
        setChzzkTabOpened(true)
        window.open(targetUrl, '_blank')
        
        setIsSubmitting(false)
      }
    } catch (error: any) {
      console.error('Donate intent error:', error)
      alert(error.response?.data?.error || '후원 준비 중 오류가 발생했습니다.')
      setIsSubmitting(false)
    }
  }

  const handleManualComplete = () => {
    router.push(`/app/channels/${chzzkChannelId}/donate/complete`)
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
          <h1 className="text-xl font-bold">🧀 치즈 보내기</h1>
          <div className="w-8" />
        </div>

        {/* 실시간 연동 상태 안내 */}
        {isRealtimeConnected && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-green-400 font-semibold">실시간 연동 중</span>
            </div>
            <p className="text-xs text-neutral-400">
              이 채널은 치지직과 실시간 연동되어 있습니다.
              치지직에서 후원하면 <span className="text-green-400 font-semibold">금액과 메시지가 자동으로 기록</span>됩니다.
            </p>
          </div>
        )}

        {/* 치지직 탭이 열린 상태 */}
        {chzzkTabOpened && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-green-500/20 border border-blue-500/30 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <p className="text-sm text-green-400 font-semibold">
                치지직에서 후원을 진행해주세요!
              </p>
            </div>
            
            {/* 단계별 안내 - 실시간 연동 여부에 따라 다름 */}
            <div className="bg-neutral-900/50 rounded-lg p-3 space-y-2">
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-500 text-black text-xs font-bold flex items-center justify-center">1</span>
                <p className="text-sm text-neutral-300">치지직에서 <span className="text-yellow-400 font-semibold">&quot;치즈 보내기&quot;</span> 클릭</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-500 text-black text-xs font-bold flex items-center justify-center">2</span>
                <p className="text-sm text-neutral-300">
                  {isRealtimeConnected 
                    ? '원하는 금액 선택 후 후원'
                    : <>금액: <span className="text-yellow-400 font-bold">{finalAmount.toLocaleString()}원</span> 선택</>
                  }
                </p>
              </div>
              {!isRealtimeConnected && (
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-500 text-black text-xs font-bold flex items-center justify-center">3</span>
                  <p className="text-sm text-neutral-300">메시지란에 <span className="text-blue-400 font-semibold">Ctrl+V</span> (붙여넣기)</p>
                </div>
              )}
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-500 text-black text-xs font-bold flex items-center justify-center">{isRealtimeConnected ? 3 : 4}</span>
                <p className="text-sm text-neutral-300">
                  {isRealtimeConnected 
                    ? <>&quot;보내기&quot; 클릭 - <span className="text-green-400">자동으로 기록됩니다!</span></>
                    : '&quot;보내기&quot; 클릭 후 여기로 돌아오기'
                  }
                </p>
              </div>
            </div>
            
            {/* 복사된 메시지 미리보기 - 연동 안 된 채널만 */}
            {!isRealtimeConnected && message && (
              <div className="bg-neutral-800 rounded-lg p-3">
                <p className="text-xs text-neutral-500 mb-1">📋 복사된 메시지:</p>
                <p className="text-sm text-neutral-300 line-clamp-2">{message}</p>
              </div>
            )}

            {/* 실시간 연동 채널 안내 */}
            {isRealtimeConnected && (
              <div className="bg-green-500/10 rounded-lg p-3">
                <p className="text-xs text-green-400">
                  ✓ 후원이 완료되면 자동으로 피드에 표시됩니다
                </p>
              </div>
            )}
            
            <div className="flex gap-2">
              {isRealtimeConnected ? (
                // 실시간 연동 채널: 채널 페이지로 돌아가기
                <Link
                  href={`/app/channels/${chzzkChannelId}`}
                  className="flex-1 px-4 py-3 rounded-lg bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors text-center"
                >
                  ← 채널로 돌아가기
                </Link>
              ) : (
                // 비연동 채널: 수동 완료
                <button
                  onClick={handleManualComplete}
                  className="flex-1 px-4 py-3 rounded-lg bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors"
                >
                  ✅ 후원 완료했어요
                </button>
              )}
              <button
                onClick={() => setChzzkTabOpened(false)}
                className="px-4 py-3 rounded-lg bg-neutral-700 text-neutral-300 text-sm hover:bg-neutral-600 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* 금액 선택 - 실시간 연동이 안 된 채널에서만 표시 */}
        {!isRealtimeConnected && (
          <div className="space-y-3">
            <label className="text-sm font-semibold">치즈 금액 (참고용)</label>
            <div className="grid grid-cols-4 gap-2">
              {CHEESE_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    setAmount(amt)
                    setIsCustom(false)
                  }}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    !isCustom && amount === amt
                      ? 'bg-yellow-500 text-black'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {amt >= 10000 ? `${amt / 10000}만` : amt.toLocaleString()}
                </button>
              ))}
            </div>
            
            {/* 직접 입력 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCustom(!isCustom)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  isCustom
                    ? 'bg-yellow-500 text-black'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                직접 입력
              </button>
              {isCustom && (
                <div className="flex-1 relative">
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="금액 입력"
                    min={1000}
                    step={1000}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-yellow-500 text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">원</span>
                </div>
              )}
            </div>
            
            <p className="text-xs text-neutral-500">
              선택된 금액: <span className="text-yellow-400 font-semibold">{finalAmount.toLocaleString()}원</span>
            </p>
          </div>
        )}

        {/* 메시지 입력 - 실시간 연동 채널에서는 선택사항 */}
        {!isRealtimeConnected && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">메시지</label>
              <button
                onClick={handleCopyMessage}
                disabled={!message.trim()}
                className="text-xs text-blue-400 hover:text-blue-300 disabled:text-neutral-600 transition-colors"
              >
                {copied ? '✓ 복사됨' : '📋 복사'}
              </button>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="크리에이터에게 전할 메시지를 입력하세요..."
              className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-neutral-600 resize-none"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-neutral-500 text-right">
              {message.length}/500
            </p>
          </div>
        )}
        
        {/* 실시간 연동 채널 안내 */}
        {isRealtimeConnected && (
          <div className="p-4 rounded-xl bg-neutral-800/50 border border-neutral-700">
            <p className="text-sm text-neutral-300 mb-2">
              치지직에서 직접 메시지와 금액을 입력하세요
            </p>
            <p className="text-xs text-neutral-500">
              후원이 완료되면 자동으로 Melt에 기록됩니다.
              크리에이터가 설정한 뱃지 기준에 따라 뱃지가 자동으로 부여됩니다.
            </p>
          </div>
        )}

        {/* 안내 - 실시간 연동 여부에 따라 다름 */}
        <div className="p-4 rounded-xl bg-neutral-800/50 border border-neutral-700">
          <p className="text-sm text-neutral-400 mb-2">💡 후원 절차</p>
          {isRealtimeConnected ? (
            <ol className="text-xs text-neutral-500 space-y-1 list-decimal list-inside">
              <li>&quot;치지직에서 후원하기&quot; 클릭</li>
              <li>치지직에서 원하는 금액과 메시지로 후원</li>
              <li className="text-green-400">완료! 후원 내역이 자동으로 기록됩니다</li>
            </ol>
          ) : (
            <ol className="text-xs text-neutral-500 space-y-1 list-decimal list-inside">
              <li>금액과 메시지를 입력하고 &quot;치지직에서 후원하기&quot; 클릭</li>
              <li>새 탭에서 치지직이 열리고, 메시지가 자동 복사됩니다</li>
              <li>치지직 후원창에서 <span className="text-yellow-400">붙여넣기(Ctrl+V)</span> 후 후원</li>
              <li>후원 완료 후 &quot;후원 완료했어요&quot; 클릭</li>
            </ol>
          )}
        </div>

        {/* 버튼 */}
        {!chzzkTabOpened && (
          <button
            onClick={handleDonate}
            disabled={isRealtimeConnected ? isSubmitting : (!message.trim() || finalAmount < 1000 || isSubmitting)}
            className="w-full rounded-xl py-4 font-bold bg-[#03C75A] text-white hover:bg-[#02B350] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              '준비 중...'
            ) : isRealtimeConnected ? (
              <>
                <span>🧀</span>
                <span>치지직에서 후원하기</span>
              </>
            ) : (
              <>
                <span>🧀</span>
                <span>치지직에서 {finalAmount.toLocaleString()}원 후원하기</span>
              </>
            )}
          </button>
        )}
      </div>
    </main>
  )
}
