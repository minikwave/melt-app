# Connection Pooling "Tenant or user not found" 오류 해결

## 오류 메시지

```
데이터베이스 연결 실패: Tenant or user not found
```

## 원인

Connection Pooling을 사용할 때 사용자명 형식이 잘못되었습니다.

## 해결 방법

### Connection Pooling 사용 시 올바른 형식

**사용자명**: `postgres.[PROJECT-REF]` 형식이어야 합니다.

**올바른 Connection String**:
```
postgresql://postgres.pqafhdeeooxpyuocydxa:blockwave0806%21@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require
```

**잘못된 형식** (Direct connection):
```
postgresql://postgres:blockwave0806%21@db.pqafhdeeooxpyuocydxa.supabase.co:5432/postgres?sslmode=require
```

## Railway 환경 변수 확인

1. **Railway** → **Settings** → **Variables**
2. `DATABASE_URL` 변수 확인
3. 사용자명이 `postgres.pqafhdeeooxpyuocydxa` 형식인지 확인
4. 호스트명이 `.pooler.supabase.com`인지 확인
5. 포트가 `6543` (Session mode)인지 확인

## 올바른 Connection Pooling URL

**Session Mode (포트 6543) - 권장**:
```
postgresql://postgres.pqafhdeeooxpyuocydxa:blockwave0806%21@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require
```

**중요 사항**:
- ✅ 사용자명: `postgres.pqafhdeeooxpyuocydxa` (점 포함)
- ✅ 호스트명: `.pooler.supabase.com`
- ✅ 포트: `6543` (Session mode)
- ✅ 비밀번호 인코딩: `blockwave0806%21`

## 리전이 다른 경우

리전에 따라 호스트명이 다를 수 있습니다:
- **ap-northeast-2** (서울): `aws-0-ap-northeast-2.pooler.supabase.com`
- **us-east-1** (버지니아): `aws-0-us-east-1.pooler.supabase.com`
- **eu-west-1** (아일랜드): `aws-0-eu-west-1.pooler.supabase.com`

Settings → General에서 Region 확인 후 호스트명 조정

## 체크리스트

- [ ] Railway `DATABASE_URL`에 사용자명이 `postgres.pqafhdeeooxpyuocydxa` 형식인지 확인
- [ ] 호스트명이 `.pooler.supabase.com`인지 확인
- [ ] 포트가 `6543`인지 확인
- [ ] 비밀번호가 `blockwave0806%21`로 인코딩되었는지 확인
- [ ] `sslmode=require` 포함 여부 확인
