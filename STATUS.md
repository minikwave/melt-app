# 🎉 Melt 로컬 개발 환경 상태

## ✅ 완료된 작업

### 1. Docker 및 PostgreSQL 설정
- ✅ Docker Desktop 확인 및 사용
- ✅ PostgreSQL 컨테이너 생성 및 실행
- ✅ 데이터베이스 스키마 적용 완료
- ✅ SSL 연결 비활성화 (로컬 개발용)

### 2. 환경 변수 설정
- ✅ `backend/.env` - 치지직 OAuth 정보 포함
- ✅ `web/.env.local` - 실제 API 모드 설정
- ✅ DATABASE_URL에 `sslmode=disable` 추가

### 3. 서버 실행
- ✅ 백엔드 서버: http://localhost:3001
- ✅ 프론트엔드 서버: http://localhost:3000
- ✅ Next.js 빌드 캐시 정리 완료

## 📱 접속 주소

### 프론트엔드
- **메인**: http://localhost:3000
- **개발 모드 로그인**: http://localhost:3000/dev/login
- **실제 OAuth 로그인**: http://localhost:3000/auth/naver

### 백엔드
- **API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🗄️ 데이터베이스

- **컨테이너**: melt-postgres (Docker)
- **포트**: 5432
- **데이터베이스**: melt
- **사용자**: postgres
- **비밀번호**: postgres

## 🔐 로그인 방법

### 개발 모드 (Mock 데이터)
1. http://localhost:3000/dev/login 접속
2. 더미 유저 선택:
   - `creator_1` - 크리에이터
   - `viewer_1` - 시청자
3. 데이터베이스 불필요, UI/UX 테스트용

### 실제 OAuth 로그인
1. http://localhost:3000/auth/naver 접속
2. "네이버로 시작하기" 클릭
3. 치지직 OAuth 페이지로 이동
4. 네이버 계정으로 로그인 및 권한 동의
5. 자동으로 Melt로 돌아와서 온보딩 또는 메인 페이지로 이동

## 💡 유용한 명령어

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
# 모든 서버 재시작
.\SETUP_WITH_DOCKER.ps1
```

## ⚠️ 문제 해결

### 데이터베이스 연결 실패
- PostgreSQL 컨테이너가 실행 중인지 확인:
  ```powershell
  docker ps | findstr melt-postgres
  ```
- 백엔드 서버 로그 확인 (PowerShell 창에서)
- `.env` 파일의 `DATABASE_URL` 확인

### Next.js 빌드 오류
- 캐시 정리:
  ```powershell
  cd web
  Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
  ```

### 포트 충돌
- 포트 사용 확인:
  ```powershell
  netstat -ano | findstr ":3000"
  netstat -ano | findstr ":3001"
  netstat -ano | findstr ":5432"
  ```

## 🎯 다음 단계

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

## ✅ 모든 준비 완료!

이제 브라우저에서 http://localhost:3000 에 접속하여 테스트하세요!
