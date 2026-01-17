# Supabase SQL 실행 가이드

## 방법 1: Supabase 대시보드 SQL Editor 사용 (권장)

### 1.1 SQL Editor 접속

1. **Supabase 대시보드 접속**
   ```
   https://app.supabase.com/
   ```

2. **프로젝트 선택**
   - 배포할 프로젝트 클릭

3. **SQL Editor 열기**
   - 왼쪽 메뉴에서 **"SQL Editor"** 클릭
   - 또는 상단 메뉴에서 **"SQL Editor"** 선택

### 1.2 새 쿼리 생성

1. **"New query"** 버튼 클릭
2. 또는 **"+"** 아이콘 클릭

### 1.3 SQL 파일 내용 복사 및 실행

#### 스키마 적용

1. **`backend/db/schema.sql` 파일 열기**
2. **전체 내용 복사** (`Ctrl+A` → `Ctrl+C`)
3. **Supabase SQL Editor에 붙여넣기** (`Ctrl+V`)
4. **"Run"** 버튼 클릭 또는 `Ctrl+Enter`
5. **결과 확인**: "Success. No rows returned" 메시지 확인

#### 마이그레이션 파일 실행

같은 방식으로 다음 파일들을 **순서대로** 실행:

1. **`backend/db/migrations/001_add_channel_urls.sql`**
   - 파일 내용 복사
   - SQL Editor에 붙여넣기
   - Run 클릭

2. **`backend/db/migrations/002_add_follows_and_reads.sql`**
   - 파일 내용 복사
   - SQL Editor에 붙여넣기
   - Run 클릭

3. **`backend/db/migrations/003_add_user_profile_fields.sql`**
   - 파일 내용 복사
   - SQL Editor에 붙여넣기
   - Run 클릭

### 1.4 실행 결과 확인

**성공 시**:
```
Success. No rows returned
```

**오류 시**:
- 빨간색 오류 메시지 표시
- 오류 내용 확인 및 수정

### 1.5 쿼리 저장 (선택적)

1. **"Save"** 버튼 클릭
2. 쿼리 이름 입력 (예: "Melt Schema")
3. 나중에 재사용 가능

## 방법 2: Supabase CLI 사용

### 2.1 Supabase CLI 설치

```bash
# npm으로 설치
npm install -g supabase

# 또는 Homebrew (Mac)
brew install supabase/tap/supabase
```

### 2.2 Supabase 로그인

```bash
supabase login
```

브라우저가 열리면 로그인하여 인증

### 2.3 프로젝트 연결

```bash
# 프로젝트 참조 ID 확인
# Supabase 대시보드 → Settings → General → Reference ID

supabase link --project-ref [YOUR-PROJECT-REF]
```

예시:
```bash
supabase link --project-ref abcdefghijklmnop
```

### 2.4 스키마 적용

```bash
# 프로젝트 루트에서 실행
cd backend

# 스키마 파일을 직접 실행
psql [DATABASE_URL] -f db/schema.sql

# 또는 Supabase CLI 사용
supabase db push
```

### 2.5 마이그레이션 실행

```bash
# 마이그레이션 파일들을 순서대로 실행
psql [DATABASE_URL] -f db/migrations/001_add_channel_urls.sql
psql [DATABASE_URL] -f db/migrations/002_add_follows_and_reads.sql
psql [DATABASE_URL] -f db/migrations/003_add_user_profile_fields.sql
```

## 방법 3: psql 직접 사용

### 3.1 연결 문자열 사용

```bash
# Supabase 연결 문자열로 직접 연결
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require"

# 또는 환경 변수 사용
export PGPASSWORD="[PASSWORD]"
psql -h db.[PROJECT-REF].supabase.co -U postgres -d postgres -p 5432
```

### 3.2 SQL 파일 실행

```bash
# 스키마 실행
psql [DATABASE_URL] -f backend/db/schema.sql

# 마이그레이션 실행
psql [DATABASE_URL] -f backend/db/migrations/001_add_channel_urls.sql
psql [DATABASE_URL] -f backend/db/migrations/002_add_follows_and_reads.sql
psql [DATABASE_URL] -f backend/db/migrations/003_add_user_profile_fields.sql
```

## 방법 4: Table Editor에서 확인

### 4.1 테이블 확인

1. **Supabase 대시보드** → **"Table Editor"** 클릭
2. 생성된 테이블 확인:
   - `users`
   - `channels`
   - `messages`
   - `donation_intents`
   - `donation_events`
   - `user_follows`
   - `message_reads`
   - 등등

### 4.2 데이터 확인

- 각 테이블을 클릭하여 구조 확인
- 데이터가 있는지 확인

## 실행 순서 (중요!)

**반드시 다음 순서로 실행해야 합니다:**

1. ✅ **`schema.sql`** - 기본 스키마 및 테이블 생성
2. ✅ **`001_add_channel_urls.sql`** - 채널 URL 필드 추가
3. ✅ **`002_add_follows_and_reads.sql`** - 팔로우 및 읽음 기능 추가
4. ✅ **`003_add_user_profile_fields.sql`** - 프로필 필드 추가

## 문제 해결

### 오류: "relation already exists"

**원인**: 이미 테이블이 존재함

**해결**:
- SQL 파일에 `IF NOT EXISTS`가 포함되어 있으면 무시해도 됨
- 또는 기존 테이블 삭제 후 재실행 (주의: 데이터 손실)

### 오류: "permission denied"

**원인**: 권한 부족

**해결**:
- `postgres` 사용자로 실행 확인
- Supabase 대시보드에서 실행 시 자동으로 올바른 권한 사용

### 오류: "connection refused"

**원인**: 연결 문자열 오류 또는 방화벽

**해결**:
1. 연결 문자열 확인 (`sslmode=require` 포함 여부)
2. Supabase 대시보드에서 실행 (권장)

## 실행 확인

### SQL Editor에서 확인

```sql
-- 테이블 목록 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- users 테이블 구조 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';
```

### Table Editor에서 확인

1. **Table Editor** → 테이블 목록 확인
2. 각 테이블 클릭하여 구조 확인

## 체크리스트

- [ ] Supabase 프로젝트 생성 완료
- [ ] SQL Editor 접속
- [ ] `schema.sql` 실행
- [ ] `001_add_channel_urls.sql` 실행
- [ ] `002_add_follows_and_reads.sql` 실행
- [ ] `003_add_user_profile_fields.sql` 실행
- [ ] 모든 쿼리 성공 확인
- [ ] Table Editor에서 테이블 확인
- [ ] Railway에서 연결 테스트

## 참고 자료

- [Supabase SQL Editor 가이드](https://supabase.com/docs/guides/database/tables)
- [Supabase CLI 문서](https://supabase.com/docs/reference/cli/introduction)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)
