# Railway + Supabase + Vercel 배포 완전 가이드

## 배포 아키텍처

```
┌─────────────┐
│   Vercel    │  ← 프론트엔드 (Next.js)
│  (Frontend) │
└─────────────┘
       │
       │ API 호출
       ▼
┌─────────────┐
│   Railway   │  ← 백엔드 (Express API)
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

## 배포 순서

1. **Supabase** - 데이터베이스 설정
2. **Railway** - 백엔드 배포
3. **Vercel** - 프론트엔드 배포
4. **환경 변수 및 도메인 설정**

---

## 1단계: Supabase 설정

### 1.1 Supabase 프로젝트 생성

1. **Supabase 대시보드 접속**
   ```
   https://app.supabase.com/
   ```

2. **새 프로젝트 생성**
   - "New Project" 클릭
   - 프로젝트 이름: `melt-production`
   - 데이터베이스 비밀번호: 강력한 비밀번호 설정 (저장해두기!)
   - 리전: `Northeast Asia (Seoul)` 또는 가장 가까운 리전
   - "Create new project" 클릭

3. **프로젝트 생성 대기** (약 2분)

### 1.2 데이터베이스 연결 정보 확인

1. **Settings** → **Database**
2. **Connection string** 섹션에서 연결 정보 확인:
   - **URI**: 전체 연결 문자열
   - **Host**: `db.[project-ref].supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: 프로젝트 생성 시 설정한 비밀번호

3. **연결 문자열 복사** (SSL 필수)
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
   ```

### 1.3 스키마 적용

#### 방법 1: Supabase SQL Editor 사용 (권장)

1. **SQL Editor** → **New query**
2. 다음 파일들을 순서대로 실행:
   - `backend/db/schema.sql` 내용 복사하여 실행
   - `backend/db/migrations/001_add_channel_urls.sql` 실행
   - `backend/db/migrations/002_add_follows_and_reads.sql` 실행
   - `backend/db/migrations/003_add_user_profile_fields.sql` 실행
   - `backend/db/migrations/004_add_intended_amount.sql` 실행
   - `backend/db/migrations/005_add_chzzk_api_credentials.sql` 실행
   - `backend/db/migrations/006_add_onboarding_complete.sql` 실행

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

### 1.4 API 키 확인

1. **Settings** → **API**
2. 다음 키들을 메모:
   - **Project URL**: `https://[PROJECT-REF].supabase.co`
   - **anon public key**: (프론트엔드용, 필요 시)
   - **service_role key**: (서버 전용, 필요 시)

---

## 2단계: Railway 백엔드 배포

### 2.1 Railway 계정 생성

1. **Railway 대시보드 접속**
   ```
   https://railway.app/
   ```

2. **GitHub로 로그인** (권장)
   - GitHub 계정 연결
   - 저장소 접근 권한 부여

### 2.2 백엔드 프로젝트 생성

1. **New Project** 클릭
2. **"Deploy from GitHub repo"** 선택
3. `cheese3` 저장소 선택
4. **"Add Service"** → **"GitHub Repo"** 선택

### 2.3 백엔드 서비스 설정

1. **서비스 이름**: `melt-backend`
2. **Root Directory**: `backend`
3. **Settings** → **Build**:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### 2.4 환경 변수 설정

**Settings** → **Variables**에서 다음 변수 추가:

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

# Frontend URL (Vercel 도메인, 나중에 설정)
FRONTEND_URL=https://[프론트엔드-도메인]
```

**비밀 키 생성 방법**:
```bash
# JWT_SECRET 생성
openssl rand -base64 32

# ENCRYPTION_KEY 생성
openssl rand -hex 32
```

### 2.5 도메인 설정

1. **Settings** → **Networking**
2. **"Generate Domain"** 클릭
3. 생성된 도메인 복사 (예: `melt-backend-production.up.railway.app`)
4. 이 도메인을 메모해두세요 (프론트엔드와 OAuth 설정에 사용)

### 2.6 배포 확인

1. **Deployments** 탭에서 배포 상태 확인
2. **View Logs**에서 로그 확인
3. Health check:
   ```bash
   curl https://[백엔드-도메인]/health
   ```

---

## 3단계: Vercel 프론트엔드 배포

### 3.1 Vercel 계정 생성

1. **Vercel 대시보드 접속**
   ```
   https://vercel.com/
   ```

2. **GitHub로 로그인** (권장)

### 3.2 프로젝트 Import

1. **"Add New..."** → **"Project"** 클릭
2. **"Import Git Repository"** 선택
3. `cheese3` 저장소 선택
4. **"Import"** 클릭

### 3.3 프로젝트 설정

1. **Framework Preset**: Next.js (자동 감지)
2. **Root Directory**: `web`
3. **Build Command**: `npm run build` (기본값)
4. **Output Directory**: `.next` (기본값)
5. **Install Command**: `npm install` (기본값)

### 3.4 환경 변수 설정

**Environment Variables** 섹션에서 다음 변수 추가:

```env
# API URL (Railway 백엔드 도메인)
NEXT_PUBLIC_API_URL=https://[백엔드-도메인]

# 치지직 OAuth
NEXT_PUBLIC_CHZZK_CLIENT_ID=[치지직 Client ID]

# Force Mock (프로덕션에서는 false)
NEXT_PUBLIC_FORCE_MOCK=false
```

### 3.5 배포

1. **"Deploy"** 클릭
2. 배포 완료 대기 (약 2-3분)
3. 생성된 도메인 확인 (예: `melt.vercel.app`)

### 3.6 커스텀 도메인 설정 (선택적)

1. **Settings** → **Domains**
2. 원하는 도메인 입력 (예: `melt.app`)
3. DNS 설정 안내에 따라 CNAME 레코드 추가

---

## 4단계: 환경 변수 업데이트

### 4.1 Railway 백엔드 환경 변수 업데이트

Railway 대시보드 → 백엔드 서비스 → **Variables**:

```env
# Vercel 프론트엔드 도메인으로 업데이트
FRONTEND_URL=https://[Vercel-도메인]
```

### 4.2 치지직 OAuth 설정 업데이트

1. **치지직 개발자 포털 접속**
   ```
   https://developers.chzzk.naver.com/
   ```

2. **애플리케이션 설정** → **Redirect URI 추가**
   ```
   https://[백엔드-도메인]/auth/chzzk/callback
   ```

3. **Railway 환경 변수 확인**
   ```env
   CHZZK_REDIRECT_URI=https://[백엔드-도메인]/auth/chzzk/callback
   ```

---

## 5단계: 데이터베이스 마이그레이션

### Railway CLI 사용 (권장)

```bash
# Railway CLI 설치
npm install -g @railway/cli

# Railway 로그인
railway login

# 프로젝트 선택
railway link

# 백엔드 디렉토리로 이동
cd backend

# 환경 변수 확인 (Supabase 연결 문자열)
railway variables

# 마이그레이션 실행
railway run npm run migrate
```

### 또는 Supabase SQL Editor 사용

1. Supabase 대시보드 → **SQL Editor**
2. 마이그레이션 파일 내용 복사하여 실행

---

## 6단계: 배포 확인 및 테스트

### 6.1 백엔드 Health Check

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

### 6.2 프론트엔드 접속

브라우저에서 Vercel 도메인 접속:
```
https://[Vercel-도메인]
```

### 6.3 기능 테스트

1. **로그인 테스트**
   - 치지직 OAuth 로그인
   - 개발 모드 로그인 (Mock)

2. **기본 기능 테스트**
   - 채널 검색
   - 메시지 전송
   - 후원 기능
   - 프로필 설정

---

## 7단계: 프로덕션 최적화

### 7.1 Next.js 빌드 최적화

`web/next.config.js` 확인:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 프로덕션 최적화 설정
  productionBrowserSourceMaps: false,
  compress: true,
}

module.exports = nextConfig
```

### 7.2 환경 변수 검증

배포 전 모든 환경 변수가 올바르게 설정되었는지 확인:

**Railway (백엔드)**:
- ✅ DATABASE_URL
- ✅ JWT_SECRET
- ✅ ENCRYPTION_KEY
- ✅ CHZZK_CLIENT_ID
- ✅ CHZZK_CLIENT_SECRET
- ✅ CHZZK_REDIRECT_URI
- ✅ FRONTEND_URL

**Vercel (프론트엔드)**:
- ✅ NEXT_PUBLIC_API_URL
- ✅ NEXT_PUBLIC_CHZZK_CLIENT_ID
- ✅ NEXT_PUBLIC_FORCE_MOCK=false

### 7.3 로그 모니터링

**Railway**:
- Deployments → View Logs
- 실시간 로그 확인

**Vercel**:
- 프로젝트 → Functions → Logs
- 실시간 로그 확인

**Supabase**:
- Logs → Database Logs
- 쿼리 성능 확인

---

## 8단계: CI/CD 설정 (선택적)

### 8.1 자동 배포

Railway와 Vercel은 기본적으로 GitHub push 시 자동 배포됩니다.

### 8.2 배포 브랜치 설정

**Railway**:
- Settings → Source
- 배포할 브랜치 선택 (기본: `main`)

**Vercel**:
- Settings → Git
- Production Branch 설정 (기본: `main`)

---

## 문제 해결

### 배포 실패

1. **로그 확인**
   - Railway: Deployments → View Logs
   - Vercel: 프로젝트 → Functions → Logs

2. **빌드 오류 확인**
   - TypeScript 컴파일 오류
   - 의존성 설치 실패
   - 환경 변수 누락

### 데이터베이스 연결 실패

1. **Supabase 연결 문자열 확인**
   - `sslmode=require` 포함 여부
   - 비밀번호 정확성

2. **Railway 환경 변수 확인**
   - `DATABASE_URL` 정확성
   - Supabase 방화벽 설정 확인

### OAuth 오류

1. **Redirect URI 확인**
   - 치지직 개발자 포털과 Railway 환경 변수 일치 여부
   - HTTPS 사용 확인

2. **Client ID/Secret 확인**
   - 환경 변수 정확성

### CORS 오류

1. **Railway CORS 설정 확인**
   - `FRONTEND_URL`이 Vercel 도메인과 일치하는지 확인

2. **Vercel 환경 변수 확인**
   - `NEXT_PUBLIC_API_URL`이 Railway 도메인과 일치하는지 확인

---

## 비용 최적화

### Railway

- **무료 플랜**: $5 크레딧/월
- **사용량 모니터링**: Metrics 탭
- **서비스 중지**: 사용하지 않을 때 일시 중지

### Supabase

- **무료 플랜**: 500MB 데이터베이스, 2GB 대역폭
- **사용량 모니터링**: Dashboard
- **백업**: 자동 일일 백업 (무료 플랜)

### Vercel

- **무료 플랜**: 무제한 개인 프로젝트
- **제한**: 100GB 대역폭/월
- **Hobby 플랜**: 커스텀 도메인 지원

---

## 체크리스트

### Supabase 설정
- [ ] 프로젝트 생성
- [ ] 데이터베이스 비밀번호 설정
- [ ] 연결 정보 확인
- [ ] 스키마 적용
- [ ] 마이그레이션 실행

### Railway 백엔드
- [ ] 프로젝트 생성
- [ ] GitHub 저장소 연결
- [ ] Root Directory 설정 (`backend`)
- [ ] 빌드/시작 명령어 설정
- [ ] 환경 변수 설정
- [ ] 도메인 생성
- [ ] Health check 확인

### Vercel 프론트엔드
- [ ] 프로젝트 Import
- [ ] Root Directory 설정 (`web`)
- [ ] 환경 변수 설정
- [ ] 배포 완료
- [ ] 도메인 확인

### 환경 변수 업데이트
- [ ] Railway `FRONTEND_URL` 업데이트
- [ ] 치지직 Redirect URI 업데이트
- [ ] Railway `CHZZK_REDIRECT_URI` 확인

### 최종 확인
- [ ] 백엔드 API 동작 확인
- [ ] 프론트엔드 접속 확인
- [ ] 데이터베이스 연결 확인
- [ ] OAuth 로그인 테스트
- [ ] 주요 기능 테스트

---

## 참고 자료

- [Supabase 문서](https://supabase.com/docs)
- [Railway 문서](https://docs.railway.app/)
- [Vercel 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [치지직 개발자 포털](https://developers.chzzk.naver.com/)

---

## 다음 단계

배포 완료 후:
1. **모니터링 설정**: 에러 추적, 성능 모니터링
2. **백업 전략**: 정기적인 데이터베이스 백업
3. **보안 강화**: HTTPS, CORS, Rate Limiting
4. **성능 최적화**: 캐싱, CDN 사용
5. **알림 설정**: 배포 알림, 에러 알림
