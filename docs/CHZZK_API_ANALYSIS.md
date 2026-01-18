# 치지직 치즈 후원 API 분석 결과

> 2026년 1월 18일 분석 완료

## 1. 확인된 API 엔드포인트

### 후원 팝업 열 때 (사전 조회 API)

| 순서 | 메서드 | 엔드포인트 | 설명 |
|-----|-------|-----------|------|
| 1 | POST | `https://api.chzzk.naver.com/service/live-status` | 라이브 상태 확인 |
| 2 | GET | `https://api.chzzk.naver.com/commercial/v1/donation/tts/benefit?channelId={channelId}` | TTS 혜택 정보 |
| 3 | GET | `https://api.chzzk.naver.com/commercial/v1/coin/balance` | 치즈 잔액 조회 |
| 4 | GET | `https://api.chzzk.naver.com/service/v1/channels/{channelId}/tts` | TTS 설정 |

### 실제 후원 전송 API (핵심)

```
POST https://api.chzzk.naver.com/commercial/v1/donate
```

#### 요청 헤더
```
Content-Type: application/json
Referer: https://chzzk.naver.com/live/{channelId}
Cookie: (치지직 로그인 세션)
```

#### 요청 본문 (Request Payload)
```json
{
  "channelId": "54a0fcbd1d146bcce1219d5a1d165557",
  "nickname": "후원자닉네임",
  "liveId": 16783517,
  "donationType": "CHAT",
  "donationSubType": null,
  "payType": "CURRENCY",
  "productId": null,
  "payAmount": 1000,
  "donationText": "후원 메시지 내용",
  "videoDescription": null,
  "donationImageUrl": "",
  "donationVideoUrl": "",
  "useSpeech": true,
  "extras": {
    "chatType": "STREAMING",
    "osType": "PC",
    "streamingChannelId": "54a0fcbd1d146bcce1219d5a1d165557",
    "emojis": {}
  },
  "emojis": null,
  "createdBadge": null,
  "largeDonationEnvelopeAnimationCode": null,
  "donationCampaignId": null,
  "nvoiceSpeakerType": null
}
```

#### 응답 (Response)
```json
{
  "code": 200,
  "message": null,
  "content": {
    "channelId": "54a0fcbd1d146bcce1219d5a1d165557",
    "nickname": "후원자닉네임",
    "liveId": 16783517,
    "donationType": "CHAT",
    "payType": "CURRENCY",
    "payAmount": 1000,
    "donationText": "후원 메시지 내용",
    "useSpeech": true,
    ...
  }
}
```

### 후원 완료 후 (후속 조회 API)

| 메서드 | 엔드포인트 | 설명 |
|-------|-----------|------|
| GET | `https://comm-api.game.naver.com/nng_main/v1/notification/new` | 새 알림 확인 |
| GET | `https://comm-api.game.naver.com/nng_main/v1/dm?limit=1` | DM 확인 |

## 2. 주요 파라미터 설명

### donationType
- `CHAT`: 일반 채팅 후원 (텍스트 메시지)
- 기타: 영상/이미지 후원 등

### payType
- `CURRENCY`: 치즈 (기본)
- 기타: 다른 결제 수단

### payAmount
- 최소: 1,000원
- 단위: 원 (KRW)

### useSpeech
- `true`: TTS 읽기 활성화
- `false`: TTS 비활성화

### liveId
- 현재 진행 중인 라이브의 고유 ID
- **라이브 중일 때만 후원 가능**

## 3. TTS 정보

### benefit API 응답
```json
{
  "code": 200,
  "message": null,
  "content": {
    "ttsBenefitAvailable": false,
    "ttsBenefitMaxCount": 0,
    "ttsBenefitRemainCount": 0,
    "ttsBenefitAmount": 200
  }
}
```

### 기본 설정
- 기본 TTS: 유나 (기본형)
- `useSpeech: true`로 활성화

## 4. 치즈 잔액 조회

### balance API 응답
```json
{
  "code": 200,
  "message": null,
  "content": {
    "coinBalance": 40450,
    "coinCurrency": "NGSCASH"
  }
}
```

## 5. Melt 적용 방안

### 현재 제약사항

1. **CORS 제한**: `Access-Control-Allow-Origin: https://chzzk.naver.com` 
   - Melt 도메인에서 치지직 API 직접 호출 불가
2. **인증 문제**: 사용자의 치지직 세션 쿠키를 Melt에서 사용 불가
3. **라이브 필수 아님**: 라이브 중이 아니어도 후원 가능 확인됨 ✅

### 구현된 플로우 (UX 최적화)

```
[Melt]                           [치지직]
   │                                │
   │ 1. 금액 선택 (1천~5만원)        │
   │ 2. 메시지 작성                  │
   │ 3. Intent 생성 (금액 포함)      │
   │ 4. localStorage 저장           │
   │ 5. 클립보드에 메시지 복사       │
   │                                │
   │ ──── 새 탭으로 치지직 열기 ───▶ │
   │                                │
   │                    6. 후원창 열기│
   │                    7. 메시지 붙여넣기 (Ctrl+V)
   │                    8. 후원 전송 │
   │                                │
   │ ◀──── "후원 완료했어요" 클릭 ── │
   │       (또는 탭 전환 자동 감지)  │
   │                                │
   │ 9. 완료 페이지 (금액 표시)      │
   │ 10. 메시지 공개하기             │
   │                                │
```

### 주요 개선 사항

1. **금액 선택 UI**: 1천~5만원 프리셋 + 직접 입력
2. **클립보드 자동 복사**: 치지직에서 붙여넣기만 하면 됨
3. **새 탭 방식**: 사용자가 Melt 탭을 유지한 채 치지직 이용
4. **탭 전환 감지**: `visibilitychange` 이벤트로 자동 완료 처리
5. **금액 저장**: Intent에 금액 저장, 피드에 금액 표시

## 6. 관련 파일

- `web/app/app/channels/[chzzkChannelId]/donate/page.tsx`
- `web/app/app/channels/[chzzkChannelId]/donate/complete/page.tsx`
- `web/components/DonateButton.tsx`
- `backend/src/routes/donations.ts`

## 7. 추가 확인 필요 사항

- [ ] 라이브 종료 후 VOD에서 후원 가능 여부
- [ ] 모바일 앱 딥링크 존재 여부
- [ ] 후원 완료 콜백/웹훅 존재 여부
