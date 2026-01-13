import axios from 'axios'
import Cookies from 'js-cookie'
import { mockApiResponses, mockUser } from './mockData'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// 더미 데이터 모드 강제 활성화 옵션
const FORCE_MOCK_MODE = process.env.NEXT_PUBLIC_FORCE_MOCK === 'true'

// 백엔드 서버 연결 확인 (강제 모드가 아닐 때만)
// 기본값을 true로 설정하여 Mock 모드를 기본으로 사용 (백엔드가 없을 때를 대비)
// 백엔드가 확인되면 자동으로 false로 변경됨
let useMockData = true // 기본적으로 Mock 모드 사용

if (FORCE_MOCK_MODE) {
  useMockData = true
  console.log('🔧 Mock data mode FORCED (no backend check)')
} else if (typeof window !== 'undefined') {
  // 브라우저에서만 체크 (비동기로 실행)
  // 백엔드가 있으면 자동으로 전환됨
  checkBackendConnection()
} else {
  // 서버 사이드에서는 기본적으로 Mock 모드 사용
  console.log('🔧 Mock data mode enabled by default (server-side)')
}

async function checkBackendConnection() {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)
    
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      credentials: 'omit',
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    if (response.ok) {
      // 백엔드가 정상 작동하면 Mock 모드 비활성화
      useMockData = false
      if (typeof window !== 'undefined') {
        console.log('🔧 Backend available, using real API')
      }
    } else {
      useMockData = true
      if (typeof window !== 'undefined') {
        console.log('🔧 Backend not available, using mock data')
      }
    }
  } catch (error) {
    // 서버가 없거나 연결 실패 시 더미 데이터 사용
    useMockData = true
    if (typeof window !== 'undefined') {
      console.log('🔧 Using mock data mode (backend not available)')
    }
  }
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(async (config) => {
  const token = Cookies.get('melt_session')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // 더미 데이터 모드인 경우 가짜 응답 반환
  if (useMockData) {
    const url = config.url || ''
    const method = config.method?.toLowerCase() || 'get'
    
    // GET과 POST 요청 모두 더미 데이터 지원
    if (method === 'get' || method === 'post' || method === 'put' || method === 'delete') {
      const mockResponse = getMockResponse(url, config.params, config.data)
      if (mockResponse) {
        // 가짜 axios 응답 객체 반환
        return Promise.reject({
          isMock: true,
          data: mockResponse,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        })
      }
    }
  }

  return config
})

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 더미 데이터 응답인 경우
    if (error.isMock) {
      return Promise.resolve({
        data: error.data,
        status: error.status,
        statusText: error.statusText,
        headers: error.headers,
        config: error.config,
      })
    }

    // 네트워크 오류인 경우 더미 데이터 시도
    if (!error.response && useMockData) {
      const url = error.config?.url || ''
      const mockResponse = getMockResponse(url, error.config?.params)
      if (mockResponse) {
        return Promise.resolve({
          data: mockResponse,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config,
        })
      }
    }

    if (error.response?.status === 401) {
      // 로그인 페이지로 리다이렉트
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

// 더미 응답 생성
function getMockResponse(url: string, params?: any, data?: any): any {
  // URL에서 파라미터 추출
  const urlParts = url.split('/')
  
  // /auth/me - 쿠키에서 더미 유저 정보 읽기
  if (url === '/auth/me' || url.startsWith('/auth/me')) {
    if (typeof window !== 'undefined') {
      try {
        const mockUserId = Cookies.get('mock_user_id')
        const mockUserRole = Cookies.get('mock_user_role') || 'viewer'
        const mockUserName = Cookies.get('mock_user_name') || '테스트 유저'
        
        if (mockUserId) {
          return {
            data: {
              user: {
                id: `mock_${mockUserId}`,
                chzzk_user_id: mockUserId,
                display_name: mockUserName,
                role: mockUserRole,
              }
            }
          }
        }
      } catch (e) {
        // 쿠키 읽기 실패 시 기본값 사용
      }
    }
    const handler = mockApiResponses['/auth/me']
    return typeof handler === 'function' ? handler() : handler
  }

  // /conversations
  if (url === '/conversations' || url.startsWith('/conversations')) {
    const handler = mockApiResponses['/conversations']
    return typeof handler === 'function' ? handler() : handler
  }

  // /search/creators
  if (url === '/search/creators' || url.startsWith('/search/creators')) {
    const query = params?.q || ''
    return mockApiResponses['/search/creators'](query)
  }

  // /creators/popular
  if (url === '/creators/popular' || url.startsWith('/creators/popular')) {
    const handler = mockApiResponses['/creators/popular']
    return typeof handler === 'function' ? handler() : handler
  }

  // /feed
  if (url === '/feed' || url.startsWith('/feed')) {
    const chzzkChannelId = params?.chzzkChannelId || 'channel_creator_1'
    return mockApiResponses['/feed'](chzzkChannelId)
  }

  // /onboarding/status
  if (url === '/onboarding/status' || url.startsWith('/onboarding/status')) {
    const handler = mockApiResponses['/onboarding/status']
    return typeof handler === 'function' ? handler() : handler
  }

  // /onboarding/role
  if (url === '/onboarding/role' || url.startsWith('/onboarding/role')) {
    const handler = mockApiResponses['/onboarding/role']
    if (handler && typeof handler === 'function') {
      // POST 요청의 body에서 role 추출
      const role = data?.role || 'viewer'
      return handler(role)
    }
  }

  // /messages/dm - DM 전송
  if (url === '/messages/dm' || url.startsWith('/messages/dm')) {
    // 개발 모드: 성공 응답만 반환
    return { data: { success: true, message: { id: `msg_${Date.now()}`, content: data?.content } } }
  }

  // /messages/creator-post - 크리에이터 공개 메시지
  if (url === '/messages/creator-post' || url.startsWith('/messages/creator-post')) {
    // 개발 모드: 성공 응답만 반환
    return { data: { success: true, message: { id: `msg_${Date.now()}`, content: data?.content, type: 'creator_post' } } }
  }

  // /messages/:id/reply - 답장
  if (url.match(/\/messages\/[^/]+\/reply/)) {
    return { data: { success: true } }
  }

  // /messages/:id/retweet - RT
  if (url.match(/\/messages\/[^/]+\/retweet/)) {
    return { data: { success: true } }
  }

  // /channels/:id/settings - 채널 설정 업데이트
  if (url.match(/\/channels\/[^/]+\/settings/)) {
    return { data: { success: true } }
  }

  // /channels/:id/follow - 팔로우
  if (url.match(/\/channels\/[^/]+\/follow/) && !url.includes('/follow-status')) {
    return { data: { success: true } }
  }

  // /channels/:id/follow - 언팔로우 (DELETE)
  if (url.match(/\/channels\/[^/]+\/follow/) && !url.includes('/follow-status')) {
    return { data: { success: true } }
  }

  // /conversations/unread-count - 전체 읽지 않은 메시지 수
  if (url === '/conversations/unread-count' || url.startsWith('/conversations/unread-count')) {
    const handler = mockApiResponses['/conversations/unread-count']
    return typeof handler === 'function' ? handler() : handler
  }

  // /creator/inbox/unread-count - 크리에이터 읽지 않은 DM 수
  if (url === '/creator/inbox/unread-count' || url.startsWith('/creator/inbox/unread-count')) {
    const handler = mockApiResponses['/creator/inbox/unread-count']
    const chzzkChannelId = params?.chzzkChannelId || 'channel_creator_1'
    return typeof handler === 'function' ? handler(chzzkChannelId) : handler
  }

  // /donations/:intentId/complete - 후원 완료 후 메시지 등록
  if (url.match(/\/donations\/[^/]+\/complete/)) {
    const handler = mockApiResponses['/donations/:intentId/complete']
    if (handler && typeof handler === 'function') {
      const intentId = url.split('/')[2] || data?.intentId
      const message = data?.message || ''
      return handler(intentId, message)
    }
  }

  // /profile - 프로필 업데이트
  if (url === '/profile' || url.startsWith('/profile')) {
    const handler = mockApiResponses['/profile']
    if (handler && typeof handler === 'function') {
      const displayName = data?.display_name || data?.displayName
      return handler(displayName)
    }
  }

  // /auth/logout - 로그아웃
  if (url === '/auth/logout' || url.startsWith('/auth/logout')) {
    const handler = mockApiResponses['/auth/logout']
    return typeof handler === 'function' ? handler() : handler
  }

  // /creator/stats - 크리에이터 통계
  if (url === '/creator/stats' || url.startsWith('/creator/stats')) {
    const handler = mockApiResponses['/creator/stats']
    if (handler && typeof handler === 'function') {
      const period = params?.period || 'week'
      return handler(period)
    }
  }

  // /my/activity - 내 활동 내역
  if (url === '/my/activity' || url.startsWith('/my/activity')) {
    const handler = mockApiResponses['/my/activity']
    return typeof handler === 'function' ? handler() : handler
  }

  // /notifications - 알림 목록
  if (url === '/notifications' || url.startsWith('/notifications')) {
    // /notifications/:id/read 패턴 체크
    if (url.match(/\/notifications\/[^/]+\/read/)) {
      const handler = mockApiResponses['/notifications/:id/read']
      if (handler && typeof handler === 'function') {
        const id = url.split('/')[2]
        return handler(id)
      }
    }
    // /notifications/unread-count 패턴 체크
    if (url === '/notifications/unread-count' || url.startsWith('/notifications/unread-count')) {
      const handler = mockApiResponses['/notifications/unread-count']
      return typeof handler === 'function' ? handler() : handler
    }
    // 일반 알림 목록
    const handler = mockApiResponses['/notifications']
    return typeof handler === 'function' ? handler() : handler
  }

  // /admin/stats - 관리자 통계
  if (url === '/admin/stats' || url.startsWith('/admin/stats')) {
    const handler = mockApiResponses['/admin/stats']
    return typeof handler === 'function' ? handler() : handler
  }

  // /admin/users - 관리자 유저 목록
  if (url === '/admin/users' || url.startsWith('/admin/users')) {
    const handler = mockApiResponses['/admin/users']
    return typeof handler === 'function' ? handler(params) : handler
  }

  // /admin/channels - 관리자 채널 목록
  if (url === '/admin/channels' || url.startsWith('/admin/channels')) {
    const handler = mockApiResponses['/admin/channels']
    return typeof handler === 'function' ? handler(params) : handler
  }

  // /admin/messages/reported - 신고된 메시지 목록
  if (url === '/admin/messages/reported' || url.startsWith('/admin/messages/reported')) {
    const handler = mockApiResponses['/admin/messages/reported']
    return typeof handler === 'function' ? handler() : handler
  }

  // /contact - 문의 접수
  if (url === '/contact' || url.startsWith('/contact')) {
    // /contact/history 패턴 체크
    if (url === '/contact/history' || url.startsWith('/contact/history')) {
      const handler = mockApiResponses['/contact/history']
      return typeof handler === 'function' ? handler() : handler
    }
    // 일반 문의 접수
    const handler = mockApiResponses['/contact']
    return typeof handler === 'function' ? handler(data) : handler
  }

  // /conversations/:id/read - 읽음 처리
  if (url.match(/\/conversations\/[^/]+\/read/)) {
    return { data: { success: true } }
  }

  // /creator/inbox
  if (url === '/creator/inbox' || url.startsWith('/creator/inbox')) {
    const chzzkChannelId = params?.chzzkChannelId || 'channel_creator_1'
    return mockApiResponses['/creator/inbox'](chzzkChannelId)
  }

  // /channels/:id
  if (url.startsWith('/channels/')) {
    const chzzkChannelId = urlParts[2] || params?.chzzkChannelId || 'channel_creator_1'
    
    // /channels/:id/follow-status
    if (url.includes('/follow-status')) {
      return mockApiResponses['/channels/:id/follow-status']()
    }
    
    return mockApiResponses['/channels/:id'](chzzkChannelId)
  }

  return null
}

// 수동으로 더미 데이터 모드 활성화 (개발용)
export function enableMockDataMode() {
  useMockData = true
  console.log('🔧 Mock data mode enabled')
}

// 더미 데이터 모드 비활성화
export function disableMockDataMode() {
  useMockData = false
  console.log('🔧 Mock data mode disabled')
}
