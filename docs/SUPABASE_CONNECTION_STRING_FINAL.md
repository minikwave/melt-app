# Supabase Connection String 최종 확인 및 설정

## 현재 상황 분석

보여주신 Supabase 대시보드 화면을 기반으로:

1. **Connection Pooling 설정**: 활성화되어 있음 (Pool Size: 15)
2. **SSL 설정**: "Enforce SSL"이 꺼져 있음 (OFF)
3. **Project URL**: `https://pqafhdeeooxpyuocydxa.supabase.co`

## Connection String 찾기

### 방법 1: Settings → Database에서 확인

1. **Supabase 대시보드** → **Settings** → **Database** 탭
2. **Connection string** 섹션 찾기
3. **"Connection pooling"** 탭 클릭
4. **Session mode** 또는 **Transaction mode** 선택
5. Connection String 복사

### 방법 2: 직접 구성 (Connection string 섹션이 없는 경우)

**필요한 정보**:
- Project Reference ID: `pqafhdeeooxpyuocydxa` ✅
- 비밀번호: `blockwave0806!` → URL 인코딩: `blockwave0806%21` ✅
- 리전: 확인 필요 (일반적으로 ap-northeast-2)

## 올바른 Connection Pooling URL

### Session Mode (포트 6543) - 권장

```
postgresql://postgres.pqafhdeeooxpyuocydxa:blockwave0806%21@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require
```

**중요 사항**:
- ✅ 사용자명: `postgres.pqafhdeeooxpyuocydxa` (점 포함, Project ID 포함)
- ✅ 호스트명: `.pooler.supabase.com` (pooler 포함)
- ✅ 포트: `6543` (Session mode)
- ✅ 비밀번호: `blockwave0806%21` (URL 인코딩)

### 리전 확인 방법

1. **Settings** → **General**에서 Region 확인
2. 또는 현재 Direct connection URL의 호스트명 확인:
   - `db.pqafhdeeooxpyuocydxa.supabase.co` → 리전 정보 없음
   - Connection Pooling URL은 리전별로 다름

## Railway 환경 변수 업데이트

### 1단계: 현재 DATABASE_URL 확인

1. **Railway** → **Settings** → **Variables**
2. `DATABASE_URL` 변수 확인
3. 현재 값이 Direct connection인지 확인:
   ```
   postgresql://postgres:blockwave0806%21@db.pqafhdeeooxpyuocydxa.supabase.co:5432/postgres?sslmode=require
   ```

### 2단계: Connection Pooling URL로 업데이트

1. `DATABASE_URL` 변수 → **"..."** 메뉴 → **"Edit"**
2. 다음 URL로 교체:
   ```
   postgresql://postgres.pqafhdeeooxpyuocydxa:blockwave0806%21@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require
   ```
3. **"Save"** 클릭

### 3단계: 리전이 다른 경우

위 URL이 작동하지 않으면:

1. **Settings** → **General**에서 Region 확인
2. 리전에 맞게 호스트명 변경:
   - `ap-northeast-2`: `aws-0-ap-northeast-2.pooler.supabase.com`
   - `us-east-1`: `aws-0-us-east-1.pooler.supabase.com`
   - `eu-west-1`: `aws-0-eu-west-1.pooler.supabase.com`

## SSL 설정 확인

현재 "Enforce SSL"이 OFF로 되어 있지만, Railway에서는 `sslmode=require`를 사용하는 것이 안전합니다.

## 체크리스트

- [ ] Supabase Settings → Database에서 Connection string 섹션 확인
- [ ] Connection pooling 탭에서 Session mode URL 확인
- [ ] 사용자명이 `postgres.pqafhdeeooxpyuocydxa` 형식인지 확인
- [ ] 호스트명이 `.pooler.supabase.com`인지 확인
- [ ] Railway `DATABASE_URL` 업데이트
- [ ] 재배포 및 연결 확인

## 문제 해결

### "Tenant or user not found" 오류

**원인**: 사용자명 형식이 잘못됨
- ❌ 잘못됨: `postgres`
- ✅ 올바름: `postgres.pqafhdeeooxpyuocydxa`

### 연결 실패

1. 리전 확인 (Settings → General)
2. 호스트명 정확성 확인
3. 비밀번호 인코딩 확인 (`%21`)
4. 포트 확인 (`6543` for Session mode)
