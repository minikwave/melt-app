# 실제 API 연동 설정 가이드

## 개요

Mock 모드에서 실제 API로 전환하기 위한 설정 가이드입니다.

## 필수 환경 변수

### Backend (`.env`)

```env
# 데이터베이스
DATABASE_URL=postgresql://user:password@localhost:5432/melt

# JWT
APP_JWT_SECRET=your-secret-key-here

# 치지직 OAuth
CHZZK_CLIENT_ID=your-chzzk-client-id
CHZZK_CLIENT_SECRET=your-chzzk-client-secret
CHZZK_REDIRECT_URI=http://localhost:3001/auth/chzzk/callback
```

### Frontend (`.env.local`)

```env
# API URL (실제 백엔드 서버)
NEXT_PUBLIC_API_URL=http://localhost:3001

# Mock 모드 비활성화
NEXT_PUBLIC_FORCE_MOCK=false
```

## 치지직 OAuth 설정

### 1. 치지직 개발자 포털에서 앱 등록

1. [치지직 개발자 포털](https://developers.chzzk.naver.com/) 접속
2. 새 앱 등록
3. OAuth Redirect URI 설정:
   - 개발: `http://localhost:3001/auth/chzzk/callback`
   - 프로덕션: `https://your-domain.com/auth/chzzk/callback`

### 2. Client ID 및 Secret 발급

- Client ID와 Client Secret을 받아서 Backend `.env`에 설정

## 네이버 로그인 연동

현재 구현:
- `/auth/naver` → `/auth/chzzk/login`으로 리다이렉트
- 치지직 OAuth를 통해 네이버 계정으로 로그인

**참고**: 치지직은 네이버 계정으로 로그인하므로, 별도의 네이버 OAuth 설정은 필요 없습니다.

## 백엔드 서버 실행

```bash
cd backend
npm install
npm run dev
```

백엔드 서버가 `http://localhost:3001`에서 실행되어야 합니다.

## 프론트엔드 설정

### Mock 모드 비활성화

`.env.local` 파일 생성:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FORCE_MOCK=false
```

### 개발 서버 실행

```bash
cd web
npm install
npm run dev
```

## 테스트 플로우

1. `/auth/naver` 접속
2. "네이버로 시작하기" 클릭
3. 치지직 OAuth 페이지로 리다이렉트
4. 네이버 계정으로 로그인
5. 권한 동의
6. 백엔드 `/auth/chzzk/callback`으로 리다이렉트 (code 포함)
7. 백엔드에서 토큰 교환 및 유저 정보 조회
8. 온보딩 상태 확인 후 적절한 페이지로 리다이렉트:
   - 온보딩 미완료: `/onboarding`
   - 온보딩 완료: `/app`

## 주의사항

1. **State 검증**: CSRF 방지를 위해 OAuth state를 Redis/세션에 저장하고 검증해야 합니다. (현재 TODO 상태)
2. **토큰 암호화**: Access Token과 Refresh Token은 DB에 암호화하여 저장해야 합니다. (현재 평문 저장)
3. **HTTPS**: 프로덕션 환경에서는 반드시 HTTPS를 사용해야 합니다.
4. **환경 변수 보안**: `.env` 파일은 절대 Git에 커밋하지 마세요.
5. **Refresh Token 갱신**: Access Token 만료 시 Refresh Token으로 갱신하는 로직이 필요합니다.
6. **에러 처리**: OAuth 실패 시 사용자에게 적절한 에러 메시지를 표시해야 합니다.

## 문제 해결

### 백엔드 연결 실패
- 백엔드 서버가 실행 중인지 확인
- `NEXT_PUBLIC_API_URL`이 올바른지 확인
- CORS 설정 확인

### OAuth 오류
- Client ID와 Secret이 올바른지 확인
- Redirect URI가 개발자 포털에 등록되어 있는지 확인
- State 검증 로직 확인

### 토큰 만료
- Refresh Token으로 Access Token 갱신 로직 구현 필요
- 토큰 만료 시간 확인
