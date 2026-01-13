'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export default function Navigation() {
  const pathname = usePathname()
  const isAppPage = pathname?.startsWith('/app')

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me'),
  })

  const userData = user?.data?.data?.user || user?.data?.user
  const isCreator = userData?.role === 'creator' || userData?.role === 'admin'

  // 알림 수 확인
  const { data: unreadCount } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => api.get('/notifications/unread-count'),
    enabled: !!userData,
    refetchInterval: 10000,
  })

  // 대화방 읽지 않은 메시지 수 확인
  const { data: conversationsUnreadCount } = useQuery({
    queryKey: ['conversations-unread-count'],
    queryFn: () => api.get('/conversations/unread-count'),
    enabled: !!userData && !isCreator,
    refetchInterval: 10000,
  })

  if (!isAppPage || !userData) {
    return null
  }

  const navItems = isCreator
    ? [
        { href: '/app', label: '홈', icon: '🏠' },
        { href: '/app/creator/dashboard', label: '대시보드', icon: '📊' },
        { href: '/app/creator/messages', label: '메시지', icon: '💬' },
        { href: '/app/notifications', label: '알림', icon: '🔔', badge: unreadCount?.data?.unreadCount },
        { href: '/app/profile', label: '프로필', icon: '👤' },
      ]
    : [
        { href: '/app', label: '홈', icon: '🏠' },
        { href: '/app/conversations', label: '대화방', icon: '💬', badge: conversationsUnreadCount?.data?.unreadCount },
        { href: '/app/search', label: '검색', icon: '🔍' },
        { href: '/app/notifications', label: '알림', icon: '🔔', badge: unreadCount?.data?.unreadCount },
        { href: '/app/profile', label: '프로필', icon: '👤' },
      ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 z-50 safe-area-bottom">
      <div className="max-w-[460px] mx-auto">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/app' && pathname?.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors min-w-[60px] relative ${
                  isActive ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span className="text-xl mb-1">{item.icon}</span>
                <span className="text-[10px] font-semibold">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold min-w-[18px] text-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
