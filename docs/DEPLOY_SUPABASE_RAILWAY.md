# Supabase + Railway 배포 가이드

## 개요

이 가이드는 Melt 프로젝트를 Supabase(데이터베이스)와 Railway(백엔드/프론트엔드)로 배포하는 방법을 설명합니다.

## 아키텍처

```
┌─────────────┐
│   Railway   │  ← 프론트엔드 (Next.js)
│  (Frontend) │
└─────────────┘
       │
       │ API 호출
       ▼
┌─────────────┐
│   Railway   │  ← 백엔드 (Express)
│  (Backend)  │
└─────────────┘
       │
       │ 데이터베이스 연결
       ▼
┌─────────────┐
│  Supabase   │  ← PostgreSQL 데이터베이스
│ (Database)  │
└─────────────┘
```

## 1단계: Supabase 설정

### 1.1 Supabase 프로젝트 생성

1. **Supabase 대시보드 접속**
   ```
   https://app.supabase.com/
   ```

2. **새 프로젝트 생성**
   - "New Project" 클릭
   - 프로젝트 이름: `melt-production` (또는 원하는 이름)
   - 데이터베이스 비밀번호: 강력한 비밀번호 설정 (저장해두기!)
   - 리전: 가장 가까운 리전 선택 (예: `Northeast Asia (Seoul)`)
   - "Create new project" 클릭

3. **프로젝트 생성 대기** (약 2분 소요)

### 1.2 데이터베이스 연결 정보 확인

1. **프로젝트 대시보드** → **Settings** → **Database**
2. **Connection string** 섹션에서 연결 정보 확인:
   - **URI**: 전체 연결 문자열
   - **Host**: `db.[project-ref].supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: 프로젝트 생성 시 설정한 비밀번호

3. **연결 문자열 복사**
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

### 1.3 스키마 적용

#### 방법 1: Supabase SQL Editor 사용

1. **Supabase 대시보드** → **SQL Editor**
2. **New query** 클릭
3. `backend/db/schema.sql` 파일 내용 복사하여 실행
4. 마이그레이션 파일도 순서대로 실행:
   - `backend/db/migrations/001_add_channel_urls.sql`
   - `backend/db/migrations/002_add_follows_and_reads.sql`

#### 방법 2: Supabase CLI 사용

```bash
# Supabase CLI 설치
npm install -g supabase

# Supabase 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref [YOUR-PROJECT-REF]

# 스키마 적용
supabase db push
```

### 1.4 환경 변수 준비

Supabase 연결 정보를 메모해두세요 (Railway에서 사용):
- `SUPABASE_URL`: `https://[PROJECT-REF].supabase.co`
- `SUPABASE_DB_URL`: 연결 문자열
- `SUPABASE_ANON_KEY`: Settings → API → anon public key
- `SUPABASE_SERVICE_KEY`: Settings → API → service_role key (서버 전용)

## 2단계: Railway 설정

### 2.1 Railway 계정 생성

1. **Railway 대시보드 접속**
   ```
   https://railway.app/
   ```

2. **GitHub로 로그인** (권장)
   - GitHub 계정 연결
   - 저장소 접근 권한 부여

### 2.2 백엔드 배포

#### 2.2.1 새 프로젝트 생성

1. **Railway 대시보드** → **New Project**
2. **"Deploy from GitHub repo"** 선택
3. `cheese3` 저장소 선택
4. **"Add Service"** → **"GitHub Repo"** 선택

#### 2.2.2 백엔드 서비스 설정

1. **서비스 이름**: `melt-backend`
2. **Root Directory**: `backend`
3. **Build Command**: `npm install && npm run build`
4. **Start Command**: `npm start`

#### 2.2.3 환경 변수 설정

Railway 대시보드 → 백엔드 서비스 → **Variables** 탭에서 추가:

```env
# Server
PORT=3001
NODE_ENV=production

# Database (Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require

# JWT
JWT_SECRET=[강력한 랜덤 문자열]
JWT_EXPIRES_IN=7d

# Encryption
ENCRYPTION_KEY=[32바이트 hex 문자열]

# 치지직 OAuth
CHZZK_CLIENT_ID=[치지직 Client ID]
CHZZK_CLIENT_SECRET=[치지직 Client Secret]
CHZZK_REDIRECT_URI=https://[백엔드-도메인]/auth/chzzk/callback

# Frontend URL
FRONTEND_URL=https://[프론트엔드-도메인]
```

**비밀 키 생성 방법**:
```bash
# JWT_SECRET 생성
openssl rand -base64 32

# ENCRYPTION_KEY 생성
openssl rand -hex 32
```

#### 2.2.4 도메인 설정

1. **Settings** → **Networking**
2. **"Generate Domain"** 클릭
3. 생성된 도메인 복사 (예: `melt-backend-production.up.railway.app`)

### 2.3 프론트엔드 배포

#### 2.3.1 프론트엔드 서비스 추가

1. **프로젝트** → **"Add Service"** → **"GitHub Repo"**
2. 같은 저장소 선택
3. **서비스 이름**: `melt-frontend`
4. **Root Directory**: `web`

#### 2.3.2 빌드 설정

1. **Settings** → **Build**
2. **Build Command**: `npm install && npm run build`
3. **Start Command**: `npm start`

#### 2.3.3 환경 변수 설정

```env
# API URL
NEXT_PUBLIC_API_URL=https://[백엔드-도메인]

# 치지직 OAuth
NEXT_PUBLIC_CHZZK_CLIENT_ID=[치지직 Client ID]

# Force Mock (프로덕션에서는 false)
NEXT_PUBLIC_FORCE_MOCK=false
```

#### 2.3.4 도메인 설정

1. **Settings** → **Networking**
2. **"Generate Domain"** 클릭
3. 생성된 도메인 복사

## 3단계: 치지직 OAuth 설정 업데이트

### 3.1 치지직 개발자 포털

1. **치지직 개발자 포털 접속**
   ```
   https://developers.chzzk.naver.com/
   ```

2. **애플리케이션 설정** → **Redirect URI 추가**
   ```
   https://[백엔드-도메인]/auth/chzzk/callback
   ```

3. **저장**

### 3.2 Railway 환경 변수 업데이트

백엔드 서비스의 `CHZZK_REDIRECT_URI`를 프로덕션 도메인으로 업데이트:
```env
CHZZK_REDIRECT_URI=https://[백엔드-도메인]/auth/chzzk/callback
```

## 4단계: 데이터베이스 마이그레이션

### 4.1 Railway에서 마이그레이션 실행

#### 방법 1: Railway CLI 사용

```bash
# Railway CLI 설치
npm install -g @railway/cli

# Railway 로그인
railway login

# 프로젝트 선택
railway link

# 백엔드 디렉토리로 이동
cd backend

# 환경 변수 설정 (Supabase 연결 문자열)
railway variables set DATABASE_URL="postgresql://..."

# 마이그레이션 실행
railway run npm run migrate
```

#### 방법 2: Supabase SQL Editor 사용

1. Supabase 대시보드 → SQL Editor
2. 스키마 파일 내용 복사하여 실행

### 4.2 시드 데이터 (선택적)

```bash
# Railway에서 시드 데이터 생성
railway run npm run seed
```

## 5단계: 배포 확인

### 5.1 백엔드 Health Check

```bash
curl https://[백엔드-도메인]/health
```

**예상 응답**:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### 5.2 프론트엔드 접속

브라우저에서 프론트엔드 도메인 접속:
```
https://[프론트엔드-도메인]
```

### 5.3 로그 확인

Railway 대시보드 → 각 서비스 → **Deployments** → **View Logs**

## 6단계: 커스텀 도메인 설정 (선택적)

### 6.1 Railway 커스텀 도메인

1. **Settings** → **Networking** → **Custom Domain**
2. 도메인 입력 (예: `api.melt.app`)
3. DNS 설정 안내에 따라 CNAME 레코드 추가

### 6.2 프론트엔드 커스텀 도메인

1. 동일한 절차로 프론트엔드 도메인 설정
2. 환경 변수 업데이트:
   ```env
   FRONTEND_URL=https://melt.app
   ```

## 7단계: 모니터링 및 유지보수

### 7.1 Railway 모니터링

- **Metrics**: CPU, 메모리 사용량
- **Logs**: 실시간 로그 확인
- **Deployments**: 배포 이력

### 7.2 Supabase 모니터링

- **Database**: 쿼리 성능, 연결 수
- **API**: API 사용량
- **Logs**: 데이터베이스 로그

### 7.3 환경 변수 관리

- Railway 대시보드에서 환경 변수 관리
- 민감한 정보는 Railway Secrets 사용
- 팀원과 공유 시 주의

## 8단계: 문제 해결

### 배포 실패

1. **로그 확인**: Railway → Deployments → View Logs
2. **빌드 오류 확인**: TypeScript 컴파일 오류 등
3. **환경 변수 확인**: 필수 변수 누락 여부

### 데이터베이스 연결 실패

1. **Supabase 연결 문자열 확인**
2. **SSL 모드 확인**: `sslmode=require` 포함 여부
3. **방화벽 확인**: Supabase IP 허용 여부

### OAuth 오류

1. **Redirect URI 확인**: 치지직 개발자 포털과 일치 여부
2. **Client ID/Secret 확인**: 환경 변수 정확성

## 9단계: 비용 최적화

### Railway

- **무료 플랜**: $5 크레딧/월
- **사용량 모니터링**: Metrics 탭에서 확인
- **서비스 중지**: 사용하지 않을 때 일시 중지

### Supabase

- **무료 플랜**: 500MB 데이터베이스, 2GB 대역폭
- **사용량 모니터링**: Dashboard에서 확인
- **백업**: 자동 일일 백업 (무료 플랜)

## 체크리스트

### Supabase 설정
- [ ] Supabase 프로젝트 생성
- [ ] 데이터베이스 비밀번호 설정
- [ ] 연결 정보 확인
- [ ] 스키마 적용
- [ ] 마이그레이션 실행

### Railway 백엔드
- [ ] Railway 프로젝트 생성
- [ ] 백엔드 서비스 배포
- [ ] 환경 변수 설정
- [ ] 도메인 생성
- [ ] Health check 확인

### Railway 프론트엔드
- [ ] 프론트엔드 서비스 배포
- [ ] 환경 변수 설정
- [ ] 도메인 생성
- [ ] 접속 확인

### OAuth 설정
- [ ] 치지직 Redirect URI 업데이트
- [ ] Railway 환경 변수 업데이트
- [ ] OAuth 로그인 테스트

### 최종 확인
- [ ] 백엔드 API 동작 확인
- [ ] 프론트엔드 접속 확인
- [ ] 데이터베이스 연결 확인
- [ ] OAuth 로그인 테스트
- [ ] 주요 기능 테스트

## 참고 자료

- [Supabase 문서](https://supabase.com/docs)
- [Railway 문서](https://docs.railway.app/)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Supabase CLI](https://supabase.com/docs/reference/cli/introduction)
- [치지직 개발자 포털](https://developers.chzzk.naver.com/)

## 다음 단계

배포 완료 후:
1. **모니터링 설정**: 에러 추적, 성능 모니터링
2. **백업 전략**: 정기적인 데이터베이스 백업
3. **CI/CD 설정**: GitHub Actions로 자동 배포
4. **보안 강화**: HTTPS, CORS, Rate Limiting
5. **성능 최적화**: 캐싱, CDN 사용
