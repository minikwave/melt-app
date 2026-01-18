'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import Link from 'next/link'
import Skeleton, { ChannelCardSkeleton } from '../../components/Skeleton'
import ErrorDisplay from '../../components/ErrorDisplay'

export default function BrowsePage() {
  // 인기 크리에이터 목록 (로그인 불필요)
  const { data: popularCreators, isLoading, error, refetch } = useQuery({
    queryKey: ['popular-creators-browse'],
    queryFn: () => api.get('/creators/popular', { params: { limit: 20 } }),
  })

  const creators = popularCreators?.data?.creators || []

  return (
    <main className="min-h-screen p-4 bg-gradient-to-b from-neutral-950 to-neutral-900">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 via-blue-500 via-green-500 to-yellow-500 rounded-xl transform rotate-12 opacity-90 blur-sm"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-pink-400 via-purple-400 via-blue-400 via-green-400 to-yellow-400 rounded-xl flex items-center justify-center shadow-2xl">
                <span className="text-4xl font-bold text-white drop-shadow-lg">M</span>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 via-blue-400 via-green-400 to-yellow-400 bg-clip-text text-transparent">
            Melt 둘러보기
          </h1>
          <p className="text-neutral-400">
            인기 크리에이터를 둘러보고 메시지를 확인해보세요
          </p>
        </div>

        {/* 로그인 안내 */}
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <p className="text-sm text-blue-400 font-semibold mb-2">
            💡 로그인하면 더 많은 기능을 사용할 수 있습니다
          </p>
          <div className="flex gap-2">
            <Link
              href="/auth/naver"
              className="flex-1 px-4 py-2 rounded-lg bg-[#03C75A] text-white hover:bg-[#02B350] transition-colors text-center text-sm font-semibold"
            >
              네이버로 시작하기
            </Link>
            <Link
              href="/"
              className="px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors text-center text-sm"
            >
              홈으로
            </Link>
          </div>
        </div>

        {/* 인기 크리에이터 목록 */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton variant="text" width="40%" height={24} className="mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ChannelCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : error ? (
          <ErrorDisplay 
            error={error as Error} 
            onRetry={() => refetch()}
            title="크리에이터 목록을 불러올 수 없습니다"
          />
        ) : creators.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold">크리에이터가 없습니다</h2>
            <p className="text-neutral-400 text-sm">
              아직 등록된 크리에이터가 없습니다
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">인기 크리에이터</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {creators.map((creator: any) => (
                <Link
                  key={creator.id || creator.chzzk_channel_id}
                  href={`/app/channels/${creator.chzzk_channel_id}`}
                  className="p-4 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 hover:border-neutral-600 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="font-semibold text-sm truncate">
                      {creator.name || creator.chzzk_channel_id}
                    </div>
                    {creator.owner_name && (
                      <div className="text-xs text-neutral-400 truncate">
                        {creator.owner_name}
                      </div>
                    )}
                    {creator.follower_count > 0 && (
                      <div className="text-xs text-neutral-500">
                        팔로워 {creator.follower_count.toLocaleString()}명
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 안내 */}
        <div className="pt-8 border-t border-neutral-800">
          <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
            <h3 className="font-semibold mb-2">Melt란?</h3>
            <ul className="text-sm text-neutral-400 space-y-1">
              <li>• 방송이 꺼진 뒤에도 후원이 가능합니다</li>
              <li>• 크리에이터와 비공개 메시지를 주고받을 수 있습니다</li>
              <li>• 공개 피드로 모두와 소통할 수 있습니다</li>
              <li>• 치즈와 함께 보낸 메시지는 모두에게 공개됩니다</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
