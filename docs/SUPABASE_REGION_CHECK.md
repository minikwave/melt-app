# Supabase 리전 확인 방법

## 리전 확인이 필요한 이유

Connection Pooling URL의 호스트명은 리전에 따라 다릅니다:
- **ap-northeast-2** (서울): `aws-0-ap-northeast-2.pooler.supabase.com`
- **us-east-1** (버지니아): `aws-0-us-east-1.pooler.supabase.com`
- **eu-west-1** (아일랜드): `aws-0-eu-west-1.pooler.supabase.com`

## 리전 확인 방법

### 방법 1: Settings → General에서 확인

1. **Settings** → **General** 탭
2. **Region** 또는 **Infrastructure** 섹션 확인
3. 리전 정보 확인 (예: `ap-northeast-2`, `us-east-1` 등)

### 방법 2: 프로젝트 URL에서 확인

Supabase 대시보드 URL을 확인:
- `https://app.supabase.com/project/pqafhdeeooxpyuocydxa`
- URL에 리전 정보가 포함되어 있을 수 있습니다

### 방법 3: Database Settings에서 확인

1. **Settings** → **Database** 탭
2. **Connection string** 섹션 확인
3. 호스트명에 리전 정보가 포함되어 있을 수 있습니다

### 방법 4: 직접 시도

한국 사용자라면 일반적으로 `ap-northeast-2` (서울) 리전일 가능성이 높습니다.

## Connection Pooling URL 구성

### ap-northeast-2 (서울) - 가장 가능성 높음

**Session Mode (포트 6543)**:
```
postgresql://postgres.pqafhdeeooxpyuocydxa:blockwave0806%21@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require
```

### 다른 리전인 경우

리전을 확인한 후 호스트명만 변경:
- `aws-0-[리전].pooler.supabase.com`

예시:
- **us-east-1**: `aws-0-us-east-1.pooler.supabase.com`
- **eu-west-1**: `aws-0-eu-west-1.pooler.supabase.com`
- **ap-southeast-1**: `aws-0-ap-southeast-1.pooler.supabase.com`

## Railway에 설정

1. 위의 URL을 Railway `DATABASE_URL`에 설정
2. 연결 실패 시 다른 리전 URL 시도
3. 또는 Settings → General에서 정확한 리전 확인
