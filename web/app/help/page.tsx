'use client'

import Link from 'next/link'
import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
  category: 'general' | 'viewer' | 'creator' | 'donation'
}

const faqData: FAQItem[] = [
  {
    category: 'general',
    question: 'Melt는 무엇인가요?',
    answer:
      'Melt는 치지직 스트리머와 팬들이 방송 외 시간에도 소통하고 후원할 수 있는 플랫폼입니다. 방송이 꺼진 뒤에도 후원이 흐르도록 하는 것이 목표입니다.',
  },
  {
    category: 'general',
    question: '어떻게 시작하나요?',
    answer:
      '네이버 계정으로 로그인하거나 개발 모드로 테스트할 수 있습니다. 로그인 후 역할(시청자/크리에이터)을 선택하고 시작하세요.',
  },
  {
    category: 'viewer',
    question: '시청자는 어떤 기능을 사용할 수 있나요?',
    answer:
      '시청자는 크리에이터를 검색하고 팔로우할 수 있으며, 비공개 메시지(DM)를 보내거나 치즈와 함께 공개 메시지를 보낼 수 있습니다.',
  },
  {
    category: 'viewer',
    question: '비공개 메시지와 공개 메시지의 차이는?',
    answer:
      '비공개 메시지는 크리에이터에게만 전달되며, 치즈와 함께 보낸 메시지는 공개 피드에 표시되어 모두가 볼 수 있습니다.',
  },
  {
    category: 'creator',
    question: '크리에이터는 어떤 기능을 사용할 수 있나요?',
    answer:
      '크리에이터는 받은 DM을 확인하고, 공개 메시지를 작성할 수 있으며, 후원 내역을 관리하고 통계를 확인할 수 있습니다.',
  },
  {
    category: 'creator',
    question: 'DM을 공개 피드에 올릴 수 있나요?',
    answer:
      '네, 받은 DM에 "RT (공개)" 버튼을 클릭하면 공개 피드에 올릴 수 있습니다. 이렇게 하면 팬들과의 소통을 공유할 수 있습니다.',
  },
  {
    category: 'donation',
    question: '후원은 어떻게 하나요?',
    answer:
      '크리에이터 채널 페이지에서 "치즈 보내기" 버튼을 클릭하면 치지직 공식 후원 페이지로 이동합니다. 후원 완료 후 메시지를 입력하면 공개 피드에 표시됩니다.',
  },
  {
    category: 'donation',
    question: '후원 내역은 어디서 확인하나요?',
    answer:
      '프로필 → 내 활동 → 후원 탭에서 내가 한 후원 내역과 총 후원액을 확인할 수 있습니다.',
  },
]

export default function HelpPage() {
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'general' | 'viewer' | 'creator' | 'donation'
  >('all')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = [
    { id: 'all', label: '전체' },
    { id: 'general', label: '일반' },
    { id: 'viewer', label: '시청자' },
    { id: 'creator', label: '크리에이터' },
    { id: 'donation', label: '후원' },
  ]

  const filteredFAQs = faqData.filter((faq) => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    const matchesSearch =
      searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/app" className="text-neutral-400 hover:text-white">
            ← 뒤로
          </Link>
          <h1 className="text-xl font-bold">도움말</h1>
          <div className="w-8" />
        </div>

        {/* 검색 */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="질문 검색..."
          className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-blue-500"
        />

        {/* 카테고리 필터 */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ 목록 */}
        <div className="space-y-3">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">
              검색 결과가 없습니다
            </div>
          ) : (
            filteredFAQs.map((faq, index) => (
              <details
                key={index}
                className="p-4 rounded-xl bg-neutral-800 border border-neutral-700"
              >
                <summary className="font-semibold cursor-pointer hover:text-blue-400 transition-colors">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm text-neutral-300 whitespace-pre-wrap">{faq.answer}</p>
              </details>
            ))
          )}
        </div>

        {/* 문의하기 링크 */}
        <div className="pt-6 border-t border-neutral-800">
          <Link
            href="/contact"
            className="block p-4 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors text-center"
          >
            <div className="font-semibold">추가 문의하기</div>
            <div className="text-sm text-neutral-400 mt-1">
              원하는 답변을 찾지 못하셨나요?
            </div>
          </Link>
        </div>
      </div>
    </main>
  )
}
