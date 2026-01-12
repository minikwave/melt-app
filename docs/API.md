# Melt API 문서

## Base URL
```
http://localhost:3001 (개발)
https://api.melt.gg (운영)
```

## 인증

대부분의 API는 인증이 필요합니다. 인증은 쿠키(`melt_session`) 또는 Authorization 헤더로 전달됩니다.

```http
Authorization: Bearer <token>
```

## 엔드포인트

### Auth

#### GET /auth/chzzk/login
치지직 OAuth 로그인 시작

**Response**: 302 Redirect to CHZZK OAuth

---

#### GET /auth/chzzk/callback
OAuth 콜백 처리

**Query Parameters**:
- `code`: Authorization code
- `state`: CSRF state

**Response**: 302 Redirect to frontend

---

#### GET /auth/me
현재 로그인한 유저 정보

**Headers**: Authorization required

**Response**:
```json
{
  "user": {
    "id": "uuid",
    "chzzk_user_id": "string",
    "display_name": "string",
    "role": "viewer" | "creator" | "admin"
  }
}
```

---

#### POST /auth/logout
로그아웃

**Response**:
```json
{
  "ok": true
}
```

---

### Channels

#### GET /channels/:chzzkChannelId
채널 정보 조회

**Response**:
```json
{
  "channel": {
    "id": "uuid",
    "chzzk_channel_id": "string",
    "name": "string",
    "owner_user_id": "uuid",
    "channel_url": "string",
    "donate_url": "string",
    "charge_url": "string"
  }
}
```

---

#### POST /channels/:chzzkChannelId/follow
채널 팔로우

**Headers**: Authorization required

**Response**:
```json
{
  "ok": true,
  "message": "Followed successfully"
}
```

---

#### DELETE /channels/:chzzkChannelId/follow
채널 언팔로우

**Headers**: Authorization required

**Response**:
```json
{
  "ok": true,
  "message": "Unfollowed successfully"
}
```

---

#### GET /channels/:chzzkChannelId/follow-status
팔로우 상태 확인

**Headers**: Authorization required

**Response**:
```json
{
  "isFollowing": true
}
```

---

#### PUT /channels/:chzzkChannelId/settings
채널 설정 업데이트 (Creator only)

**Headers**: Authorization required (Creator)

**Body**:
```json
{
  "channelUrl": "string (optional)",
  "donateUrl": "string (optional)",
  "chargeUrl": "string (optional)"
}
```

**Response**:
```json
{
  "channel": {
    "id": "uuid",
    "chzzk_channel_id": "string",
    "channel_url": "string",
    "donate_url": "string",
    "charge_url": "string"
  }
}
```

---

### Onboarding

#### POST /onboarding/role
역할 선택 (온보딩)

**Headers**: Authorization required

**Body**:
```json
{
  "role": "viewer" | "creator"
}
```

**Response**:
```json
{
  "user": {
    "id": "uuid",
    "chzzk_user_id": "string",
    "display_name": "string",
    "role": "viewer" | "creator"
  }
}
```

---

#### GET /onboarding/status
온보딩 상태 확인

**Headers**: Authorization required

**Response**:
```json
{
  "role": "viewer" | "creator",
  "needsOnboarding": true,
  "needsCreatorSetup": true,
  "onboardingComplete": false
}
```

---

### Search

#### GET /search/creators
크리에이터 검색

**Query Parameters**:
- `q`: string (required) - 검색어
- `limit`: number (optional, default: 20)

**Response**:
```json
{
  "creators": [
    {
      "id": "uuid",
      "chzzk_channel_id": "string",
      "name": "string",
      "channel_url": "string",
      "owner_name": "string",
      "follower_count": 0
    }
  ]
}
```

---

#### GET /search/followed
팔로우한 크리에이터 목록

**Headers**: Authorization required

**Response**:
```json
{
  "channels": [
    {
      "id": "uuid",
      "chzzk_channel_id": "string",
      "name": "string",
      "channel_url": "string",
      "owner_name": "string",
      "followed_at": "2024-01-01T00:00:00Z",
      "unread_count": 5
    }
  ]
}
```

---

### Conversations

#### GET /conversations
대화방 목록 (팔로우한 채널별 최신 메시지 요약)

**Headers**: Authorization required

**Response**:
```json
{
  "conversations": [
    {
      "id": "uuid",
      "chzzk_channel_id": "string",
      "name": "string",
      "channel_url": "string",
      "owner_name": "string",
      "last_message": "string",
      "last_message_at": "2024-01-01T00:00:00Z",
      "unread_count": 3,
      "followed_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### POST /conversations/:chzzkChannelId/read
메시지 읽음 처리

**Headers**: Authorization required

**Response**:
```json
{
  "ok": true
}
```

---

### Donations

#### POST /donations/intent
후원 Intent 생성 (치즈 보내기 버튼 클릭 시)

**Headers**: Authorization required

**Body**:
```json
{
  "chzzkChannelId": "string"
}
```

**Response**:
```json
{
  "intentId": "uuid",
  "chzzkChannelId": "string"
}
```

---

#### POST /donations/occurred
후원 발생 등록 (OCCURRED)

**Headers**: Authorization required

**Body**:
```json
{
  "intentId": "uuid",
  "message": "string",
  "amount": 10000 // optional
}
```

**Response**:
```json
{
  "ok": true,
  "donationEventId": "uuid"
}
```

---

#### POST /donations/:donationEventId/confirm
후원 확정 (CONFIRMED) - Creator only

**Headers**: Authorization required (Creator)

**Body**:
```json
{
  "amount": 10000
}
```

**Response**:
```json
{
  "ok": true,
  "donation": {
    "id": "uuid",
    "status": "CONFIRMED",
    "amount": 10000,
    "confirmed_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### GET /donations
후원 목록 조회

**Headers**: Authorization required

**Query Parameters**:
- `chzzkChannelId`: string (optional)
- `status`: PENDING | OCCURRED | CONFIRMED (optional)

**Response**:
```json
{
  "donations": [
    {
      "id": "uuid",
      "amount": 10000,
      "status": "CONFIRMED",
      "occurred_at": "2024-01-01T00:00:00Z",
      "display_name": "string",
      "chzzk_user_id": "string"
    }
  ]
}
```

---

### Messages

#### POST /messages/dm
DM 생성 (Viewer → Creator)

**Headers**: Authorization required

**Body**:
```json
{
  "chzzkChannelId": "string",
  "content": "string"
}
```

**Response**:
```json
{
  "message": {
    "id": "uuid",
    "type": "dm",
    "visibility": "private",
    "content": "string",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### POST /messages/:messageId/reply
답장 (Creator → Viewer)

**Headers**: Authorization required (Creator)

**Body**:
```json
{
  "content": "string",
  "visibility": "private" | "public"
}
```

**Response**:
```json
{
  "message": {
    "id": "uuid",
    "type": "creator_reply",
    "visibility": "private",
    "content": "string"
  }
}
```

---

#### POST /messages/:messageId/retweet
RT (DM을 공개로 전환) - Creator only

**Headers**: Authorization required (Creator)

**Response**:
```json
{
  "retweet": {
    "id": "uuid",
    "message_id": "uuid",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### Feed

#### GET /feed
공개 피드 조회

**Query Parameters**:
- `chzzkChannelId`: string (required)
- `cursor`: string (optional, for pagination)

**Response**:
```json
{
  "feed": [
    {
      "id": "uuid",
      "type": "donation" | "creator_post" | "creator_reply",
      "content": "string",
      "author": {
        "chzzkUserId": "string",
        "displayName": "string"
      },
      "donationAmount": 10000,
      "donationStatus": "CONFIRMED",
      "isRetweet": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "nextCursor": "2024-01-01T00:00:00Z" | null
}
```

---

### Creator

#### GET /creator/inbox
Creator 인박스 (DM + 미확정 후원)

**Headers**: Authorization required (Creator)

**Query Parameters**:
- `chzzkChannelId`: string (required)

**Response**:
```json
{
  "dms": [
    {
      "id": "uuid",
      "content": "string",
      "display_name": "string",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pendingDonations": [
    {
      "id": "uuid",
      "amount": null,
      "status": "OCCURRED",
      "display_name": "string",
      "message_content": "string"
    }
  ]
}
```

---

#### GET /creator/stats/summary
통계 요약

**Headers**: Authorization required (Creator)

**Query Parameters**:
- `chzzkChannelId`: string (required)
- `range`: "7d" | "30d" | "90d" (default: "30d")

**Response**:
```json
{
  "total": 100,
  "confirmed": 80,
  "pending": 20,
  "totalAmount": 1000000,
  "period": "30d"
}
```

---

## 에러 응답

모든 에러는 다음 형식을 따릅니다:

```json
{
  "error": "Error message"
}
```

**HTTP Status Codes**:
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error
