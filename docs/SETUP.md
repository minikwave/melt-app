# Melt 설정 가이드

## 사전 요구사항

- Node.js 18+ 
- PostgreSQL 14+
- 치지직 Open API Client ID/Secret

## 1. 프로젝트 클론 및 설치

```bash
# 백엔드
cd backend
npm install

# 프론트엔드
cd ../web
npm install
```

## 2. 데이터베이스 설정

### PostgreSQL 데이터베이스 생성

```bash
createdb melt
```

### 스키마 적용

```bash
psql -U postgres -d melt -f backend/db/schema.sql
```

## 3. 환경 변수 설정

### 백엔드 (.env)

`backend/.env` 파일 생성:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/melt

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# 치지직 OAuth
CHZZK_CLIENT_ID=your-chzzk-client-id
CHZZK_CLIENT_SECRET=your-chzzk-client-secret
CHZZK_REDIRECT_URI=http://localhost:3001/auth/chzzk/callback

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Token Encryption (AES-256-GCM)
TOKEN_ENCRYPTION_KEY=your-32-byte-key-for-aes-256
```

### 프론트엔드 (.env.local)

`web/.env.local` 파일 생성:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CHZZK_CLIENT_ID=your-chzzk-client-id
```

## 4. 치지직 OAuth 설정

1. [치지직 개발자 포털](https://developers.chzzk.naver.com/) 접속
2. 새 애플리케이션 등록
3. Redirect URI 설정: `http://localhost:3001/auth/chzzk/callback`
4. Client ID와 Client Secret을 `.env`에 입력

## 5. 실행

### 백엔드 실행

```bash
cd backend
npm run dev
```

백엔드는 `http://localhost:3001`에서 실행됩니다.

### 프론트엔드 실행

```bash
cd web
npm run dev
```

프론트엔드는 `http://localhost:3000`에서 실행됩니다.

## 6. 테스트

1. 브라우저에서 `http://localhost:3000` 접속
2. "로그인" 버튼 클릭
3. 치지직 OAuth 로그인 진행
4. 로그인 후 메인 화면 확인

## 문제 해결

### 데이터베이스 연결 오류

- PostgreSQL이 실행 중인지 확인
- `DATABASE_URL`이 올바른지 확인
- 데이터베이스가 생성되었는지 확인

### OAuth 오류

- `CHZZK_CLIENT_ID`와 `CHZZK_CLIENT_SECRET`이 올바른지 확인
- Redirect URI가 개발자 포털에 등록되어 있는지 확인
- `CHZZK_REDIRECT_URI`가 정확히 일치하는지 확인

### CORS 오류

- `FRONTEND_URL`이 프론트엔드 실제 URL과 일치하는지 확인
- 백엔드 CORS 설정 확인

## 다음 단계

- [아키텍처 문서](./ARCHITECTURE.md) 참조
- [API 문서](./API.md) 참조
- Phase 0 MVP 기능 테스트
