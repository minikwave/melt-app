# 빠른 배포 가이드

## 5분 안에 배포하기

### 1. Supabase 설정 (2분)

```bash
# 1. Supabase 프로젝트 생성
# https://app.supabase.com/ → New Project

# 2. 연결 문자열 복사
# Settings → Database → Connection string

# 3. SQL Editor에서 스키마 실행
# backend/db/schema.sql
# backend/db/migrations/001_add_channel_urls.sql
# backend/db/migrations/002_add_follows_and_reads.sql
# backend/db/migrations/003_add_user_profile_fields.sql
```

### 2. Railway 백엔드 배포 (2분)

```bash
# 1. Railway 접속
# https://railway.app/ → New Project → Deploy from GitHub

# 2. 저장소 선택: cheese3
# 3. Root Directory: backend
# 4. 환경 변수 설정 (아래 참고)
# 5. Deploy
```

**환경 변수**:
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
JWT_SECRET=[openssl rand -base64 32]
ENCRYPTION_KEY=[openssl rand -hex 32]
CHZZK_CLIENT_ID=[치지직 Client ID]
CHZZK_CLIENT_SECRET=[치지직 Client Secret]
CHZZK_REDIRECT_URI=https://[Railway-도메인]/auth/chzzk/callback
FRONTEND_URL=https://[Vercel-도메인]
PORT=3001
NODE_ENV=production
```

### 3. Vercel 프론트엔드 배포 (1분)

```bash
# 1. Vercel 접속
# https://vercel.com/ → Add New Project

# 2. 저장소 선택: cheese3
# 3. Root Directory: web
# 4. 환경 변수 설정 (아래 참고)
# 5. Deploy
```

**환경 변수**:
```
NEXT_PUBLIC_API_URL=https://[Railway-도메인]
NEXT_PUBLIC_CHZZK_CLIENT_ID=[치지직 Client ID]
NEXT_PUBLIC_FORCE_MOCK=false
```

### 4. 환경 변수 업데이트

```bash
# Railway에서 FRONTEND_URL 업데이트
FRONTEND_URL=https://[Vercel-도메인]

# 치지직 개발자 포털에서 Redirect URI 추가
https://[Railway-도메인]/auth/chzzk/callback
```

## 완료!

이제 프로젝트가 배포되었습니다! 🎉

상세 가이드: [DEPLOY_COMPLETE_GUIDE.md](./DEPLOY_COMPLETE_GUIDE.md)
