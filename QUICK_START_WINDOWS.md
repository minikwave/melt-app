# 🚀 Melt 빠른 시작 가이드 (Windows)

## 현재 상태

✅ **백엔드 서버**: `http://localhost:3001` (실행 중)
✅ **프론트엔드 서버**: `http://localhost:3000` (실행 중)

## ⚠️ 데이터베이스 설정 필요

PostgreSQL이 설치되어 있지 않거나 데이터베이스가 설정되지 않았습니다.

### 옵션 1: PostgreSQL 설치 및 설정 (권장)

1. **PostgreSQL 다운로드 및 설치**
   - https://www.postgresql.org/download/windows/
   - 설치 시 비밀번호를 `postgres`로 설정하거나, `.env` 파일의 `DATABASE_URL`을 수정하세요.

2. **데이터베이스 생성**
   ```powershell
   # PostgreSQL 설치 후 psql 실행
   psql -U postgres
   
   # 데이터베이스 생성
   CREATE DATABASE melt;
   \q
   ```

3. **스키마 적용**
   ```powershell
   psql -U postgres -d melt -f backend\db\schema.sql
   psql -U postgres -d melt -f backend\db\migrations\001_add_channel_urls.sql
   psql -U postgres -d melt -f backend\db\migrations\002_add_follows_and_reads.sql
   ```

4. **더미 데이터 생성**
   ```powershell
   cd backend
   npm run seed
   ```

### 옵션 2: Docker로 PostgreSQL 실행

```powershell
# Docker Desktop 설치 후
docker run --name melt-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=melt -p 5432:5432 -d postgres:14

# 스키마 적용
psql -h localhost -U postgres -d melt -f backend\db\schema.sql
psql -h localhost -U postgres -d melt -f backend\db\migrations\001_add_channel_urls.sql
psql -h localhost -U postgres -d melt -f backend\db\migrations\002_add_follows_and_reads.sql

# 더미 데이터
cd backend
npm run seed
```

## 🌐 접속 방법

### 1. 개발 모드 로그인 (데이터베이스 없이도 테스트 가능)

브라우저에서 접속:
```
http://localhost:3000/dev/login
```

더미 유저로 로그인:
- `creator_1` - 크리에이터
- `viewer_1` - 시청자

### 2. 메인 페이지

```
http://localhost:3000
```

## 🔧 서버 재시작

### 백엔드 재시작
```powershell
cd backend
# 기존 프로세스 종료 후
npm run dev
```

### 프론트엔드 재시작
```powershell
cd web
# 기존 프로세스 종료 후
npm run dev
```

## 📝 환경 변수 확인

백엔드 `.env` 파일 위치: `backend\.env`

필수 변수:
- `DATABASE_URL`: PostgreSQL 연결 문자열
- `JWT_SECRET`: JWT 토큰 서명 키
- `PORT`: 백엔드 포트 (기본: 3001)
- `FRONTEND_URL`: 프론트엔드 URL (기본: http://localhost:3000)

## 🐛 문제 해결

### 서버가 시작되지 않는 경우

1. **포트 충돌 확인**
   ```powershell
   netstat -ano | findstr :3001
   netstat -ano | findstr :3000
   ```

2. **Node 프로세스 종료**
   ```powershell
   Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process
   ```

3. **의존성 재설치**
   ```powershell
   cd backend
   Remove-Item -Recurse -Force node_modules
   npm install
   
   cd ..\web
   Remove-Item -Recurse -Force node_modules
   npm install
   ```

### 데이터베이스 연결 오류

1. PostgreSQL이 실행 중인지 확인
2. `.env` 파일의 `DATABASE_URL` 확인
3. 데이터베이스 `melt`가 생성되었는지 확인

## ✅ 다음 단계

데이터베이스 설정 후:
1. `http://localhost:3000/dev/login` 접속
2. 더미 유저로 로그인
3. 모든 기능 테스트
