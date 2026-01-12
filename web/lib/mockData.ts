// 더미 데이터 - 백엔드 서버 없이 프론트엔드 테스트용

export const mockUser = {
  id: 'mock-user-id',
  chzzk_user_id: 'viewer_1',
  display_name: '테스트 시청자',
  role: 'viewer',
  onboarding_complete: true,
}

export const mockCreator = {
  id: 'mock-creator-id',
  chzzk_user_id: 'creator_1',
  display_name: '테스트 크리에이터',
  role: 'creator',
  onboarding_complete: true,
}

export const mockChannels = [
  {
    id: 'channel-1',
    chzzk_channel_id: 'channel_creator_1',
    name: '크리에이터 1의 채널',
    owner_name: '크리에이터1',
    follower_count: 150,
    owner_user_id: 'creator-1',
  },
  {
    id: 'channel-2',
    chzzk_channel_id: 'channel_creator_2',
    name: '크리에이터 2의 채널',
    owner_name: '크리에이터2',
    follower_count: 89,
    owner_user_id: 'creator-2',
  },
  {
    id: 'channel-3',
    chzzk_channel_id: 'channel_creator_3',
    name: '크리에이터 3의 채널',
    owner_name: '크리에이터3',
    follower_count: 234,
    owner_user_id: 'creator-3',
  },
]

export const mockConversations = [
  {
    id: 'conv-1',
    chzzk_channel_id: 'channel_creator_1',
    name: '크리에이터 1의 채널',
    last_message: '안녕하세요! 방송 외 시간에도 응원해주셔서 감사합니다!',
    last_message_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    unread_count: '3',
  },
  {
    id: 'conv-2',
    chzzk_channel_id: 'channel_creator_2',
    name: '크리에이터 2의 채널',
    last_message: '오늘도 좋은 하루 되세요!',
    last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    unread_count: '1',
  },
]

export const mockMessages = [
  {
    id: 'msg-1',
    channel_id: 'channel-1',
    author: {
      chzzkUserId: 'creator_1',
      displayName: '크리에이터1',
    },
    type: 'creator_post',
    visibility: 'public',
    content: '안녕하세요! 방송 외 시간에도 응원해주셔서 감사합니다!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    donationAmount: null,
    isRetweet: false,
    read: true,
    sent: true,
  },
  {
    id: 'msg-2',
    channel_id: 'channel-1',
    author: {
      chzzkUserId: 'viewer_1',
      displayName: '시청자1',
    },
    type: 'donation',
    visibility: 'public',
    content: '치즈 10000원과 함께 보내는 응원 메시지!',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    donationAmount: 10000,
    isRetweet: false,
    read: true,
    sent: true,
  },
  {
    id: 'msg-3',
    channel_id: 'channel-1',
    author: {
      chzzkUserId: 'viewer_2',
      displayName: '시청자2',
    },
    type: 'donation',
    visibility: 'public',
    content: '항상 응원합니다!',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    donationAmount: 5000,
    isRetweet: false,
    read: false,
    sent: true,
  },
  {
    id: 'msg-4',
    channel_id: 'channel-1',
    author: {
      chzzkUserId: 'viewer_3',
      displayName: '시청자3',
    },
    type: 'retweet',
    visibility: 'public',
    content: '이 메시지는 크리에이터가 RT한 비공개 메시지입니다!',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    donationAmount: null,
    isRetweet: true,
    read: true,
    sent: true,
  },
]

export const mockDms = [
  {
    id: 'dm-1',
    channel_id: 'channel-1',
    author_user_id: 'viewer_1',
    display_name: '시청자1',
    type: 'dm',
    visibility: 'private',
    content: '안녕하세요! 좋은 방송 감사합니다.',
    created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    read: false,
    sent: true,
  },
  {
    id: 'dm-2',
    channel_id: 'channel-1',
    author_user_id: 'viewer_2',
    display_name: '시청자2',
    type: 'dm',
    visibility: 'private',
    content: '다음 방송도 기대하고 있습니다!',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    read: true,
    sent: true,
  },
]

export const mockPendingDonations = [
  {
    id: 'donation-1',
    channel_id: 'channel-1',
    viewer_user_id: 'viewer-3',
    viewer_display_name: '시청자3',
    amount: 20000,
    status: 'OCCURRED',
    message: {
      id: 'msg-donation-1',
      content: '치즈 20000원과 함께 보내는 메시지입니다!',
      created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
  },
]

// API 응답 형태로 변환
export const mockApiResponses = {
  '/auth/me': { data: { user: mockUser } },
  '/conversations': { data: { conversations: mockConversations } },
  '/search/creators': (query: string) => ({
    data: {
      creators: mockChannels.filter(
        (ch) =>
          ch.name.toLowerCase().includes(query.toLowerCase()) ||
          ch.chzzk_channel_id.toLowerCase().includes(query.toLowerCase())
      ),
    },
  }),
  '/feed': (chzzkChannelId: string) => {
    // 채널별 메시지 필터링 (개발 모드에서는 모든 메시지 표시)
    const channelMessages = mockMessages.filter((msg) => 
      msg.channel_id === 'channel-1' || chzzkChannelId.includes('channel')
    )
    return {
      data: {
        feed: channelMessages,
      },
    }
  },
  '/creator/inbox': (chzzkChannelId: string) => ({
    data: {
      dms: mockDms,
      pendingDonations: mockPendingDonations,
    },
  }),
  '/channels/:id': (chzzkChannelId: string) => {
    const channel = mockChannels.find((ch) => ch.chzzk_channel_id === chzzkChannelId)
    return {
      data: {
        channel: channel || {
          id: 'channel-1',
          chzzk_channel_id: chzzkChannelId,
          name: `${chzzkChannelId}의 채널`,
          owner_name: '크리에이터',
        },
      },
    }
  },
  '/channels/:id/follow-status': () => ({
    data: { isFollowing: false },
  }),
  '/conversations/unread-count': () => {
    // 개발 모드: 전체 읽지 않은 메시지 수
    const totalUnread = mockConversations.reduce((sum, conv) => {
      return sum + parseInt(conv.unread_count || '0')
    }, 0)
    return {
      data: { unreadCount: totalUnread },
    }
  },
  '/creator/inbox/unread-count': (chzzkChannelId: string) => {
    // 개발 모드: 특정 채널의 읽지 않은 DM 수
    return {
      data: { unreadCount: mockDms.length },
    }
  },
  '/donations/:intentId/complete': (intentId: string, message: string) => {
    // 개발 모드: 후원 완료 후 메시지 등록
    // 실제로는 후원 상태를 OCCURRED로 변경하고 메시지를 공개 피드에 추가
    return {
      data: {
        success: true,
        donation: {
          id: `donation_${intentId}`,
          intentId,
          status: 'OCCURRED',
          message: {
            id: `msg_${Date.now()}`,
            content: message,
            type: 'donation',
            visibility: 'public',
          },
        },
      },
    }
  },
  '/profile': (displayName?: string) => {
    // 개발 모드: 프로필 업데이트
    if (typeof window !== 'undefined' && displayName) {
      const Cookies = require('js-cookie').default
      Cookies.set('mock_user_name', displayName, { path: '/' })
    }
    return {
      data: {
        success: true,
        user: {
          display_name: displayName,
        },
      },
    }
  },
  '/auth/logout': () => {
    // 개발 모드: 로그아웃
    if (typeof window !== 'undefined') {
      const Cookies = require('js-cookie').default
      Cookies.remove('melt_session', { path: '/' })
      Cookies.remove('mock_user_id', { path: '/' })
      Cookies.remove('mock_user_role', { path: '/' })
      Cookies.remove('mock_user_name', { path: '/' })
      Cookies.remove('mock_onboarding_complete', { path: '/' })
    }
    return {
      data: { success: true },
    }
  },
  '/creator/stats': (period: string = 'week') => {
    // 개발 모드: 크리에이터 통계
    const now = new Date()
    const periodDays = period === 'day' ? 1 : period === 'week' ? 7 : 30
    
    // 더미 통계 데이터 생성
    const dailyStats = Array.from({ length: periodDays }, (_, i) => {
      const date = new Date(now)
      date.setDate(date.getDate() - (periodDays - 1 - i))
      return {
        date: date.toISOString().split('T')[0],
        amount: Math.floor(Math.random() * 50000) + 10000,
        count: Math.floor(Math.random() * 5) + 1,
      }
    })
    
    const totalAmount = dailyStats.reduce((sum, day) => sum + day.amount, 0)
    const totalCount = dailyStats.reduce((sum, day) => sum + day.count, 0)
    
    return {
      data: {
        period,
        totalAmount,
        totalCount,
        averageAmount: Math.floor(totalAmount / totalCount),
        dailyStats,
        topSupporters: [
          { chzzk_user_id: 'viewer_1', display_name: '시청자1', totalAmount: 50000, count: 3 },
          { chzzk_user_id: 'viewer_2', display_name: '시청자2', totalAmount: 30000, count: 2 },
          { chzzk_user_id: 'viewer_3', display_name: '시청자3', totalAmount: 20000, count: 1 },
        ],
      },
    }
  },
  '/onboarding/status': () => {
    // 개발 모드: 쿠키에서 온보딩 상태 확인
    if (typeof window !== 'undefined') {
      const mockUserId = document.cookie.split('; ').find(row => row.startsWith('mock_user_id='))?.split('=')[1]
      const onboardingComplete = document.cookie.split('; ').find(row => row.startsWith('mock_onboarding_complete='))?.split('=')[1] === 'true'
      
      if (mockUserId && !onboardingComplete) {
        const role = document.cookie.split('; ').find(row => row.startsWith('mock_user_role='))?.split('=')[1]
        return {
          data: {
            needsOnboarding: true,
            needsCreatorSetup: role === 'creator',
            onboardingComplete: false,
          },
        }
      }
    }
    return {
      data: {
        needsOnboarding: false,
        needsCreatorSetup: false,
        onboardingComplete: true,
      },
    }
  },
  '/creators/popular': () => ({
    data: {
      creators: mockChannels.sort((a, b) => (b.follower_count || 0) - (a.follower_count || 0)),
    },
  }),
  '/onboarding/role': (role: 'viewer' | 'creator') => {
    // 개발 모드: 역할 설정
    if (typeof window !== 'undefined') {
      const Cookies = require('js-cookie').default
      const mockUserId = Cookies.get('mock_user_id')
      const user = role === 'creator' ? { ...mockCreator } : { ...mockUser }
      // 쿠키 업데이트
      Cookies.set('mock_user_role', role, { path: '/' })
      return {
        data: {
          user: {
            ...user,
            role,
            chzzk_user_id: mockUserId || user.chzzk_user_id,
          },
        },
      }
    }
    return { data: { user: role === 'creator' ? mockCreator : mockUser } }
  },
}
