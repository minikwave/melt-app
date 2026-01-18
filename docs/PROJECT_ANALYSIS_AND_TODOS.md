# 프로젝트 분석 및 개선 사항 정리

## 📋 프로젝트 개요

**Melt (멜트)** - 방송이 꺼진 뒤에도 후원이 흐르도록 설계된 치지직 기반 후원·메시지 웹앱

### 기술 스택
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Auth**: 치지직 OAuth 2.0

### 현재 상태
- ✅ DB 연결 완료
- ✅ 백엔드 서버 실행 완료
- ✅ 프론트엔드 서버 실행 완료
- ✅ 네이버 치지직 OAuth 연동 완료 (네이버 계정으로만 로그인 가능)
- ✅ 개발자 모드 개선 (목 데이터로 누구나 접근 가능)
- ✅ 후원 완료 페이지 구현 완료
- ⚠️ 치즈 후원 딥링크 분석 부족 (현재는 채널 페이지로 이동)

---

## 🔒 개발자 모드 개선 완료

### 구현 내용
1. **목 데이터 기반 접근** (`backend/src/routes/dev.ts`)
   - 실제 네이버 계정 없이도 목 데이터로 테스트 가능
   - 누구나 접근 가능 (개발자 모드 활성화 시)
   - DB에 없는 유저도 자동 생성
   - 환경 변수 `ENABLE_DEV_MODE`로 활성화/비활성화 제어

2. **프론트엔드 개선** (`web/app/dev/login/page.tsx`)
   - 접근 제한 제거, 누구나 목 데이터로 접근 가능
   - 백엔드 연결 실패 시 로컬 쿠키 모드로 폴백
   - 명확한 안내 메시지 표시

### 설정 방법

**백엔드 `.env` 파일:**
```env
# 개발자 모드 활성화/비활성화
# 개발 환경(NODE_ENV=development)에서는 기본적으로 활성화됨
# 프로덕션에서는 false로 설정하거나 설정하지 않으면 비활성화됨
ENABLE_DEV_MODE=true
```

**참고:**
- 개발 환경(`NODE_ENV=development`)에서는 기본적으로 활성화됨
- 프로덕션 환경에서는 `ENABLE_DEV_MODE=false`로 설정하거나 설정하지 않으면 비활성화됨
- 목 데이터 유저: `creator_1`, `creator_2`, `creator_3`, `viewer_1`, `viewer_2`, `viewer_3`

---

## 🎯 정상 작동을 위해 필요한 작업들

### 1. 치지직 치즈 후원 딥링크 분석 및 연결 ⚠️ 중요

**현재 상태:**
- 후원 딥링크가 분석되지 않아 채널 페이지로만 이동
- 사용자가 수동으로 치즈 버튼을 클릭해야 함

**필요한 작업:**
1. 치지직 공식 후원 딥링크 확인
   - 치지직 개발자 포털 문서 확인
   - 실제 채널 페이지에서 개발자 도구로 링크 추출
   - 커뮤니티/오픈소스 프로젝트 확인
   
2. 딥링크 형식 확인 후 구현
   - 웹 링크: `https://chzzk.naver.com/live/{channelId}/donate`
   - 앱 딥링크: `chzzk://donate?channelId={channelId}`
   
3. 크리에이터 설정 페이지에서 딥링크 등록 기능 (이미 구현됨)
   - `/app/creator/settings`에서 후원 딥링크 입력 가능
   - `donate_url` 필드에 저장

**참고 문서:**
- `docs/CHZZK_DONATE_LINK.md`
- `docs/DONATE_LINKS.md`

---

### 2. 후원 완료 후 자동 복귀 플로우 개선

**현재 상태:**
- 치지직에서 후원 완료 후 사용자가 수동으로 Melt로 복귀해야 함
- `localStorage`에 `melt_intent_id` 저장되어 있음

**필요한 작업:**
1. 치지직 후원 완료 후 콜백 URL 설정
   - 치지직에서 제공하는 콜백 기능 확인
   - 또는 브라우저 뒤로가기 감지
   
2. 복귀 시 자동으로 메시지 등록 페이지 표시
   - `melt_intent_id` 확인
   - `/app/channels/{channelId}/donate/complete` 페이지로 자동 이동

**구현 위치:**
- `web/app/app/channels/[chzzkChannelId]/donate/complete/page.tsx` (확인 필요)

---

### 3. 후원 메시지 등록 플로우 개선

**현재 상태:**
- 후원 Intent 생성 후 치지직으로 이동
- `localStorage`에 메시지 저장
- 복귀 후 메시지 등록 API 호출 필요

**필요한 작업:**
1. 후원 완료 페이지 구현/개선
   - Intent ID로 후원 이벤트 확인
   - 메시지 입력 및 등록
   - API: `POST /donations/:intentId/complete`

2. 자동 메시지 등록 옵션
   - 후원 시 입력한 메시지 자동 등록
   - 또는 복귀 후 메시지 입력 페이지 표시

**관련 파일:**
- `backend/src/routes/donations.ts` - `/donations/:intentId/complete` 엔드포인트
- `web/app/app/channels/[chzzkChannelId]/donate/page.tsx` - 후원 페이지

---

### 4. 에러 핸들링 및 사용자 피드백 개선

**현재 상태:**
- 기본적인 에러 처리만 구현됨
- 사용자에게 명확한 피드백 부족

**필요한 작업:**
1. 후원 플로우 중 오류 상황 처리
   - Intent 생성 실패
   - 치지직 페이지 이동 실패
   - 후원 완료 후 메시지 등록 실패
   
2. 사용자 피드백 개선
   - 로딩 상태 표시
   - 에러 메시지 명확화
   - 재시도 옵션 제공

---

### 5. 프로덕션 환경 설정 검증

**필요한 점검 사항:**

1. **환경 변수 설정**
   - [ ] `ALLOWED_DEV_USERS` 설정 (개발자 모드 접근 제한)
   - [ ] `JWT_SECRET` 강력한 키로 변경
   - [ ] `ENCRYPTION_KEY` 강력한 키로 변경
   - [ ] `CHZZK_CLIENT_ID`, `CHZZK_CLIENT_SECRET` 프로덕션 값
   - [ ] `CHZZK_REDIRECT_URI` 프로덕션 URL
   - [ ] `FRONTEND_URL` 프로덕션 URL

2. **보안 설정**
   - [ ] 쿠키 `secure` 플래그 (HTTPS 환경)
   - [ ] CORS 설정 검증
   - [ ] SQL Injection 방지 확인
   - [ ] XSS 방지 확인

3. **데이터베이스**
   - [ ] 마이그레이션 스크립트 실행 확인
   - [ ] 인덱스 최적화
   - [ ] 백업 전략 수립

4. **배포 준비**
   - [ ] 빌드 오류 확인
   - [ ] 환경별 설정 분리
   - [ ] 로깅 설정
   - [ ] 모니터링 설정

---

### 6. 추가 개선 사항 (선택)

1. **실시간 업데이트**
   - WebSocket 또는 Server-Sent Events로 실시간 피드 업데이트
   - 새 메시지 알림

2. **크리에이터 대시보드 통계**
   - 후원 통계
   - 메시지 통계
   - 시청자 통계

3. **모바일 앱 최적화**
   - PWA 지원
   - 모바일 UI/UX 개선

4. **뱃지 시스템** (Phase 2)
   - 후원 금액별 뱃지
   - 특별 이벤트 뱃지

---

## 📝 구현 우선순위

### 높음 (즉시 필요)
1. ✅ 개발자 모드 접근 제한 구현 (완료)
2. ⚠️ 치지직 치즈 후원 딥링크 분석 및 연결
3. 후원 완료 후 자동 복귀 플로우 개선

### 중간 (서비스 안정화)
4. 후원 메시지 등록 플로우 개선
5. 에러 핸들링 및 사용자 피드백 개선

### 낮음 (추가 기능)
6. 프로덕션 환경 설정 검증
7. 실시간 업데이트
8. 크리에이터 대시보드 통계

---

## 🔗 관련 문서

- [치지직 개발자 포털](https://developers.chzzk.naver.com/)
- [치지직 Open API 문서](https://chzzk.gitbook.io/chzzk)
- [프로젝트 아키텍처](docs/ARCHITECTURE.md)
- [API 문서](docs/API.md)
- [후원 링크 설정 가이드](docs/DONATE_LINKS.md)

---

## 📌 참고 사항

1. **로그인 방식**: 현재는 네이버 계정(치지직 OAuth)으로만 로그인 가능합니다. 별도의 회원가입 없이 OAuth로 자동 가입됩니다.

2. **개발자 모드**: 목 데이터로 누구나 접근 가능하며, 실제 네이버 계정 없이도 테스트할 수 있습니다. 프로덕션에서는 `ENABLE_DEV_MODE=false`로 비활성화해야 합니다.

3. **치지직 후원 딥링크**는 공식 문서가 부족하므로 다음 방법으로 확인 필요:
   - 실제 채널 페이지에서 개발자 도구로 링크 추출
   - 치지직 개발자 포털 문의
   - 커뮤니티/오픈소스 프로젝트 확인

4. **후원 플로우**는 치지직 공식 UI를 사용하므로, 직접 결제 API를 호출하지 않습니다.

5. **후원 완료 페이지**: `/app/channels/[id]/donate/complete`에서 후원 메시지를 등록할 수 있습니다. localStorage에 저장된 메시지가 자동으로 불러와집니다.
