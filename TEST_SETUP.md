# Melt 로컬 테스트 설정 가이드

## 빠른 시작

### 1. 데이터베이스 설정

```bash
# PostgreSQL 실행 확인
psql --version

# 데이터베이스 생성
createdb melt

# 스키마 적용
psql -U postgres -d melt -f backend/db/schema.sql
psql -U postgres -d melt -f backend/db/migrations/001_add_channel_urls.sql
psql -U postgres -d melt -f backend/db/migrations/002_add_follows_and_reads.sql
```

### 2. 더미 데이터 생성

```bash
cd backend
npm install
npm run seed
```

### 3. 백엔드 실행

```bash
cd backend
# .env 파일 생성 (아래 참고)
npm run dev
```

**backend/.env**:
```env
NODE_ENV=development
ENABLE_MOCK_AUTH=true
PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/melt
JWT_SECRET=dev-secret-key-change-in-production
CHZZK_CLIENT_ID=dummy
CHZZK_CLIENT_SECRET=dummy
CHZZK_REDIRECT_URI=http://localhost:3001/auth/chzzk/callback
FRONTEND_URL=http://localhost:3000
```

### 4. 프론트엔드 실행

```bash
cd web
npm install
npm run dev
```

**web/.env.local**:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 5. 테스트 시작

1. 브라우저에서 `http://localhost:3000/dev/login` 접속
2. 더미 유저 선택하여 로그인
3. 기능 테스트

## 구현된 모든 페이지

### ✅ 인증
- `/` - 홈
- `/auth/naver` - 네이버 로그인
- `/auth/chzzk/callback` - OAuth 콜백
- `/dev/login` - 개발 모드 로그인 (더미 데이터)

### ✅ 온보딩
- `/onboarding` - 역할 선택
- `/onboarding/creator-setup` - 스트리머 설정

### ✅ 시청자
- `/app` - 메인 대시보드
- `/app/conversations` - 대화방 목록
- `/app/search` - 크리에이터 검색
- `/app/channels/[id]` - 채널 메신저
- `/app/channels/[id]/donate` - 치즈 후원
- `/app/profile` - 프로필 설정

### ✅ 크리에이터
- `/app/creator/dashboard` - 대시보드
- `/app/creator/messages` - 메시지 관리
- `/app/creator/settings` - 채널 설정

## 테스트 체크리스트

- [ ] 더미 데이터 생성 성공
- [ ] 개발 모드 로그인 작동
- [ ] 시청자 플로우 테스트
- [ ] 크리에이터 플로우 테스트
- [ ] 메시지 전송/수신 테스트
- [ ] 팔로우 기능 테스트
- [ ] 대화방 목록 테스트
- [ ] 치즈 후원 플로우 테스트

## 빌드 테스트

### 프론트엔드 빌드
```bash
cd web
npm run build
npm start
```

### 백엔드 빌드
```bash
cd backend
npm run build
npm start
```

## 문제 해결

자세한 내용은 `docs/TESTING.md` 참조
