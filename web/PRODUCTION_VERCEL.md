# Vercel 프로덕션 배포 (route.ts / API 함수 포함)

## 1. Vercel 프로젝트 설정 (필수)

### Root Directory = `web`

- Vercel 대시보드 → 프로젝트 → **Settings** → **General** → **Root Directory**
- **Edit** → `web` 입력 후 저장
- `web`이 아니면 `app/api/**/route.ts`가 빌드에 포함되지 않아 **Functions 목록에 API가 보이지 않습니다.**

### next.config.js 금지 사항

- `output: 'export'` 사용 **금지**. 사용 시 `app/api/*` 서버리스 함수가 모두 제외됩니다.

---

## 2. 배포 후 API(Functions) 확인

배포가 끝나면 다음을 확인하세요.

| 경로 | 설명 |
|------|------|
| `/api/health` | `{ "status":"ok","type":"vercel-serverless" }` → route.ts가 정상 배포된 것 |
| `/api/auth/chzzk/login` | 치지직 OAuth 로그인 페이지로 리다이렉트 |

Vercel 배포 상세에서 **Functions** (또는 **Serverless**) 섹션에 다음이 포함되어야 합니다.

- `/api/health`
- `/api/auth/chzzk/callback`
- `/api/auth/chzzk/login`

PAGE만 있고 위 항목이 없다면 **Root Directory가 `web`인지** 다시 확인하세요.

---

## 3. Vercel 환경 변수

| Name | Production | 설명 |
|------|------------|------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.railway.app` | 백엔드 API (Railway 등) |
| `NEXT_PUBLIC_BASE_URL` | `https://your-app.vercel.app` | 프론트 도메인 (에러 시 리다이렉트 등) |
| `CHZZK_CLIENT_ID` | (치지직 앱 Client ID) | OAuth, **서버 전용** (비공개) |
| `CHZZK_CLIENT_SECRET` | (치지직 앱 Secret) | OAuth, **서버 전용** (비공개) |

**CHZZK_REDIRECT_URI**: 코드에서는 **사용하지 않음**. 리다이렉트 URI는 항상 `https://<현재 요청 호스트>/api/auth/chzzk/callback` 로 자동 계산됩니다.  
**치지직 개발자 콘솔**에 `https://your-app.vercel.app/api/auth/chzzk/callback` (배포 도메인에 맞게)를 등록해야 합니다.

**프로덕션에서 설정하지 말 것**

- `NEXT_PUBLIC_FORCE_MOCK` → 설정하지 않으면 실제 API 사용

---

## 4. 백엔드(Railway 등) 환경 변수

- **`FRONTEND_URL`** = `https://your-app.vercel.app` (CORS, **로그인 후 리다이렉트 대상**)
  - ⚠️ **Railway 자신의 URL을 넣으면** 로그인 후 사용자가 Railway 쪽 `/app`으로 가며 404·루프가 발생합니다. 반드시 **Vercel(프론트) URL**로 설정하세요.
- `CHZZK_REDIRECT_URI` 는 **OAuth가 Vercel에 있을 때**에는 Railway에 둘 필요 없습니다. (선택 사항)

---

## 5. OAuth가 Vercel에 있는 이유 (리다이렉트 URI)

- **지금 구조**: 로그인 시작·치지직 콜백·토큰 교환·쿠키 설정까지 **전부 Vercel** (`/api/auth/chzzk/login`, `/api/auth/chzzk/callback`)에서 처리합니다.
- **이유**: 과거에 치지직 API를 Railway(해외 리전)에서 호출할 때 ECONNRESET이 나서, **치지직에 가까운/접속 가능한 쪽(Vercel)** 에서 토큰 교환을 하도록 옮긴 것입니다.
- **리다이렉트 URI**: 치지직이 사용자를 되돌려 보내는 주소는 **반드시 이 프론트(Vercel) 도메인** 이어야 합니다.  
  - `https://<Vercel 도메인>/api/auth/chzzk/callback`  
  - 코드는 `CHZZK_REDIRECT_URI` env를 쓰지 않고, **요청이 들어온 호스트**를 기준으로 위 주소를 만들어 씁니다.  
  - 따라서 **CHZZK_REDIRECT_URI를 Railway로 두면 안 됩니다.** (이전 문서 일부가 잘못 안내했을 수 있음.)

---

## 6. "로그인 후 Railway로 리다이렉트된다" / "끊임없이 리다이렉트된다"

### 원인

1. **`FRONTEND_URL` 이 Railway로 설정된 경우**  
   - 백엔드 `POST /auth/chzzk/complete` 가 `redirectUrl = FRONTEND_URL + /app` 을 돌려줍니다.  
   - `FRONTEND_URL` 이 Railway이면, Vercel 콜백이 사용자를 `https://xxx.railway.app/app` 으로 보내고,  
     쿠키는 Vercel 도메인에만 있어서 Railway에서는 로그인 상태가 아니며, `/app` 이 없으면 404·이상 동작이 난 뒤 다시 로그인으로 돌아가는 **루프**가 생길 수 있습니다.

2. **`CHZZK_REDIRECT_URI` 를 Railway로 둔 경우 (과거)**  
   - 치지직이 사용자를 `https://xxx.railway.app/auth/chzzk/callback` 로 보냅니다.  
   - Railway에서 쿠키를 세팅하면 그 쿠키는 **Railway 도메인**에만 있어서, Vercel 프론트에서는 못 읽고, 로그인 루프가 발생할 수 있습니다.  
   - **지금 코드**는 `CHZZK_REDIRECT_URI` 를 사용하지 않고, **항상 현재 요청 호스트(Vercel)** 로 리다이렉트 URI를 만들므로, 이 env를 Railway로 잘못 넣어도 **코드 동작에는 영향 없습니다.** (다만 치지직 콘솔에는 **Vercel** 콜백 URL만 등록해야 합니다.)

### 해결

- **Railway `FRONTEND_URL`** = `https://your-app.vercel.app` (Vercel URL) 로 설정.
- **치지직 개발자 콘솔** 리다이렉트 URI = `https://your-app.vercel.app/api/auth/chzzk/callback` (Vercel, **Railway 아님**).
- **보정 로직**: `FRONTEND_URL` 이 잘못되어 백엔드가 Railway 주소를 `redirectUrl` 로 주더라도, Vercel 콜백에서 **그 주소의 호스트가 `NEXT_PUBLIC_API_URL`(백엔드)과 같으면** 자동으로 Vercel 쪽 `/app` 등으로 갈 주소로 바꿔서 리다이렉트합니다.

---

## 7. "Railway에서 치지직 OAuth를 처리하는 게 나을까?"

- **구조적 차이**
  - **지금 (Vercel OAuth)**:  
    - 장: 치지직 API를 Vercel에서 호출해, 해외 리전 이슈를 피할 수 있음.  
    - 장: 쿠키를 **Vercel 도메인**에 바로 세팅할 수 있어, SPA가 `melt_session` 을 읽고 `Authorization` 으로 백엔드에 보내는 방식이 단순함.
  - **Railway OAuth**  
    - 장: OAuth·세션·DB를 한 서버에서 관리해 단순해 보일 수 있음.  
    - 단: 치지직 API를 Railway(해외)에서 호출할 때 **ECONNRESET 등이 다시 날 수 있음.**  
    - 단: 쿠키는 Railway 도메인에만 설정되므로, **Vercel에 뜬 SPA는 그 쿠키를 읽을 수 없음.**  
      → 토큰을 Vercel에 넘기려면, Railway가 **일회용 코드**를 만들어 `https://your-app.vercel.app/api/auth/session?code=xxx` 처럼 보내고,  
      Vercel API 라우트가 Railway `POST /auth/exchange-session-code` 로 코드를 주고 JWT를 받은 뒤, **Vercel 도메인에 쿠키를 세팅**하는 식의 **핸드오프**가 필요함.

- **정리**:  
  - 치지직 접속이 Railway에서 안정적이면, Railway OAuth + 위와 같은 **코드 기반 세션 핸드오프**로 옮기는 선택지는 있음.  
  - 다만 **지금처럼 Vercel에서 OAuth를 처리하는 구성이, 프론트(Vercel)와 백엔드(Railway)를 나눈 경우에는 무난한 선택**입니다.  
  - 우선 **`FRONTEND_URL`·치지직 리다이렉트 URI를 위처럼 맞추고, 보정 로직이 동작하는지** 확인하는 것을 권장합니다.

---

## 8. 트러블슈팅

- **Functions에 /api가 안 보임**  
  - Root Directory = `web` 인지 확인  
  - `output: 'export'` 가 next.config에 있는지 확인 후 제거  

- **/api/health 404**  
  - Root Directory = `web`  
  - 재배포 후에도 404면, Vercel 빌드 로그에서 `app/api` 관련 에러 확인  

- **치지직 로그인 후 404 또는 5xx**  
  - 치지직 개발자 콘솔 리다이렉트 URI가 `https://<Vercel 도메인>/api/auth/chzzk/callback` 인지  
  - `CHZZK_CLIENT_ID`, `CHZZK_CLIENT_SECRET` 이 Vercel에 설정되어 있는지  
  - 백엔드 `NEXT_PUBLIC_API_URL` 의 `/auth/chzzk/complete` 가 동작하는지 (헬스/curl 등으로 확인)

- **로그인 후 Railway로 보이거나 리다이렉트 루프**  
  - [6. "로그인 후 Railway로 리다이렉트된다"](#6-로그인-후-railway로-리다이렉트된다--끊임없이-리다이렉트된다) 참고
