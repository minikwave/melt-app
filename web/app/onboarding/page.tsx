'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import Link from 'next/link'

export default function OnboardingPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<'viewer' | 'creator' | null>(null)

  const { data: onboardingStatus } = useQuery({
    queryKey: ['onboarding-status'],
    queryFn: () => api.get('/onboarding/status'),
    retry: false,
  })

  const roleMutation = useMutation({
    mutationFn: (role: 'viewer' | 'creator') => 
      api.post('/onboarding/role', { role }),
    onSuccess: (data) => {
      try {
        const role = data.data?.user?.role
        if (!role) {
          throw new Error('역할 정보를 받지 못했습니다.')
        }
        
        // 개발 모드: 쿠키 업데이트
        if (typeof window !== 'undefined') {
          const Cookies = require('js-cookie').default
          Cookies.set('mock_user_role', role, { path: '/' })
          Cookies.set('mock_onboarding_complete', 'true', { path: '/' })
          if (data.data?.user?.display_name) {
            Cookies.set('mock_user_name', data.data.user.display_name, { path: '/' })
          }
        }
        
        if (role === 'creator') {
          router.push('/onboarding/creator-setup')
        } else {
          router.push('/app')
        }
      } catch (error: any) {
        console.error('Role mutation success handler error:', error)
        alert(error.message || '역할 설정 후 처리 중 오류가 발생했습니다.')
      }
    },
    onError: (error: any) => {
      console.error('Role mutation error:', error)
      alert(error.response?.data?.error || error.message || '역할 설정에 실패했습니다.')
    },
  })

  const handleRoleSelect = (role: 'viewer' | 'creator') => {
    setSelectedRole(role)
  }

  const handleContinue = () => {
    if (!selectedRole) {
      alert('역할을 선택해주세요')
      return
    }
    roleMutation.mutate(selectedRole)
  }

  // 이미 온보딩이 완료된 경우
  if (onboardingStatus?.data?.onboardingComplete) {
    router.push('/app')
    return null
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-neutral-950 to-neutral-900 onboarding-fullscreen">
      <div className="w-full max-w-md space-y-8">
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Melt에 오신 것을 환영합니다!</h1>
          <p className="text-neutral-400">
            어떤 역할로 시작하시겠어요?
          </p>
        </div>

        {/* 역할 선택 카드 */}
        <div className="space-y-4">
          {/* 시청자 카드 */}
          <button
            onClick={() => handleRoleSelect('viewer')}
            className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
              selectedRole === 'viewer'
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                selectedRole === 'viewer'
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-neutral-700'
              }`}>
                {selectedRole === 'viewer' && (
                  <div className="w-3 h-3 rounded-full bg-white" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">시청자</h3>
                <p className="text-sm text-neutral-400 mb-3">
                  좋아하는 스트리머에게 응원과 메시지를 보내세요
                </p>
                <ul className="text-xs text-neutral-500 space-y-1">
                  <li>• 치즈와 함께 메시지 전송</li>
                  <li>• 스트리머에게 비공개 메시지</li>
                  <li>• 공개 피드에서 소통</li>
                </ul>
              </div>
            </div>
          </button>

          {/* 스트리머 카드 */}
          <button
            onClick={() => handleRoleSelect('creator')}
            className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
              selectedRole === 'creator'
                ? 'border-yellow-500 bg-yellow-500/10'
                : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                selectedRole === 'creator'
                  ? 'border-yellow-500 bg-yellow-500'
                  : 'border-neutral-700'
              }`}>
                {selectedRole === 'creator' && (
                  <div className="w-3 h-3 rounded-full bg-white" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">스트리머</h3>
                <p className="text-sm text-neutral-400 mb-3">
                  방송 외 시간에도 후원을 받고 팬과 소통하세요
                </p>
                <ul className="text-xs text-neutral-500 space-y-1">
                  <li>• 후원 관리 및 통계</li>
                  <li>• 팬 메시지 관리</li>
                  <li>• 뱃지 시스템 운영</li>
                </ul>
              </div>
            </div>
          </button>
        </div>

        {/* 계속하기 버튼 */}
        <button
          onClick={handleContinue}
          disabled={!selectedRole || roleMutation.isPending}
          className="w-full rounded-xl py-4 font-bold bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {roleMutation.isPending ? '처리 중...' : '계속하기'}
        </button>

        {/* 건너뛰기 */}
        <div className="text-center">
          <button
            onClick={() => router.push('/app')}
            className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            나중에 설정하기
          </button>
        </div>
      </div>
    </main>
  )
}
