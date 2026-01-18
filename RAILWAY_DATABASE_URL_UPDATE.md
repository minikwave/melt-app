# Railway DATABASE_URL 업데이트 가이드

## 현재 오류

```
데이터베이스 연결 실패: Tenant or user not found
```

## 원인

Connection Pooling을 사용할 때 사용자명 형식이 잘못되었습니다.

## 해결 방법

### 1단계: Railway 환경 변수 확인

1. **Railway 대시보드** 접속
2. 프로젝트 선택: `melt-app`
3. **Settings** → **Variables** 탭
4. `DATABASE_URL` 변수 찾기

### 2단계: 현재 값 확인

현재 값이 다음과 같은지 확인:
```
postgresql://postgres:blockwave0806%21@db.pqafhdeeooxpyuocydxa.supabase.co:5432/postgres?sslmode=require
```

이것은 **Direct connection** 형식입니다.

### 3단계: Connection Pooling URL로 업데이트

1. `DATABASE_URL` 변수 → **"..."** 메뉴 → **"Edit"** 클릭
2. 다음 URL로 **완전히 교체**:
   ```
   postgresql://postgres.pqafhdeeooxpyuocydxa:blockwave0806%21@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require
   ```
3. **"Save"** 클릭

### 4단계: 변경사항 확인

**변경 전 (Direct Connection)**:
- 사용자명: `postgres`
- 호스트명: `db.pqafhdeeooxpyuocydxa.supabase.co`
- 포트: `5432`

**변경 후 (Connection Pooling)**:
- 사용자명: `postgres.pqafhdeeooxpyuocydxa` ✅
- 호스트명: `aws-0-ap-northeast-2.pooler.supabase.com` ✅
- 포트: `6543` ✅

### 5단계: 재배포 확인

1. **Deployments** 탭에서 자동 재배포 확인
2. **View Logs**에서 연결 로그 확인
3. **"✅ 데이터베이스 연결 성공"** 메시지 확인

### 6단계: Health Check

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

## 리전이 다른 경우

위 URL이 작동하지 않으면:

1. **Supabase** → **Settings** → **General**
2. **Region** 확인
3. 리전에 맞게 호스트명 변경:
   - `ap-northeast-2` (서울): `aws-0-ap-northeast-2.pooler.supabase.com`
   - `us-east-1` (버지니아): `aws-0-us-east-1.pooler.supabase.com`
   - `eu-west-1` (아일랜드): `aws-0-eu-west-1.pooler.supabase.com`

## 중요 사항

✅ **사용자명**: 반드시 `postgres.pqafhdeeooxpyuocydxa` 형식 (점 포함)  
✅ **호스트명**: 반드시 `.pooler.supabase.com` 포함  
✅ **포트**: `6543` (Session mode) 또는 `5432` (Transaction mode)  
✅ **비밀번호**: `blockwave0806%21` (URL 인코딩)

## 문제가 계속되는 경우

1. Railway 로그에서 정확한 오류 메시지 확인
2. Supabase Logs & Analytics에서 연결 시도 확인
3. Connection Pooling 설정 확인 (Pool Size: 15)
