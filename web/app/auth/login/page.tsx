'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // 네이버 로그인 페이지로 리다이렉트
    router.replace('/auth/naver')
  }, [router])

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-neutral-400">리다이렉트 중...</div>
    </main>
  )
}
