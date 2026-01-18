'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

/**
 * 후원 완료 후 자동 복귀 감지 컴포넌트
 * 
 * - 브라우저 탭 복귀 감지 (window.focus)
 * - 페이지 복귀 감지 (pageshow)
 * - localStorage에 저장된 Intent ID 확인
 * - 자동으로 후원 완료 페이지로 이동
 */
export default function DonationReturnHandler() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // 이미 완료 페이지에 있으면 처리하지 않음
    if (pathname?.includes('/donate/complete')) {
      return
    }

    const checkDonationReturn = () => {
      const intentId = localStorage.getItem('melt_intent_id')
      const donationMessage = localStorage.getItem('melt_donation_message')
      const channelId = localStorage.getItem('melt_donation_channel_id')

      // Intent ID와 채널 ID가 있으면 완료 페이지로 이동
      if (intentId && channelId && donationMessage) {
        // 약간의 지연을 두어 사용자가 페이지를 볼 수 있도록
        setTimeout(() => {
          router.push(`/app/channels/${channelId}/donate/complete`)
        }, 500)
      }
    }

    // 탭 복귀 감지
    const handleFocus = () => {
      checkDonationReturn()
    }

    // 페이지 복귀 감지 (뒤로가기 포함)
    const handlePageShow = (event: PageTransitionEvent) => {
      // 브라우저 캐시에서 복원된 경우에도 감지
      if (event.persisted) {
        checkDonationReturn()
      }
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('pageshow', handlePageShow)

    // 초기 체크 (페이지 로드 시)
    checkDonationReturn()

    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [router, pathname])

  return null
}
