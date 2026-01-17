# Railway + Vercel 배포 가이드 (Project Reference ID: pqafhdeeooxpyuocydxa)

## 현재 상태
✅ Supabase 프로젝트 생성 완료  
✅ SQL 스키마 실행 완료  
✅ Database password: `blockkwave0806!`  
✅ Project Reference ID: `pqafhdeeooxpyuocydxa`  
✅ 치지직 Client ID/Secret 확인 완료

---

## Connection String (준비 완료)

```
postgresql://postgres:blockkwave0806%21@db.pqafhdeeooxpyuocydxa.supabase.co:5432/postgres?sslmode=require
```

**이 Connection String을 복사해두세요!**

---

## 1단계: Railway 백엔드 배포

### 1.1 프로젝트 생성

1. **Railway 대시보드 접속**
   ```
   https://railway.app/
   ```

2. **GitHub로 로그인**
   - GitHub 계정 연결
   - 저장소 접근 권한 부여

3. **"New Project"** 클릭
4. **"Deploy from GitHub repo"** 선택
5. **`cheese3` 저장소 선택**

### 1.2 백엔드 서비스 추가

1. **"Add Service"** → **"GitHub Repo"** 선택
2. 같은 저장소(`cheese3`) 선택
3. 서비스가 자동으로 생성됩니다

### 1.3 서비스 설정

1. **Settings** → **Source** 탭
   - **Root Directory**: `backend` 입력
   - **Save** 클릭

2. **Settings** → **Build** 탭
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Save** 클릭

### 1.4 비밀 키 생성 (로컬 터미널)

PowerShell에서 실행:

```powershell
# JWT_SECRET 생성 (Base64, 32바이트)
$bytes = 1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }
[Convert]::ToBase64String($bytes)

# ENCRYPTION_KEY 생성 (Hex, 64자)
-join ((48..57) + (97..102) | Get-Random -Count 64 | ForEach-Object { [char]$_ })
```

**생성된 두 값을 메모해두세요!**

### 1.5 환경 변수 설정

**Settings** → **Variables** 탭 → **"New Variable"** 클릭하여 하나씩 추가:

#### 변수 1: PORT
- **Name**: `PORT`
- **Value**: `3001`
- **Add** 클릭

#### 변수 2: NODE_ENV
- **Name**: `NODE_ENV`
- **Value**: `production`
- **Add** 클릭

#### 변수 3: DATABASE_URL
- **Name**: `DATABASE_URL`
- **Value**: `postgresql://postgres:blockkwave0806%21@db.pqafhdeeooxpyuocydxa.supabase.co:5432/postgres?sslmode=require`
- **Add** 클릭

#### 변수 4: JWT_SECRET
- **Name**: `JWT_SECRET`
- **Value**: `[1.4에서 생성한 값]`
- **Add** 클릭

#### 변수 5: ENCRYPTION_KEY
- **Name**: `ENCRYPTION_KEY`
- **Value**: `[1.4에서 생성한 값]`
- **Add** 클릭

#### 변수 6: CHZZK_CLIENT_ID
- **Name**: `CHZZK_CLIENT_ID`
- **Value**: `adbe2be0-a1c7-43a5-bdfd-408491968f3b`
- **Add** 클릭

#### 변수 7: CHZZK_CLIENT_SECRET
- **Name**: `CHZZK_CLIENT_SECRET`
- **Value**: `ahHose2CWgcApBBrxtlmzPf5THLxEURXwr5s7uc2OFk`
- **Add** 클릭

#### 변수 8: CHZZK_REDIRECT_URI
- **Name**: `CHZZK_REDIRECT_URI`
- **Value**: `https://[Railway-도메인]/auth/chzzk/callback`
- **참고**: 도메인은 1.6에서 생성 후 업데이트
- **Add** 클릭

#### 변수 9: FRONTEND_URL
- **Name**: `FRONTEND_URL`
- **Value**: `https://[Vercel-도메인]`
- **참고**: Vercel 배포 후 업데이트
- **Add** 클릭

### 1.6 도메인 생성

1. **Settings** → **Networking** 탭
2. **"Generate Domain"** 버튼 클릭
3. 생성된 도메인 복사 (예: `melt-backend-production.up.railway.app`)
4. **이 도메인을 메모해두세요!**

### 1.7 CHZZK_REDIRECT_URI 업데이트

1. **Settings** → **Variables** 탭
2. `CHZZK_REDIRECT_URI` 변수 찾기
3. **"..."** 메뉴 클릭 → **"Edit"** 선택
4. 값 업데이트: `https://[1.6에서 생성한 도메인]/auth/chzzk/callback`
   - 예시: `https://melt-backend-production.up.railway.app/auth/chzzk/callback`
5. **"Save"** 클릭

### 1.8 배포 확인

1. **Deployments** 탭에서 배포 상태 확인
   - "Building..." → "Deploying..." → "Active" 상태 확인

2. **View Logs** 클릭하여 로그 확인
   - 에러가 없는지 확인
   - "Database connected" 메시지 확인

3. **Health Check**
   ```bash
   curl https://[Railway-도메인]/health
   ```
   
   또는 브라우저에서:
   ```
   https://[Railway-도메인]/health
   ```

   **예상 응답**:
   ```json
   {
     "status": "ok",
     "database": "connected"
   }
   ```

---

## 2단계: Vercel 프론트엔드 배포

### 2.1 프로젝트 Import

1. **Vercel 대시보드 접속**
   ```
   https://vercel.com/
   ```

2. **GitHub로 로그인**

3. **"Add New..."** → **"Project"** 클릭
4. **"Import Git Repository"** 선택
5. **`cheese3` 저장소 선택**
6. **"Import"** 버튼 클릭

### 2.2 프로젝트 설정

1. **Configure Project** 화면에서:
   - **Framework Preset**: Next.js (자동 감지됨)
   - **Root Directory**: `web` 설정
     - "Edit" 클릭 → `web` 입력 → "Continue"
   - **Build Command**: `npm run build` (기본값, 확인만)
   - **Output Directory**: `.next` (기본값, 확인만)

2. **"Continue"** 클릭

### 2.3 환경 변수 설정

**Environment Variables** 섹션에서 **"Add"** 클릭하여 추가:

#### 변수 1: NEXT_PUBLIC_API_URL
- **Name**: `NEXT_PUBLIC_API_URL`
- **Value**: `https://[Railway-도메인]`
  - **중요**: `[Railway-도메인]`을 1.6에서 생성한 Railway 도메인으로 교체!
  - 예시: `https://melt-backend-production.up.railway.app`
- **Add** 클릭

#### 변수 2: NEXT_PUBLIC_CHZZK_CLIENT_ID
- **Name**: `NEXT_PUBLIC_CHZZK_CLIENT_ID`
- **Value**: `adbe2be0-a1c7-43a5-bdfd-408491968f3b`
- **Add** 클릭

#### 변수 3: NEXT_PUBLIC_FORCE_MOCK
- **Name**: `NEXT_PUBLIC_FORCE_MOCK`
- **Value**: `false`
- **Add** 클릭

### 2.4 배포

1. **"Deploy"** 버튼 클릭
2. 배포 진행 상황 확인
   - "Building..." → "Deploying..." → "Ready"
3. 배포 완료 대기 (약 2-3분)
4. 생성된 도메인 확인 (예: `melt.vercel.app` 또는 `cheese3-xxx.vercel.app`)
5. **이 도메인을 메모해두세요!**

---

## 3단계: 환경 변수 최종 업데이트

### 3.1 Railway FRONTEND_URL 업데이트

1. **Railway 대시보드** → 백엔드 서비스 선택
2. **Settings** → **Variables** 탭
3. `FRONTEND_URL` 변수 찾기
4. **"..."** 메뉴 클릭 → **"Edit"** 선택
5. 값 업데이트: `https://[2.4에서 생성한 Vercel-도메인]`
   - 예시: `https://melt.vercel.app`
6. **"Save"** 클릭

### 3.2 치지직 OAuth Redirect URI 추가

1. **치지직 개발자 포털 접속**
   ```
   https://developers.chzzk.naver.com/
   ```

2. **애플리케이션 관리** → **`melt_app`** 선택

3. **Redirect URI 추가**
   - Redirect URI 입력란에 추가:
     ```
     https://[Railway-도메인]/auth/chzzk/callback
     ```
   - **중요**: `[Railway-도메인]`을 1.6에서 생성한 Railway 도메인으로 교체!
   - 예시: `https://melt-backend-production.up.railway.app/auth/chzzk/callback`

4. **저장** 또는 **"추가"** 버튼 클릭

---

## 4단계: 최종 확인 및 테스트

### 4.1 백엔드 Health Check

브라우저에서 접속:
```
https://[Railway-도메인]/health
```

**예상 응답**:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### 4.2 프론트엔드 접속

브라우저에서 Vercel 도메인 접속:
```
https://[Vercel-도메인]
```

### 4.3 기능 테스트

1. **로그인 테스트**
   - 치지직 OAuth 로그인 시도
   - 개발 모드 로그인 (`/dev/login`) 테스트

2. **기본 기능 테스트**
   - 채널 검색
   - 메시지 전송
   - 후원 기능
   - 프로필 설정

### 4.4 로그 확인

**Railway**:
- Deployments → View Logs
- 에러가 있는지 확인

**Vercel**:
- 프로젝트 → Functions → Logs
- 에러가 있는지 확인

---

## 환경 변수 최종 정리

### Railway (백엔드) - 9개 변수

| 변수명 | 값 |
|--------|-----|
| `PORT` | `3001` |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `postgresql://postgres:blockkwave0806%21@db.pqafhdeeooxpyuocydxa.supabase.co:5432/postgres?sslmode=require` |
| `JWT_SECRET` | `[생성한 값]` |
| `ENCRYPTION_KEY` | `[생성한 값]` |
| `CHZZK_CLIENT_ID` | `adbe2be0-a1c7-43a5-bdfd-408491968f3b` |
| `CHZZK_CLIENT_SECRET` | `ahHose2CWgcApBBrxtlmzPf5THLxEURXwr5s7uc2OFk` |
| `CHZZK_REDIRECT_URI` | `https://[Railway-도메인]/auth/chzzk/callback` |
| `FRONTEND_URL` | `https://[Vercel-도메인]` |

### Vercel (프론트엔드) - 3개 변수

| 변수명 | 값 |
|--------|-----|
| `NEXT_PUBLIC_API_URL` | `https://[Railway-도메인]` |
| `NEXT_PUBLIC_CHZZK_CLIENT_ID` | `adbe2be0-a1c7-43a5-bdfd-408491968f3b` |
| `NEXT_PUBLIC_FORCE_MOCK` | `false` |

---

## 문제 해결

### 배포 실패

1. **로그 확인**
   - Railway: Deployments → View Logs
   - Vercel: 프로젝트 → Functions → Logs

2. **빌드 오류 확인**
   - TypeScript 컴파일 오류
   - 의존성 설치 실패

### 데이터베이스 연결 실패

1. **Connection String 확인**
   - `sslmode=require` 포함 여부
   - 비밀번호 인코딩 확인 (`blockkwave0806%21`)

2. **Railway 환경 변수 확인**
   - `DATABASE_URL` 정확성

### OAuth 오류

1. **Redirect URI 확인**
   - 치지직 개발자 포털과 Railway 환경 변수 일치 여부
   - HTTPS 사용 확인

2. **Client ID/Secret 확인**
   - 환경 변수 정확성

---

## 체크리스트

### Railway 백엔드
- [ ] 프로젝트 생성
- [ ] GitHub 저장소 연결
- [ ] Root Directory 설정 (`backend`)
- [ ] 빌드/시작 명령어 설정
- [ ] 환경 변수 설정 (9개)
- [ ] 도메인 생성
- [ ] CHZZK_REDIRECT_URI 업데이트
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

### 최종 확인
- [ ] 백엔드 Health Check 통과
- [ ] 프론트엔드 접속 가능
- [ ] 데이터베이스 연결 확인
- [ ] OAuth 로그인 테스트
- [ ] 주요 기능 테스트

---

## 완료!

배포가 완료되었습니다! 🎉

이제 다음 URL로 접속하여 테스트하세요:
- 프론트엔드: `https://[Vercel-도메인]`
- 백엔드 Health Check: `https://[Railway-도메인]/health`
