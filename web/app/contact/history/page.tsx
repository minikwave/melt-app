'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export default function ContactHistoryPage() {
  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contact-history'],
    queryFn: () => api.get('/contact/history'),
  })

  if (isLoading) {
    return (
      <main className="min-h-screen p-4">
        <div className="text-center text-neutral-400 py-8">로딩 중...</div>
      </main>
    )
  }

  const contactList = contacts?.data?.contacts || []

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'general':
        return '일반 문의'
      case 'bug':
        return '버그 신고'
      case 'feature':
        return '기능 제안'
      case 'other':
        return '기타'
      default:
        return category
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '대기 중'
      case 'answered':
        return '답변 완료'
      default:
        return status
    }
  }

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/contact" className="text-neutral-400 hover:text-white">
            ← 뒤로
          </Link>
          <h1 className="text-xl font-bold">문의 내역</h1>
          <div className="w-8" />
        </div>

        {/* 문의 목록 */}
        {contactList.length === 0 ? (
          <div className="text-center py-12 text-neutral-400">
            문의 내역이 없습니다
          </div>
        ) : (
          <div className="space-y-3">
            {contactList.map((contact: any) => (
              <div
                key={contact.id}
                className="p-4 rounded-xl bg-neutral-800 border border-neutral-700"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{contact.subject}</span>
                      <span className="px-2 py-0.5 rounded bg-neutral-500/20 text-neutral-300 text-xs">
                        {getCategoryLabel(contact.category)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          contact.status === 'answered'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}
                      >
                        {getStatusLabel(contact.status)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-300 mb-2 line-clamp-2">
                      {contact.message}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {formatDistanceToNow(new Date(contact.created_at), { addSuffix: true })}
                    </p>
                    {contact.answer && (
                      <div className="mt-3 pt-3 border-t border-neutral-700">
                        <div className="text-sm font-semibold text-green-400 mb-1">답변:</div>
                        <p className="text-sm text-neutral-300 whitespace-pre-wrap">
                          {contact.answer}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 새 문의하기 */}
        <Link
          href="/contact"
          className="block p-4 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors text-center font-semibold"
        >
          새 문의하기
        </Link>
      </div>
    </main>
  )
}
