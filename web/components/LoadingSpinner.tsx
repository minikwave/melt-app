'use client'

interface LoadingSpinnerProps {
  label?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = { sm: 'h-4 w-4 border-2', md: 'h-6 w-6 border-2', lg: 'h-8 w-8 border-[3px]' }

export default function LoadingSpinner({ label, className = '', size = 'md' }: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`animate-spin rounded-full border-neutral-600 border-t-white ${sizeClasses[size]}`}
        role="status"
        aria-label={label || '로딩 중'}
      />
      {label && <span className="text-sm text-neutral-400">{label}</span>}
    </div>
  )
}

/** 풀 페이지 중앙 로딩 (모바일 프레임 내) */
export function PageLoading({ label = '로딩 중...' }: { label?: string }) {
  return (
    <main className="flex min-h-[50vh] items-center justify-center">
      <LoadingSpinner label={label} size="lg" />
    </main>
  )
}
