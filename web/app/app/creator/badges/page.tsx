'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../../lib/api'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// 기본 뱃지 티어 템플릿
const DEFAULT_TIERS = [
  { tier: 'bronze', threshold_amount: 10000, color: '#CD7F32', label: '브론즈' },
  { tier: 'silver', threshold_amount: 50000, color: '#C0C0C0', label: '실버' },
  { tier: 'gold', threshold_amount: 100000, color: '#FFD700', label: '골드' },
  { tier: 'platinum', threshold_amount: 500000, color: '#E5E4E2', label: '플래티넘' },
  { tier: 'diamond', threshold_amount: 1000000, color: '#B9F2FF', label: '다이아몬드' },
]

// 뱃지 색상 매핑
const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  bronze: { bg: 'bg-amber-700/20', text: 'text-amber-500', border: 'border-amber-700/50' },
  silver: { bg: 'bg-neutral-400/20', text: 'text-neutral-300', border: 'border-neutral-400/50' },
  gold: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
  platinum: { bg: 'bg-cyan-300/20', text: 'text-cyan-200', border: 'border-cyan-300/50' },
  diamond: { bg: 'bg-blue-300/20', text: 'text-blue-200', border: 'border-blue-300/50' },
}

// 뱃지 라벨 매핑
const TIER_LABELS: Record<string, string> = {
  bronze: '브론즈',
  silver: '실버',
  gold: '골드',
  platinum: '플래티넘',
  diamond: '다이아몬드',
}

interface BadgeTier {
  id?: string
  tier: string
  threshold_amount: number
}

export default function BadgeSettingsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedChannel, setSelectedChannel] = useState<string>('channel_creator_1')
  const [tiers, setTiers] = useState<BadgeTier[]>([])
  const [isEditing, setIsEditing] = useState(false)

  // 사용자 정보 확인
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me'),
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

  // 기존 뱃지 티어 조회
  const { data: existingTiers, isLoading: isLoadingTiers } = useQuery({
    queryKey: ['badge-tiers', selectedChannel],
    queryFn: () => api.get(`/badges/${selectedChannel}/tiers`),
    enabled: !!selectedChannel,
  })

  // 기존 티어로 초기화
  useEffect(() => {
    if (existingTiers?.data?.tiers && existingTiers.data.tiers.length > 0) {
      setTiers(existingTiers.data.tiers)
    } else {
      // 기본 템플릿 사용
      setTiers(DEFAULT_TIERS.map((t) => ({ tier: t.tier, threshold_amount: t.threshold_amount })))
    }
  }, [existingTiers])

  // 뱃지 티어 저장
  const saveMutation = useMutation({
    mutationFn: (tierData: BadgeTier[]) =>
      api.post(`/badges/${selectedChannel}/tiers`, { tiers: tierData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badge-tiers', selectedChannel] })
      setIsEditing(false)
      alert('뱃지 설정이 저장되었습니다.')
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || '저장에 실패했습니다.')
    },
  })

  // VIP 리스트 조회
  const { data: vipList } = useQuery({
    queryKey: ['badge-holders', selectedChannel],
    queryFn: () => api.get(`/badges/${selectedChannel}/holders`, { params: { limit: 20 } }),
    enabled: !!selectedChannel,
  })

  const handleTierChange = (index: number, field: 'tier' | 'threshold_amount', value: any) => {
    const newTiers = [...tiers]
    newTiers[index] = { ...newTiers[index], [field]: value }
    setTiers(newTiers)
  }

  const handleAddTier = () => {
    setTiers([...tiers, { tier: '', threshold_amount: 0 }])
  }

  const handleRemoveTier = (index: number) => {
    setTiers(tiers.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    // 유효성 검사
    for (const tier of tiers) {
      if (!tier.tier.trim()) {
        alert('티어 이름을 입력해주세요.')
        return
      }
      if (tier.threshold_amount <= 0) {
        alert('기준 금액은 0보다 커야 합니다.')
        return
      }
    }
    saveMutation.mutate(tiers)
  }

  const handleResetToDefault = () => {
    if (confirm('기본 설정으로 초기화하시겠습니까?')) {
      setTiers(DEFAULT_TIERS.map((t) => ({ tier: t.tier, threshold_amount: t.threshold_amount })))
    }
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
          <h1 className="text-xl font-bold">뱃지 설정</h1>
          <div className="w-8" />
        </div>

        {/* 채널 선택 */}
        <div>
          <label className="block text-sm font-semibold mb-2">채널 선택</label>
          <input
            type="text"
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            placeholder="치지직 채널 ID 입력"
            className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* 뱃지 티어 설정 */}
        <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">뱃지 티어</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600"
              >
                편집
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleResetToDefault}
                  className="px-3 py-1.5 rounded-lg bg-neutral-700 text-white text-sm font-semibold hover:bg-neutral-600"
                >
                  기본값
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-700 text-white text-sm font-semibold hover:bg-neutral-600"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-50"
                >
                  {saveMutation.isPending ? '저장 중...' : '저장'}
                </button>
              </div>
            )}
          </div>

          <p className="text-sm text-neutral-400">
            누적 후원 금액에 따라 자동으로 뱃지가 부여됩니다.
          </p>

          {isLoadingTiers ? (
            <div className="text-center text-neutral-400 py-4">로딩 중...</div>
          ) : (
            <div className="space-y-3">
              {tiers.map((tier, index) => {
                const colors = TIER_COLORS[tier.tier] || { bg: 'bg-neutral-700', text: 'text-white', border: 'border-neutral-600' }
                const label = TIER_LABELS[tier.tier] || tier.tier

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-3 rounded-lg ${colors.bg} border ${colors.border}`}
                  >
                    {/* 뱃지 아이콘 */}
                    <div className={`w-10 h-10 rounded-full ${colors.bg} border-2 ${colors.border} flex items-center justify-center`}>
                      <span className={`text-lg ${colors.text}`}>
                        {tier.tier === 'bronze' && '🥉'}
                        {tier.tier === 'silver' && '🥈'}
                        {tier.tier === 'gold' && '🥇'}
                        {tier.tier === 'platinum' && '💎'}
                        {tier.tier === 'diamond' && '💠'}
                        {!['bronze', 'silver', 'gold', 'platinum', 'diamond'].includes(tier.tier) && '🏅'}
                      </span>
                    </div>

                    {isEditing ? (
                      <>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={tier.tier}
                            onChange={(e) => handleTierChange(index, 'tier', e.target.value)}
                            placeholder="티어 이름 (영문)"
                            className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm"
                          />
                        </div>
                        <div className="w-32">
                          <input
                            type="number"
                            value={tier.threshold_amount}
                            onChange={(e) => handleTierChange(index, 'threshold_amount', parseInt(e.target.value) || 0)}
                            placeholder="기준 금액"
                            className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm text-right"
                          />
                        </div>
                        <button
                          onClick={() => handleRemoveTier(index)}
                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1">
                          <span className={`font-semibold ${colors.text}`}>{label}</span>
                        </div>
                        <div className="text-sm text-neutral-400">
                          {tier.threshold_amount.toLocaleString()}원 이상
                        </div>
                      </>
                    )}
                  </div>
                )
              })}

              {isEditing && (
                <button
                  onClick={handleAddTier}
                  className="w-full py-3 rounded-lg border-2 border-dashed border-neutral-700 text-neutral-400 hover:border-neutral-600 hover:text-neutral-300 transition-colors"
                >
                  + 티어 추가
                </button>
              )}
            </div>
          )}
        </div>

        {/* VIP 리스트 */}
        <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700 space-y-4">
          <h2 className="font-bold">뱃지 보유자 (VIP)</h2>

          {vipList?.data?.holders?.length > 0 ? (
            <div className="space-y-2">
              {vipList.data.holders.map((holder: any, index: number) => {
                const colors = TIER_COLORS[holder.tier] || { bg: 'bg-neutral-700', text: 'text-white', border: 'border-neutral-600' }
                const label = TIER_LABELS[holder.tier] || holder.tier

                return (
                  <div
                    key={holder.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-neutral-900"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-neutral-500 w-6">#{index + 1}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${colors.bg} ${colors.text}`}>
                        {label}
                      </span>
                      <span className="font-semibold">{holder.display_name || holder.chzzk_user_id}</span>
                    </div>
                    <div className="text-sm text-neutral-400">
                      {parseInt(holder.total_donation).toLocaleString()}원
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center text-neutral-400 py-4">
              아직 뱃지 보유자가 없습니다
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
