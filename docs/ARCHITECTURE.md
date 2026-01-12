# Melt 아키텍처 문서

## 전체 구조

```
┌─────────────────┐
│   Melt Web      │  Next.js 14 (모바일 최적화)
│   (Frontend)    │  - 모바일 UI 고정
│                 │  - 데스크톱 양옆 마스킹
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐
│  Melt Backend   │  Node.js + Express
│   (API Server)  │  - OAuth 처리
│                 │  - 메시지/피드/DM/RT
│                 │  - 후원 데이터 관리
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│PostgreSQL│ │CHZZK API│
│  (DB)   │ │ (OAuth) │
└────────┘ └────────┘
```

## 데이터 흐름

### 1. 로그인 플로우
```
User → Melt Web → Backend → CHZZK OAuth → Backend → DB → Melt Web
```

### 2. 후원 플로우
```
User → [치즈 보내기] → Intent 생성 → CHZZK UI → 후원 완료 → 
Melt로 복귀 → 메시지 등록 (OCCURRED) → Creator 확인 → CONFIRMED
```

### 3. 메시지 플로우
```
Viewer → DM 작성 → DB 저장 (private) → Creator 인박스 → 
Creator 답장/RT → Feed 노출 (public)
```

## 핵심 설계 원칙

1. **치지직 채팅과 완전 분리**: Melt 메시지는 치지직 채팅에 남지 않음
2. **치즈 결제는 치지직 공식 UI**: API로 직접 결제 실행하지 않음
3. **후원 상태 모델**: PENDING → OCCURRED → CONFIRMED
4. **모바일 우선**: 웹에서도 모바일 UI 유지

## API 엔드포인트

### Auth
- `GET /auth/chzzk/login` - 치지직 OAuth 로그인 시작
- `GET /auth/chzzk/callback` - OAuth 콜백
- `GET /auth/me` - 현재 유저 정보
- `POST /auth/logout` - 로그아웃

### Channels
- `GET /channels/:chzzkChannelId` - 채널 정보 조회

### Donations
- `POST /donations/intent` - 후원 Intent 생성
- `POST /donations/occurred` - 후원 발생 등록
- `POST /donations/:id/confirm` - 후원 확정 (Creator only)
- `GET /donations` - 후원 목록 조회

### Messages
- `POST /messages/dm` - DM 생성
- `POST /messages/:id/reply` - 답장
- `POST /messages/:id/retweet` - RT (Creator only)

### Feed
- `GET /feed` - 공개 피드 조회

### Creator
- `GET /creator/inbox` - Creator 인박스
- `GET /creator/stats/summary` - 통계 요약

## 데이터베이스 스키마

### 핵심 테이블
- `users` - 유저 정보
- `channels` - 채널 정보
- `oauth_tokens` - OAuth 토큰 저장
- `donation_intents` - 후원 Intent
- `donation_events` - 후원 이벤트 (원장)
- `messages` - 메시지
- `retweets` - RT 기록

### 상태 관리
- `donation_status`: PENDING, OCCURRED, CONFIRMED
- `message_type`: donation, dm, creator_post, creator_reply
- `visibility`: public, private

## 보안

1. **OAuth 토큰**: 서버에 암호화 저장 (운영 환경)
2. **JWT 세션**: httpOnly 쿠키로 전달
3. **CSRF 방지**: OAuth state 검증
4. **권한 검증**: Creator only 엔드포인트 보호

## 확장 계획

### Phase 1 (MVP)
- ✅ 기본 메시징
- ✅ 후원 Intent/Event
- ✅ Creator 인박스

### Phase 2
- 뱃지 시스템
- 통계 대시보드
- 뱃지별 콘텐츠

### Phase 3
- 선정산 서비스
- 고급 통계
- API 파트너십
