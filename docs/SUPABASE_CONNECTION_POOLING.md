# Supabase Connection Pooling 사용 가이드

## 문제 상황

Railway 배포 시 IPv6 연결 오류가 계속 발생:
```
데이터베이스 연결 실패: connect ENETUNREACH 2406:da14:271:9915:1eda:454c:5bf7:2298:5432
```

## 해결 방법: Connection Pooling 사용

Supabase Connection Pooling을 사용하면 IPv4 연결을 사용하여 문제를 해결할 수 있습니다.

### 1. Supabase에서 Connection Pooling 정보 확인

1. **Supabase 대시보드** → **Settings** → **Database**
2. **Connection string** 섹션에서 **"Connection pooling"** 탭 선택
3. **Session mode** 또는 **Transaction mode** 선택
4. Connection String 확인 (포트가 `6543` 또는 다른 포트로 변경됨)

### 2. DATABASE_URL 업데이트

**기존 (Direct Connection)**:
```
postgresql://postgres:blockwave0806%21@db.pqafhdeeooxpyuocydxa.supabase.co:5432/postgres?sslmode=require
```

**변경 후 (Connection Pooling - Session Mode)**:
```
postgresql://postgres.pqafhdeeooxpyuocydxa:blockwave0806%21@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require
```

**또는 (Transaction Mode)**:
```
postgresql://postgres.pqafhdeeooxpyuocydxa:blockwave0806%21@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require
```

**중요 사항**:
- 호스트명이 `.pooler.supabase.com`으로 변경됨
- 사용자명이 `postgres.[PROJECT-REF]` 형식으로 변경됨
- 포트가 `6543` (Session mode) 또는 `5432` (Transaction mode)로 변경됨

### 3. Railway 환경 변수 업데이트

1. **Railway** → **Settings** → **Variables**
2. `DATABASE_URL` 변수 찾기
3. **Edit** 클릭
4. Connection Pooling URL로 업데이트
5. **Save** 클릭

### 4. 재배포 확인

1. **Deployments** 탭에서 배포 상태 확인
2. **View Logs**에서 연결 로그 확인
3. Health Check:
   ```
   https://melt-app-production.up.railway.app/health
   ```

## Connection Pooling 모드 차이

### Session Mode (포트 6543)
- **장점**: 일반적인 애플리케이션에 적합
- **특징**: 세션 레벨에서 연결 관리
- **사용 시나리오**: 대부분의 웹 애플리케이션

### Transaction Mode (포트 5432)
- **장점**: 더 많은 동시 연결 지원
- **특징**: 트랜잭션 레벨에서 연결 관리
- **사용 시나리오**: 높은 동시성 요구사항

## 대안: IPv4 강제 설정 (코드 수정)

코드에서 IPv4를 우선하도록 설정 (이미 적용됨):
- `dns.setDefaultResultOrder('ipv4first')` 추가
- Node.js가 IPv4를 우선적으로 사용하도록 설정

하지만 이 방법이 작동하지 않으면 Connection Pooling 사용을 권장합니다.

## 체크리스트

- [ ] Supabase Connection Pooling 정보 확인
- [ ] DATABASE_URL을 Pooling URL로 업데이트
- [ ] Railway 환경 변수 업데이트
- [ ] 재배포 및 연결 확인
- [ ] Health Check 통과 확인
