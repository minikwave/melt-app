# 🚀 Melt 완전 자동 시작 가이드

## Docker Desktop 사용 시 (권장)

### 한 번의 명령으로 모든 설정 완료

```powershell
.\SETUP_WITH_DOCKER.ps1
```

이 스크립트가 자동으로:
1. ✅ Docker 찾기 및 확인
2. ✅ PostgreSQL 컨테이너 생성/시작
3. ✅ 데이터베이스 스키마 적용
4. ✅ 환경 변수 파일 확인/생성
5. ✅ 의존성 확인
6. ✅ Next.js 캐시 정리
7. ✅ 백엔드 서버 시작
8. ✅ 프론트엔드 서버 시작

## 접속 주소

### 프론트엔드
- **메인**: http://localhost:3000
- **개발 모드 로그인**: http://localhost:3000/dev/login
- **실제 OAuth 로그인**: http://localhost:3000/auth/naver

### 백엔드
- **API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 로그인 방법

### 1. 개발 모드 (Mock 데이터)
- URL: http://localhost:3000/dev/login
- 더미 유저 선택:
  - `creator_1` - 크리에이터
  - `viewer_1` - 시청자
- 데이터베이스 불필요, UI/UX 테스트용

### 2. 실제 OAuth 로그인
- URL: http://localhost:3000/auth/naver
- 치지직 OAuth를 통한 실제 로그인
- 데이터베이스에 실제 사용자 데이터 저장
- 치지직 개발자 포털에 Redirect URI 등록 필요

## 데이터베이스 정보

- **컨테이너 이름**: melt-postgres
- **포트**: 5432
- **데이터베이스**: melt
- **사용자**: postgres
- **비밀번호**: postgres

## 유용한 명령어

### Docker 컨테이너 관리
```powershell
# 컨테이너 상태 확인
docker ps -a | findstr melt-postgres

# 컨테이너 시작
docker start melt-postgres

# 컨테이너 중지
docker stop melt-postgres

# 컨테이너 로그 확인
docker logs melt-postgres

# 컨테이너 삭제 (데이터도 삭제됨)
docker rm -f melt-postgres
```

### 더미 데이터 생성
```powershell
cd backend
npm run seed
```

### 서버 재시작
```powershell
# 각 PowerShell 창에서 Ctrl+C로 중지 후
.\SETUP_WITH_DOCKER.ps1
```

## 문제 해결

### Docker를 찾을 수 없는 경우
- Docker Desktop이 실행 중인지 확인
- PowerShell을 재시작
- `SETUP_WITH_DOCKER.ps1` 스크립트가 자동으로 Docker 경로를 찾습니다

### 포트 충돌
- 3000, 3001, 5432 포트가 사용 중인지 확인:
```powershell
netstat -ano | findstr ":3000"
netstat -ano | findstr ":3001"
netstat -ano | findstr ":5432"
```

### 데이터베이스 연결 실패
- PostgreSQL 컨테이너가 실행 중인지 확인:
```powershell
docker ps | findstr melt-postgres
```
- 컨테이너 로그 확인:
```powershell
docker logs melt-postgres
```

### Next.js 빌드 오류
- 캐시 정리:
```powershell
cd web
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
```

## 다음 단계

1. **더미 데이터 생성** (선택사항)
   ```powershell
   cd backend
   npm run seed
   ```

2. **개발 모드로 테스트**
   - http://localhost:3000/dev/login 접속
   - 더미 유저로 로그인하여 UI/UX 확인

3. **실제 OAuth 테스트**
   - 치지직 개발자 포털에서 Redirect URI 확인
   - http://localhost:3000/auth/naver 접속
   - 실제 로그인 테스트

## 환경 변수

### backend/.env
- `DATABASE_URL`: PostgreSQL 연결 문자열
- `CHZZK_CLIENT_ID`: 치지직 Client ID
- `CHZZK_CLIENT_SECRET`: 치지직 Client Secret
- `ENCRYPTION_KEY`: 토큰 암호화 키
- `JWT_SECRET`: JWT 서명 키

### web/.env.local
- `NEXT_PUBLIC_API_URL`: 백엔드 API URL
- `NEXT_PUBLIC_FORCE_MOCK`: Mock 모드 강제 여부 (false = 실제 API 사용)

## 완료!

이제 모든 것이 준비되었습니다. 브라우저에서 http://localhost:3000 에 접속하여 테스트하세요!
