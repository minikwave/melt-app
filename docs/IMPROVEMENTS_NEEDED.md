# 수정 및 보강이 필요한 기능

## 우선순위 높음 (즉시 구현 권장)

### 1. 읽지 않은 메시지 수 표시 ⭐⭐⭐
**현재 상태**: 미구현  
**위치**: 
- 대화방 목록 (`/app/conversations`)
- 크리에이터 인박스 (`/app/creator/messages`)
- 헤더/네비게이션

**구현 필요**:
- [ ] API 엔드포인트: `GET /conversations/unread-count`
- [ ] API 엔드포인트: `GET /creator/inbox/unread-count`
- [ ] 프론트엔드: 배지 표시 컴포넌트
- [ ] 데이터베이스: 읽음 상태 추적 (이미 `message_reads` 테이블 존재)

**예상 작업 시간**: 2-3시간

### 2. 후원 완료 후 메시지 자동 등록 ⭐⭐⭐
**현재 상태**: 부분 구현 (Intent 생성만 완료)  
**위치**: `/app/channels/[id]/donate/complete`

**구현 필요**:
- [ ] 후원 완료 페이지에서 메시지 자동 등록
- [ ] Intent ID와 메시지 연결
- [ ] 후원 상태 자동 변경 (OCCURRED → CONFIRMED)
- [ ] 피드에 자동 표시

**예상 작업 시간**: 2-3시간

### 3. 프로필 설정 기능 ⭐⭐
**현재 상태**: 기본 페이지만 존재, 기능 미구현  
**위치**: `/app/profile`

**구현 필요**:
- [ ] 표시 이름 변경
- [ ] 프로필 이미지 업로드 (선택적)
- [ ] 로그아웃 기능
- [ ] API 엔드포인트: `PUT /profile`

**예상 작업 시간**: 3-4시간

## 우선순위 중간 (단기 구현)

### 4. 메시지 상태 표시 ⭐⭐
**현재 상태**: 미구현

**구현 필요**:
- [ ] 읽음/안읽음 표시
- [ ] 전송 중/전송 완료/전송 실패 상태
- [ ] 데이터베이스: `messages` 테이블에 상태 컬럼 추가

**예상 작업 시간**: 3-4시간

### 5. 크리에이터 대시보드 통계 ⭐⭐
**현재 상태**: 기본 페이지만 존재  
**위치**: `/app/creator/dashboard`

**구현 필요**:
- [ ] 실제 통계 데이터 표시
- [ ] 기간별 필터 (일/주/월)
- [ ] API 엔드포인트: `GET /creator/stats?period=day|week|month`
- [ ] 그래프/차트 라이브러리 통합 (선택적)

**예상 작업 시간**: 4-6시간

### 6. 실시간 피드 업데이트 ⭐
**현재 상태**: 5초마다 폴링 (React Query)

**개선 필요**:
- [ ] WebSocket 연결 (선택적)
- [ ] 새 메시지 알림 배지
- [ ] 자동 스크롤 개선
- [ ] 무한 스크롤 (페이지네이션)

**예상 작업 시간**: 4-6시간

## 우선순위 낮음 (장기 계획)

### 7. 메시지 모더레이션
- [ ] 메시지 신고 기능
- [ ] 유저 차단 기능
- [ ] 스팸/도배 방지 (레이트 리밋)
- [ ] 금칙어 필터링

### 8. 뱃지 시스템
- [ ] 누적 치즈 기반 뱃지 티어
- [ ] 뱃지 표시 (프로필, 메시지)
- [ ] 뱃지별 특별 혜택

### 9. 고급 통계 및 분석
- [ ] 시간대별 후원 히트맵
- [ ] Top Supporters 목록
- [ ] 후원 내역 Export (CSV)
- [ ] 성장 추이 그래프

## 데이터베이스 스키마 추가 필요

### 알림 테이블 (선택적)
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(50), -- 'message', 'donation', 'follow'
  content TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 메시지 읽음 상태 (이미 존재하지만 활용 필요)
- `message_reads` 테이블 이미 존재
- API에서 읽지 않은 메시지 수 집계 필요

## API 엔드포인트 추가 필요

### 우선순위 높음
```
GET /conversations/unread-count
GET /creator/inbox/unread-count
POST /donations/:intentId/complete
PUT /profile
```

### 우선순위 중간
```
GET /creator/stats?period=day|week|month
GET /feed?page=1&limit=20
PUT /messages/:id/read
```

## UX 개선 사항

### 로딩 상태
- [ ] 스켈레톤 UI 추가
- [ ] 로딩 스피너 개선
- [ ] 에러 상태 UI 개선

### 접근성
- [ ] 키보드 네비게이션
- [ ] 스크린 리더 지원
- [ ] 색상 대비 개선

### 모바일 최적화
- [ ] 터치 제스처 지원
- [ ] 스와이프 액션
- [ ] 모바일 키보드 대응

## 보안 강화

### 인증/인가
- [ ] 토큰 갱신 자동화
- [ ] 세션 타임아웃 처리
- [ ] CSRF 보호

### 데이터 보호
- [ ] API 레이트 리밋
- [ ] 입력 검증 강화
- [ ] SQL Injection 방지 (이미 준비됨)

## 테스트

### 단위 테스트
- [ ] 컴포넌트 테스트
- [ ] API 클라이언트 테스트
- [ ] 유틸리티 함수 테스트

### 통합 테스트
- [ ] E2E 테스트
- [ ] API 통합 테스트
- [ ] 사용자 플로우 테스트

## 구현 우선순위 요약

### Phase 1.1 (1주 내)
1. 읽지 않은 메시지 수 표시
2. 후원 완료 후 메시지 자동 등록
3. 프로필 설정 기능

### Phase 1.2 (2주 내)
4. 메시지 상태 표시
5. 크리에이터 대시보드 통계
6. 실시간 피드 업데이트 개선

### Phase 2 (1개월 내)
7. 메시지 모더레이션
8. 뱃지 시스템
9. 고급 통계 및 분석

## 참고 문서

- [프로젝트 평가](../PROJECT_EVALUATION.md)
- [추가 기능 목록](../web/ADDITIONAL_FEATURES.md)
- [구현 로드맵](../IMPLEMENTATION_ROADMAP.md)
