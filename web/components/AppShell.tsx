'use client'

import { usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import Header from './Header'
import Footer from './Footer'
import Navigation from './Navigation'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/'
  const isApp = pathname.startsWith('/app')

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me'),
    retry: false,
  })
  const userData = user?.data?.data?.user || user?.data?.user
  const showBottomNav = isApp && !!userData

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className={`flex-1 min-h-0 ${showBottomNav ? 'pb-20' : ''}`}>
        {children}
      </main>
      {showBottomNav ? <Navigation /> : <Footer />}
    </div>
  )
}
