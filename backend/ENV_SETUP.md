# 환경 변수 설정 가이드

## 필수 환경 변수

`.env` 파일을 `backend/` 디렉토리에 생성하고 다음 변수들을 설정하세요.

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/melt

# JWT
JWT_SECRET=your-jwt-secret-key-here-change-in-production
JWT_EXPIRES_IN=7d

# Encryption (32 bytes hex string or any string)
# Generate: openssl rand -hex 32
ENCRYPTION_KEY=your-encryption-key-here-change-in-production

# 치지직 OAuth
CHZZK_CLIENT_ID=adbe2be0-a1c7-43a5-bdfd-408491968f3b
CHZZK_CLIENT_SECRET=ahHose2CWgcApBBrxtlmzPf5THLxEURXwr5s7uc2OFk
CHZZK_REDIRECT_URI=http://localhost:3001/auth/chzzk/callback

# Frontend
FRONTEND_URL=http://localhost:3000

# Server
PORT=3001
NODE_ENV=development
```

## 환경 변수 설명

### DATABASE_URL
PostgreSQL 데이터베이스 연결 문자열
- 형식: `postgresql://username:password@host:port/database`

### JWT_SECRET
JWT 토큰 서명에 사용되는 비밀 키
- 프로덕션에서는 강력한 랜덤 문자열 사용 권장
- 생성: `openssl rand -base64 32`

### ENCRYPTION_KEY
OAuth 토큰 암호화에 사용되는 키
- 32바이트 hex 문자열 또는 임의의 문자열
- 생성: `openssl rand -hex 32`
- **중요**: 이 키를 잃어버리면 암호화된 토큰을 복호화할 수 없습니다!

### CHZZK_CLIENT_ID
치지직 개발자 포털에서 발급받은 Client ID

### CHZZK_CLIENT_SECRET
치지직 개발자 포털에서 발급받은 Client Secret
- **보안**: 절대 Git에 커밋하지 마세요!

### CHZZK_REDIRECT_URI
OAuth 콜백 URL
- 개발: `http://localhost:3001/auth/chzzk/callback`
- 프로덕션: `https://your-domain.com/auth/chzzk/callback`
- 치지직 개발자 포털에 등록된 URI와 정확히 일치해야 합니다

### FRONTEND_URL
프론트엔드 애플리케이션 URL
- 개발: `http://localhost:3000`
- 프로덕션: `https://your-domain.com`

## 보안 주의사항

1. **`.env` 파일은 절대 Git에 커밋하지 마세요**
2. 프로덕션 환경에서는 모든 비밀 키를 강력한 랜덤 문자열로 변경하세요
3. `ENCRYPTION_KEY`는 안전한 곳에 백업하세요 (키를 잃으면 복구 불가능)
4. 환경 변수는 서버 환경에서만 설정하고, 클라이언트 코드에 노출하지 마세요
