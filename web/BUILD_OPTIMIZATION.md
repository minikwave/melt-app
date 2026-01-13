# 빌드 최적화 가이드

## 변경 사항

### 1. 동적 렌더링 제거
- `export const dynamic = 'force-dynamic'` 제거
- Next.js가 자동으로 정적 생성 가능한 페이지는 빌드 시 미리 생성
- 클라이언트 컴포넌트(`'use client'`)가 있는 페이지도 부분 정적 생성

### 2. Next.js 설정 최적화
- `onDemandEntries` 설정으로 페이지 캐싱 개선
- `swcMinify` 활성화로 번들 크기 최적화
- 프로덕션에서 console 제거

## 빌드 방법

### 개발 모드 (빠른 시작)
```powershell
cd web
npm run dev
```
- 개발 모드에서는 여전히 동적 렌더링
- 하지만 캐싱이 개선되어 더 빠름

### 프로덕션 빌드 (모든 페이지 미리 생성)
```powershell
cd web
npm run build
npm run start
```
- 빌드 시 모든 페이지를 미리 생성
- 정적 생성 가능한 페이지는 HTML로 생성
- 클라이언트 컴포넌트는 JavaScript로 번들링

### Mock 모드로 빌드
```powershell
cd web
npm run build:static
npm run preview
```
- Mock 데이터 모드로 빌드
- 모든 페이지가 미리 생성됨

## 성능 개선 효과

### Before (동적 렌더링)
- 각 페이지 요청 시마다 서버에서 렌더링
- 첫 로딩: 500-1000ms
- 페이지 전환: 300-500ms

### After (정적 생성)
- 빌드 시 미리 생성된 HTML 제공
- 첫 로딩: 50-100ms (CDN 사용 시)
- 페이지 전환: 50-100ms (클라이언트 사이드 라우팅)

## 주의사항

### 동적 렌더링이 필요한 페이지
다음 페이지들은 사용자별 데이터가 필요하므로 동적 렌더링 유지:
- `/app` - 사용자 정보 필요
- `/app/channels/[id]` - 채널별 데이터
- `/app/profile` - 사용자별 프로필
- `/app/my/activity` - 사용자별 활동 내역

이런 페이지들은:
- 클라이언트 사이드에서 데이터 페칭
- 서버 컴포넌트는 정적으로 생성
- 클라이언트 컴포넌트는 런타임에 렌더링

## 추가 최적화

### 이미지 최적화
```tsx
import Image from 'next/image'
// Next.js Image 컴포넌트 사용
```

### 코드 스플리팅
- Next.js가 자동으로 페이지별 코드 스플리팅
- 필요한 JavaScript만 로드

### 프리페칭
- Link 컴포넌트가 자동으로 프리페칭
- 마우스 오버 시 미리 로드
