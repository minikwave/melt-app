# 치지직 도네이션 통합 가이드

> `kimcore/chzzk` 라이브러리를 활용한 실시간 도네이션 수신

## 참고 자료

- [awesome-chzzk](https://github.com/dokdo2013/awesome-chzzk) - 치지직 관련 라이브러리/도구 모음
- [kimcore/chzzk](https://github.com/kimcore/chzzk) - Node.js용 비공식 API 라이브러리 (MIT 라이선스)
- [치지직 Open API 문서](https://chzzk.gitbook.io/chzzk)

## 핵심 원칙

**사용자 입력 금액을 절대 신뢰하지 않습니다.**

치지직 채팅창에 도네이션 메시지가 나타나면, 해당 정보(닉네임, 금액, 메시지)를 `kimcore/chzzk` 라이브러리를 통해 직접 받아와 DB에 저장합니다.

## 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│  치지직 (Chzzk)                                                  │
│  • 시청자가 치즈 후원                                             │
│  • 채팅창에 도네이션 메시지 표시                                   │
│  • WebSocket으로 이벤트 전송                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ WebSocket (실시간)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Melt 백엔드                                                     │
│  • 크리에이터별 WebSocket 세션 유지                               │
│  • 도네이션 이벤트 수신                                           │
│  • DB에 **치지직 기준 금액/메시지** 저장                          │
│  • 사용자 입력은 참고용으로만 (또는 무시)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Melt DB                                                        │
│  donation_events:                                               │
│    • amount = 치지직 payAmount                                  │
│    • chzzk_donation_text = 치지직 donationText                  │
│    • chzzk_donator_nickname = 치지직 donatorNickname            │
│    • chzzk_raw_data = 원본 JSON                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 치지직 Open API

### 1. 인증 및 앱 등록

크리에이터가 치지직 개발자 센터에서 앱을 등록해야 합니다:
- https://developers.chzzk.naver.com/
- `Client ID`, `Client Secret` 발급

### 2. 세션 생성 API

```
GET https://openapi.chzzk.naver.com/open/v1/sessions/auth/client
Headers:
  Client-Id: {CLIENT_ID}
  Client-Secret: {CLIENT_SECRET}

Response:
{
  "url": "wss://..."  // WebSocket 연결 URL
}
```

### 3. 도네이션 이벤트 구독

```
POST https://openapi.chzzk.naver.com/open/v1/sessions/events/subscribe/donation
Headers:
  Client-Id: {CLIENT_ID}
  Client-Secret: {CLIENT_SECRET}
Body:
{
  "sessionKey": "{SESSION_KEY}",
  "channelId": "{CHANNEL_ID}"
}
```

### 4. 도네이션 이벤트 메시지

```json
{
  "type": "donation",
  "data": {
    "donationType": "CHAT",
    "channelId": "스트리머 채널 ID",
    "donatorChannelId": "후원자 채널 ID",
    "donatorNickname": "닉네임",
    "payAmount": "1000",
    "donationText": "후원 메시지",
    "emojis": {}
  }
}
```

## Melt 구현

### 크리에이터 설정

1. 크리에이터가 Melt 채널 설정에서 치지직 API 자격 증명 입력
2. Melt 백엔드가 WebSocket 세션 생성 및 도네이션 구독
3. 실시간으로 후원 이벤트 수신 시작

### 도네이션 처리 플로우

```
1. 치지직에서 도네이션 이벤트 수신
   ↓
2. chzzk_donation_id로 중복 체크
   ↓
3. 후원자 매칭 (chzzk_donator_channel_id → users.chzzk_user_id)
   ↓
4. donation_events 생성 (치지직 데이터 기준)
   ↓
5. messages 생성 (치지직 donationText 기준)
   ↓
6. 뱃지 자동 부여 (누적 금액 계산)
```

### DB 스키마 변경

```sql
-- channels 테이블
ALTER TABLE channels ADD COLUMN chzzk_client_id TEXT;
ALTER TABLE channels ADD COLUMN chzzk_client_secret TEXT;
ALTER TABLE channels ADD COLUMN chzzk_session_active BOOLEAN DEFAULT FALSE;

-- donation_events 테이블
ALTER TABLE donation_events ADD COLUMN chzzk_donation_id TEXT UNIQUE;
ALTER TABLE donation_events ADD COLUMN chzzk_donator_channel_id TEXT;
ALTER TABLE donation_events ADD COLUMN chzzk_donator_nickname TEXT;
ALTER TABLE donation_events ADD COLUMN chzzk_donation_text TEXT;
ALTER TABLE donation_events ADD COLUMN chzzk_raw_data JSONB;
```

## UX 변경

### Before (사용자가 금액 입력)
```
[Melt 후원 페이지]
1. 금액 선택: 5,000원
2. 메시지 입력
3. 치지직으로 이동
4. 치지직에서 후원
5. Melt 완료 페이지에서 금액 확인 입력 ← 조작 가능!
```

### After (치지직 API 연동)
```
[Melt]
1. 메시지 입력 (선택)
2. 치지직으로 이동
3. 치지직에서 후원 (금액, 메시지 입력)
   ↓
[치지직 → Melt 백엔드]
4. 도네이션 이벤트 자동 수신
5. DB에 실제 금액/메시지 저장
6. 피드에 자동 표시
```

## 보안 고려사항

1. **Client Secret 암호화**: DB에 평문 저장 금지, 환경 변수 또는 암호화 저장
2. **WebSocket 세션 관리**: 연결 끊김 시 자동 재연결
3. **중복 처리**: `chzzk_donation_id`로 중복 이벤트 방지
4. **권한 검증**: 크리에이터만 자신의 채널 API 자격 증명 수정 가능

## 구현 파일

### 백엔드

- `backend/src/services/chzzkSession.ts` - 치지직 세션 매니저 (핵심)
- `backend/src/routes/channels.ts` - API 자격 증명 저장/세션 관리 엔드포인트
- `backend/db/migrations/005_add_chzzk_api_credentials.sql` - DB 스키마 변경

### 프론트엔드

- `web/app/app/creator/settings/page.tsx` - 크리에이터 설정 페이지 (쿠키 입력 UI)
- `web/app/app/channels/[chzzkChannelId]/donate/page.tsx` - 후원 페이지 (연동 상태에 따른 UX)

## 사용된 라이브러리

```bash
npm install chzzk  # kimcore/chzzk
```

### 주요 기능

- 로그인 (브라우저 쿠키 `NID_AUT`, `NID_SES` 사용)
- 채팅/후원/구독 이벤트 실시간 수신
- 채널 정보 조회

### 예제 코드

```typescript
import { ChzzkClient } from 'chzzk';

const client = new ChzzkClient({
  nidAuth: 'NID_AUT 쿠키 값',
  nidSession: 'NID_SES 쿠키 값'
});

const chat = client.chat({
  channelId: '채널 ID',
  pollInterval: 30 * 1000
});

// 후원 이벤트 수신
chat.on('donation', (donation) => {
  console.log(`${donation.profile?.nickname}님이 ${donation.extras.payAmount}원 후원!`);
  console.log(`메시지: ${donation.message}`);
});

await chat.connect();
```

## API 엔드포인트

### 치지직 API 자격 증명 저장

```
PUT /channels/:chzzkChannelId/api-credentials
Body: { nidAuth: string, nidSession: string }
Response: { ok: true, sessionActive: boolean }
```

### 세션 상태 확인

```
GET /channels/:chzzkChannelId/session-status
Response: { hasCredentials: boolean, sessionActive: boolean, connectedAt: string }
```

### 세션 재시작

```
POST /channels/:chzzkChannelId/restart-session
Response: { ok: true }
```
