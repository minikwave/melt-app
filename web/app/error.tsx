'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // MetaMask 관련 오류는 무시하고 자동으로 리셋
  const isMetaMaskError = 
    error.message?.includes('MetaMask') ||
    error.message?.includes('Failed to connect to MetaMask') ||
    error.message?.includes('ethereum') ||
    error.stack?.includes('nkbihfbeogaeaoehlefnkodbefgpgknn')

  if (isMetaMaskError) {
    // MetaMask 오류는 자동으로 리셋하고 무시
    console.warn('MetaMask error caught by Error Boundary, ignoring:', error.message)
    // 자동으로 리셋 시도
    setTimeout(() => {
      try {
        reset()
      } catch (e) {
        // 리셋 실패해도 무시
      }
    }, 100)
    // 빈 화면 반환 (오류 표시 안 함)
    return null
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="mb-4 text-5xl">⚠️</div>
        <h1 className="text-xl font-bold mb-2">오류가 발생했습니다</h1>
        <p className="text-neutral-400 text-sm mb-6">{error.message || '알 수 없는 오류'}</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full py-3.5 rounded-xl bg-white text-neutral-900 font-semibold hover:bg-neutral-200 transition-colors"
          >
            다시 시도
          </button>
          <a
            href="/"
            className="block w-full py-3.5 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors text-center"
          >
            홈으로
          </a>
        </div>
      </div>
    </main>
  )
}
