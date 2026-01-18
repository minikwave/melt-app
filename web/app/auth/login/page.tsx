'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { PageLoading } from '../../../components/LoadingSpinner'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/auth/naver')
  }, [router])

  return (
    <main className="flex min-h-screen items-center justify-center">
      <PageLoading label="리다이렉트 중..." />
    </main>
  )
}
