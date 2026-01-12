# Melt 로컬 테스트 가이드

## 더미 데이터로 테스트하기

### 1. 데이터베이스 설정

```bash
# PostgreSQL 실행 후
psql -U postgres -d melt -f backend/db/schema.sql

# 마이그레이션 적용
psql -U postgres -d melt -f backend/db/migrations/001_add_channel_urls.sql
psql -U postgres -d melt -f backend/db/migrations/002_add_follows_and_reads.sql
```

### 2. 더미 데이터 생성

```bash
cd backend
npm run seed
```

이 명령어는 다음을 생성합니다:
- 크리에이터 3명
- 시청자 10명
- 채널 3개
- 팔로우 관계
- 더미 메시지 (DM, 공개 메시지, 치즈 후원 메시지)
- RT 예시

### 3. 개발 모드 실행

#### 백엔드
```bash
cd backend
npm run dev
```

#### 프론트엔드
```bash
cd web
npm run dev
```

### 4. 개발 모드 로그인

브라우저에서:
1. `http://localhost:3000/dev/login` 접속
2. 더미 유저 선택 (크리에이터 또는 시청자)
3. 자동으로 로그인되어 `/app`으로 이동

### 5. 테스트 계정

시드 스크립트 실행 후 생성되는 계정:

**크리에이터:**
- `creator_1` - 크리에이터1
- `creator_2` - 크리에이터2
- `creator_3` - 크리에이터3

**시청자:**
- `viewer_1` ~ `viewer_10` - 시청자1~10

## 테스트 시나리오

### 시청자 플로우
1. `/dev/login`에서 `viewer_1`로 로그인
2. `/app` → "대화방" 클릭
3. 팔로우한 크리에이터 목록 확인
4. 채널 클릭하여 메신저 열기
5. 메시지 전송 테스트
6. "크리에이터 찾기"에서 새 크리에이터 검색 및 팔로우

### 크리에이터 플로우
1. `/dev/login`에서 `creator_1`로 로그인
2. `/app` → "메시지 관리" 클릭
3. 채널 ID 입력: `channel_creator_1`
4. DM 및 후원 메시지 확인
5. 답장 및 RT 테스트
6. 후원 확정 테스트

### 치즈 후원 플로우
1. 시청자로 로그인
2. 채널 페이지에서 "치즈 보내기" 클릭
3. 메시지 입력
4. "치지직에서 후원하기" 클릭
5. (실제 치지직 페이지는 열리지 않지만) 완료 페이지로 이동
6. 메시지 등록 확인

## 환경 변수 (개발 모드)

### 백엔드 (.env)
```env
NODE_ENV=development
ENABLE_MOCK_AUTH=true
DATABASE_URL=postgresql://postgres:password@localhost:5432/melt
JWT_SECRET=dev-secret-key
```

### 프론트엔드 (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 문제 해결

### 더미 데이터가 보이지 않는 경우
- 시드 스크립트가 정상 실행되었는지 확인
- 데이터베이스 연결 확인
- 브라우저 캐시 클리어

### 로그인이 안 되는 경우
- 백엔드가 실행 중인지 확인
- 개발 모드 로그인 페이지 사용 (`/dev/login`)
- 쿠키 설정 확인

### API 오류
- 백엔드 콘솔 로그 확인
- 데이터베이스 연결 확인
- CORS 설정 확인

## 다음 단계

더미 데이터로 테스트한 후:
1. 실제 치지직 OAuth 설정
2. 실제 채널로 테스트
3. 운영 환경 배포
