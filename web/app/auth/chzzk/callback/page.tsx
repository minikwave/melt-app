'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ChzzkCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      setStatus('error')
      setMessage('로그인에 실패했습니다. 다시 시도해주세요.')
      setTimeout(() => {
        router.push('/auth/naver')
      }, 3000)
      return
    }

    if (code) {
      // 백엔드에서 이미 처리했으므로, 쿠키가 설정되어 있을 것
      // 유저 정보 확인 후 온보딩 또는 메인으로 이동
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        credentials: 'include',
      })
        .then((res) => res.json())
        .then(async (data) => {
          if (data.user) {
            setStatus('success')
            setMessage('로그인 성공!')
            
            // 온보딩 상태 확인
            const onboardingRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/onboarding/status`, {
              credentials: 'include',
            })
            const onboardingData = await onboardingRes.json()
            
            setTimeout(() => {
              if (onboardingData.needsOnboarding || onboardingData.needsCreatorSetup) {
                router.push('/onboarding')
              } else {
                router.push('/app')
              }
            }, 1000)
          } else {
            throw new Error('User not found')
          }
        })
        .catch((err) => {
          console.error('Auth check error:', err)
          setStatus('error')
          setMessage('인증 확인에 실패했습니다.')
          setTimeout(() => {
            router.push('/auth/naver')
          }, 3000)
        })
    } else {
      setStatus('error')
      setMessage('인증 코드가 없습니다.')
      setTimeout(() => {
        router.push('/auth/naver')
      }, 3000)
    }
  }, [searchParams, router])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center space-y-4">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="text-neutral-400">로그인 처리 중...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-green-400 text-4xl mb-2">✓</div>
            <p className="text-white">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-red-400 text-4xl mb-2">✗</div>
            <p className="text-red-400">{message}</p>
          </>
        )}
      </div>
    </main>
  )
}
