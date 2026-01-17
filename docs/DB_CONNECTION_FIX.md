# 데이터베이스 연결 오류 수정 가이드

## 수정된 내용

### 1. `backend/src/db/pool.ts` 개선

#### 주요 변경사항:
- **비밀번호 디코딩**: URL 인코딩된 비밀번호 자동 디코딩
- **향상된 에러 처리**: 구체적인 오류 메시지 및 해결 방법 제시
- **연결 테스트 함수**: `testConnection()` 함수 추가
- **연결 이벤트 핸들러**: 연결 성공/실패 시 명확한 로그 출력

#### 개선된 기능:
```typescript
// 비밀번호가 URL 인코딩되어 있어도 자동 디코딩
if (url.password) {
  url.password = decodeURIComponent(url.password);
}

// 구체적인 오류 메시지
if (error.message.includes('password')) {
  console.error('💡 비밀번호 형식 오류일 수 있습니다.');
}
```

### 2. `backend/src/index.ts` 업데이트

- `testConnection()` 함수 사용으로 더 나은 오류 진단

## 일반적인 연결 오류 해결 방법

### 오류 1: "client password must be a string"

**원인**: DATABASE_URL의 비밀번호가 올바르게 파싱되지 않음

**해결 방법**:
1. `.env` 파일의 `DATABASE_URL` 확인:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/melt
   ```

2. 특수문자가 포함된 비밀번호의 경우 URL 인코딩:
   ```env
   # 비밀번호가 "my@pass#123"인 경우
   DATABASE_URL=postgresql://postgres:my%40pass%23123@localhost:5432/melt
   ```

3. 비밀번호에 특수문자가 없는 경우 그대로 사용:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/melt
   ```

### 오류 2: "ECONNREFUSED"

**원인**: PostgreSQL 서버가 실행되지 않음

**해결 방법**:
```powershell
# PostgreSQL 실행 확인
netstat -ano | findstr :5432

# Docker로 실행 중인 경우
docker ps | findstr postgres

# Docker로 시작
docker start melt-postgres
```

### 오류 3: "database does not exist"

**원인**: `melt` 데이터베이스가 생성되지 않음

**해결 방법**:
```powershell
# Docker 사용 시
docker exec -it melt-postgres psql -U postgres -c "CREATE DATABASE melt;"

# 또는 직접 설치된 경우
psql -U postgres -c "CREATE DATABASE melt;"
```

### 오류 4: "password authentication failed"

**원인**: 비밀번호가 잘못됨

**해결 방법**:
1. PostgreSQL 비밀번호 확인
2. `.env` 파일의 `DATABASE_URL` 비밀번호 수정

## DATABASE_URL 형식

### 올바른 형식:
```
postgresql://username:password@host:port/database
```

### 예시:
```env
# 기본 (비밀번호: postgres)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/melt

# 특수문자 포함 비밀번호 (URL 인코딩 필요)
DATABASE_URL=postgresql://postgres:my%40pass%23123@localhost:5432/melt

# 원격 서버
DATABASE_URL=postgresql://user:pass@192.168.1.100:5432/melt
```

## 연결 테스트

서버 시작 시 자동으로 연결 테스트가 실행됩니다:

```
✅ PostgreSQL 클라이언트 연결됨
✅ 데이터베이스 연결 성공: 2024-01-01 12:00:00
```

연결 실패 시:
```
❌ PostgreSQL 연결 오류: password authentication failed
💡 비밀번호 형식 오류일 수 있습니다. DATABASE_URL의 비밀번호를 확인하세요.
💡 형식: postgresql://username:password@host:port/database
```

## 추가 개선 사항

### 연결 풀 설정
- 최대 연결 수: 20
- 연결 타임아웃: 10초
- 유휴 타임아웃: 30초

### SSL 설정
- 개발 환경: SSL 비활성화
- 프로덕션 환경: SSL 활성화 (환경 변수로 제어)

## 문제 해결 체크리스트

- [ ] PostgreSQL 서버가 실행 중인가?
- [ ] `melt` 데이터베이스가 생성되었는가?
- [ ] `.env` 파일의 `DATABASE_URL`이 올바른가?
- [ ] 비밀번호에 특수문자가 있다면 URL 인코딩되었는가?
- [ ] 포트 5432가 사용 가능한가?
- [ ] 방화벽이 PostgreSQL 포트를 차단하지 않는가?

## 참고 문서

- [PostgreSQL 연결 문자열 문서](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
- [로컬 설정 가이드](../LOCAL_SETUP_GUIDE.md)
- [빠른 시작 가이드](../QUICK_START_WINDOWS.md)
