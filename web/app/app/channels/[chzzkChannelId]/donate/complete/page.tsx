'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '../../../../../../lib/api'
import Link from 'next/link'

// 치즈 금액 옵션 (후원 페이지와 동일)
const CHEESE_AMOUNTS = [1000, 2000, 3000, 5000, 10000, 20000, 30000, 50000]

export default function DonateCompletePage() {
  const params = useParams()
  const router = useRouter()
  const chzzkChannelId = params.chzzkChannelId as string
  const [message, setMessage] = useState('')
  const [intendedAmount, setIntendedAmount] = useState(0) // Melt에서 선택한 금액
  const [actualAmount, setActualAmount] = useState(0) // 실제 후원 금액
  const [customAmount, setCustomAmount] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [amountMismatch, setAmountMismatch] = useState(false)
  const [visibility, setVisibility] = useState<'public' | 'private'>('public') // 공개/비공개 설정

  useEffect(() => {
    // localStorage에서 Intent ID 확인
    const intentId = localStorage.getItem('melt_intent_id')
    const savedMessage = localStorage.getItem('melt_donation_message')
    const savedAmount = localStorage.getItem('melt_donation_amount')

    if (!intentId) {
      // Intent ID가 없으면 채널 페이지로 이동
      router.push(`/app/channels/${chzzkChannelId}`)
      return
    }

    // 저장된 메시지가 있으면 자동으로 불러오기
    if (savedMessage) {
      setMessage(savedMessage)
    }
    
    // 저장된 금액 불러오기 (Melt에서 선택한 금액)
    if (savedAmount) {
      const amt = parseInt(savedAmount) || 0
      setIntendedAmount(amt)
      setActualAmount(amt) // 기본값은 동일하게 설정
    }
  }, [chzzkChannelId, router])

  // 실제 금액 변경 감지
  useEffect(() => {
    const finalActual = isCustom ? (parseInt(customAmount) || 0) : actualAmount
    setAmountMismatch(intendedAmount > 0 && finalActual !== intendedAmount)
  }, [actualAmount, customAmount, isCustom, intendedAmount])

  const finalActualAmount = isCustom ? (parseInt(customAmount) || 0) : actualAmount

  const handleSubmit = async () => {
    if (!message.trim()) {
      alert('메시지를 입력해주세요')
      return
    }

    if (finalActualAmount < 1000) {
      alert('최소 1,000원 이상 입력해주세요')
      return
    }

    const intentId = localStorage.getItem('melt_intent_id')
    if (!intentId) {
      alert('후원 정보를 찾을 수 없습니다.')
      return
    }

    setIsSubmitting(true)
    try {
      // 후원 완료 후 메시지 등록 (실제 금액, 공개 여부 포함)
      await api.post(`/donations/${intentId}/complete`, {
        message: message.trim(),
        amount: finalActualAmount,
        visibility: visibility,
      })

      // localStorage 정리
      localStorage.removeItem('melt_intent_id')
      localStorage.removeItem('melt_donation_message')
      localStorage.removeItem('melt_donation_amount')
      localStorage.removeItem('melt_donation_channel_id')

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
            실제 후원 금액을 확인하고 메시지를 공개하세요
          </p>
        </div>

        {/* 실제 후원 금액 확인 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold">실제 후원 금액</label>
            {intendedAmount > 0 && (
              <span className="text-xs text-neutral-500">
                예정: {intendedAmount.toLocaleString()}원
              </span>
            )}
          </div>
          
          {/* 금액 불일치 경고 */}
          {amountMismatch && (
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <p className="text-xs text-yellow-400">
                ⚠️ 예정 금액과 다릅니다. 치지직에서 실제로 후원한 금액을 선택해주세요.
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-4 gap-2">
            {CHEESE_AMOUNTS.map((amt) => (
              <button
                key={amt}
                onClick={() => {
                  setActualAmount(amt)
                  setIsCustom(false)
                }}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  !isCustom && actualAmount === amt
                    ? amt === intendedAmount
                      ? 'bg-green-500 text-white'
                      : 'bg-yellow-500 text-black'
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
            선택된 금액: <span className={`font-semibold ${amountMismatch ? 'text-yellow-400' : 'text-green-400'}`}>
              {finalActualAmount.toLocaleString()}원
            </span>
          </p>
        </div>

        {/* 공개/비공개 선택 */}
        <div className="space-y-3">
          <label className="text-sm font-semibold">메시지 공개 설정</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setVisibility('public')}
              className={`p-4 rounded-xl border transition-colors text-left ${
                visibility === 'public'
                  ? 'bg-green-500/20 border-green-500/50'
                  : 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700'
              }`}
            >
              <div className="text-lg mb-1">🌐</div>
              <div className="font-semibold text-sm">공개</div>
              <p className="text-xs text-neutral-400 mt-1">
                모든 팬들이 볼 수 있어요
              </p>
            </button>
            <button
              onClick={() => setVisibility('private')}
              className={`p-4 rounded-xl border transition-colors text-left ${
                visibility === 'private'
                  ? 'bg-blue-500/20 border-blue-500/50'
                  : 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700'
              }`}
            >
              <div className="text-lg mb-1">🔒</div>
              <div className="font-semibold text-sm">비공개</div>
              <p className="text-xs text-neutral-400 mt-1">
                크리에이터만 볼 수 있어요
              </p>
            </button>
          </div>
        </div>

        {/* 메시지 미리보기 */}
        <div className={`p-4 rounded-xl ${
          visibility === 'public' 
            ? 'bg-green-500/10 border border-green-500/30' 
            : 'bg-blue-500/10 border border-blue-500/30'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <p className={`text-xs ${visibility === 'public' ? 'text-green-400' : 'text-blue-400'}`}>
              {visibility === 'public' ? '💬 공개될 메시지' : '🔒 비공개 메시지'}
            </p>
            <span className={`text-xs font-semibold ${visibility === 'public' ? 'text-green-400' : 'text-blue-400'}`}>
              🧀 {finalActualAmount.toLocaleString()}원
            </span>
          </div>
          <p className="text-sm text-white whitespace-pre-wrap">{message || '(메시지 없음)'}</p>
          {visibility === 'private' && (
            <p className="text-xs text-blue-400/70 mt-2">
              * 이 메시지는 크리에이터에게만 보입니다
            </p>
          )}
        </div>

        {/* 메시지 수정 */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">메시지 수정 (선택)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="크리에이터와 팬들에게 전할 메시지를 입력하세요..."
            className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-neutral-600 resize-none"
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-neutral-500 text-right">
            {message.length}/500
          </p>
        </div>

        {/* 안내 */}
        <div className="p-4 rounded-xl bg-neutral-800/50 border border-neutral-700">
          <p className="text-xs text-neutral-400">
            💡 크리에이터가 치지직에서 후원 내역을 확인하면 뱃지 등급이 올라갈 수 있습니다.
            정확한 금액을 입력해주세요.
          </p>
        </div>

        {/* 버튼 */}
        <div className="space-y-2">
          <button
            onClick={handleSubmit}
            disabled={!message.trim() || finalActualAmount < 1000 || isSubmitting}
            className={`w-full rounded-xl py-4 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              visibility === 'public'
                ? 'bg-[#03C75A] text-white hover:bg-[#02B350]'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isSubmitting 
              ? '등록 중...' 
              : visibility === 'public'
                ? `✨ ${finalActualAmount.toLocaleString()}원 후원 메시지 공개하기`
                : `🔒 ${finalActualAmount.toLocaleString()}원 비공개 후원 메시지 보내기`
            }
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
