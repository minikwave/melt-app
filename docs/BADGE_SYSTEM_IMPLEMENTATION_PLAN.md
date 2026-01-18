# 뱃지 시스템 구현 계획

## 📋 개요

뱃지 시스템은 Phase 2의 핵심 기능으로, 후원자와 크리에이터 간의 관계를 시각화하고 강화하는 시스템입니다.

## 🎯 뱃지 시스템의 목적

1. **관계의 깊이 시각화**: 누적 후원액에 따른 티어 표시
2. **후원 동기 부여**: 뱃지 획득을 통한 성취감
3. **크리에이터 관리 도구**: VIP 식별 및 우선 관리
4. **뱃지 기반 기능**: 뱃지별 특별 혜택 제공

## 📊 데이터베이스 스키마 (이미 준비됨)

### badges 테이블
```sql
CREATE TABLE badges (
  id              UUID PRIMARY KEY,
  channel_id      UUID NOT NULL REFERENCES channels(id),
  tier            TEXT NOT NULL,  -- 'bronze', 'silver', 'gold', 'platinum'
  threshold_amount BIGINT NOT NULL,  -- 누적 후원액 임계값
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(channel_id, tier)
);
```

### user_badges 테이블
```sql
CREATE TABLE user_badges (
  id          UUID PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(id),
  channel_id  UUID NOT NULL REFERENCES channels(id),
  badge_id    UUID NOT NULL REFERENCES badges(id),
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, channel_id, badge_id)
);
```

## 🚀 구현 단계

### Phase 2.1: 뱃지 티어 설정 (2-3시간)

**목표**: 크리에이터가 채널별 뱃지 티어를 설정할 수 있도록

**구현 내용:**
1. **백엔드 API**
   - `POST /channels/:chzzkChannelId/badges` - 뱃지 티어 생성
   - `GET /channels/:chzzkChannelId/badges` - 뱃지 티어 조회
   - `PUT /channels/:chzzkChannelId/badges/:badgeId` - 뱃지 티어 수정
   - `DELETE /channels/:chzzkChannelId/badges/:badgeId` - 뱃지 티어 삭제

2. **프론트엔드 UI**
   - 크리에이터 설정 페이지에 "뱃지 관리" 섹션 추가
   - 뱃지 티어 추가/수정/삭제 UI
   - 기본 티어 템플릿 제공 (Bronze, Silver, Gold, Platinum)

3. **Mock 데이터**
   - Mock 뱃지 티어 데이터
   - 개발 모드에서 테스트 가능

**기본 티어 예시:**
- Bronze: 10,000원
- Silver: 50,000원
- Gold: 200,000원
- Platinum: 1,000,000원

**관련 파일:**
- `backend/src/routes/badges.ts` (새로 생성)
- `web/app/app/creator/settings/page.tsx` (뱃지 관리 섹션 추가)
- `web/lib/mockData.ts` (Mock 뱃지 데이터)

---

### Phase 2.2: 뱃지 자동 계산 및 부여 (3-4시간)

**목표**: 후원 확정 시 자동으로 뱃지 계산 및 부여

**구현 내용:**
1. **뱃지 계산 로직**
   - 후원 확정(CONFIRMED) 시 해당 채널의 누적 후원액 계산
   - SQL: `SELECT SUM(amount) FROM donation_events WHERE viewer_user_id = ? AND channel_id = ? AND status = 'CONFIRMED'`
   - 뱃지 티어 임계값과 비교하여 자동 부여

2. **백엔드 API**
   - `GET /users/:userId/badges?channelId=xxx` - 유저의 뱃지 조회
   - `POST /badges/check` - 후원 확정 시 뱃지 체크 (내부 API)
   - 후원 확정 엔드포인트에서 자동 호출

3. **뱃지 부여 로직**
   - 누적 후원액이 티어 임계값 도달 시 `user_badges`에 추가
   - 이미 보유한 뱃지는 중복 부여하지 않음
   - 강등 없음 (기본 정책)

**구현 위치:**
- `backend/src/routes/donations.ts` - 후원 확정 시 뱃지 체크
- `backend/src/utils/badgeCalculator.ts` (새로 생성) - 뱃지 계산 로직

---

### Phase 2.3: 뱃지 표시 (2-3시간)

**목표**: 프로필 및 메시지에 뱃지 아이콘 표시

**구현 내용:**
1. **Badge 컴포넌트 생성**
   - 티어별 색상 및 아이콘
   - 크기 변형 가능 (small, medium, large)
   - 툴팁으로 뱃지 정보 표시

2. **뱃지 표시 위치**
   - 프로필 페이지
   - 메시지 작성자 옆
   - 크리에이터 인박스 (DM 목록)
   - Top Supporters 목록

3. **뱃지 디자인**
   - Bronze: 갈색/구리색
   - Silver: 은색/회색
   - Gold: 금색/노란색
   - Platinum: 백금색/하얀색

**관련 파일:**
- `web/components/Badge.tsx` (새로 생성)
- `web/components/Messenger.tsx` (뱃지 표시 추가)
- `web/app/app/profile/page.tsx` (뱃지 표시 추가)

---

### Phase 2.4: 뱃지 기반 기능 (1-2시간)

**목표**: 뱃지를 활용한 추가 기능 제공

**구현 내용:**
1. **인박스 뱃지별 정렬**
   - 크리에이터 인박스에서 뱃지 티어 순으로 정렬
   - 높은 티어 우선 표시

2. **VIP 리스트**
   - Platinum 이상 뱃지 보유자 목록
   - 크리에이터 대시보드에 표시

3. **뱃지별 특별 혜택** (선택적)
   - DM 우선 노출
   - RT 후보 가중치
   - 전용 콘텐츠 접근 (향후)

**관련 파일:**
- `backend/src/routes/creator.ts` (인박스 정렬 로직 추가)
- `web/app/app/creator/messages/page.tsx` (뱃지별 정렬 UI)

---

## 📝 구현 순서 요약

1. **뱃지 티어 설정** (2-3시간)
   - 크리에이터가 뱃지 티어 관리
   - 기본 티어 템플릿 제공

2. **뱃지 자동 계산 및 부여** (3-4시간)
   - 후원 확정 시 자동 뱃지 체크
   - 누적 후원액 계산 및 티어 부여

3. **뱃지 표시** (2-3시간)
   - Badge 컴포넌트 생성
   - 프로필 및 메시지에 표시

4. **뱃지 기반 기능** (1-2시간)
   - 인박스 정렬
   - VIP 리스트

**총 예상 시간: 8-12시간**

---

## 🧪 테스트 시나리오

### 개발 모드 테스트
1. 크리에이터로 로그인
2. 뱃지 티어 설정 (Bronze: 10,000원)
3. 시청자로 로그인
4. 후원 시뮬레이션 (Mock 데이터)
5. 뱃지 부여 확인
6. 프로필 및 메시지에 뱃지 표시 확인

### 실제 환경 테스트
1. 실제 후원 확정
2. 뱃지 자동 부여 확인
3. 뱃지 표시 확인

---

## 🔗 관련 문서

- [구현 로드맵 상세](IMPLEMENTATION_ROADMAP_DETAILED.md)
- [프로젝트 분석](PROJECT_ANALYSIS_AND_TODOS.md)
- [데이터베이스 스키마](../backend/db/schema.sql)
