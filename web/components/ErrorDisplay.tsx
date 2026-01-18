'use client'

import { useState } from 'react'

interface ErrorDisplayProps {
  error: Error | string | null
  onRetry?: () => void
  title?: string
  className?: string
}

/**
 * 에러 표시 컴포넌트
 * 명확한 에러 메시지와 재시도 옵션 제공
 */
export default function ErrorDisplay({ 
  error, 
  onRetry, 
  title = '오류가 발생했습니다',
  className = '' 
}: ErrorDisplayProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  if (!error) return null

  const errorMessage = typeof error === 'string' ? error : error.message || '알 수 없는 오류가 발생했습니다'

  const handleRetry = async () => {
    if (onRetry && !isRetrying) {
      setIsRetrying(true)
      try {
        await onRetry()
      } finally {
        setIsRetrying(false)
      }
    }
  }

  return (
    <div className={`p-6 rounded-xl bg-red-500/10 border border-red-500/30 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="text-red-400 text-2xl">⚠️</div>
        <div className="flex-1 space-y-2">
          <h3 className="text-red-400 font-semibold">{title}</h3>
          <p className="text-sm text-neutral-300">{errorMessage}</p>
          
          {onRetry && (
            <div className="pt-2">
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRetrying ? '재시도 중...' : '다시 시도'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * 네트워크 에러 표시
 */
export function NetworkErrorDisplay({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorDisplay
      error="네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인하고 다시 시도해주세요."
      onRetry={onRetry}
      title="연결 오류"
    />
  )
}

/**
 * 권한 에러 표시
 */
export function PermissionErrorDisplay({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorDisplay
      error="이 작업을 수행할 권한이 없습니다. 로그인 상태를 확인해주세요."
      onRetry={onRetry}
      title="권한 오류"
    />
  )
}
