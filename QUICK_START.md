# Melt 빠른 시작 가이드

## 🚀 5분 안에 테스트하기

### 1단계: 데이터베이스 준비

```bash
# PostgreSQL이 실행 중이어야 합니다
createdb melt

# 스키마 적용
psql -U postgres -d melt -f backend/db/schema.sql
psql -U postgres -d melt -f backend/db/migrations/001_add_channel_urls.sql
psql -U postgres -d melt -f backend/db/migrations/002_add_follows_and_reads.sql
```

### 2단계: 더미 데이터 생성

```bash
cd backend
npm install
npm run seed
```

생성되는 데이터:
- 크리에이터 3명
- 시청자 10명
- 채널 3개
- 메시지 및 후원 데이터

### 3단계: 백엔드 실행

```bash
# backend/.env 파일 생성 (최소 설정)
cat > .env << EOF
NODE_ENV=development
ENABLE_MOCK_AUTH=true
PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/melt
JWT_SECRET=dev-secret-key
CHZZK_CLIENT_ID=dummy
CHZZK_CLIENT_SECRET=dummy
CHZZK_REDIRECT_URI=http://localhost:3001/auth/chzzk/callback
FRONTEND_URL=http://localhost:3000
EOF

npm run dev
```

### 4단계: 프론트엔드 실행

```bash
# 새 터미널에서
cd web
npm install

# web/.env.local 파일 생성
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF

npm run dev
```

### 5단계: 테스트 시작

1. 브라우저에서 `http://localhost:3000/dev/login` 접속
2. 더미 유저 선택 (예: `creator_1` 또는 `viewer_1`)
3. 자동 로그인 후 기능 테스트

## 📱 테스트 시나리오

### 시청자로 테스트
1. `viewer_1`로 로그인
2. "대화방" → 팔로우한 크리에이터 목록 확인
3. 채널 클릭 → 메신저 열기
4. 메시지 전송 테스트
5. "크리에이터 찾기" → 새 크리에이터 검색 및 팔로우

### 크리에이터로 테스트
1. `creator_1`로 로그인
2. "메시지 관리" → 채널 ID: `channel_creator_1` 입력
3. DM 및 후원 메시지 확인
4. 답장 및 RT 테스트
5. 후원 확정 테스트

## ✅ 구현된 모든 페이지

### 인증
- `/` - 홈
- `/auth/naver` - 네이버 로그인
- `/dev/login` - 개발 모드 로그인 ⭐

### 온보딩
- `/onboarding` - 역할 선택
- `/onboarding/creator-setup` - 스트리머 설정

### 시청자
- `/app` - 메인 대시보드
- `/app/conversations` - 대화방 목록
- `/app/search` - 크리에이터 검색
- `/app/channels/[id]` - 채널 메신저
- `/app/profile` - 프로필 설정

### 크리에이터
- `/app/creator/dashboard` - 대시보드
- `/app/creator/messages` - 메시지 관리
- `/app/creator/settings` - 채널 설정

## 🐛 문제 해결

**데이터베이스 연결 오류**
- PostgreSQL 실행 확인: `pg_isready`
- DATABASE_URL 확인

**더미 데이터가 안 보임**
- 시드 스크립트 재실행: `npm run seed`
- 브라우저 캐시 클리어

**API 오류**
- 백엔드 콘솔 로그 확인
- CORS 설정 확인

자세한 내용은 [docs/TESTING.md](docs/TESTING.md) 참조
