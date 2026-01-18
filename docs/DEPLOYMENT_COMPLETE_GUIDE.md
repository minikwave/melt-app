# 완전한 배포 가이드: Supabase + Railway + Vercel

이 문서는 Melt 앱을 Supabase (데이터베이스), Railway (백엔드), Vercel (프론트엔드)에 배포하는 전체 과정을 상세히 설명합니다.

## 목차

1. [사전 준비](#사전-준비)
2. [1단계: Supabase 데이터베이스 설정](#1단계-supabase-데이터베이스-설정)
3. [2단계: Railway 백엔드 배포](#2단계-railway-백엔드-배포)
4. [3단계: Vercel 프론트엔드 배포](#3단계-vercel-프론트엔드-배포)
5. [4단계: 환경 변수 설정](#4단계-환경-변수-설정)
6. [5단계: 치지직 OAuth 설정](#5단계-치지직-oauth-설정)
7. [문제 해결](#문제-해결)
8. [최종 확인](#최종-확인)

---

## 사전 준비

### 필요한 계정

1. **Supabase 계정**
   - https://supabase.com/ 에서 가입
   - 무료 플랜으로 시작 가능

2. **Railway 계정**
   - https://railway.app/ 에서 가입
   - GitHub 연동 권장

3. **Vercel 계정**
   - https://vercel.com/ 에서 가입
   - GitHub 연동 권장

4. **치지직 개발자 포털**
   - https://developers.chzzk.naver.com/ 에서 애플리케이션 등록

### 필요한 정보

- **치지직 Client ID**: `adbe2be0-a1c7-43a5-bdfd-408491968f3b`
- **치지직 Client Secret**: (개인 정보이므로 안전하게 보관)
- **치지직 Application ID**: `melt_app`

---

## 1단계: Supabase 데이터베이스 설정

### 1.1 프로젝트 생성

1. **Supabase 대시보드 접속**
   ```
   https://app.supabase.com/
   ```

2. **"New Project" 클릭**

3. **프로젝트 정보 입력**
   - **Name**: `melt-app` (또는 원하는 이름)
   - **Database Password**: 강력한 비밀번호 설정 (예: `blockwave0806!`)
   - **Region**: `ap-northeast-1` (서울) 권장
   - **Pricing Plan**: Free (시작)

4. **"Create new project" 클릭**
   - 프로젝트 생성에 약 2분 소요

### 1.2 데이터베이스 스키마 적용

1. **SQL Editor 접속**
   - 좌측 메뉴에서 **"SQL Editor"** 클릭

2. **스키마 파일 실행**
   - `backend/db/schema.sql` 파일 내용을 복사
   - SQL Editor에 붙여넣기
   - **"Run"** 클릭

3. **마이그레이션 파일 실행** (순서대로)
   - `backend/db/migrations/001_add_channel_urls.sql`
   - `backend/db/migrations/002_add_follows_and_reads.sql`
   - `backend/db/migrations/003_add_user_profile_fields.sql`

### 1.3 Connection Pooling URL 확인

1. **Settings** → **Database** 접속

2. **Connection Pooling** 섹션 확인
   - **Pool Mode**: Transaction Mode (권장) 또는 Session Mode
   - **Port**: `5432` (Transaction Mode) 또는 `6543` (Session Mode)

3. **Connection String 복사**
   - **Connection Pooling** 섹션에서 **"Connection string"** 복사
   - 형식: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres`
   - 예시: `postgresql://postgres.pqafhdeeooxpyuocydxa:blockwave0806!@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres`

4. **Project Reference ID 확인**
   - Settings → General → **Project ID** 복사
   - 예시: `pqafhdeeooxpyuocydxa`

### 1.4 Network Restrictions 설정

1. **Settings** → **Database** → **Network Restrictions** 접속

2. **"Add restriction"** 클릭

3. **모든 IP 허용** (개발 단계)
   - 또는 Railway IP만 허용 (프로덕션 권장)

---

## 2단계: Railway 백엔드 배포

### 2.1 프로젝트 생성

1. **Railway 대시보드 접속**
   ```
   https://railway.app/dashboard
   ```

2. **"New Project" 클릭**

3. **"Deploy from GitHub repo"** 선택

4. **저장소 선택**
   - `ziptalk/melt-app` 또는 `minikwave/melt-app` 선택

### 2.2 백엔드 서비스 설정

1. **"Add Service"** → **"GitHub Repo"** 선택

2. **서비스 설정**
   - **Root Directory**: `backend`
   - **Settings** → **Build**:
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`

### 2.3 도메인 생성

1. **Settings** → **Networking** 접속

2. **"Generate Domain"** 클릭

3. **생성된 도메인 복사**
   - 예시: `melt-app-production.up.railway.app`
   - 이 도메인을 메모해두세요!

### 2.4 환경 변수 설정 (초기)

**Settings** → **Variables**에서 다음 변수 추가:

```env
# Server
PORT=3001
NODE_ENV=production

# Database (Supabase Connection Pooling)
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres

# JWT (강력한 랜덤 문자열 생성)
JWT_SECRET=[openssl rand -base64 32로 생성]

# Encryption (32바이트 hex 문자열 생성)
ENCRYPTION_KEY=[openssl rand -hex 32로 생성]

# 치지직 OAuth
CHZZK_CLIENT_ID=adbe2be0-a1c7-43a5-bdfd-408491968f3b
CHZZK_CLIENT_SECRET=[치지직 Client Secret]

# Frontend URL (나중에 Vercel 도메인으로 업데이트)
FRONTEND_URL=https://[Vercel-도메인]

# OAuth Redirect URI (Railway 도메인)
CHZZK_REDIRECT_URI=https://[Railway-도메인]/auth/chzzk/callback
```

**비밀 키 생성 방법**:
```bash
# JWT_SECRET 생성
openssl rand -base64 32

# ENCRYPTION_KEY 생성
openssl rand -hex 32
```

### 2.5 배포 확인

1. **Deployments 탭**에서 배포 상태 확인
   - "Building..." → "Deploying..." → "Active"

2. **View Logs** 클릭하여 로그 확인
   - ✅ "PostgreSQL 클라이언트 연결됨"
   - ✅ "데이터베이스 연결 성공"
   - ✅ "Melt API server running on port 3001"

3. **Health Check**
   ```bash
   curl https://[Railway-도메인]/health
   ```
   예상 응답:
   ```json
   {
     "status": "ok",
     "database": "connected"
   }
   ```

---

## 3단계: Vercel 프론트엔드 배포

### 3.1 프로젝트 Import

1. **Vercel 대시보드 접속**
   ```
   https://vercel.com/dashboard
   ```

2. **"Add New..."** → **"Project"** 클릭

3. **"Import Git Repository"** 선택

4. **저장소 선택**
   - `ziptalk/melt-app` 또는 `minikwave/melt-app` 선택

5. **"Import"** 클릭

### 3.2 프로젝트 설정

1. **Framework Preset**: Next.js (자동 감지)

2. **Root Directory**: `web`
   - "Edit" 클릭 → `web` 입력 → "Continue"

3. **Build Command**: `npm run build` (기본값)

4. **Output Directory**: `.next` (기본값)

5. **Install Command**: `npm install` (기본값)

### 3.3 환경 변수 설정 (초기)

**Environment Variables** 섹션에서 다음 변수 추가:

```env
# API URL (Railway 백엔드 도메인)
NEXT_PUBLIC_API_URL=https://[Railway-도메인]

# 치지직 OAuth
NEXT_PUBLIC_CHZZK_CLIENT_ID=adbe2be0-a1c7-43a5-bdfd-408491968f3b

# Force Mock (프로덕션에서는 false)
NEXT_PUBLIC_FORCE_MOCK=false
```

**중요**: `[Railway-도메인]`을 2.3에서 생성한 Railway 도메인으로 교체하세요.

### 3.4 배포

1. **"Deploy"** 버튼 클릭

2. **배포 진행 상황 확인**
   - "Building..." → "Deploying..." → "Ready"

3. **생성된 도메인 확인**
   - 예시: `melt-app-27gx.vercel.app`
   - 이 도메인을 메모해두세요!

### 3.5 빌드 오류 해결 (필요 시)

만약 `Module not found: Can't resolve '@/lib/api'` 오류가 발생하면:

1. **모든 `@/` import를 상대 경로로 변경**
   - 프로젝트에서 모든 `@/lib/api` import를 상대 경로로 변경
   - 예: `import { api } from '@/lib/api'` → `import { api } from '../../lib/api'`

2. **커밋 및 푸시**
   ```bash
   git add -A
   git commit -m "fix: replace @/ imports with relative paths"
   git push origin main
   ```

3. **Vercel 자동 재배포 확인**

---

## 4단계: 환경 변수 설정

### 4.1 Railway 환경 변수 업데이트

**Railway** → **백엔드 서비스** → **Variables**에서 업데이트:

1. **FRONTEND_URL** 업데이트
   ```
   https://[Vercel-도메인]
   ```
   예시: `https://melt-app-27gx.vercel.app`

2. **CHZZK_REDIRECT_URI** 확인
   ```
   https://[Railway-도메인]/auth/chzzk/callback
   ```
   예시: `https://melt-app-production.up.railway.app/auth/chzzk/callback`

### 4.2 Vercel 환경 변수 확인

**Vercel** → **프로젝트** → **Settings** → **Environment Variables**에서 확인:

1. **NEXT_PUBLIC_API_URL**
   ```
   https://[Railway-도메인]
   ```
   예시: `https://melt-app-production.up.railway.app`

2. **NEXT_PUBLIC_CHZZK_CLIENT_ID**
   ```
   adbe2be0-a1c7-43a5-bdfd-408491968f3b
   ```

3. **NEXT_PUBLIC_FORCE_MOCK**
   ```
   false
   ```

### 4.3 재배포

환경 변수 변경 후:

1. **Railway**: 자동 재배포 또는 수동 "Redeploy"
2. **Vercel**: 자동 재배포 또는 수동 "Redeploy"

---

## 5단계: 치지직 OAuth 설정

### 5.1 치지직 개발자 포털 설정

1. **치지직 개발자 포털 접속**
   ```
   https://developers.chzzk.naver.com/
   ```

2. **애플리케이션 선택**
   - `melt_app` 애플리케이션 선택

3. **Redirect URI 추가**
   - **Redirect URI** 섹션에서 **"추가"** 클릭
   - 다음 URI 추가:
     ```
     https://[Railway-도메인]/auth/chzzk/callback
     ```
     예시: `https://melt-app-production.up.railway.app/auth/chzzk/callback`

4. **저장**

### 5.2 OAuth 테스트

1. **Vercel 프론트엔드 접속**
   - https://[Vercel-도메인] 접속

2. **"네이버로 시작하기" 클릭**

3. **치지직 로그인 진행**

4. **콜백 확인**
   - 정상적으로 리다이렉트되는지 확인

---

## 문제 해결

### 문제 1: Railway 데이터베이스 연결 실패

**증상**: `connect ENETUNREACH` 또는 `IPv6 connection problem`

**해결 방법**:
1. **Supabase Connection Pooling 사용**
   - Connection Pooling URL 사용 (`.pooler.supabase.com`)
   - Port: `5432` (Transaction Mode) 또는 `6543` (Session Mode)

2. **DATABASE_URL 형식 확인**
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres
   ```

3. **Network Restrictions 확인**
   - Supabase → Settings → Database → Network Restrictions
   - 모든 IP 허용 또는 Railway IP 허용

### 문제 2: SSL 인증서 오류

**증상**: `self-signed certificate in certificate chain`

**해결 방법**:
- `backend/src/db/pool.ts`에서 `rejectUnauthorized: false` 설정 확인
- Connection Pooling 사용 (자동으로 해결됨)

### 문제 3: Vercel 빌드 오류 - Module not found

**증상**: `Module not found: Can't resolve '@/lib/api'`

**해결 방법**:
1. **모든 `@/` import를 상대 경로로 변경**
   ```typescript
   // 변경 전
   import { api } from '@/lib/api'
   
   // 변경 후
   import { api } from '../../lib/api'
   ```

2. **커밋 및 푸시**
   ```bash
   git add -A
   git commit -m "fix: replace @/ imports with relative paths"
   git push origin main
   ```

3. **Vercel 자동 재배포 확인**

### 문제 4: Railway SIGTERM 오류

**증상**: `npm error signal SIGTERM`

**해결 방법**:
- `backend/src/index.ts`에 graceful shutdown 처리 추가됨
- 정상적인 종료 신호이므로 문제 없음

### 문제 5: CORS 오류

**증상**: 프론트엔드에서 API 호출 시 CORS 오류

**해결 방법**:
1. **Railway 환경 변수 확인**
   - `FRONTEND_URL`이 Vercel 도메인으로 설정되어 있는지 확인

2. **백엔드 재배포**
   - 환경 변수 변경 후 재배포

---

## 최종 확인

### 1. 백엔드 Health Check

```bash
curl https://[Railway-도메인]/health
```

**예상 응답**:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### 2. 프론트엔드 접속

- https://[Vercel-도메인] 접속
- 메인 페이지가 정상적으로 로드되는지 확인

### 3. 치지직 로그인 테스트

1. **"네이버로 시작하기" 클릭**
2. **치지직 로그인 진행**
3. **온보딩 페이지 또는 메인 페이지로 리다이렉트 확인**

### 4. 데이터베이스 확인

1. **Supabase** → **Table Editor**
2. **users 테이블** 확인
   - 로그인한 사용자 데이터가 저장되어 있는지 확인

### 5. 전체 시스템 상태

- ✅ Supabase: 데이터베이스 연결 성공
- ✅ Railway: 백엔드 서버 실행 중
- ✅ Vercel: 프론트엔드 배포 완료
- ✅ 치지직 OAuth: 로그인 정상 작동

---

## 배포 완료 체크리스트

- [ ] Supabase 프로젝트 생성 및 스키마 적용
- [ ] Supabase Connection Pooling URL 확인
- [ ] Railway 백엔드 배포 및 도메인 생성
- [ ] Railway 환경 변수 설정 (DATABASE_URL, JWT_SECRET, ENCRYPTION_KEY 등)
- [ ] Vercel 프론트엔드 배포 및 도메인 생성
- [ ] Vercel 환경 변수 설정 (NEXT_PUBLIC_API_URL 등)
- [ ] Railway FRONTEND_URL 업데이트
- [ ] 치지직 개발자 포털 Redirect URI 등록
- [ ] 백엔드 Health Check 통과
- [ ] 프론트엔드 접속 확인
- [ ] 치지직 로그인 테스트 성공

---

## 유용한 링크

- **Supabase 대시보드**: https://app.supabase.com/
- **Railway 대시보드**: https://railway.app/dashboard
- **Vercel 대시보드**: https://vercel.com/dashboard
- **치지직 개발자 포털**: https://developers.chzzk.naver.com/

---

## 참고 사항

### 환경 변수 보안

- **절대 Git에 커밋하지 마세요**
- Railway와 Vercel의 환경 변수는 대시보드에서만 관리
- `.env` 파일은 로컬 개발용으로만 사용

### 비밀 키 관리

- **JWT_SECRET**: 강력한 랜덤 문자열 사용
- **ENCRYPTION_KEY**: 안전한 곳에 백업 (키를 잃으면 복구 불가능)
- **CHZZK_CLIENT_SECRET**: 치지직 개발자 포털에서만 확인 가능

### 도메인 관리

- Railway와 Vercel은 무료 도메인 제공
- 커스텀 도메인 설정 가능 (추가 비용 발생 가능)
- 도메인 변경 시 환경 변수도 함께 업데이트 필요

---

## 문제 발생 시

1. **로그 확인**
   - Railway: Deployments → View Logs
   - Vercel: Deployments → Build Logs

2. **환경 변수 확인**
   - 모든 환경 변수가 올바르게 설정되어 있는지 확인

3. **재배포**
   - 환경 변수 변경 후 재배포 필요

4. **문서 참고**
   - 이 문서의 "문제 해결" 섹션 참고

---

**배포 완료! 🎉**

이제 Melt 앱이 프로덕션 환경에서 실행 중입니다.
