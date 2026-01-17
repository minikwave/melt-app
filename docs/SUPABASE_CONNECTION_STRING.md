# Supabase Connection String 찾는 방법

## 1. Supabase 대시보드 접속

1. **Supabase 대시보드 접속**
   ```
   https://app.supabase.com/
   ```

2. **프로젝트 선택**
   - 배포할 프로젝트 클릭

## 2. Connection String 찾기

### 방법 1: Settings → Database (권장)

1. **왼쪽 메뉴** → **"Settings"** (톱니바퀴 아이콘) 클릭
2. **"Database"** 탭 클릭
3. **"Connection string"** 섹션 찾기
4. **"URI"** 탭 선택
5. 연결 문자열 확인:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

### 방법 2: Connection Pooling

1. **Settings** → **Database**
2. **"Connection string"** 섹션
3. **"Connection pooling"** 탭 선택 (선택적)
4. Session 모드 또는 Transaction 모드 선택

### 방법 3: Connection Info 섹션

**Settings** → **Database**에서 다음 정보 확인:
- **Host**: `db.[PROJECT-REF].supabase.co`
- **Database name**: `postgres`
- **Port**: `5432`
- **User**: `postgres`
- **Password**: 프로젝트 생성 시 설정한 비밀번호

## 3. Connection String 형식

### 기본 형식
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### SSL 필수 형식 (Railway/Vercel 배포 시)
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

### 예시
```
postgresql://postgres:MySecurePassword123@db.abcdefghijklmnop.supabase.co:5432/postgres?sslmode=require
```

## 4. 비밀번호 확인

비밀번호를 잊어버린 경우:

1. **Settings** → **Database**
2. **"Database password"** 섹션
3. **"Reset database password"** 클릭
4. 새 비밀번호 설정

## 5. Project Reference ID 확인

Connection string에 포함된 `[PROJECT-REF]`는:

1. **Settings** → **General**
2. **"Reference ID"** 확인
3. 또는 URL에서 확인: `https://app.supabase.com/project/[PROJECT-REF]`

## 6. Connection String 복사

1. **Settings** → **Database** → **Connection string**
2. **"URI"** 탭 선택
3. **"Copy"** 버튼 클릭 또는 텍스트 선택 후 복사
4. **중요**: `[YOUR-PASSWORD]` 부분을 실제 비밀번호로 교체

## 7. Railway/Vercel에 설정

### Railway (백엔드)
```env
DATABASE_URL=postgresql://postgres:[실제-비밀번호]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

### 주의사항
- `[YOUR-PASSWORD]`를 실제 비밀번호로 교체
- `sslmode=require` 추가 (프로덕션 필수)
- 특수문자가 포함된 비밀번호는 URL 인코딩 필요

## 8. 연결 테스트

### Railway에서 테스트
```bash
# Railway CLI 사용
railway run node -e "console.log(process.env.DATABASE_URL)"
```

### 또는 Health Check
```bash
curl https://[Railway-도메인]/health
```

응답에서 `"database": "connected"` 확인

## 체크리스트

- [ ] Supabase 프로젝트 생성 완료
- [ ] Settings → Database 접속
- [ ] Connection string 확인
- [ ] 비밀번호 확인/설정
- [ ] Project Reference ID 확인
- [ ] Connection string 복사
- [ ] `sslmode=require` 추가 확인
- [ ] Railway 환경 변수에 설정
