export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="mb-4 text-5xl">🔍</div>
        <h1 className="text-2xl font-bold mb-2">404</h1>
        <p className="text-neutral-400 text-sm mb-6">페이지를 찾을 수 없습니다</p>
        <a
          href="/"
          className="block w-full py-3.5 rounded-xl bg-white text-neutral-900 font-semibold hover:bg-neutral-200 transition-colors text-center"
        >
          홈으로
        </a>
      </div>
    </main>
  )
}
