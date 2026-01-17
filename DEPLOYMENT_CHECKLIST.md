# 배포 체크리스트

## 배포 전 확인 사항

### 1. 코드 준비
- [ ] 모든 변경사항 커밋 및 푸시
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] 빌드 오류 없음 확인 (`npm run build`)

### 2. 환경 변수 준비

#### 백엔드 (Railway)
- [ ] `DATABASE_URL` - Supabase 연결 문자열
- [ ] `JWT_SECRET` - 강력한 랜덤 문자열
- [ ] `ENCRYPTION_KEY` - 32바이트 hex 문자열
- [ ] `CHZZK_CLIENT_ID` - 치지직 Client ID
- [ ] `CHZZK_CLIENT_SECRET` - 치지직 Client Secret
- [ ] `CHZZK_REDIRECT_URI` - 프로덕션 콜백 URL
- [ ] `FRONTEND_URL` - Vercel 도메인
- [ ] `PORT` - 3001 (기본값)
- [ ] `NODE_ENV` - production

#### 프론트엔드 (Vercel)
- [ ] `NEXT_PUBLIC_API_URL` - Railway 백엔드 도메인
- [ ] `NEXT_PUBLIC_CHZZK_CLIENT_ID` - 치지직 Client ID
- [ ] `NEXT_PUBLIC_FORCE_MOCK` - false

### 3. 데이터베이스 준비
- [ ] Supabase 프로젝트 생성
- [ ] 스키마 적용 (`schema.sql`)
- [ ] 마이그레이션 실행 (001, 002, 003)
- [ ] 연결 테스트

### 4. OAuth 설정
- [ ] 치지직 개발자 포털에서 Redirect URI 추가
- [ ] 프로덕션 도메인으로 업데이트

## 배포 순서

1. ✅ Supabase 설정
2. ✅ Railway 백엔드 배포
3. ✅ Vercel 프론트엔드 배포
4. ✅ 환경 변수 업데이트
5. ✅ OAuth 설정 업데이트
6. ✅ 최종 테스트

## 배포 후 확인

- [ ] 백엔드 Health Check 통과
- [ ] 프론트엔드 접속 가능
- [ ] 데이터베이스 연결 확인
- [ ] OAuth 로그인 테스트
- [ ] 주요 기능 테스트
