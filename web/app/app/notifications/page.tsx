'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'

export default function NotificationsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications'),
    refetchInterval: 10000, // 10초마다 새로고침
  })

  // 읽지 않은 알림 수
  const { data: unreadCount } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => api.get('/notifications/unread-count'),
    refetchInterval: 10000,
  })

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => api.post(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
    },
  })

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id)
    }
    if (notification.link) {
      router.push(notification.link)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return '💬'
      case 'donation':
        return '💰'
      case 'follow':
        return '👥'
      default:
        return '🔔'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'bg-blue-500/20 border-blue-500/30'
      case 'donation':
        return 'bg-green-500/20 border-green-500/30'
      case 'follow':
        return 'bg-purple-500/20 border-purple-500/30'
      default:
        return 'bg-neutral-500/20 border-neutral-500/30'
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen p-4">
        <div className="text-center text-neutral-400 py-8">로딩 중...</div>
      </main>
    )
  }

  const notificationList = notifications?.data?.notifications || []

  return (
    <main className="min-h-screen p-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/app" className="text-neutral-400 hover:text-white">
            ← 뒤로
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">알림</h1>
            {unreadCount?.data?.unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs font-semibold">
                {unreadCount.data.unreadCount}
              </span>
            )}
          </div>
          <div className="w-8" />
        </div>

        {/* 알림 목록 */}
        {notificationList.length === 0 ? (
          <div className="text-center py-12 text-neutral-400">
            알림이 없습니다
          </div>
        ) : (
          <div className="space-y-3">
            {notificationList.map((notification: any) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full p-4 rounded-xl border text-left transition-colors ${
                  notification.read
                    ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700'
                    : `${getNotificationColor(notification.type)} hover:opacity-80`
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{notification.title}</h3>
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-300 mb-2">{notification.content}</p>
                    <p className="text-xs text-neutral-500">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
