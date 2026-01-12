# Melt 빌드 및 테스트 가이드

## 📋 페이지 구현 현황

### ✅ 완료된 페이지 (총 16개)

#### 인증 (4개)
- `/` - 홈
- `/auth/naver` - 네이버 로그인
- `/auth/login` - 로그인 리다이렉트
- `/auth/chzzk/callback` - OAuth 콜백

#### 온보딩 (2개)
- `/onboarding` - 역할 선택
- `/onboarding/creator-setup` - 스트리머 초기 설정

#### 개발 도구 (1개)
- `/dev/login` - 개발 모드 로그인 ⭐

#### 시청자 (6개)
- `/app` - 메인 대시보드
- `/app/conversations` - 대화방 목록
- `/app/search` - 크리에이터 검색
- `/app/channels` - 채널 검색
- `/app/channels/[id]` - 채널 메신저
- `/app/channels/[id]/donate` - 치즈 후원
- `/app/channels/[id]/donate/complete` - 후원 완료
- `/app/profile` - 프로필 설정

#### 크리에이터 (3개)
- `/app/creator/dashboard` - 대시보드
- `/app/creator/messages` - 메시지 관리
- `/app/creator/settings` - 채널 설정

## 🚀 로컬 빌드 및 테스트

### 1. 환경 준비

```bash
# Node.js 18+ 확인
node --version

# PostgreSQL 14+ 확인
psql --version
```

### 2. 데이터베이스 설정

```bash
# 데이터베이스 생성
createdb melt

# 스키마 적용
psql -U postgres -d melt -f backend/db/schema.sql
psql -U postgres -d melt -f backend/db/migrations/001_add_channel_urls.sql
psql -U postgres -d melt -f backend/db/migrations/002_add_follows_and_reads.sql
```

### 3. 더미 데이터 생성

```bash
cd backend
npm install
npm run seed
```

**생성되는 데이터:**
- 크리에이터 3명
- 시청자 10명
- 채널 3개
- 팔로우 관계
- 더미 메시지 (DM, 공개, 치즈 후원)
- RT 예시

### 4. 백엔드 실행

```bash
cd backend

# .env 파일 생성
cat > .env << 'EOF'
NODE_ENV=development
ENABLE_MOCK_AUTH=true
PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/melt
JWT_SECRET=dev-secret-key-change-in-production
CHZZK_CLIENT_ID=dummy
CHZZK_CLIENT_SECRET=dummy
CHZZK_REDIRECT_URI=http://localhost:3001/auth/chzzk/callback
FRONTEND_URL=http://localhost:3000
EOF

npm run dev
```

### 5. 프론트엔드 실행

```bash
# 새 터미널
cd web
npm install

# .env.local 파일 생성
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF

npm run dev
```

### 6. 빌드 테스트

#### 프론트엔드 빌드
```bash
cd web
npm run build
npm start
```

#### 백엔드 빌드
```bash
cd backend
npm run build
npm start
```

## 🧪 테스트 방법

### 개발 모드 로그인

1. 브라우저에서 `http://localhost:3000/dev/login` 접속
2. 더미 유저 선택:
   - `creator_1` - 크리에이터1
   - `viewer_1` - 시청자1
3. 자동 로그인 후 `/app`으로 이동

### 테스트 시나리오

#### 시청자 플로우
1. `viewer_1`로 로그인
2. "대화방" 클릭 → 팔로우한 크리에이터 확인
3. 채널 클릭 → 메신저 열기
4. 메시지 전송 테스트
5. "크리에이터 찾기" → 검색 및 팔로우

#### 크리에이터 플로우
1. `creator_1`로 로그인
2. "메시지 관리" 클릭
3. 채널 ID: `channel_creator_1` 입력
4. DM 및 후원 메시지 확인
5. 답장 및 RT 테스트
6. 후원 확정 테스트

## ✅ 기능 체크리스트

### 시청자 기능
- [x] 크리에이터 검색
- [x] 팔로우/언팔로우
- [x] 대화방 목록
- [x] 안읽은 메시지 배지
- [x] 채널 메신저
- [x] 비공개 메시지 전송
- [x] 치즈 후원 메시지 전송
- [x] 프로필 설정

### 크리에이터 기능
- [x] 메시지 관리 (DM/후원)
- [x] 답장 기능 (비공개/공개)
- [x] RT 기능 (공개 전환)
- [x] 후원 확정
- [x] 통계 대시보드
- [x] 채널 설정 (후원 링크)

## 📱 모든 페이지 접근 경로

### 인증
- 홈: `http://localhost:3000/`
- 개발 로그인: `http://localhost:3000/dev/login` ⭐

### 시청자
- 메인: `http://localhost:3000/app`
- 대화방: `http://localhost:3000/app/conversations`
- 검색: `http://localhost:3000/app/search`
- 채널: `http://localhost:3000/app/channels/channel_creator_1`
- 프로필: `http://localhost:3000/app/profile`

### 크리에이터
- 메인: `http://localhost:3000/app`
- 메시지 관리: `http://localhost:3000/app/creator/messages`
- 대시보드: `http://localhost:3000/app/creator/dashboard`
- 설정: `http://localhost:3000/app/creator/settings`

## 🎯 다음 단계

1. ✅ 더미 데이터로 모든 기능 테스트
2. 실제 치지직 OAuth 설정
3. 실제 채널로 테스트
4. 운영 환경 배포
