# Supabase Connection String 수동 구성 가이드

## Connection String이 보이지 않는 경우

Supabase UI가 업데이트되어 Connection string 섹션이 보이지 않을 수 있습니다. 이 경우 수동으로 구성할 수 있습니다.

## 1. Project Reference ID 확인

### 방법 1: URL에서 확인
1. Supabase 대시보드 URL 확인
2. URL 형식: `https://app.supabase.com/project/[PROJECT-REF]`
3. `[PROJECT-REF]` 부분이 Project Reference ID입니다

### 방법 2: Settings → General
1. **Settings** → **General** 탭
2. **"Reference ID"** 확인

## 2. Connection String 수동 구성

### 기본 정보
- **Host**: `db.[PROJECT-REF].supabase.co`
- **Database name**: `postgres`
- **Port**: `5432`
- **User**: `postgres`
- **Password**: `blockkwave0806!`

### 비밀번호 URL 인코딩

비밀번호에 특수문자(`!`)가 포함되어 있으므로 URL 인코딩이 필요합니다:

- `!` → `%21`

**인코딩된 비밀번호**: `blockkwave0806%21`

### Connection String 형식

```
postgresql://postgres:blockkwave0806%21@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

### 예시 (Project Reference ID가 `abcdefghijklmnop`인 경우)

```
postgresql://postgres:blockkwave0806%21@db.abcdefghijklmnop.supabase.co:5432/postgres?sslmode=require
```

## 3. 온라인 URL 인코더 사용 (선택적)

비밀번호를 자동으로 인코딩하려면:
1. https://www.urlencoder.org/ 접속
2. `blockkwave0806!` 입력
3. 인코딩된 결과 복사: `blockkwave0806%21`

## 4. Railway 환경 변수에 설정

Railway → Settings → Variables에서:

```env
DATABASE_URL=postgresql://postgres:blockkwave0806%21@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

**중요**: `[PROJECT-REF]`를 실제 Project Reference ID로 교체하세요.

## 5. 연결 테스트

Railway 배포 후 Health check로 확인:
```bash
curl https://[Railway-도메인]/health
```

응답에서 `"database": "connected"` 확인
