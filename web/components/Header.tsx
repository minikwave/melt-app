'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

function getBackHref(pathname: string): string | null {
  if (pathname === '/') return null
  const toRoot = ['/browse', '/help', '/terms', '/privacy', '/contact', '/auth/login', '/auth/naver', '/auth/chzzk/callback', '/dev/login']
  if (toRoot.includes(pathname)) return '/'
  if (pathname === '/contact/history') return '/contact'
  if (pathname === '/onboarding/creator-setup') return '/onboarding'
  if (pathname === '/onboarding') return '/'
  if (pathname === '/app') return '/'
  if (pathname === '/app/admin' || pathname.startsWith('/app/admin/')) return '/app'
  if (pathname.startsWith('/app/creator/')) return '/app'
  if (pathname.startsWith('/app/channels/')) {
    const parts = pathname.split('/').filter(Boolean)
    if (parts[3] === 'donate' && parts[4] === 'complete') return `/app/channels/${parts[2]}/donate`
    if (parts[3] === 'donate') return `/app/channels/${parts[2]}`
    if (parts[2]) return '/app/channels'
  }
  if (pathname.startsWith('/app/')) return '/app'
  return '/'
}

export default function Header() {
  const pathname = usePathname() || '/'
  const backHref = getBackHref(pathname)

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me'),
    retry: false,
  })
  const userData = user?.data?.data?.user || user?.data?.user

  return (
    <header className="sticky top-0 z-40 h-14 flex-shrink-0 bg-neutral-900/95 backdrop-blur border-b border-neutral-800">
      <div className="h-full max-w-[460px] mx-auto px-3 flex items-center justify-between gap-2">
        <div className="w-10 flex-shrink-0 flex justify-start">
          {backHref ? (
            <Link
              href={backHref}
              className="flex items-center justify-center w-10 h-10 -ml-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label="뒤로 가기"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          ) : (
            <span />
          )}
        </div>

        <Link
          href="/"
          className="flex items-center gap-2 flex-shrink-0 min-w-0"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-400 via-purple-400 to-yellow-400 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-white">M</span>
          </div>
          <span className="font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-yellow-400 bg-clip-text text-transparent truncate">Melt</span>
        </Link>

        <div className="w-10 flex-shrink-0 flex justify-end gap-1">
          <Link
            href="/browse"
            className="flex items-center justify-center px-2 py-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors text-sm"
          >
            둘러보기
          </Link>
          {userData ? (
            <Link
              href="/app"
              className="flex items-center justify-center px-2 py-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors text-sm"
            >
              앱
            </Link>
          ) : (
            <Link
              href="/auth/naver"
              className="flex items-center justify-center px-2 py-1.5 rounded-lg text-[#03C75A] hover:bg-[#03C75A]/10 transition-colors text-sm font-medium"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
