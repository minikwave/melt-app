'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import Link from 'next/link'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general' as 'general' | 'bug' | 'feature' | 'other',
  })

  const contactMutation = useMutation({
    mutationFn: (data: any) => api.post('/contact', data),
    onSuccess: () => {
      alert('문의가 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.')
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'general',
      })
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || '문의 접수에 실패했습니다.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.message.trim()) {
      alert('이름과 메시지를 입력해주세요.')
      return
    }
    contactMutation.mutate(formData)
  }

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/app" className="text-neutral-400 hover:text-white">
            ← 뒤로
          </Link>
          <h1 className="text-xl font-bold">문의하기</h1>
          <div className="w-8" />
        </div>

        {/* 안내 */}
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <p className="text-sm text-blue-400">
            💡 문의사항을 남겨주시면 빠른 시일 내에 답변드리겠습니다.
          </p>
        </div>

        {/* 문의 양식 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">카테고리</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value as any })
              }
              className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-blue-500"
            >
              <option value="general">일반 문의</option>
              <option value="bug">버그 신고</option>
              <option value="feature">기능 제안</option>
              <option value="other">기타</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">이름 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="이름을 입력하세요"
              className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">이메일 (선택사항)</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="이메일을 입력하세요 (답변 받을 이메일)"
              className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">제목 *</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="문의 제목을 입력하세요"
              className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">메시지 *</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="문의 내용을 입력하세요"
              rows={8}
              className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-blue-500 resize-none"
              required
            />
            <p className="text-xs text-neutral-500 mt-1 text-right">
              {formData.message.length}/1000
            </p>
          </div>

          <button
            type="submit"
            disabled={contactMutation.isPending}
            className="w-full py-4 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {contactMutation.isPending ? '전송 중...' : '문의 보내기'}
          </button>
        </form>

        {/* 문의 내역 링크 */}
        <div className="pt-4 border-t border-neutral-800">
          <Link
            href="/contact/history"
            className="block p-4 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors text-center"
          >
            <div className="font-semibold">내 문의 내역</div>
            <div className="text-sm text-neutral-400 mt-1">이전에 보낸 문의 확인</div>
          </Link>
        </div>
      </div>
    </main>
  )
}
