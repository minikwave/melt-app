# Railway 백엔드 배포 가이드 (상세 버전)

## 📋 목차
1. [Railway 계정 생성 및 로그인](#1-railway-계정-생성-및-로그인)
2. [프로젝트 생성](#2-프로젝트-생성)
3. [백엔드 서비스 추가](#3-백엔드-서비스-추가)
4. [서비스 설정 (Root Directory, Build)](#4-서비스-설정)
5. [비밀 키 생성](#5-비밀-키-생성)
6. [환경 변수 설정](#6-환경-변수-설정)
7. [도메인 생성](#7-도메인-생성)
8. [배포 확인](#8-배포-확인)

---

## 1. Railway 계정 생성 및 로그인

### 1.1 Railway 접속

1. **브라우저에서 Railway 접속**
   ```
   https://railway.app/
   ```

2. **"Start a New Project"** 또는 **"Login"** 버튼 클릭

### 1.2 GitHub로 로그인

1. **"Login with GitHub"** 버튼 클릭
2. GitHub 계정 선택 (ziptalk 또는 minikwave)
3. **"Authorize Railway"** 클릭하여 권한 부여
   - Railway가 GitHub 저장소에 접근할 수 있도록 권한 부여

### 1.3 대시보드 확인

- 로그인 후 Railway 대시보드가 표시됩니다
- 왼쪽 상단에 프로젝트 목록이 보입니다

---

## 2. 프로젝트 생성

### 2.1 새 프로젝트 시작

1. **"New Project"** 버튼 클릭
   - 대시보드 왼쪽 상단 또는 중앙에 있습니다

2. **"Deploy from GitHub repo"** 선택
   - 여러 옵션 중 GitHub 저장소에서 배포하는 옵션을 선택합니다

### 2.2 GitHub 저장소 선택

1. **저장소 목록에서 `melt-app` 선택**
   - ziptalk/melt-app 또는 minikwave/melt-app 중 하나 선택
   - 두 저장소 모두 동일한 코드이므로 어느 것이든 가능합니다

2. **"Deploy Now"** 또는 **"Add"** 버튼 클릭

### 2.3 프로젝트 생성 완료

- 프로젝트가 생성되고 자동으로 서비스가 추가됩니다
- 프로젝트 이름은 자동으로 생성되거나 수정할 수 있습니다

---

## 3. 백엔드 서비스 추가

### 3.1 서비스 확인

- 프로젝트 생성 시 자동으로 서비스가 추가됩니다
- 서비스 이름은 보통 저장소 이름과 동일합니다 (예: `melt-app`)

### 3.2 서비스 이름 변경 (선택적)

1. 서비스 카드에서 **"..."** 메뉴 클릭
2. **"Rename"** 선택
3. 이름을 `melt-backend`로 변경 (선택적)

---

## 4. 서비스 설정

### 4.1 Settings 탭 열기

1. 서비스 카드 클릭 또는
2. 서비스 이름 옆 **"Settings"** 탭 클릭

### 4.2 Source 설정 (Root Directory)

1. **Settings** → **Source** 탭 클릭
2. **Root Directory** 섹션 찾기
3. **"Edit"** 버튼 클릭
4. `backend` 입력
   - ⚠️ **중요**: `backend` 폴더가 루트 디렉토리로 설정되어야 합니다
5. **"Save"** 버튼 클릭

**왜 필요한가요?**
- 프로젝트 루트에는 `backend`와 `web` 폴더가 있습니다
- Railway는 `backend` 폴더 안의 코드를 빌드해야 합니다

### 4.3 Build 설정

1. **Settings** → **Build** 탭 클릭
2. **Build Command** 섹션:
   - **"Edit"** 클릭
   - 다음 명령어 입력:
     ```
     npm install && npm run build
     ```
   - **"Save"** 클릭

3. **Start Command** 섹션:
   - **"Edit"** 클릭
   - 다음 명령어 입력:
     ```
     npm start
     ```
   - **"Save"** 클릭

**명령어 설명:**
- **Build Command**: 의존성 설치 + TypeScript 컴파일
- **Start Command**: 컴파일된 코드 실행

---

## 5. 비밀 키 생성

### 5.1 PowerShell 열기

1. **Windows 키 + X** 누르기
2. **"Windows PowerShell"** 또는 **"터미널"** 선택

### 5.2 JWT_SECRET 생성

PowerShell에서 다음 명령어 실행:

```powershell
$bytes = 1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }
[Convert]::ToBase64String($bytes)
```

**예시 출력:**
```
aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5zA7bC9dE1fG3hI5jK7lM9nO1pQ3rS5tU7vW9xY1zA3=
```

**이 값을 복사해두세요!** (JWT_SECRET으로 사용)

### 5.3 ENCRYPTION_KEY 생성

PowerShell에서 다음 명령어 실행:

```powershell
-join ((48..57) + (97..102) | Get-Random -Count 64 | ForEach-Object { [char]$_ })
```

**예시 출력:**
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890ab
```

**이 값을 복사해두세요!** (ENCRYPTION_KEY로 사용)

### 5.4 값 저장

- JWT_SECRET: `[위에서 생성한 값]`
- ENCRYPTION_KEY: `[위에서 생성한 값]`

**⚠️ 중요**: 이 값들은 안전하게 보관하세요. 나중에 환경 변수에 입력합니다.

---

## 6. 환경 변수 설정

### 6.1 Variables 탭 열기

1. **Settings** → **Variables** 탭 클릭
2. **"New Variable"** 버튼 클릭

### 6.2 환경 변수 추가 (9개)

하나씩 순서대로 추가합니다:

#### 변수 1: PORT

1. **Name**: `PORT`
2. **Value**: `3001`
3. **"Add"** 버튼 클릭

**설명**: 백엔드 서버가 실행될 포트 번호

---

#### 변수 2: NODE_ENV

1. **Name**: `NODE_ENV`
2. **Value**: `production`
3. **"Add"** 버튼 클릭

**설명**: 프로덕션 환경임을 나타냅니다

---

#### 변수 3: DATABASE_URL

1. **Name**: `DATABASE_URL`
2. **Value**: 다음을 정확히 복사하여 붙여넣기:
   ```
   postgresql://postgres:blockkwave0806%21@db.pqafhdeeooxpyuocydxa.supabase.co:5432/postgres?sslmode=require
   ```
3. **"Add"** 버튼 클릭

**⚠️ 중요 사항:**
- 비밀번호의 `!`가 `%21`로 인코딩되어 있습니다
- `sslmode=require`가 포함되어 있어야 합니다
- Project Reference ID: `pqafhdeeooxpyuocydxa`

**설명**: Supabase 데이터베이스 연결 문자열

---

#### 변수 4: JWT_SECRET

1. **Name**: `JWT_SECRET`
2. **Value**: `[5.2에서 생성한 값]`
   - 예시: `aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5zA7bC9dE1fG3hI5jK7lM9nO1pQ3rS5tU7vW9xY1zA3=`
3. **"Add"** 버튼 클릭

**설명**: JWT 토큰 서명에 사용되는 비밀 키

---

#### 변수 5: ENCRYPTION_KEY

1. **Name**: `ENCRYPTION_KEY`
2. **Value**: `[5.3에서 생성한 값]`
   - 예시: `a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890ab`
3. **"Add"** 버튼 클릭

**설명**: 데이터 암호화에 사용되는 키

---

#### 변수 6: CHZZK_CLIENT_ID

1. **Name**: `CHZZK_CLIENT_ID`
2. **Value**: `adbe2be0-a1c7-43a5-bdfd-408491968f3b`
3. **"Add"** 버튼 클릭

**설명**: 치지직 OAuth 클라이언트 ID

---

#### 변수 7: CHZZK_CLIENT_SECRET

1. **Name**: `CHZZK_CLIENT_SECRET`
2. **Value**: `ahHose2CWgcApBBrxtlmzPf5THLxEURXwr5s7uc2OFk`
3. **"Add"** 버튼 클릭

**설명**: 치지직 OAuth 클라이언트 시크릿

---

#### 변수 8: CHZZK_REDIRECT_URI

1. **Name**: `CHZZK_REDIRECT_URI`
2. **Value**: `https://[Railway-도메인]/auth/chzzk/callback`
   - ⚠️ **참고**: 도메인은 7단계에서 생성 후 업데이트합니다
   - 임시로 입력: `https://placeholder.up.railway.app/auth/chzzk/callback`
3. **"Add"** 버튼 클릭

**설명**: OAuth 인증 후 리다이렉트될 URL

---

#### 변수 9: FRONTEND_URL

1. **Name**: `FRONTEND_URL`
2. **Value**: `https://[Vercel-도메인]`
   - ⚠️ **참고**: Vercel 배포 후 업데이트합니다
   - 임시로 입력: `https://placeholder.vercel.app`
3. **"Add"** 버튼 클릭

**설명**: 프론트엔드 URL (CORS 설정에 사용)

---

### 6.3 환경 변수 확인

**Variables** 탭에서 9개 변수가 모두 추가되었는지 확인:

- ✅ PORT
- ✅ NODE_ENV
- ✅ DATABASE_URL
- ✅ JWT_SECRET
- ✅ ENCRYPTION_KEY
- ✅ CHZZK_CLIENT_ID
- ✅ CHZZK_CLIENT_SECRET
- ✅ CHZZK_REDIRECT_URI
- ✅ FRONTEND_URL

---

## 7. 도메인 생성

### 7.1 Networking 탭 열기

1. **Settings** → **Networking** 탭 클릭

### 7.2 도메인 생성

1. **"Generate Domain"** 버튼 클릭
2. 도메인이 자동으로 생성됩니다
   - 예시: `melt-backend-production.up.railway.app`
3. **생성된 도메인을 복사해두세요!**

### 7.3 CHZZK_REDIRECT_URI 업데이트

1. **Settings** → **Variables** 탭으로 돌아가기
2. `CHZZK_REDIRECT_URI` 변수 찾기
3. **"..."** 메뉴 클릭 → **"Edit"** 선택
4. 값 업데이트:
   ```
   https://[7.2에서 생성한 도메인]/auth/chzzk/callback
   ```
   - 예시: `https://melt-backend-production.up.railway.app/auth/chzzk/callback`
5. **"Save"** 버튼 클릭

---

## 8. 배포 확인

### 8.1 배포 상태 확인

1. **Deployments** 탭 클릭
2. 배포 상태 확인:
   - **"Building..."**: 빌드 중
   - **"Deploying..."**: 배포 중
   - **"Active"**: 배포 완료 ✅

### 8.2 로그 확인

1. **"View Logs"** 버튼 클릭
2. 로그에서 다음을 확인:
   - ✅ "Database connected" 메시지
   - ✅ "Server running on port 3001" 메시지
   - ❌ 에러 메시지가 없는지 확인

### 8.3 Health Check

브라우저에서 다음 URL 접속:
```
https://[Railway-도메인]/health
```

**예상 응답:**
```json
{
  "status": "ok",
  "database": "connected"
}
```

### 8.4 문제 해결

**배포 실패 시:**
1. **로그 확인**: 에러 메시지 확인
2. **환경 변수 확인**: 모든 변수가 올바르게 설정되었는지 확인
3. **DATABASE_URL 확인**: Connection String이 정확한지 확인

**데이터베이스 연결 실패 시:**
1. `DATABASE_URL`의 `sslmode=require` 확인
2. 비밀번호 인코딩 확인 (`%21`)
3. Supabase Network Restrictions 확인 (모든 IP 허용)

---

## ✅ 체크리스트

- [ ] Railway 계정 생성 및 로그인
- [ ] 프로젝트 생성 (GitHub 저장소 연결)
- [ ] 백엔드 서비스 추가
- [ ] Root Directory 설정 (`backend`)
- [ ] Build Command 설정 (`npm install && npm run build`)
- [ ] Start Command 설정 (`npm start`)
- [ ] JWT_SECRET 생성 및 저장
- [ ] ENCRYPTION_KEY 생성 및 저장
- [ ] 환경 변수 9개 모두 추가
- [ ] 도메인 생성
- [ ] CHZZK_REDIRECT_URI 업데이트
- [ ] 배포 완료 확인
- [ ] Health Check 통과

---

## 📝 다음 단계

Railway 백엔드 배포가 완료되면:
1. **Vercel 프론트엔드 배포** 진행
2. **Railway FRONTEND_URL 업데이트**
3. **치지직 OAuth Redirect URI 추가**

---

## 🔗 참고 자료

- [Railway 공식 문서](https://docs.railway.app/)
- [Vercel 배포 가이드](./VERCEL_SETUP_DETAILED.md)
- [전체 배포 가이드](./DEPLOY_RAILWAY_VERCEL.md)
