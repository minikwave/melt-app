# Railway DATABASE_URL 최종 설정

## 확인된 Connection Pooling URL

**Supabase에서 확인한 URL**:
```
postgresql://postgres.pqafhdeeooxpyuocydxa:[YOUR-PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres
```

**비밀번호**: `blockwave0806!` → URL 인코딩: `blockwave0806%21`

## 최종 Connection String (Railway용)

### Transaction Mode (포트 5432)

```
postgresql://postgres.pqafhdeeooxpyuocydxa:blockwave0806%21@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require
```

**중요 사항**:
- ✅ 사용자명: `postgres.pqafhdeeooxpyuocydxa` (점 포함)
- ✅ 호스트명: `aws-1-ap-northeast-1.pooler.supabase.com` (리전: ap-northeast-1)
- ✅ 포트: `5432` (Transaction mode)
- ✅ 비밀번호: `blockwave0806%21` (URL 인코딩)
- ✅ `sslmode=require` 추가

## Railway에 설정하기

### 1단계: Railway 환경 변수 업데이트

1. **Railway 대시보드** → 프로젝트 선택 (`melt-app`)
2. **Settings** → **Variables** 탭
3. `DATABASE_URL` 변수 찾기
4. **"..."** 메뉴 → **"Edit"** 클릭
5. 다음 URL로 **완전히 교체**:
   ```
   postgresql://postgres.pqafhdeeooxpyuocydxa:blockwave0806%21@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require
   ```
6. **"Save"** 클릭

### 2단계: 재배포 확인

1. **Deployments** 탭에서 자동 재배포 확인
   - "Building..." → "Deploying..." → "Active"
2. **View Logs**에서 연결 로그 확인
   - "✅ 데이터베이스 연결 성공" 메시지 확인
   - "Tenant or user not found" 오류가 사라졌는지 확인

### 3단계: Health Check

```
https://melt-app-production.up.railway.app/health
```

**예상 응답**:
```json
{
  "status": "ok",
  "database": "connected"
}
```

## 변경사항 요약

**변경 전 (Direct Connection - 오류 발생)**:
```
postgresql://postgres:blockwave0806%21@db.pqafhdeeooxpyuocydxa.supabase.co:5432/postgres?sslmode=require
```
- 사용자명: `postgres` ❌
- 호스트명: `db.pqafhdeeooxpyuocydxa.supabase.co`
- IPv6 연결 문제, SSL 인증서 문제 발생

**변경 후 (Connection Pooling - 올바름)**:
```
postgresql://postgres.pqafhdeeooxpyuocydxa:blockwave0806%21@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require
```
- 사용자명: `postgres.pqafhdeeooxpyuocydxa` ✅
- 호스트명: `aws-1-ap-northeast-1.pooler.supabase.com` ✅
- IPv4 연결, SSL 문제 해결

## 체크리스트

- [x] Supabase Connection Pooling URL 확인
- [x] 비밀번호 URL 인코딩 (`blockwave0806%21`)
- [x] 리전 확인 (`ap-northeast-1`)
- [x] 포트 확인 (`5432` - Transaction mode)
- [ ] Railway `DATABASE_URL` 업데이트
- [ ] 재배포 완료
- [ ] Health Check 통과

## 문제 해결

### 여전히 "Tenant or user not found" 오류가 발생하는 경우

1. 사용자명이 `postgres.pqafhdeeooxpyuocydxa` 형식인지 확인 (점 포함)
2. 호스트명이 `aws-1-ap-northeast-1.pooler.supabase.com`인지 확인
3. 비밀번호가 `blockwave0806%21`로 인코딩되었는지 확인
4. `sslmode=require` 포함 여부 확인

### 연결 실패하는 경우

1. Railway 로그에서 정확한 오류 메시지 확인
2. Supabase Logs & Analytics에서 연결 시도 확인
3. Connection Pooling 설정 확인 (Pool Size: 15)
