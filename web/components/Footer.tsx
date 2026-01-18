'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export default function Footer() {
  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me'),
    retry: false,
  })
  const userData = user?.data?.data?.user || user?.data?.user

  return (
    <footer className="flex-shrink-0 border-t border-neutral-800 bg-neutral-900/80 py-4 px-4">
      <div className="max-w-[460px] mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-3">
          <Link href="/browse" className="text-sm text-neutral-400 hover:text-white transition-colors">
            둘러보기
          </Link>
          {userData ? (
            <Link href="/app" className="text-sm text-neutral-400 hover:text-white transition-colors">
              앱 홈
            </Link>
          ) : (
            <Link href="/auth/naver" className="text-sm text-[#03C75A] hover:text-[#02B350] transition-colors font-medium">
              로그인
            </Link>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-3 text-xs text-neutral-500">
          <Link href="/terms" className="hover:text-neutral-400 transition-colors">이용약관</Link>
          <Link href="/privacy" className="hover:text-neutral-400 transition-colors">개인정보처리방침</Link>
          <Link href="/help" className="hover:text-neutral-400 transition-colors">도움말</Link>
        </div>
      </div>
    </footer>
  )
}
