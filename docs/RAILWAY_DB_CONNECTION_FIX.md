# Railway 데이터베이스 연결 문제 해결

## 문제 상황

Railway 배포 시 다음 오류 발생:
```
데이터베이스 연결 실패: connect ENETUNREACH 2406:da14:271:9915:1eda:454c:5bf7:2298:5432
```

## 원인

1. **IPv6 연결 문제**: Supabase가 IPv6 주소를 반환하는데 Railway에서 IPv6 연결이 차단됨
2. **SSL 설정 문제**: 프로덕션 환경에서 `sslmode=require`가 제대로 설정되지 않음

## 해결 방법

### 1. pool.ts 수정 완료

- ✅ 프로덕션 환경에서 `sslmode=require` 유지
- ✅ SSL 설정 추가 (`rejectUnauthorized: false`)
- ✅ IPv6 연결 오류에 대한 상세한 에러 메시지 추가

### 2. Supabase Network Restrictions 확인

1. **Supabase 대시보드** → **Settings** → **Database**
2. **Network Restrictions** 섹션 확인
3. **"Add restriction"** 또는 **"Restrict all access"** 확인
4. **모든 IP 주소 허용** 설정 확인

### 3. DATABASE_URL 확인

Railway 환경 변수에서 `DATABASE_URL`이 다음 형식인지 확인:

```
postgresql://postgres:blockkwave0806%21@db.pqafhdeeooxpyuocydxa.supabase.co:5432/postgres?sslmode=require
```

**중요 사항**:
- `sslmode=require` 포함 여부
- 비밀번호 인코딩 (`%21`)
- Project Reference ID 정확성

### 4. Railway 재배포

수정사항이 자동으로 배포되면:
1. **Deployments** 탭에서 배포 상태 확인
2. **View Logs**에서 연결 로그 확인
3. Health Check:
   ```
   https://melt-app-production.up.railway.app/health
   ```

## 추가 확인 사항

### Supabase Connection Pooling (선택적)

IPv6 문제가 계속되면 Connection Pooling 사용:

1. **Supabase** → **Settings** → **Database**
2. **Connection pooling** 섹션 확인
3. **Session mode** 또는 **Transaction mode** 선택
4. Connection String 업데이트 (포트 번호 변경)

### Railway 네트워크 설정

Railway에서 IPv4 연결 강제:
- Railway는 기본적으로 IPv4/IPv6 모두 지원
- 문제가 계속되면 Supabase Network Restrictions 확인

## 예상 결과

수정 후:
- ✅ 데이터베이스 연결 성공
- ✅ Health Check: `{"status": "ok", "database": "connected"}`
- ✅ 로그에 "✅ 데이터베이스 연결 성공" 메시지 표시

## 문제가 계속되는 경우

1. **Supabase Network Restrictions** 확인
2. **DATABASE_URL** 정확성 재확인
3. **Railway 로그**에서 상세 오류 확인
4. **Supabase 대시보드**에서 연결 상태 확인
