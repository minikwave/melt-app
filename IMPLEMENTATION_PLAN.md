# Melt 기능 구현 계획

## 구현 순서 및 상세 계획

### 🔴 Phase 1.1 - 즉시 구현 (우선순위 높음)

#### 1. 읽지 않은 메시지 수 표시
**예상 시간: 2-3시간**

**구현 내용:**
- API 엔드포인트: `GET /conversations/unread-count`
- API 엔드포인트: `GET /creator/inbox/unread-count`
- 대화방 목록에 읽지 않은 메시지 수 배지 표시
- 크리에이터 인박스 헤더에 읽지 않은 DM 수 표시
- Mock 데이터로 테스트 가능

**Mock 데이터:**
```typescript
'/conversations/unread-count': { data: { unreadCount: 5 } }
'/creator/inbox/unread-count': { data: { unreadCount: 3 } }
```

**파일 수정:**
- `web/lib/mockData.ts` - Mock 응답 추가
- `web/lib/api.ts` - API 라우팅 추가
- `web/app/app/conversations/page.tsx` - 배지 표시 추가
- `web/app/app/creator/messages/page.tsx` - 배지 표시 추가

---

#### 2. 후원 완료 후 메시지 자동 등록
**예상 시간: 3-4시간**

**구현 내용:**
- API 엔드포인트: `POST /donations/{intentId}/complete`
- 후원 완료 페이지에서 Intent ID로 메시지 등록
- 후원 상태를 OCCURRED로 변경
- 피드에 자동 표시
- Mock 데이터로 테스트 가능

**Mock 데이터:**
```typescript
'/donations/:intentId/complete': (intentId: string, message: string) => {
  // 후원 완료 처리 및 메시지 등록
}
```

**파일 수정:**
- `web/lib/mockData.ts` - Mock 응답 추가
- `web/lib/api.ts` - API 라우팅 추가
- `web/app/app/channels/[chzzkChannelId]/donate/complete/page.tsx` - 메시지 등록 로직 추가

---

#### 3. 프로필 설정 기능
**예상 시간: 2-3시간**

**구현 내용:**
- API 엔드포인트: `PUT /profile`
- API 엔드포인트: `POST /auth/logout`
- 이름 변경 기능
- 로그아웃 기능
- Mock 데이터로 테스트 가능

**Mock 데이터:**
```typescript
'/profile': { data: { success: true } }
'/auth/logout': { data: { success: true } }
```

**파일 수정:**
- `web/lib/mockData.ts` - Mock 응답 추가
- `web/lib/api.ts` - API 라우팅 추가
- `web/app/app/profile/page.tsx` - 프로필 설정 UI 및 기능 구현

---

### 🟡 Phase 1.2 - 단기 구현 (우선순위 중간)

#### 4. 메시지 상태 표시
**예상 시간: 2-3시간**

**구현 내용:**
- 메시지 읽음/안읽음 표시
- 전송 중/전송 완료/전송 실패 상태
- Mock 데이터로 테스트 가능

**파일 수정:**
- `web/components/Messenger.tsx` - 상태 표시 추가
- `web/lib/mockData.ts` - Mock 메시지에 상태 추가

---

#### 5. 크리에이터 대시보드 통계
**예상 시간: 4-5시간**

**구현 내용:**
- API 엔드포인트: `GET /creator/stats?period=day|week|month`
- 기본 통계 표시 (총 후원액, 후원 건수)
- 기간별 필터
- Mock 데이터로 테스트 가능

**Mock 데이터:**
```typescript
'/creator/stats': (period: string) => {
  // 기간별 통계 데이터
}
```

**파일 수정:**
- `web/lib/mockData.ts` - Mock 통계 데이터 추가
- `web/lib/api.ts` - API 라우팅 추가
- `web/app/app/creator/dashboard/page.tsx` - 통계 UI 구현

---

#### 6. 실시간 피드 업데이트 개선
**예상 시간: 2-3시간**

**구현 내용:**
- 새 메시지 자동 스크롤 개선
- 새 메시지 알림 배지
- Mock 데이터로 테스트 가능

**파일 수정:**
- `web/components/Messenger.tsx` - 업데이트 로직 개선

---

## 구현 시작

이제 Phase 1.1의 첫 번째 기능부터 순차적으로 구현하겠습니다.
