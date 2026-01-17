# 지금 바로 배포하기

## 현재 상태
✅ Supabase 프로젝트 생성 완료  
✅ SQL 스키마 실행 완료  
✅ Database password: `blockkwave0806!`  
✅ 치지직 Client ID/Secret 확인 완료

---

## 1단계: Project Reference ID 확인

### Supabase에서 확인

**방법 1: URL에서 확인**
1. Supabase 대시보드 브라우저 주소창 확인
2. URL 형식: `https://app.supabase.com/project/[PROJECT-REF]`
3. `[PROJECT-REF]` 부분이 Project Reference ID입니다

**방법 2: Settings → General**
1. Settings → General 탭
2. "Reference ID" 확인

**예시**: `abcdefghijklmnop` (실제 값으로 교체 필요)

---

## 2단계: Connection String (준비 완료)

**Project Reference ID**: `pqafhdeeooxpyuocydxa`

**Connection String**:
```
postgresql://postgres:blockkwave0806%21@db.pqafhdeeooxpyuocydxa.supabase.co:5432/postgres?sslmode=require
```

**이 Connection String을 복사해두세요!**

---

## 3단계: Railway 백엔드 배포

### 3.1 프로젝트 생성

1. **Railway 접속**: https://railway.app/
2. **GitHub로 로그인**
3. **"New Project"** → **"Deploy from GitHub repo"**
4. **`cheese3` 저장소 선택**

### 3.2 백엔드 서비스 설정

1. **"Add Service"** → **"GitHub Repo"** 선택
2. 같은 저장소 선택
3. **Settings** → **Source**:
   - **Root Directory**: `backend` 입력
4. **Settings** → **Build**:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### 3.3 비밀 키 생성

PowerShell에서 실행:
```powershell
# JWT_SECRET 생성
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# ENCRYPTION_KEY 생성
-join ((48..57) + (97..102) | Get-Random -Count 64 | ForEach-Object { [char]$_ })
```

생성된 두 값을 메모해두세요.

### 3.4 환경 변수 설정

**Settings** → **Variables** → **"New Variable"** 클릭하여 하나씩 추가:

1. **PORT**
   ```
   3001
   ```

2. **NODE_ENV**
   ```
   production
   ```

3. **DATABASE_URL**
   ```
   postgresql://postgres:blockkwave0806%21@db.pqafhdeeooxpyuocydxa.supabase.co:5432/postgres?sslmode=require
   ```

4. **JWT_SECRET**
   ```
   [3.3에서 생성한 값]
   ```

5. **ENCRYPTION_KEY**
   ```
   [3.3에서 생성한 값]
   ```

6. **CHZZK_CLIENT_ID**
   ```
   adbe2be0-a1c7-43a5-bdfd-408491968f3b
   ```

7. **CHZZK_CLIENT_SECRET**
   ```
   ahHose2CWgcApBBrxtlmzPf5THLxEURXwr5s7uc2OFk
   ```

8. **CHZZK_REDIRECT_URI**
   ```
   https://[Railway-도메인]/auth/chzzk/callback
   ```
   **참고**: 도메인은 3.5에서 생성 후 업데이트

9. **FRONTEND_URL**
   ```
   https://[Vercel-도메인]
   ```
   **참고**: Vercel 배포 후 업데이트

### 3.5 도메인 생성

1. **Settings** → **Networking**
2. **"Generate Domain"** 클릭
3. 생성된 도메인 복사 (예: `melt-backend-production.up.railway.app`)
4. **이 도메인을 메모해두세요!**

### 3.6 CHZZK_REDIRECT_URI 업데이트

1. **Settings** → **Variables**
2. `CHZZK_REDIRECT_URI` 찾기
3. **Edit** 클릭
4. 값 업데이트: `https://[3.5에서 생성한 도메인]/auth/chzzk/callback`
5. **Save** 클릭

### 3.7 배포 확인

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

## 4단계: Vercel 프론트엔드 배포

### 4.1 프로젝트 Import

1. **Vercel 접속**: https://vercel.com/
2. **GitHub로 로그인**
3. **"Add New..."** → **"Project"**
4. **"Import Git Repository"** 선택
5. **`cheese3` 저장소 선택**
6. **"Import"** 클릭

### 4.2 프로젝트 설정

1. **Root Directory**: `web` 설정
   - "Edit" 클릭 → `web` 입력 → "Continue"
2. **Framework Preset**: Next.js (자동 감지)

### 4.3 환경 변수 설정

**Environment Variables** → **"Add"** 클릭하여 추가:

1. **NEXT_PUBLIC_API_URL**
   ```
   https://[Railway-도메인]
   ```
   **중요**: `[Railway-도메인]`을 3.5에서 생성한 Railway 도메인으로 교체!

2. **NEXT_PUBLIC_CHZZK_CLIENT_ID**
   ```
   adbe2be0-a1c7-43a5-bdfd-408491968f3b
   ```

3. **NEXT_PUBLIC_FORCE_MOCK**
   ```
   false
   ```

### 4.4 배포

1. **"Deploy"** 버튼 클릭
2. 배포 완료 대기 (약 2-3분)
3. 생성된 도메인 확인 (예: `melt.vercel.app`)
4. **이 도메인을 메모해두세요!**

---

## 5단계: 환경 변수 최종 업데이트

### 5.1 Railway FRONTEND_URL 업데이트

1. **Railway** → 백엔드 서비스 → **Settings** → **Variables**
2. `FRONTEND_URL` 찾기
3. **Edit** 클릭
4. 값 업데이트: `https://[4.4에서 생성한 Vercel-도메인]`
5. **Save** 클릭

### 5.2 치지직 OAuth Redirect URI 추가

1. **치지직 개발자 포털**: https://developers.chzzk.naver.com/
2. **애플리케이션 관리** → **`melt_app`** 선택
3. **Redirect URI 추가**:
   ```
   https://[Railway-도메인]/auth/chzzk/callback
   ```
   **중요**: `[Railway-도메인]`을 3.5에서 생성한 Railway 도메인으로 교체!
4. **저장**

---

## 6단계: 최종 확인

### 6.1 백엔드 Health Check

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

### 6.2 프론트엔드 접속

브라우저에서 Vercel 도메인 접속:
```
https://[Vercel-도메인]
```

### 6.3 기능 테스트

1. **로그인 테스트**
   - 치지직 OAuth 로그인
   - 개발 모드 로그인 (`/dev/login`)

2. **기본 기능 테스트**
   - 채널 검색
   - 메시지 전송
   - 후원 기능
   - 프로필 설정

---

## 환경 변수 요약

### Railway (백엔드) - 9개

| 변수명 | 값 |
|--------|-----|
| `PORT` | `3001` |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `postgresql://postgres:blockkwave0806%21@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require` |
| `JWT_SECRET` | [생성 필요] |
| `ENCRYPTION_KEY` | [생성 필요] |
| `CHZZK_CLIENT_ID` | `adbe2be0-a1c7-43a5-bdfd-408491968f3b` |
| `CHZZK_CLIENT_SECRET` | `ahHose2CWgcApBBrxtlmzPf5THLxEURXwr5s7uc2OFk` |
| `CHZZK_REDIRECT_URI` | `https://[Railway-도메인]/auth/chzzk/callback` |
| `FRONTEND_URL` | `https://[Vercel-도메인]` |

### Vercel (프론트엔드) - 3개

| 변수명 | 값 |
|--------|-----|
| `NEXT_PUBLIC_API_URL` | `https://[Railway-도메인]` |
| `NEXT_PUBLIC_CHZZK_CLIENT_ID` | `adbe2be0-a1c7-43a5-bdfd-408491968f3b` |
| `NEXT_PUBLIC_FORCE_MOCK` | `false` |

---

## 문제 해결

### Connection String 오류

**확인 사항**:
1. Project Reference ID가 올바른지
2. 비밀번호가 `blockkwave0806%21`로 인코딩되었는지
3. `sslmode=require`가 포함되었는지

### 데이터베이스 연결 실패

**확인 사항**:
1. Railway 환경 변수 `DATABASE_URL` 정확성
2. Supabase Network Restrictions 확인 (모든 IP 허용인지)

### OAuth 오류

**확인 사항**:
1. 치지직 개발자 포털의 Redirect URI와 Railway 환경 변수 일치
2. HTTPS 사용 확인

---

## 체크리스트

- [ ] Project Reference ID 확인
- [ ] Connection String 구성
- [ ] Railway 프로젝트 생성
- [ ] Railway 환경 변수 설정 (9개)
- [ ] Railway 도메인 생성
- [ ] Vercel 프로젝트 Import
- [ ] Vercel 환경 변수 설정 (3개)
- [ ] Vercel 배포 완료
- [ ] Railway FRONTEND_URL 업데이트
- [ ] 치지직 Redirect URI 추가
- [ ] Health Check 통과
- [ ] 기능 테스트 완료
