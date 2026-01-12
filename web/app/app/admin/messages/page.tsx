'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'

export default function AdminMessagesPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me'),
  })

  const { data: reportedMessages, isLoading } = useQuery({
    queryKey: ['admin-reported-messages'],
    queryFn: () => api.get('/admin/messages/reported'),
  })

  useEffect(() => {
    if (user?.data?.user && user.data.user.role !== 'admin') {
      router.push('/app')
    }
  }, [user, router])

  const deleteMessageMutation = useMutation({
    mutationFn: (messageId: string) => api.delete(`/messages/${messageId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reported-messages'] })
      alert('메시지가 삭제되었습니다.')
    },
  })

  const handleDelete = (messageId: string) => {
    if (confirm('이 메시지를 삭제하시겠습니까?')) {
      deleteMessageMutation.mutate(messageId)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen p-4">
        <div className="text-center text-neutral-400 py-8">로딩 중...</div>
      </main>
    )
  }

  if (user?.data?.user?.role !== 'admin') {
    return null
  }

  const messages = reportedMessages?.data?.reportedMessages || []

  return (
    <main className="min-h-screen p-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/app/admin" className="text-neutral-400 hover:text-white">
            ← 뒤로
          </Link>
          <h1 className="text-xl font-bold">메시지 모더레이션</h1>
          <div className="w-8" />
        </div>

        {/* 신고된 메시지 목록 */}
        {messages.length === 0 ? (
          <div className="text-center py-12 text-neutral-400">
            신고된 메시지가 없습니다
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg: any) => (
              <div
                key={msg.id}
                className="p-4 rounded-xl bg-neutral-800 border border-red-500/30"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{msg.channel_name}</span>
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-xs font-semibold">
                        신고 {msg.report_count}회
                      </span>
                      <span className="px-2 py-0.5 rounded bg-neutral-500/20 text-neutral-300 text-xs">
                        {msg.report_reason}
                      </span>
                    </div>
                    <div className="text-sm text-neutral-400 mb-2">
                      작성자: {msg.author}
                    </div>
                    <p className="text-sm text-neutral-300 mb-2">{msg.content}</p>
                    <p className="text-xs text-neutral-500">
                      {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Link
                    href={`/app/channels/${msg.channel_id}`}
                    className="flex-1 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-sm font-semibold text-center"
                  >
                    채널 보기
                  </Link>
                  <button
                    onClick={() => handleDelete(msg.message_id)}
                    disabled={deleteMessageMutation.isPending}
                    className="flex-1 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 text-sm font-semibold"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
