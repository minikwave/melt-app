'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminUsersPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me'),
  })

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: () => api.get('/admin/users', { params: { search } }),
  })

  useEffect(() => {
    if (user?.data?.user && user.data.user.role !== 'admin') {
      router.push('/app')
    }
  }, [user, router])

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

  const userList = users?.data?.users || []

  return (
    <main className="min-h-screen p-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/app/admin" className="text-neutral-400 hover:text-white">
            ← 뒤로
          </Link>
          <h1 className="text-xl font-bold">유저 관리</h1>
          <div className="w-8" />
        </div>

        {/* 검색 */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="유저 ID 또는 이름으로 검색..."
          className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-blue-500"
        />

        {/* 유저 목록 */}
        <div className="space-y-2">
          {userList.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">유저를 찾을 수 없습니다</div>
          ) : (
            userList.map((u: any) => (
              <div
                key={u.id || u.chzzk_user_id}
                className="p-4 rounded-xl bg-neutral-800 border border-neutral-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold mb-1">
                      {u.display_name || u.chzzk_user_id}
                    </div>
                    <div className="text-sm text-neutral-400 mb-1 font-mono">
                      {u.chzzk_user_id}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          u.role === 'admin'
                            ? 'bg-red-500/20 text-red-300'
                            : u.role === 'creator'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {u.role === 'admin' && '관리자'}
                        {u.role === 'creator' && '크리에이터'}
                        {u.role === 'viewer' && '시청자'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 총 유저 수 */}
        {users?.data?.total !== undefined && (
          <div className="text-center text-sm text-neutral-400">
            총 {users.data.total}명
          </div>
        )}
      </div>
    </main>
  )
}
