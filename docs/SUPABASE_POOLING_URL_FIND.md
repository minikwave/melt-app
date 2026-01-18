# Supabase Connection Pooling URL 찾기

## 현재 화면에서 Connection String 찾기

### 방법 1: Connection string 섹션 찾기

1. **현재 화면에서 스크롤을 내려보세요**
   - "Connection pooling configuration" 아래에 "Connection string" 섹션이 있을 수 있습니다

2. **또는 Settings → Database의 다른 탭 확인**
   - 왼쪽 메뉴나 상단 탭에서 "Connection string" 또는 "Connection info" 찾기

### 방법 2: 직접 Connection Pooling URL 구성

Connection string 섹션이 보이지 않으면 직접 구성할 수 있습니다.

## Connection Pooling URL 직접 구성하기

### 필요한 정보
- **Project Reference ID**: `pqafhdeeooxpyuocydxa` (이미 확인됨)
- **비밀번호**: `blockwave0806!` → URL 인코딩: `blockwave0806%21`
- **리전**: 아시아 태평양 (ap-northeast-2) - 한국 리전

### Session Mode (포트 6543) - 권장

```
postgresql://postgres.pqafhdeeooxpyuocydxa:blockwave0806%21@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require
```

### Transaction Mode (포트 5432)

```
postgresql://postgres.pqafhdeeooxpyuocydxa:blockwave0806%21@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require
```

## Railway에 설정하기

1. **Railway 대시보드** → 프로젝트 선택
2. **Settings** → **Variables** 탭
3. `DATABASE_URL` 변수 찾기
4. **"..."** 메뉴 → **"Edit"** 선택
5. 위의 Session Mode URL로 업데이트:
   ```
   postgresql://postgres.pqafhdeeooxpyuocydxa:blockwave0806%21@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require
   ```
6. **"Save"** 클릭

## 리전 확인 방법

만약 위 URL이 작동하지 않으면:

1. **Supabase 대시보드** → **Settings** → **General**
2. **Region** 확인
3. 리전에 따라 호스트명이 다를 수 있습니다:
   - **ap-northeast-2** (서울): `aws-0-ap-northeast-2.pooler.supabase.com`
   - **us-east-1** (버지니아): `aws-0-us-east-1.pooler.supabase.com`
   - **eu-west-1** (아일랜드): `aws-0-eu-west-1.pooler.supabase.com`

## 테스트

Railway에 설정 후:
1. **Deployments** 탭에서 재배포 확인
2. **View Logs**에서 "✅ 데이터베이스 연결 성공" 확인
3. Health Check:
   ```
   https://melt-app-production.up.railway.app/health
   ```
