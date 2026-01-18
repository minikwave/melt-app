'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

// 뱃지 색상 매핑
const TIER_COLORS: Record<string, { bg: string; text: string; border: string; emoji: string }> = {
  bronze: { bg: 'bg-amber-700/20', text: 'text-amber-500', border: 'border-amber-700/50', emoji: '🥉' },
  silver: { bg: 'bg-neutral-400/20', text: 'text-neutral-300', border: 'border-neutral-400/50', emoji: '🥈' },
  gold: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50', emoji: '🥇' },
  platinum: { bg: 'bg-cyan-300/20', text: 'text-cyan-200', border: 'border-cyan-300/50', emoji: '💎' },
  diamond: { bg: 'bg-blue-300/20', text: 'text-blue-200', border: 'border-blue-300/50', emoji: '💠' },
}

// 뱃지 라벨 매핑
const TIER_LABELS: Record<string, string> = {
  bronze: '브론즈',
  silver: '실버',
  gold: '골드',
  platinum: '플래티넘',
  diamond: '다이아몬드',
}

interface BadgeProps {
  tier: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

// 단일 뱃지 표시 컴포넌트
export function Badge({ tier, size = 'sm', showLabel = false, className = '' }: BadgeProps) {
  const colors = TIER_COLORS[tier] || { bg: 'bg-neutral-700', text: 'text-white', border: 'border-neutral-600', emoji: '🏅' }
  const label = TIER_LABELS[tier] || tier

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  }

  return (
    <span 
      className={`inline-flex items-center gap-1 rounded font-semibold ${colors.bg} ${colors.text} ${sizeClasses[size]} ${className}`}
      title={`${label} 뱃지`}
    >
      <span>{colors.emoji}</span>
      {showLabel && <span>{label}</span>}
    </span>
  )
}

interface UserBadgeProps {
  chzzkChannelId: string
  chzzkUserId: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

// 유저의 최고 뱃지 표시 컴포넌트 (API로 조회)
export function UserBadge({ chzzkChannelId, chzzkUserId, size = 'sm', showLabel = false, className = '' }: UserBadgeProps) {
  const { data } = useQuery({
    queryKey: ['user-badge', chzzkChannelId, chzzkUserId],
    queryFn: () => api.get(`/badges/${chzzkChannelId}/user/${chzzkUserId}`),
    enabled: !!chzzkChannelId && !!chzzkUserId,
    staleTime: 60000, // 1분 캐싱
  })

  const highestBadge = data?.data?.highestBadge

  if (!highestBadge) {
    return null
  }

  return (
    <Badge
      tier={highestBadge.tier}
      size={size}
      showLabel={showLabel}
      className={className}
    />
  )
}

interface BadgeListProps {
  chzzkChannelId: string
  chzzkUserId: string
  className?: string
}

// 유저의 모든 뱃지 목록 표시 컴포넌트
export function UserBadgeList({ chzzkChannelId, chzzkUserId, className = '' }: BadgeListProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['user-badges', chzzkChannelId, chzzkUserId],
    queryFn: () => api.get(`/badges/${chzzkChannelId}/user/${chzzkUserId}`),
    enabled: !!chzzkChannelId && !!chzzkUserId,
    staleTime: 60000, // 1분 캐싱
  })

  if (isLoading) {
    return <span className="text-xs text-neutral-500">로딩 중...</span>
  }

  const badges = data?.data?.badges || []

  if (badges.length === 0) {
    return null
  }

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {badges.map((badge: any) => (
        <Badge
          key={badge.id}
          tier={badge.tier}
          size="sm"
          showLabel={false}
        />
      ))}
    </div>
  )
}

// 뱃지 아이콘만 표시하는 간단한 컴포넌트
export function BadgeIcon({ tier, className = '' }: { tier: string; className?: string }) {
  const colors = TIER_COLORS[tier] || { emoji: '🏅' }
  return <span className={className}>{colors.emoji}</span>
}

// 뱃지 정보를 포함한 프로필 카드 컴포넌트
interface BadgeProfileCardProps {
  chzzkChannelId: string
  chzzkUserId: string
  displayName: string
  showTotalDonation?: boolean
  className?: string
}

export function BadgeProfileCard({ 
  chzzkChannelId, 
  chzzkUserId, 
  displayName, 
  showTotalDonation = false,
  className = '' 
}: BadgeProfileCardProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['user-badge', chzzkChannelId, chzzkUserId],
    queryFn: () => api.get(`/badges/${chzzkChannelId}/user/${chzzkUserId}`),
    enabled: !!chzzkChannelId && !!chzzkUserId,
    staleTime: 60000,
  })

  const highestBadge = data?.data?.highestBadge
  const totalDonation = data?.data?.totalDonation || 0

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="font-semibold">{displayName}</span>
      {!isLoading && highestBadge && (
        <Badge tier={highestBadge.tier} size="sm" />
      )}
      {showTotalDonation && totalDonation > 0 && (
        <span className="text-xs text-neutral-500">
          ({totalDonation.toLocaleString()}원)
        </span>
      )}
    </div>
  )
}

export default Badge
