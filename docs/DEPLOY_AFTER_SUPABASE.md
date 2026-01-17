# Supabase 설정 완료 후 배포 가이드

## 전제 조건

✅ Supabase 프로젝트 생성 완료  
✅ SQL 스키마 및 마이그레이션 실행 완료  
✅ Connection String 확인 완료

---

## 1단계: Supabase Connection String 구성

### 1.1 Project Reference ID 확인

**방법 1: URL에서 확인**
1. Supabase 대시보드 URL 확인
2. URL 형식: `https://app.supabase.com/project/[PROJECT-REF]`
3. `[PROJECT-REF]` 부분이 Project Reference ID입니다

**방법 2: Settings → General**
1. **Settings** → **General** 탭
2. **"Reference ID"** 확인

### 1.2 Connection String 수동 구성

**제공된 정보**:
- Database password: `blockkwave0806!`
- Host: `db.[PROJECT-REF].supabase.co`
- Database: `postgres`
- Port: `5432`
- User: `postgres`

**비밀번호 URL 인코딩**:
- 비밀번호에 특수문자(`!`)가 포함되어 있으므로 URL 인코딩 필요
- `!` → `%21`
- 인코딩된 비밀번호: `blockkwave0806%21`

**Connection String 형식**:
```
postgresql://postgres:blockkwave0806%21@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

**예시** (Project Reference ID가 `abcdefghijklmnop`인 경우):
```
postgresql://postgres:blockkwave0806%21@db.abcdefghijklmnop.supabase.co:5432/postgres?sslmode=require
```

**중요**: `[PROJECT-REF]`를 실제 Project Reference ID로 교체하세요!

**상세 가이드**: [SUPABASE_CONNECTION_STRING_MANUAL.md](./SUPABASE_CONNECTION_STRING_MANUAL.md)

---

## 2단계: Railway 백엔드 배포

### 2.1 프로젝트 생성

1. **Railway 대시보드 접속**
   ```
   https://railway.app/
   ```

2. **GitHub로 로그인**
   - GitHub 계정 연결
   - 저장소 접근 권한 부여

3. **"New Project"** 클릭
4. **"Deploy from GitHub repo"** 선택
5. `cheese3` 저장소 선택

### 2.2 백엔드 서비스 추가

1. **"Add Service"** → **"GitHub Repo"** 선택
2. 같은 저장소(`cheese3`) 선택
3. **서비스 이름**: `melt-backend` (자동 생성됨)

### 2.3 서비스 설정

1. **Settings** → **Source**
   - **Root Directory**: `backend` 설정

2. **Settings** → **Build**
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### 2.4 환경 변수 설정

**Settings** → **Variables** → **"New Variable"** 클릭하여 추가:

```env
# Server
PORT=3001
NODE_ENV=production

# Database (Supabase Connection String)
# 비밀번호: blockkwave0806! → URL 인코딩: blockkwave0806%21
DATABASE_URL=postgresql://postgres:blockkwave0806%21@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require

# JWT (새로 생성)
JWT_SECRET=[아래 명령어로 생성]
ENCRYPTION_KEY=[아래 명령어로 생성]

# 치지직 OAuth (제공받은 값)
CHZZK_CLIENT_ID=adbe2be0-a1c7-43a5-bdfd-408491968f3b
CHZZK_CLIENT_SECRET=ahHose2CWgcApBBrxtlmzPf5THLxEURXwr5s7uc2OFk
CHZZK_REDIRECT_URI=https://[Railway-도메인]/auth/chzzk/callback

# Frontend URL (Vercel 배포 후 업데이트)
FRONTEND_URL=https://[Vercel-도메인]
```

**중요**: `[PROJECT-REF]`를 1단계에서 확인한 실제 Project Reference ID로 교체하세요!

**비밀 키 생성** (PowerShell에서):
```powershell
# JWT_SECRET 생성 (Base64)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# ENCRYPTION_KEY 생성 (Hex, 64자)
-join ((48..57) + (97..102) | Get-Random -Count 64 | ForEach-Object { [char]$_ })
```

또는 온라인 도구 사용:
- https://www.random.org/strings/ (32자 랜덤 문자열)

생성된 값을 Railway 환경 변수에 설정하세요.

### 2.5 도메인 생성

1. **Settings** → **Networking**
2. **"Generate Domain"** 클릭
3. 생성된 도메인 복사 (예: `melt-backend-production.up.railway.app`)
4. **이 도메인을 메모해두세요!** (Vercel과 OAuth 설정에 사용)

### 2.6 배포 확인

1. **Deployments** 탭에서 배포 상태 확인
2. **View Logs**에서 로그 확인
3. Health check:
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

---

## 3단계: Vercel 프론트엔드 배포

### 3.1 프로젝트 Import

1. **Vercel 대시보드 접속**
   ```
   https://vercel.com/
   ```

2. **GitHub로 로그인**

3. **"Add New..."** → **"Project"** 클릭
4. **"Import Git Repository"** 선택
5. `cheese3` 저장소 선택
6. **"Import"** 클릭

### 3.2 프로젝트 설정

1. **Framework Preset**: Next.js (자동 감지됨)
2. **Root Directory**: `web` 설정
   - "Edit" 클릭 → `web` 입력 → "Continue"
3. **Build Command**: `npm run build` (기본값, 확인만)
4. **Output Directory**: `.next` (기본값, 확인만)

### 3.3 환경 변수 설정

**Environment Variables** 섹션에서 **"Add"** 클릭하여 추가:

```env
# API URL (Railway 백엔드 도메인)
NEXT_PUBLIC_API_URL=https://[Railway-도메인]

# 치지직 OAuth
NEXT_PUBLIC_CHZZK_CLIENT_ID=adbe2be0-a1c7-43a5-bdfd-408491968f3b

# Force Mock (프로덕션에서는 false)
NEXT_PUBLIC_FORCE_MOCK=false
```

**중요**: `[Railway-도메인]`을 2단계에서 생성한 Railway 도메인으로 교체하세요.

### 3.4 배포

1. **"Deploy"** 버튼 클릭
2. 배포 완료 대기 (약 2-3분)
3. 생성된 도메인 확인 (예: `melt.vercel.app`)
4. **이 도메인을 메모해두세요!**

---

## 4단계: 환경 변수 업데이트

### 4.1 Railway 백엔드 업데이트

1. **Railway 대시보드** → 백엔드 서비스 → **Settings** → **Variables**
2. `FRONTEND_URL` 변수 찾기
3. **"Edit"** 클릭
4. 값 업데이트:
   ```
   https://[Vercel-도메인]
   ```
5. **"Save"** 클릭

### 4.2 치지직 OAuth 설정 업데이트

1. **치지직 개발자 포털 접속**
   ```
   https://developers.chzzk.naver.com/
   ```

2. **애플리케이션 관리** → `melt_app` 선택

3. **Redirect URI 추가**:
   ```
   https://[Railway-도메인]/auth/chzzk/callback
   ```

4. **저장**

### 4.3 Railway CHZZK_REDIRECT_URI 확인

Railway 환경 변수에서 `CHZZK_REDIRECT_URI`가 올바른지 확인:
```env
CHZZK_REDIRECT_URI=https://[Railway-도메인]/auth/chzzk/callback
```

---

## 5단계: 최종 확인 및 테스트

### 5.1 백엔드 Health Check

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

### 5.2 프론트엔드 접속

브라우저에서 Vercel 도메인 접속:
```
https://[Vercel-도메인]
```

### 5.3 기능 테스트

1. **로그인 테스트**
   - 치지직 OAuth 로그인 시도
   - 개발 모드 로그인 (`/dev/login`)

2. **기본 기능 테스트**
   - 채널 검색
   - 메시지 전송
   - 후원 기능
   - 프로필 설정

### 5.4 로그 확인

**Railway**:
- Deployments → View Logs
- 에러가 있는지 확인

**Vercel**:
- 프로젝트 → Functions → Logs
- 에러가 있는지 확인

---

## 문제 해결

### 데이터베이스 연결 실패

**확인 사항**:
1. Connection String에 `sslmode=require` 포함 여부
2. 비밀번호가 올바른지 확인
3. Railway 환경 변수 `DATABASE_URL` 정확성

**해결**:
```bash
# Railway에서 연결 테스트
railway run node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT 1').then(() => console.log('OK')).catch(e => console.error(e));"
```

### OAuth 오류

**확인 사항**:
1. 치지직 개발자 포털의 Redirect URI와 Railway 환경 변수 일치 여부
2. Client ID/Secret 정확성
3. HTTPS 사용 확인

### CORS 오류

**확인 사항**:
1. Railway `FRONTEND_URL`이 Vercel 도메인과 일치하는지
2. Vercel `NEXT_PUBLIC_API_URL`이 Railway 도메인과 일치하는지

---

## 체크리스트

### Supabase
- [x] 프로젝트 생성 완료
- [x] SQL 스키마 실행 완료
- [x] Connection String 확인 완료

### Railway 백엔드
- [ ] 프로젝트 생성
- [ ] GitHub 저장소 연결
- [ ] Root Directory 설정 (`backend`)
- [ ] 빌드/시작 명령어 설정
- [ ] 환경 변수 설정 (9개)
- [ ] 도메인 생성
- [ ] Health check 통과

### Vercel 프론트엔드
- [ ] 프로젝트 Import
- [ ] Root Directory 설정 (`web`)
- [ ] 환경 변수 설정 (3개)
- [ ] 배포 완료
- [ ] 도메인 확인

### 환경 변수 업데이트
- [ ] Railway `FRONTEND_URL` 업데이트
- [ ] 치지직 Redirect URI 추가
- [ ] Railway `CHZZK_REDIRECT_URI` 확인

### 최종 확인
- [ ] 백엔드 Health Check 통과
- [ ] 프론트엔드 접속 가능
- [ ] 데이터베이스 연결 확인
- [ ] OAuth 로그인 테스트
- [ ] 주요 기능 테스트

---

## 환경 변수 요약

### Railway (백엔드) - 9개 변수

```env
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://postgres:[비밀번호]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
JWT_SECRET=[openssl rand -base64 32]
ENCRYPTION_KEY=[openssl rand -hex 32]
CHZZK_CLIENT_ID=adbe2be0-a1c7-43a5-bdfd-408491968f3b
CHZZK_CLIENT_SECRET=ahHose2CWgcApBBrxtlmzPf5THLxEURXwr5s7uc2OFk
CHZZK_REDIRECT_URI=https://[Railway-도메인]/auth/chzzk/callback
FRONTEND_URL=https://[Vercel-도메인]
```

### Vercel (프론트엔드) - 3개 변수

```env
NEXT_PUBLIC_API_URL=https://[Railway-도메인]
NEXT_PUBLIC_CHZZK_CLIENT_ID=adbe2be0-a1c7-43a5-bdfd-408491968f3b
NEXT_PUBLIC_FORCE_MOCK=false
```

---

## 다음 단계

배포 완료 후:
1. **모니터링**: Railway와 Vercel 로그 확인
2. **테스트**: 모든 기능 정상 작동 확인
3. **최적화**: 성능 모니터링 및 개선
4. **보안**: HTTPS, CORS 확인

---

## 참고 자료

- [Supabase Connection String 가이드](./SUPABASE_CONNECTION_STRING.md)
- [완전 배포 가이드](./DEPLOY_COMPLETE_GUIDE.md)
- [치지직 Client ID 가이드](./CHZZK_CLIENT_ID_GUIDE.md)
