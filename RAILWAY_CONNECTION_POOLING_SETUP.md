# Railway Connection Pooling 설정 가이드

## 현재 문제
IPv6 연결 오류가 계속 발생하고 있습니다. Connection Pooling으로 전환해야 합니다.

## 해결 방법: Supabase Connection Pooling 사용

### 1단계: Connection Pooling URL 구성

Connection string 섹션이 보이지 않으면 직접 구성할 수 있습니다.

**필요한 정보**:
- Project Reference ID: `pqafhdeeooxpyuocydxa` ✅
- 비밀번호: `blockwave0806!` → URL 인코딩: `blockwave0806%21` ✅
- 리전: ap-northeast-2 (한국) - Settings → General에서 확인 가능

**Session Mode (포트 6543) - 권장**:
```
postgresql://postgres.pqafhdeeooxpyuocydxa:blockwave0806%21@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require
```

**Transaction Mode (포트 5432)**:
```
postgresql://postgres.pqafhdeeooxpyuocydxa:blockwave0806%21@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require
```

**참고**: 리전이 다를 수 있습니다. Settings → General에서 Region 확인 후 호스트명 조정 필요할 수 있습니다.

### 2단계: 비밀번호 URL 인코딩

비밀번호: `blockwave0806!`
- 인코딩: `blockwave0806%21`

### 3단계: 최종 Connection String 구성

**리전 확인**: Settings → General에서 Region 확인 (일반적으로 `ap-northeast-2` - 서울)

**Session Mode (권장) - ap-northeast-2 리전**:
```
postgresql://postgres.pqafhdeeooxpyuocydxa:blockwave0806%21@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require
```

**다른 리전인 경우**: `aws-0-[리전].pooler.supabase.com` 형식으로 호스트명 변경

**Transaction Mode**:
```
postgresql://postgres.pqafhdeeooxpyuocydxa:blockwave0806%21@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require
```

**중요**: 
- 호스트명이 `.pooler.supabase.com`으로 변경됨
- 사용자명이 `postgres.[PROJECT-REF]` 형식으로 변경됨
- 포트가 `6543` (Session) 또는 `5432` (Transaction)로 변경됨
- 리전에 따라 호스트명이 다를 수 있음

### 4단계: Railway 환경 변수 업데이트

1. **Railway 대시보드** → 프로젝트 선택
2. **Settings** → **Variables** 탭
3. `DATABASE_URL` 변수 찾기
4. **"..."** 메뉴 클릭 → **"Edit"** 선택
5. 위에서 구성한 Connection Pooling URL로 업데이트
6. **"Save"** 클릭

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

## Connection Pooling 모드 차이

### Session Mode (포트 6543) - 권장
- **장점**: 일반적인 웹 애플리케이션에 적합
- **특징**: 세션 레벨에서 연결 관리
- **사용 시나리오**: 대부분의 경우

### Transaction Mode (포트 5432)
- **장점**: 더 많은 동시 연결 지원
- **특징**: 트랜잭션 레벨에서 연결 관리
- **사용 시나리오**: 높은 동시성 요구사항

## 문제 해결

### Connection String을 찾을 수 없는 경우

1. Supabase 대시보드에서 **Settings** → **Database**
2. **Connection string** 섹션 확인
3. **"Connection pooling"** 탭이 보이지 않으면:
   - 프로젝트가 최신 버전인지 확인
   - Supabase 지원팀에 문의

### 여전히 연결 실패하는 경우

1. **비밀번호 인코딩 확인**: `!` → `%21`
2. **sslmode=require 포함 확인**
3. **호스트명 정확성 확인**: `.pooler.supabase.com`
4. **사용자명 형식 확인**: `postgres.[PROJECT-REF]`

## 체크리스트

- [ ] Supabase Connection Pooling URL 확인
- [ ] 비밀번호 URL 인코딩 (`blockwave0806%21`)
- [ ] Connection String 구성 완료
- [ ] Railway `DATABASE_URL` 업데이트
- [ ] 재배포 완료
- [ ] Health Check 통과
