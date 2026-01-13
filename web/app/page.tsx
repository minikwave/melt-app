import Link from 'next/link'

// 정적 생성 허용 (빌드 시 미리 생성)
// export const dynamic = 'force-dynamic' // 제거하여 정적 생성 허용

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Melt</h1>
        <p className="text-neutral-400">방송이 꺼진 뒤에도 후원이 흐르도록</p>
        
        <div className="mt-8 space-y-4">
          <Link
            href="/auth/naver"
            className="block w-full rounded-xl py-4 font-bold bg-[#03C75A] text-white text-center hover:bg-[#02B350] transition-colors"
          >
            네이버로 시작하기
          </Link>
          
          <Link
            href="/dev/login"
            className="block w-full rounded-xl py-4 font-bold bg-blue-600 text-white text-center hover:bg-blue-700 transition-colors"
          >
            🧪 개발 모드로 테스트하기
          </Link>
          
          <Link
            href="/app"
            className="block w-full rounded-xl py-4 font-bold bg-neutral-800 text-white text-center border border-neutral-700 hover:bg-neutral-700 transition-colors"
          >
            둘러보기
          </Link>
        </div>

        <div className="pt-8 text-sm text-neutral-500 space-y-2">
          <p>• 방송 중이 아니어도 후원 가능</p>
          <p>• 크리에이터와 비공개 메시지</p>
          <p>• 공개 피드로 소통</p>
        </div>
      </div>
    </main>
  )
}
