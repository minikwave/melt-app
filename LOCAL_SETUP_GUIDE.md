# 🚀 Melt 로컬 개발 환경 설정 가이드

## 현재 상태

✅ **환경 변수 파일 설정 완료**
- `backend/.env` - 백엔드 환경 변수 (치지직 OAuth 정보 포함)
- `web/.env.local` - 프론트엔드 환경 변수

⚠️ **데이터베이스 설정 필요**
- PostgreSQL 또는 Docker 설치 필요

## 1단계: 데이터베이스 설치 (선택)

### 옵션 A: Docker Desktop 사용 (권장)

1. **Docker Desktop 설치**
   - https://www.docker.com/products/docker-desktop/
   - 설치 후 Docker Desktop 실행

2. **PostgreSQL 컨테이너 실행**
   ```powershell
   docker run --name melt-postgres `
       -e POSTGRES_PASSWORD=postgres `
       -e POSTGRES_DB=melt `
       -p 5432:5432 `
       -d postgres:14
   ```

3. **데이터베이스 설정**
   ```powershell
   # 스키마 적용
   Get-Content backend\db\schema.sql | docker exec -i melt-postgres psql -U postgres -d melt
   Get-Content backend\db\migrations\001_add_channel_urls.sql | docker exec -i melt-postgres psql -U postgres -d melt
   Get-Content backend\db\migrations\002_add_follows_and_reads.sql | docker exec -i melt-postgres psql -U postgres -d melt
   ```

### 옵션 B: PostgreSQL 직접 설치

1. **PostgreSQL 다운로드 및 설치**
   - https://www.postgresql.org/download/windows/
   - 설치 시 비밀번호를 `postgres`로 설정 (또는 `.env` 파일 수정)

2. **PATH에 추가**
   - PostgreSQL 설치 경로의 `bin` 폴더를 PATH에 추가
   - 예: `C:\Program Files\PostgreSQL\14\bin`

3. **데이터베이스 생성 및 설정**
   ```powershell
   # 데이터베이스 생성
   $env:PGPASSWORD = "postgres"
   psql -U postgres -c "CREATE DATABASE melt;"
   
   # 스키마 적용
   psql -U postgres -d melt -f backend\db\schema.sql
   psql -U postgres -d melt -f backend\db\migrations\001_add_channel_urls.sql
   psql -U postgres -d melt -f backend\db\migrations\002_add_follows_and_reads.sql
   ```

### 옵션 C: 데이터베이스 없이 시작 (개발 모드)

데이터베이스 없이도 백엔드 서버는 실행됩니다. 다만 실제 데이터 저장은 되지 않습니다.

## 2단계: 백엔드 서버 실행

```powershell
cd backend
npm install  # 처음 실행 시
npm run dev
```

백엔드는 `http://localhost:3001`에서 실행됩니다.

**확인:**
- http://localhost:3001/health 접속하여 서버 상태 확인

## 3단계: 프론트엔드 서버 실행

새 터미널에서:

```powershell
cd web
npm install  # 처음 실행 시
npm run dev
```

프론트엔드는 `http://localhost:3000`에서 실행됩니다.

## 4단계: 치지직 OAuth 설정 확인

### 치지직 개발자 포털 설정

1. **개발자 포털 접속**
   - https://developers.chzzk.naver.com/
   - 로그인 후 "애플리케이션 관리" → "애플리케이션 정보" 확인

2. **Redirect URI 확인**
   - 현재 설정: `http://localhost:3001/auth/chzzk/callback`
   - 개발자 포털에 등록된 Redirect URI와 일치해야 합니다

3. **Client ID / Secret 확인**
   - `backend/.env` 파일에 이미 설정되어 있습니다:
     - `CHZZK_CLIENT_ID=adbe2be0-a1c7-43a5-bdfd-408491968f3b`
     - `CHZZK_CLIENT_SECRET=ahHose2CWgcApBBrxtlmzPf5THLxEURXwr5s7uc2OFk`

## 5단계: 테스트

### 개발 모드 로그인 (데이터베이스 없이도 가능)

1. 브라우저에서 `http://localhost:3000/dev/login` 접속
2. 더미 유저로 로그인:
   - `creator_1` - 크리에이터
   - `viewer_1` - 시청자

### 실제 OAuth 로그인 (데이터베이스 필요)

1. 브라우저에서 `http://localhost:3000/auth/naver` 접속
2. "네이버로 시작하기" 클릭
3. 치지직 OAuth 페이지로 리다이렉트
4. 네이버 계정으로 로그인 및 권한 동의
5. 자동으로 Melt로 돌아와서 온보딩 또는 메인 페이지로 이동

## 환경 변수 파일 구조

### backend/.env (Git에 커밋하지 않음)
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/melt
JWT_SECRET=...
ENCRYPTION_KEY=...
CHZZK_CLIENT_ID=...
CHZZK_CLIENT_SECRET=...
CHZZK_REDIRECT_URI=http://localhost:3001/auth/chzzk/callback
FRONTEND_URL=http://localhost:3000
PORT=3001
NODE_ENV=development
```

### web/.env.local (Git에 커밋하지 않음)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FORCE_MOCK=false
```

## 문제 해결

### 백엔드 서버가 시작되지 않는 경우

1. **포트 충돌 확인**
   ```powershell
   netstat -ano | findstr :3001
   ```

2. **Node 프로세스 종료**
   ```powershell
   Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force
   ```

3. **의존성 재설치**
   ```powershell
   cd backend
   Remove-Item -Recurse -Force node_modules
   npm install
   ```

### 데이터베이스 연결 오류

1. PostgreSQL이 실행 중인지 확인
2. `.env` 파일의 `DATABASE_URL` 확인
3. 데이터베이스 `melt`가 생성되었는지 확인
4. 비밀번호가 올바른지 확인

### OAuth 로그인 실패

1. 치지직 개발자 포털에서 Redirect URI 확인
2. `CHZZK_CLIENT_ID`와 `CHZZK_CLIENT_SECRET` 확인
3. 브라우저 콘솔에서 에러 메시지 확인

## 다음 단계

데이터베이스 설정 후:
1. 더미 데이터 생성: `cd backend; npm run seed`
2. 실제 OAuth 로그인 테스트
3. 모든 기능 테스트
