// 정적 생성 허용
// export const dynamic = 'force-dynamic' // 제거하여 정적 생성 허용

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-neutral-400 mb-8">페이지를 찾을 수 없습니다</p>
        <a
          href="/"
          className="inline-block px-6 py-3 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors"
        >
          홈으로 돌아가기
        </a>
      </div>
    </div>
  )
}
