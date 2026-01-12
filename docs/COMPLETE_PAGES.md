# Melt 완성된 페이지 목록

## 전체 페이지 구조

```
/
├── / (홈)
├── /auth/
│   ├── /naver (네이버 로그인)
│   ├── /login (리다이렉트)
│   └── /chzzk/callback (OAuth 콜백)
├── /onboarding/
│   ├── / (역할 선택)
│   └── /creator-setup (스트리머 설정)
├── /dev/
│   └── /login (개발 모드 로그인) ⭐
└── /app/
    ├── / (메인 대시보드)
    ├── /profile (프로필 설정)
    ├── /conversations (대화방 목록) - 시청자
    ├── /search (크리에이터 검색) - 시청자
    ├── /channels/
    │   ├── / (채널 검색)
    │   └── /[id]/
    │       ├── / (채널 메신저)
    │       └── /donate/
    │           ├── / (후원 페이지)
    │           └── /complete (후원 완료)
    └── /creator/
        ├── /dashboard (대시보드)
        ├── /messages (메시지 관리)
        └── /settings (채널 설정)
```

## 페이지별 기능

### 인증 플로우
1. `/` → `/auth/naver` → 치지직 OAuth → `/auth/chzzk/callback` → `/onboarding` 또는 `/app`

### 시청자 플로우
1. `/app` (메인)
2. `/app/conversations` (대화방 목록)
3. `/app/search` (크리에이터 검색)
4. `/app/channels/[id]` (메신저)
5. `/app/profile` (프로필)

### 크리에이터 플로우
1. `/app` (메인)
2. `/app/creator/messages` (메시지 관리)
3. `/app/creator/dashboard` (대시보드)
4. `/app/creator/settings` (채널 설정)
5. `/app/profile` (프로필)

## 개발 모드

### `/dev/login`
- 더미 데이터로 테스트
- OAuth 없이 바로 로그인
- 시드 스크립트로 생성된 유저 사용

## 모든 페이지 구현 완료 ✅

Phase 1 MVP에 필요한 모든 페이지가 구현되었습니다.
