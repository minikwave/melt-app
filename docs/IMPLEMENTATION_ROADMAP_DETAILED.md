# Melt 구현 로드맵 (상세)

## 📋 프로젝트 현황

### 배포 환경
- **프론트엔드**: Vercel
- **백엔드**: Railway
- **데이터베이스**: Supabase (PostgreSQL)
- **Git 저장소**: 
  - `https://github.com/ziptalk/melt-app.git`
  - `https://github.com/minikwave/melt-app.git`
  - 두 저장소에 동시 푸시 설정됨 (`git push origin main`)

### 현재 완료 상태
- ✅ Phase 0 (MVP) - 완료
- ✅ Phase 1.1 - 완료
- ✅ 개발자 모드 개선 - 완료
- ✅ 홈 페이지 개선 - 완료
- ✅ 둘러보기 페이지 - 완료

---

## 🎯 구현 우선순위 및 순서

### Phase 1.2 - 즉시 구현 (1-2주)

#### 1. 치지직 치즈 후원 딥링크 분석 및 연결 ⚠️ 중요
**우선순위: 최우선**  
**예상 시간: 4-6시간**

**현재 상태:**
- 후원 딥링크 분석 부족
- 현재는 채널 페이지로만 이동
- 사용자가 수동으로 치즈 버튼 클릭 필요

**구현 계획:**
1. **딥링크 조사** (2-3시간)
   - 치지직 개발자 포털 문서 확인
   - 실제 채널 페이지에서 개발자 도구로 링크 추출
   - 커뮤니티/오픈소스 프로젝트 확인
   - 예상 형식:
     - 웹: `https://chzzk.naver.com/live/{channelId}/donate`
     - 앱: `chzzk://donate?channelId={channelId}`

2. **딥링크 적용** (1-2시간)
   - 크리에이터 설정에서 딥링크 등록 기능 (이미 구현됨)
   - `DonateButton` 컴포넌트에서 딥링크 우선 사용
   - 딥링크가 없으면 채널 페이지로 폴백

3. **테스트 및 검증** (1시간)
   - 실제 채널에서 딥링크 테스트
   - 다양한 환경에서 동작 확인

**관련 파일:**
- `web/components/DonateButton.tsx`
- `web/app/app/channels/[chzzkChannelId]/donate/page.tsx`
- `backend/src/routes/channels.ts` (이미 구현됨)

---

#### 2. 후원 완료 후 자동 복귀 플로우 개선
**우선순위: 높음**  
**예상 시간: 3-4시간**

**현재 상태:**
- Intent 생성 후 치지직으로 이동
- 사용자가 수동으로 Melt로 복귀
- localStorage에 `melt_intent_id` 저장

**구현 계획:**
1. **복귀 감지 로직** (2시간)
   - 브라우저 뒤로가기 감지
   - 또는 명시적 복귀 버튼 (치지직 페이지에 추가 불가하므로 제외)
   - `window.addEventListener('focus')`로 탭 복귀 감지
   - `localStorage`에 저장된 Intent ID 확인

2. **자동 메시지 등록 페이지 이동** (1시간)
   - 복귀 감지 시 `/app/channels/{channelId}/donate/complete`로 자동 이동
   - Intent ID가 없으면 채널 페이지로 이동

3. **UX 개선** (1시간)
   - 복귀 안내 메시지
   - 자동 이동 전 확인 (선택적)

**관련 파일:**
- `web/app/app/channels/[chzzkChannelId]/page.tsx`
- `web/app/app/channels/[chzzkChannelId]/donate/complete/page.tsx`

---

#### 3. 에러 핸들링 및 사용자 피드백 개선
**우선순위: 높음**  
**예상 시간: 3-4시간**

**구현 계획:**
1. **로딩 상태 개선** (1-2시간)
   - 스켈레톤 UI 추가
   - 진행률 표시
   - 버튼 비활성화 상태 명확화

2. **에러 메시지 개선** (1-2시간)
   - 명확한 에러 메시지
   - 재시도 옵션 제공
   - 도움말 링크

**관련 파일:**
- 모든 페이지 컴포넌트
- `web/lib/api.ts`

---

### Phase 1.3 - 단기 구현 (2-3주)

#### 4. 메시지 상태 표시
**우선순위: 중간**  
**예상 시간: 3-4시간**

**구현 계획:**
1. **데이터베이스 활용** (이미 `message_reads` 테이블 존재)
   - 읽음/안읽음 상태는 이미 추적 가능
   - API에서 읽음 상태 포함하여 반환

2. **UI 구현** (2-3시간)
   - 메시지 버블에 읽음 표시 (체크마크)
   - 전송 중/완료 상태 표시
   - Mock 데이터에 상태 추가

3. **API 엔드포인트** (1시간)
   - `PUT /messages/:id/read` - 메시지 읽음 처리
   - 피드 API 응답에 읽음 상태 포함

**관련 파일:**
- `web/components/Messenger.tsx`
- `web/lib/mockData.ts`
- `backend/src/routes/messages.ts`

---

#### 5. 크리에이터 대시보드 통계
**우선순위: 중간**  
**예상 시간: 5-6시간**

**구현 계획:**
1. **API 엔드포인트 구현** (2-3시간)
   - `GET /creator/stats?period=day|week|month`
   - 기간별 후원 통계 집계
   - 총 후원액, 후원 건수, 평균 후원액

2. **UI 구현** (2-3시간)
   - 통계 카드 레이아웃
   - 기간별 필터 버튼
   - 간단한 차트 (선택적 - 라이브러리 사용)

3. **Mock 데이터** (1시간)
   - Mock 통계 데이터 생성
   - 개발 모드에서 테스트 가능

**관련 파일:**
- `backend/src/routes/creator.ts` (이미 `/stats/summary` 존재)
- `web/app/app/creator/dashboard/page.tsx`
- `web/lib/mockData.ts`

---

#### 6. 실시간 피드 업데이트 개선
**우선순위: 중간**  
**예상 시간: 3-4시간**

**구현 계획:**
1. **자동 스크롤 개선** (1시간)
   - 새 메시지 감지 시 자동 스크롤
   - 사용자가 위로 스크롤한 경우 자동 스크롤 비활성화

2. **새 메시지 알림** (1-2시간)
   - 새 메시지 배지 표시
   - 알림 사운드 (선택적)

3. **무한 스크롤** (1-2시간)
   - 페이지네이션 구현
   - 커서 기반 페이지네이션

**관련 파일:**
- `web/components/Messenger.tsx`
- `backend/src/routes/feed.ts`

---

### Phase 2 - 중기 구현 (1개월)

#### 7. 뱃지 시스템 ⭐⭐⭐
**우선순위: 높음 (Phase 2의 핵심 기능)**  
**예상 시간: 8-10시간**

**데이터베이스 스키마:**
- ✅ `badges` 테이블 (이미 존재)
- ✅ `user_badges` 테이블 (이미 존재)

**구현 계획:**

**1단계: 뱃지 티어 설정 (2-3시간)**
- 크리에이터가 채널별 뱃지 티어 설정
- 기본 티어: Bronze (10,000), Silver (50,000), Gold (200,000), Platinum (1,000,000)
- API: `POST /channels/:chzzkChannelId/badges` - 뱃지 티어 생성
- API: `GET /channels/:chzzkChannelId/badges` - 뱃지 티어 조회
- UI: 크리에이터 설정 페이지에 뱃지 관리 섹션 추가

**2단계: 뱃지 자동 계산 및 부여 (3-4시간)**
- 후원 확정(CONFIRMED) 시 누적 후원액 계산
- 뱃지 티어 임계값 도달 시 자동 부여
- API: `GET /users/:userId/badges?channelId=xxx` - 유저의 뱃지 조회
- 백그라운드 작업: 후원 확정 시 뱃지 체크 및 부여

**3단계: 뱃지 표시 (2-3시간)**
- 프로필에 뱃지 표시
- 메시지 작성자 옆에 뱃지 아이콘 표시
- 뱃지별 색상 및 디자인
- UI 컴포넌트: `Badge` 컴포넌트 생성

**4단계: 뱃지 기반 기능 (1-2시간)**
- 크리에이터 인박스에서 뱃지별 정렬
- VIP 리스트 (Platinum 이상)
- 뱃지별 특별 혜택 (선택적)

**관련 파일:**
- `backend/src/routes/badges.ts` (새로 생성)
- `backend/src/routes/channels.ts` (뱃지 설정 추가)
- `web/app/app/creator/settings/page.tsx` (뱃지 관리 추가)
- `web/components/Badge.tsx` (새로 생성)
- `web/lib/mockData.ts` (Mock 뱃지 데이터)

**데이터베이스 마이그레이션:**
- 뱃지 테이블은 이미 존재하므로 추가 마이그레이션 불필요
- 필요시 기본 뱃지 티어 시드 데이터 추가

---

#### 8. 메시지 모더레이션
**우선순위: 중간**  
**예상 시간: 6-8시간**

**구현 계획:**
1. **신고 기능** (2-3시간)
   - 메시지 신고 버튼
   - 신고 사유 선택
   - API: `POST /messages/:id/report`

2. **유저 차단** (2-3시간)
   - 크리에이터가 유저 차단
   - 차단된 유저의 메시지 숨김
   - API: `POST /users/:userId/block`

3. **스팸/도배 방지** (2시간)
   - 레이트 리밋 (시간당 메시지 수 제한)
   - 중복 메시지 감지

**관련 파일:**
- `backend/src/routes/moderation.ts` (새로 생성)
- `web/components/MessageBubble.tsx` (신고 버튼 추가)

---

#### 9. 고급 통계 및 분석
**우선순위: 낮음**  
**예상 시간: 8-10시간**

**구현 계획:**
1. **시간대별 히트맵** (3-4시간)
   - 시간대별 후원 분포 시각화
   - 차트 라이브러리 통합 (recharts 등)

2. **Top Supporters 목록** (2-3시간)
   - 채널별 상위 후원자 목록
   - 누적 후원액 기준 정렬

3. **후원 내역 Export** (2-3시간)
   - CSV 다운로드 기능
   - 기간별 필터링

**관련 파일:**
- `backend/src/routes/creator.ts` (통계 엔드포인트 확장)
- `web/app/app/creator/dashboard/page.tsx`

---

### Phase 3 - 장기 구현 (2-3개월)

#### 10. VIP 시스템
**우선순위: 낮음**  
**예상 시간: 6-8시간**

**구현 계획:**
- VIP 테이블 생성
- 크리에이터가 수동으로 VIP 지정
- VIP 전용 기능 (DM 우선 노출, 전용 콘텐츠 등)

---

#### 11. 선정산 시스템 (사업 확장)
**우선순위: 매우 낮음 (법적 검토 필요)**  
**예상 시간: 미정**

**구현 계획:**
- 법적 검토 완료 후 진행
- 현재는 기술적 준비만 (데이터 구조는 준비됨)

---

## 📝 구현 원칙

### 1. 개발 모드 우선
- 모든 기능은 먼저 Mock 데이터로 구현
- 개발 모드에서 완전히 테스트 가능하도록
- 백엔드 API는 Mock 응답과 동일한 형태로 구현

### 2. 점진적 개선
- Phase별로 기능 추가
- 각 Phase 완료 후 테스트 및 검증
- 사용자 피드백 반영

### 3. Git 워크플로우
- 두 저장소(ziptalk, minikwave)에 동시 푸시
- `git push origin main`으로 한 번에 푸시
- 기능별 브랜치 생성 권장

### 4. 배포 전 확인
- Railway 백엔드 환경 변수 확인
- Vercel 프론트엔드 환경 변수 확인
- Supabase 데이터베이스 마이그레이션 확인
- 치지직 OAuth Redirect URI 업데이트

---

## 🎯 즉시 시작 가능한 작업

### 우선순위 1: 치지직 후원 딥링크 분석
1. 치지직 개발자 포털 문서 확인
2. 실제 채널 페이지에서 링크 추출
3. 딥링크 적용

### 우선순위 2: 후원 완료 후 자동 복귀
1. 복귀 감지 로직 구현
2. 자동 메시지 등록 페이지 이동

### 우선순위 3: 에러 핸들링 개선
1. 스켈레톤 UI 추가
2. 에러 메시지 개선

---

## 📊 예상 일정

### 1주차
- 치지직 후원 딥링크 분석 및 연결
- 후원 완료 후 자동 복귀 플로우
- 에러 핸들링 개선

### 2-3주차
- 메시지 상태 표시
- 크리에이터 대시보드 통계
- 실시간 피드 업데이트 개선

### 4주차 이후
- 뱃지 시스템 (Phase 2 핵심)
- 메시지 모더레이션
- 고급 통계 및 분석

---

## 🔗 관련 문서

- [프로젝트 분석 및 개선 사항](PROJECT_ANALYSIS_AND_TODOS.md)
- [프로젝트 구조 및 UX/UI 개선](PROJECT_STRUCTURE_AND_UX_IMPROVEMENTS.md)
- [배포 가이드](DEPLOY_COMPLETE_GUIDE.md)
- [Git 이중 원격 설정](GIT_DUAL_REMOTE.md)
- [뱃지 시스템 구현 계획](BADGE_SYSTEM_IMPLEMENTATION_PLAN.md)

---

## 📌 Git 워크플로우 참고

### 이중 원격 저장소
- **origin**: ziptalk과 minikwave 두 저장소에 동시 푸시
  - `https://github.com/ziptalk/melt-app.git`
  - `https://github.com/minikwave/melt-app.git`
- **푸시 방법**: `git push origin main` (한 번에 두 저장소에 푸시)

### 배포 환경
- **프론트엔드**: Vercel (자동 배포 - main 브랜치)
- **백엔드**: Railway (자동 배포 - main 브랜치)
- **데이터베이스**: Supabase (PostgreSQL)
