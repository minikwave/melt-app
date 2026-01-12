'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">오류가 발생했습니다</h1>
        <p className="text-neutral-400 mb-8">{error.message || '알 수 없는 오류'}</p>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors"
          >
            다시 시도
          </button>
          <a
            href="/"
            className="inline-block px-6 py-3 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors"
          >
            홈으로 돌아가기
          </a>
        </div>
      </div>
    </div>
  )
}
