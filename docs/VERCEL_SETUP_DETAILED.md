# Vercel 프론트엔드 배포 가이드 (상세 버전)

## 📋 목차
1. [Vercel 계정 생성 및 로그인](#1-vercel-계정-생성-및-로그인)
2. [프로젝트 Import](#2-프로젝트-import)
3. [프로젝트 설정](#3-프로젝트-설정)
4. [환경 변수 설정](#4-환경-변수-설정)
5. [배포 확인](#5-배포-확인)

---

## 1. Vercel 계정 생성 및 로그인

### 1.1 Vercel 접속

1. **브라우저에서 Vercel 접속**
   ```
   https://vercel.com/
   ```

2. **"Sign Up"** 또는 **"Login"** 버튼 클릭

### 1.2 GitHub로 로그인

1. **"Continue with GitHub"** 버튼 클릭
2. GitHub 계정 선택 (ziptalk 또는 minikwave)
3. **"Authorize Vercel"** 클릭하여 권한 부여
   - Vercel이 GitHub 저장소에 접근할 수 있도록 권한 부여

### 1.3 대시보드 확인

- 로그인 후 Vercel 대시보드가 표시됩니다
- 왼쪽에 프로젝트 목록이 보입니다

---

## 2. 프로젝트 Import

### 2.1 새 프로젝트 시작

1. **"Add New..."** 버튼 클릭
   - 대시보드 왼쪽 상단 또는 중앙에 있습니다

2. **"Project"** 선택

### 2.2 GitHub 저장소 선택

1. **"Import Git Repository"** 선택
2. 저장소 목록에서 **`melt-app`** 또는 **`cheese3`** 선택
   - ziptalk/melt-app 또는 minikwave/melt-app 중 하나 선택
   - 두 저장소 모두 동일한 코드이므로 어느 것이든 가능합니다

3. **"Import"** 버튼 클릭

---

## 3. 프로젝트 설정

### 3.1 Configure Project 화면

Import 후 **Configure Project** 화면이 표시됩니다.

### 3.2 Root Directory 설정

1. **"Root Directory"** 섹션 찾기
2. **"Edit"** 버튼 클릭
3. `web` 입력
4. **"Continue"** 버튼 클릭

**왜 필요한가요?**
- 프로젝트 루트에는 `backend`와 `web` 폴더가 있습니다
- Vercel은 `web` 폴더 안의 Next.js 코드를 빌드해야 합니다

### 3.3 Framework Preset 확인

- **Framework Preset**: Next.js (자동 감지됨)
- 자동으로 감지되므로 변경할 필요 없습니다

### 3.4 Build Settings 확인

- **Build Command**: `npm run build` (기본값, 확인만)
- **Output Directory**: `.next` (기본값, 확인만)
- **Install Command**: `npm install` (기본값, 확인만)

---

## 4. 환경 변수 설정

### 4.1 Environment Variables 섹션

**Configure Project** 화면에서 **Environment Variables** 섹션을 찾습니다.

### 4.2 환경 변수 추가 (3개)

**"Add"** 버튼을 클릭하여 하나씩 추가합니다:

#### 변수 1: NEXT_PUBLIC_API_URL

1. **Name**: `NEXT_PUBLIC_API_URL`
2. **Value**: `https://melt-app-production.up.railway.app`
   - ⚠️ **중요**: Railway 백엔드 도메인을 정확히 입력하세요
3. **"Add"** 버튼 클릭

**설명**: 프론트엔드에서 백엔드 API를 호출할 때 사용하는 URL

---

#### 변수 2: NEXT_PUBLIC_CHZZK_CLIENT_ID

1. **Name**: `NEXT_PUBLIC_CHZZK_CLIENT_ID`
2. **Value**: `adbe2be0-a1c7-43a5-bdfd-408491968f3b`
3. **"Add"** 버튼 클릭

**설명**: 치지직 OAuth 클라이언트 ID (프론트엔드에서 사용)

---

#### 변수 3: NEXT_PUBLIC_FORCE_MOCK

1. **Name**: `NEXT_PUBLIC_FORCE_MOCK`
2. **Value**: `false`
3. **"Add"** 버튼 클릭

**설명**: Mock 데이터 사용 여부 (프로덕션에서는 false)

---

### 4.3 환경 변수 확인

**Environment Variables** 섹션에서 3개 변수가 모두 추가되었는지 확인:

- ✅ NEXT_PUBLIC_API_URL
- ✅ NEXT_PUBLIC_CHZZK_CLIENT_ID
- ✅ NEXT_PUBLIC_FORCE_MOCK

---

## 5. 배포

### 5.1 배포 시작

1. **"Deploy"** 버튼 클릭
2. 배포 진행 상황 확인
   - "Building..." → "Deploying..." → "Ready"

### 5.2 배포 완료 대기

- 배포 완료까지 약 2-3분 소요
- 진행 상황은 화면에서 실시간으로 확인 가능

### 5.3 도메인 확인

배포 완료 후:
1. 생성된 도메인 확인 (예: `melt-app.vercel.app` 또는 `cheese3-xxx.vercel.app`)
2. **이 도메인을 메모해두세요!**
3. Railway `FRONTEND_URL` 업데이트에 사용됩니다

---

## 6. 배포 확인

### 6.1 프론트엔드 접속

브라우저에서 Vercel 도메인 접속:
```
https://[Vercel-도메인]
```

### 6.2 기능 테스트

1. **로그인 테스트**
   - 치지직 OAuth 로그인 시도
   - 개발 모드 로그인 (`/dev/login`) 테스트

2. **기본 기능 테스트**
   - 채널 검색
   - 메시지 전송
   - 후원 기능
   - 프로필 설정

### 6.3 로그 확인

**Vercel 대시보드**:
- 프로젝트 → **Functions** → **Logs**
- 에러가 있는지 확인

---

## 7. Railway FRONTEND_URL 업데이트

### 7.1 Railway 환경 변수 업데이트

1. **Railway 대시보드** → 백엔드 서비스 선택
2. **Settings** → **Variables** 탭
3. `FRONTEND_URL` 변수 찾기
4. **"..."** 메뉴 → **"Edit"** 선택
5. 값 업데이트: `https://[Vercel-도메인]`
   - 예시: `https://melt-app.vercel.app`
6. **"Save"** 클릭

### 7.2 재배포 확인

Railway에서 자동 재배포가 시작됩니다:
1. **Deployments** 탭에서 배포 상태 확인
2. **View Logs**에서 로그 확인

---

## 8. 치지직 OAuth Redirect URI 추가

### 8.1 치지직 개발자 포털

1. **치지직 개발자 포털 접속**
   ```
   https://developers.chzzk.naver.com/
   ```

2. **애플리케이션 관리** → **`melt_app`** 선택

### 8.2 Redirect URI 추가

1. **Redirect URI** 섹션 찾기
2. 다음 URI 추가:
   ```
   https://melt-app-production.up.railway.app/auth/chzzk/callback
   ```
3. **저장** 또는 **"추가"** 버튼 클릭

---

## ✅ 체크리스트

### Vercel 프론트엔드
- [ ] Vercel 계정 생성 및 로그인
- [ ] 프로젝트 Import (GitHub 저장소)
- [ ] Root Directory 설정 (`web`)
- [ ] 환경 변수 설정 (3개)
- [ ] 배포 완료
- [ ] 도메인 확인

### 환경 변수 업데이트
- [ ] Railway `FRONTEND_URL` 업데이트
- [ ] 치지직 Redirect URI 추가

### 최종 확인
- [ ] 프론트엔드 접속 가능
- [ ] 백엔드 API 연결 확인
- [ ] OAuth 로그인 테스트
- [ ] 주요 기능 테스트

---

## 환경 변수 요약

### Vercel (프론트엔드) - 3개 변수

| 변수명 | 값 |
|--------|-----|
| `NEXT_PUBLIC_API_URL` | `https://melt-app-production.up.railway.app` |
| `NEXT_PUBLIC_CHZZK_CLIENT_ID` | `adbe2be0-a1c7-43a5-bdfd-408491968f3b` |
| `NEXT_PUBLIC_FORCE_MOCK` | `false` |

---

## 문제 해결

### 빌드 실패

1. **로그 확인**: Vercel → 프로젝트 → Deployments → View Logs
2. **Root Directory 확인**: `web`로 설정되었는지 확인
3. **의존성 오류**: `web/package.json` 확인

### API 연결 실패

1. **NEXT_PUBLIC_API_URL 확인**: Railway 도메인이 정확한지 확인
2. **CORS 오류**: Railway `FRONTEND_URL`이 Vercel 도메인과 일치하는지 확인

### OAuth 오류

1. **치지직 Redirect URI 확인**: Railway 도메인과 일치하는지 확인
2. **Client ID 확인**: 환경 변수 정확성 확인

---

## 다음 단계

배포 완료 후:
1. **모니터링**: Vercel과 Railway 로그 확인
2. **테스트**: 모든 기능 정상 작동 확인
3. **최적화**: 성능 모니터링 및 개선

---

## 🔗 참고 자료

- [Vercel 공식 문서](https://vercel.com/docs)
- [Railway 배포 가이드](./RAILWAY_SETUP_DETAILED.md)
- [전체 배포 가이드](./DEPLOY_RAILWAY_VERCEL.md)
