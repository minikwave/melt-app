# Melt 배포 가이드

## 빠른 시작

**5분 안에 배포하기**: [docs/DEPLOY_QUICK_START.md](./docs/DEPLOY_QUICK_START.md)

**상세 가이드**: [docs/DEPLOY_COMPLETE_GUIDE.md](./docs/DEPLOY_COMPLETE_GUIDE.md)

## 배포 아키텍처

```
Vercel (프론트엔드) → Railway (백엔드) → Supabase (데이터베이스)
```

## 배포 순서

1. **Supabase** - PostgreSQL 데이터베이스 설정
2. **Railway** - Express 백엔드 API 배포
3. **Vercel** - Next.js 프론트엔드 배포
4. **환경 변수 및 OAuth 설정**

## 주요 문서

- [완전 배포 가이드](./docs/DEPLOY_COMPLETE_GUIDE.md) - 단계별 상세 가이드
- [빠른 배포 가이드](./docs/DEPLOY_QUICK_START.md) - 5분 안에 배포
- [배포 체크리스트](./DEPLOYMENT_CHECKLIST.md) - 배포 전 확인 사항
- [Supabase + Railway 가이드](./docs/DEPLOY_SUPABASE_RAILWAY.md) - Railway만 사용하는 경우

## 환경 변수 요약

### Railway (백엔드)
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
JWT_SECRET=[랜덤 문자열]
ENCRYPTION_KEY=[32바이트 hex]
CHZZK_CLIENT_ID=[치지직 Client ID]
CHZZK_CLIENT_SECRET=[치지직 Client Secret]
CHZZK_REDIRECT_URI=https://[Railway-도메인]/auth/chzzk/callback
FRONTEND_URL=https://[Vercel-도메인]
PORT=3001
NODE_ENV=production
```

### Vercel (프론트엔드)
```env
NEXT_PUBLIC_API_URL=https://[Railway-도메인]
NEXT_PUBLIC_CHZZK_CLIENT_ID=[치지직 Client ID]
NEXT_PUBLIC_FORCE_MOCK=false
```

## 문제 해결

배포 중 문제가 발생하면:
1. [배포 가이드의 문제 해결 섹션](./docs/DEPLOY_COMPLETE_GUIDE.md#8단계-문제-해결) 참고
2. 로그 확인 (Railway, Vercel 대시보드)
3. 환경 변수 확인
