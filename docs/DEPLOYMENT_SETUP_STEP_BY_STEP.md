# 배포 설정 단계별 가이드

## 1. 치지직 클라이언트 ID 발급

### 단계 1: 개발자 포털 접속
1. https://developers.chzzk.naver.com/ 접속
2. 네이버 계정으로 로그인

### 단계 2: 애플리케이션 등록
1. **"애플리케이션 등록"** 또는 **"새 애플리케이션 만들기"** 클릭
2. 정보 입력:
   - 애플리케이션 이름: `Melt`
   - Redirect URI: 
     - 개발: `http://localhost:3001/auth/chzzk/callback`
     - 프로덕션: `https://[Railway-도메인]/auth/chzzk/callback` (나중에 추가)

### 단계 3: Client ID/Secret 확인
1. 등록 후 **Client ID**와 **Client Secret** 발급
2. 메모해두기 (나중에 환경 변수에 사용)

**상세 가이드**: [CHZZK_CLIENT_ID_GUIDE.md](./CHZZK_CLIENT_ID_GUIDE.md)

---

## 2. Supabase SQL 실행

### 방법 A: SQL Editor 사용 (가장 쉬움)

#### 단계 1: SQL Editor 열기
1. https://app.supabase.com/ 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **"SQL Editor"** 클릭

#### 단계 2: 스키마 실행
1. **"New query"** 클릭
2. `backend/db/schema.sql` 파일 열기
3. 전체 내용 복사 (`Ctrl+A` → `Ctrl+C`)
4. SQL Editor에 붙여넣기 (`Ctrl+V`)
5. **"Run"** 버튼 클릭 또는 `Ctrl+Enter`
6. "Success" 메시지 확인

#### 단계 3: 마이그레이션 실행
같은 방식으로 다음 파일들을 **순서대로** 실행:

1. **`backend/db/migrations/001_add_channel_urls.sql`**
   - 파일 열기 → 복사 → 붙여넣기 → Run

2. **`backend/db/migrations/002_add_follows_and_reads.sql`**
   - 파일 열기 → 복사 → 붙여넣기 → Run

3. **`backend/db/migrations/003_add_user_profile_fields.sql`**
   - 파일 열기 → 복사 → 붙여넣기 → Run

#### 단계 4: 확인
1. **"Table Editor"** 클릭
2. 테이블 목록 확인:
   - `users`, `channels`, `messages`, `donation_intents` 등

**상세 가이드**: [SUPABASE_SQL_GUIDE.md](./SUPABASE_SQL_GUIDE.md)

---

## 3. Railway 백엔드 배포

### 단계 1: 프로젝트 생성
1. https://railway.app/ 접속
2. GitHub로 로그인
3. **"New Project"** → **"Deploy from GitHub repo"**
4. `cheese3` 저장소 선택

### 단계 2: 서비스 설정
1. **Root Directory**: `backend` 설정
2. **Settings** → **Build**:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

### 단계 3: 환경 변수 설정
**Settings** → **Variables**에서 추가:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
JWT_SECRET=[openssl rand -base64 32로 생성]
ENCRYPTION_KEY=[openssl rand -hex 32로 생성]
CHZZK_CLIENT_ID=[1단계에서 발급받은 값]
CHZZK_CLIENT_SECRET=[1단계에서 발급받은 값]
CHZZK_REDIRECT_URI=https://[Railway-도메인]/auth/chzzk/callback
FRONTEND_URL=https://[Vercel-도메인] (나중에 설정)
PORT=3001
NODE_ENV=production
```

### 단계 4: 도메인 생성
1. **Settings** → **Networking**
2. **"Generate Domain"** 클릭
3. 도메인 복사 (예: `melt-backend-production.up.railway.app`)

---

## 4. Vercel 프론트엔드 배포

### 단계 1: 프로젝트 Import
1. https://vercel.com/ 접속
2. GitHub로 로그인
3. **"Add New..."** → **"Project"**
4. `cheese3` 저장소 선택
5. **"Import"** 클릭

### 단계 2: 프로젝트 설정
1. **Root Directory**: `web` 설정
2. Framework Preset: Next.js (자동 감지)

### 단계 3: 환경 변수 설정
**Environment Variables**에서 추가:

```env
NEXT_PUBLIC_API_URL=https://[Railway-도메인]
NEXT_PUBLIC_CHZZK_CLIENT_ID=[1단계에서 발급받은 값]
NEXT_PUBLIC_FORCE_MOCK=false
```

### 단계 4: 배포
1. **"Deploy"** 클릭
2. 배포 완료 대기 (2-3분)
3. 도메인 확인 (예: `melt.vercel.app`)

---

## 5. 환경 변수 업데이트

### Railway 백엔드
1. **Settings** → **Variables**
2. `FRONTEND_URL` 업데이트:
   ```
   FRONTEND_URL=https://[Vercel-도메인]
   ```

### 치지직 개발자 포털
1. https://developers.chzzk.naver.com/ 접속
2. 애플리케이션 선택
3. **Redirect URI 추가**:
   ```
   https://[Railway-도메인]/auth/chzzk/callback
   ```

---

## 6. 최종 확인

### 백엔드 Health Check
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

### 프론트엔드 접속
브라우저에서 Vercel 도메인 접속:
```
https://[Vercel-도메인]
```

### 기능 테스트
1. 로그인 테스트
2. 채널 검색 테스트
3. 메시지 전송 테스트
4. 후원 기능 테스트

---

## 요약

1. ✅ **치지직**: 개발자 포털에서 Client ID/Secret 발급
2. ✅ **Supabase**: SQL Editor에서 스키마 및 마이그레이션 실행
3. ✅ **Railway**: 백엔드 배포 및 환경 변수 설정
4. ✅ **Vercel**: 프론트엔드 배포 및 환경 변수 설정
5. ✅ **환경 변수 업데이트**: Railway와 치지직 설정 업데이트
6. ✅ **테스트**: 모든 기능 동작 확인

## 참고 문서

- [치지직 Client ID 발급 가이드](./CHZZK_CLIENT_ID_GUIDE.md)
- [Supabase SQL 실행 가이드](./SUPABASE_SQL_GUIDE.md)
- [완전 배포 가이드](./DEPLOY_COMPLETE_GUIDE.md)
