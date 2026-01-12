# Melt 개발 가이드

## 필수 API 문서 및 리소스

### 치지직 (CHZZK) API

#### 1. 공식 문서
- **Open API GitBook**: https://chzzk.gitbook.io/chzzk
  - Authorization (OAuth)
  - User API
  - Channel API
  - Session API
  - Chat API

#### 2. 개발자 포털
- **개발자 포털**: https://developers.chzzk.naver.com/
  - 애플리케이션 등록
  - Client ID/Secret 발급
  - Redirect URI 설정

#### 3. 커뮤니티 리소스
- **awesome-chzzk**: https://github.com/dokdo2013/awesome-chzzk
  - 오픈소스 프로젝트 모음
  - 비공식 API 정보 (참고용)

### 네이버 API

현재는 치지직 OAuth를 통해 네이버 계정으로 로그인하므로 별도 네이버 API 불필요.

만약 네이버 로그인을 별도로 구현한다면:
- **네이버 개발자 센터**: https://developers.naver.com/
- **네이버 로그인 API**: https://developers.naver.com/docs/login/overview/

## 현재 구현 상태

### ✅ 구현 완료
1. **OAuth 인증**
   - 치지직 OAuth 로그인
   - 토큰 교환 및 저장
   - 유저 정보 조회

2. **메시징 시스템**
   - DM (비공개 메시지)
   - 공개 메시지
   - RT (공개 전환)

3. **후원 시스템**
   - Intent 생성
   - 후원 발생 등록 (OCCURRED)
   - 후원 확정 (CONFIRMED)

### ⏳ 추가 구현 필요

#### 1. 치지직 후원 딥링크
**현재**: 채널 페이지로 이동 후 수동 클릭

**필요**: 직접 후원 페이지로 이동하는 URL/딥링크

**확인 방법**:
- 치지직 개발자 포털 문의
- 치지직 고객센터
- 커뮤니티/포럼

**예상 형태**:
```
https://chzzk.naver.com/live/{channelId}/donate
또는
chzzk://cheese?channelId={channelId}
```

#### 2. Session API (후원 이벤트 자동 수신)
**현재**: 수동 확인 방식

**향후**: Session API로 자동화

**필요한 정보**:
- Session 생성 방법
- 후원 이벤트 구독 방법
- 스코프 및 권한

**문서**: https://chzzk.gitbook.io/chzzk/session

#### 3. 채널 메타데이터 조회
**용도**: 채널 이름, 썸네일 등 표시

**API**: `GET /open/v1/channels/{channelId}`

**문서**: https://chzzk.gitbook.io/chzzk/channel

## 개발 환경 설정

### 1. 치지직 개발자 포털 설정

1. https://developers.chzzk.naver.com/ 접속
2. 로그인 (네이버 계정)
3. "애플리케이션 등록" 클릭
4. 정보 입력:
   - 애플리케이션 이름: Melt
   - 설명: 방송 외 후원 플랫폼
5. Redirect URI 설정:
   ```
   http://localhost:3001/auth/chzzk/callback
   ```
6. Client ID, Client Secret 발급

### 2. 환경 변수 설정

**백엔드** (`backend/.env`):
```env
CHZZK_CLIENT_ID=발급받은_Client_ID
CHZZK_CLIENT_SECRET=발급받은_Client_Secret
CHZZK_REDIRECT_URI=http://localhost:3001/auth/chzzk/callback
```

**프론트엔드** (`web/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. 데이터베이스 설정

PostgreSQL 실행 후:
```bash
psql -U postgres -d melt -f backend/db/schema.sql
```

## API 테스트

### 1. OAuth 로그인 테스트

1. 프론트엔드에서 "네이버로 시작하기" 클릭
2. 치지직 OAuth 페이지로 리다이렉트 확인
3. 로그인 및 동의
4. 콜백 처리 확인
5. 세션 쿠키 확인

### 2. 메시지 전송 테스트

1. 채널 페이지 접속
2. 메시지 입력
3. 전송
4. 공개 피드 또는 인박스에 표시 확인

### 3. 치즈 후원 테스트

1. "치즈 보내기" 클릭
2. 메시지 입력
3. "치지직에서 후원하기" 클릭
4. 치지직 페이지에서 후원 완료
5. Melt로 돌아와서 메시지 등록 확인

## 문제 해결

### OAuth 오류
- **Redirect URI 불일치**: 개발자 포털과 `.env`의 URI가 정확히 일치해야 함
- **Client ID/Secret 오류**: 발급받은 값이 올바른지 확인
- **CORS 오류**: 백엔드 CORS 설정 확인

### API 호출 실패
- **401 Unauthorized**: 토큰 만료 또는 잘못된 토큰
- **403 Forbidden**: 권한 부족 (스코프 확인)
- **429 Too Many Requests**: Rate Limit 초과

### 데이터베이스 오류
- **연결 실패**: PostgreSQL 실행 여부 확인
- **스키마 오류**: `schema.sql` 실행 확인
- **ENUM 오류**: PostgreSQL 버전 확인 (14+)

## 다음 단계

### Phase 1 (현재)
- ✅ 기본 메시징
- ✅ 후원 Intent/Event
- ⏳ 치지직 후원 딥링크 확인

### Phase 2 (향후)
- Session API 연동
- 후원 이벤트 자동 수신
- 채널 메타데이터 조회
- 뱃지 시스템

### Phase 3 (장기)
- 선정산 서비스
- 고급 통계
- API 파트너십

## 유용한 링크

1. **치지직 Open API 문서**: https://chzzk.gitbook.io/chzzk
2. **개발자 포털**: https://developers.chzzk.naver.com/
3. **오픈소스 프로젝트**: https://github.com/dokdo2013/awesome-chzzk
4. **개발자 포럼**: 치지직 개발자 커뮤니티

## 문의 및 지원

- 치지직 API 관련: 개발자 포털 문의
- 기술적 문제: GitHub Issues
- 커뮤니티: awesome-chzzk 참고
