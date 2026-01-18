# SSL 인증서 오류 해결 가이드

## 현재 오류

```
데이터베이스 연결 실패: self-signed certificate in certificate chain
```

## 원인

Supabase의 SSL 인증서가 self-signed이거나 중간 인증서 체인 문제로 인해 발생합니다.

## 해결 방법

### 방법 1: Connection Pooling 사용 (권장)

Connection Pooling을 사용하면 IPv4 연결과 SSL 인증서 문제를 모두 해결할 수 있습니다.

**단계**:
1. Supabase → Settings → Database → Connection pooling
2. Session mode 선택
3. Connection String 복사
4. Railway `DATABASE_URL` 업데이트

**상세 가이드**: `RAILWAY_CONNECTION_POOLING_SETUP.md`

### 방법 2: SSL 설정 확인

현재 코드에서 `rejectUnauthorized: false`가 설정되어 있지만, `connectionString`의 `sslmode=require`와 충돌할 수 있습니다.

**확인 사항**:
1. Railway 환경 변수 `DATABASE_URL`에 `sslmode=require` 포함 여부
2. `poolConfig.ssl.rejectUnauthorized: false` 설정 확인

### 방법 3: sslmode 변경 (임시 해결책)

`sslmode=require` 대신 `sslmode=prefer` 사용:

```
postgresql://postgres:blockwave0806%21@db.pqafhdeeooxpyuocydxa.supabase.co:5432/postgres?sslmode=prefer
```

**주의**: 보안상 권장되지 않지만, 임시로 작동할 수 있습니다.

## 권장 해결책

**Connection Pooling 사용**을 강력히 권장합니다:
- ✅ IPv4 연결 (IPv6 문제 해결)
- ✅ SSL 인증서 문제 해결
- ✅ 더 나은 연결 관리
- ✅ Supabase 공식 권장 방법

## 체크리스트

- [ ] Connection Pooling URL 확인
- [ ] Railway `DATABASE_URL` 업데이트
- [ ] 재배포 및 연결 확인
- [ ] Health Check 통과
