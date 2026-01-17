# 데이터베이스 비밀번호 설정 가이드

## 1. 로컬 PostgreSQL 비밀번호 설정

### 방법 1: PostgreSQL 설치 시 설정

PostgreSQL 설치 과정에서 비밀번호를 설정할 수 있습니다:
- 기본 사용자: `postgres`
- 설치 시 설정한 비밀번호를 `.env` 파일에 사용

### 방법 2: 설치 후 비밀번호 변경

#### Windows (PowerShell)
```powershell
# PostgreSQL이 PATH에 있는 경우
psql -U postgres

# psql 접속 후
ALTER USER postgres PASSWORD '새로운비밀번호';
\q
```

#### Docker 사용 시
```powershell
# Docker 컨테이너 접속
docker exec -it melt-postgres psql -U postgres

# 비밀번호 변경
ALTER USER postgres PASSWORD '새로운비밀번호';
\q
```

### 방법 3: 환경 변수로 비밀번호 설정

`.env` 파일에서 직접 설정:
```env
DATABASE_URL=postgresql://postgres:새로운비밀번호@localhost:5432/melt
```

## 2. 비밀번호 설정 위치

### 로컬 개발 환경

#### backend/.env 파일
```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/melt

# 또는 개별 변수로 설정 (pool.ts에서 조합)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=melt
```

### 비밀번호에 특수문자가 있는 경우

특수문자는 URL 인코딩이 필요합니다:

| 문자 | 인코딩 |
|------|--------|
| `@` | `%40` |
| `#` | `%23` |
| `$` | `%24` |
| `%` | `%25` |
| `&` | `%26` |
| `+` | `%2B` |
| `=` | `%3D` |
| `?` | `%3F` |
| `/` | `%2F` |
| `:` | `%3A` |

**예시**:
```env
# 비밀번호가 "my@pass#123"인 경우
DATABASE_URL=postgresql://postgres:my%40pass%23123@localhost:5432/melt
```

### 비밀번호 생성 도구

온라인 URL 인코더 사용:
- https://www.urlencoder.org/
- 또는 PowerShell에서:
```powershell
[System.Web.HttpUtility]::UrlEncode("my@pass#123")
```

## 3. Supabase 비밀번호 설정

### Supabase 프로젝트 생성 시

1. **Supabase 대시보드 접속**
   ```
   https://app.supabase.com/
   ```

2. **새 프로젝트 생성**
   - 프로젝트 이름 입력
   - 데이터베이스 비밀번호 설정 (강력한 비밀번호 권장)
   - 리전 선택

3. **연결 정보 확인**
   - 프로젝트 설정 → Database → Connection string
   - 연결 문자열 형식:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
     ```

### Supabase 비밀번호 재설정

1. **Supabase 대시보드** → 프로젝트 선택
2. **Settings** → **Database**
3. **Database Password** 섹션에서 "Reset database password" 클릭
4. 새 비밀번호 설정

### Supabase 연결 문자열 형식

```env
# Supabase 연결 문자열
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require

# 예시
DATABASE_URL=postgresql://postgres:MySecurePassword123@db.abcdefghijklmnop.supabase.co:5432/postgres?sslmode=require
```

**중요**: Supabase는 SSL이 필수이므로 `sslmode=require`를 포함해야 합니다.

## 4. Railway 비밀번호 설정

### Railway PostgreSQL 서비스 생성

1. **Railway 대시보드 접속**
   ```
   https://railway.app/
   ```

2. **새 프로젝트 생성**
   - "New Project" 클릭
   - "Add Service" → "Database" → "Add PostgreSQL"

3. **연결 정보 확인**
   - PostgreSQL 서비스 클릭
   - "Variables" 탭에서 연결 정보 확인:
     - `PGHOST`
     - `PGPORT`
     - `PGUSER`
     - `PGPASSWORD`
     - `PGDATABASE`

### Railway 연결 문자열

Railway는 자동으로 환경 변수를 생성합니다:
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/railway
```

**Railway에서 확인하는 방법**:
1. PostgreSQL 서비스 → "Variables" 탭
2. `DATABASE_URL` 변수 확인 (자동 생성됨)

### Railway 비밀번호 변경

Railway에서는 PostgreSQL 비밀번호를 직접 변경할 수 없습니다. 대신:
1. 새 PostgreSQL 서비스 생성
2. 데이터 마이그레이션
3. 환경 변수 업데이트

또는 Railway CLI 사용:
```bash
railway variables set PGPASSWORD=새로운비밀번호
```

## 5. 보안 모범 사례

### ✅ 권장 사항

1. **강력한 비밀번호 사용**
   - 최소 16자
   - 대소문자, 숫자, 특수문자 조합
   - 예: `MySecure@Pass#2024!`

2. **환경 변수 사용**
   - 코드에 비밀번호 하드코딩 금지
   - `.env` 파일 사용
   - `.gitignore`에 `.env` 추가

3. **비밀번호 관리 도구 사용**
   - 1Password, LastPass 등
   - 또는 환경 변수 관리 서비스

4. **정기적인 비밀번호 변경**
   - 프로덕션 환경: 3-6개월마다
   - 개발 환경: 필요 시

### ❌ 피해야 할 것

1. **Git에 비밀번호 커밋**
   ```bash
   # .gitignore에 추가
   .env
   .env.local
   .env.*.local
   ```

2. **약한 비밀번호**
   - `password`, `123456`, `postgres` 등

3. **공유된 비밀번호**
   - 팀원 간 비밀번호 공유 대신 개별 계정 사용

## 6. 환경별 비밀번호 관리

### 로컬 개발
```env
# backend/.env (로컬 전용)
DATABASE_URL=postgresql://postgres:localdev123@localhost:5432/melt
```

### 스테이징 환경
```env
# Railway 또는 Supabase 스테이징 프로젝트
DATABASE_URL=postgresql://postgres:[STAGING-PASSWORD]@[HOST]:5432/melt
```

### 프로덕션 환경
```env
# Railway 또는 Supabase 프로덕션 프로젝트
DATABASE_URL=postgresql://postgres:[PROD-PASSWORD]@[HOST]:5432/melt?sslmode=require
```

## 7. 문제 해결

### 오류: "password authentication failed"

**원인**: 비밀번호가 잘못됨

**해결**:
1. `.env` 파일의 비밀번호 확인
2. PostgreSQL 비밀번호 확인:
   ```powershell
   psql -U postgres -c "SELECT current_user;"
   ```
3. 비밀번호 재설정 후 `.env` 업데이트

### 오류: "client password must be a string"

**원인**: 비밀번호가 URL 인코딩되지 않음

**해결**:
1. 특수문자 URL 인코딩
2. 또는 특수문자 없는 비밀번호 사용

### 오류: "connection refused"

**원인**: PostgreSQL 서버가 실행되지 않음

**해결**:
1. PostgreSQL 서비스 시작
2. Docker 컨테이너 실행 확인
3. 포트 5432 사용 가능 여부 확인

## 8. 체크리스트

### 로컬 개발 환경 설정
- [ ] PostgreSQL 설치 또는 Docker 실행
- [ ] 데이터베이스 `melt` 생성
- [ ] 비밀번호 설정
- [ ] `.env` 파일에 `DATABASE_URL` 설정
- [ ] 연결 테스트 (`npm run dev` 후 로그 확인)

### Supabase 설정
- [ ] Supabase 프로젝트 생성
- [ ] 데이터베이스 비밀번호 설정
- [ ] 연결 문자열 복사
- [ ] `.env` 파일에 연결 문자열 설정
- [ ] SSL 모드 확인 (`sslmode=require`)

### Railway 설정
- [ ] Railway 프로젝트 생성
- [ ] PostgreSQL 서비스 추가
- [ ] `DATABASE_URL` 환경 변수 확인
- [ ] 연결 테스트

## 9. 참고 자료

- [PostgreSQL 비밀번호 설정](https://www.postgresql.org/docs/current/sql-alteruser.html)
- [Supabase 연결 가이드](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Railway PostgreSQL 가이드](https://docs.railway.app/databases/postgresql)
- [URL 인코딩 도구](https://www.urlencoder.org/)
