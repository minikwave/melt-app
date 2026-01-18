/**
 * 앱 모드 판단 유틸리티
 * 
 * 모드 종류:
 * - production: 프로덕션 환경, 실제 OAuth + 실제 API
 * - development: 개발 환경, 개발자 모드 접근 가능
 * - mock: 강제 Mock 모드, 백엔드 없이 Mock 데이터만 사용
 */

export type AppMode = 'production' | 'development' | 'mock';

/**
 * 현재 앱 모드 반환
 */
export function getAppMode(): AppMode {
  // 강제 Mock 모드
  if (process.env.NEXT_PUBLIC_FORCE_MOCK === 'true') {
    return 'mock';
  }
  
  // 개발 환경
  if (process.env.NODE_ENV === 'development') {
    return 'development';
  }
  
  // 프로덕션 환경
  return 'production';
}

/**
 * 개발자 모드가 활성화되어 있는지 확인
 */
export function isDevModeEnabled(): boolean {
  // 강제 Mock 모드면 개발자 모드 활성화
  if (process.env.NEXT_PUBLIC_FORCE_MOCK === 'true') {
    return true;
  }
  
  // 개발 환경이면 기본적으로 활성화
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // 프로덕션에서는 명시적으로 활성화해야 함
  return process.env.NEXT_PUBLIC_ENABLE_DEV_MODE === 'true';
}

/**
 * 실제 API를 사용해야 하는지 확인
 */
export function shouldUseRealApi(): boolean {
  // 강제 Mock 모드면 실제 API 사용 안 함
  if (process.env.NEXT_PUBLIC_FORCE_MOCK === 'true') {
    return false;
  }
  
  // 그 외에는 백엔드 연결 상태에 따라 결정 (api.ts에서 처리)
  return true;
}

/**
 * OAuth를 사용해야 하는지 확인
 */
export function shouldUseOAuth(): boolean {
  // 강제 Mock 모드면 OAuth 사용 안 함
  if (process.env.NEXT_PUBLIC_FORCE_MOCK === 'true') {
    return false;
  }
  
  // 프로덕션에서는 항상 OAuth 사용
  return true;
}

/**
 * 개발자 모드 비밀번호 반환 (없으면 빈 문자열)
 */
export function getDevModePassword(): string {
  return process.env.NEXT_PUBLIC_DEV_PASSWORD || '';
}
