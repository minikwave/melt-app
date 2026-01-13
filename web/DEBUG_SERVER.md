# 서버 디버깅 가이드

## 문제 진단

### 1. 서버가 실행 중인지 확인
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue
netstat -ano | findstr :3000
```

### 2. 포트 충돌 확인
```powershell
# 포트 3000 사용 중인 프로세스 확인
netstat -ano | findstr :3000
# 프로세스 종료 (PID 확인 후)
Stop-Process -Id <PID> -Force
```

### 3. 캐시 삭제 후 재시작
```powershell
cd C:\Users\alex1\cheese3\web
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

### 4. 다른 포트로 실행
```powershell
cd C:\Users\alex1\cheese3\web
npm run dev -- -p 3001
```

## 정적 빌드 문제 해결

### 확인 사항
1. ✅ `next.config.js`에 `output: 'standalone'` 없음 (개발 모드에는 영향 없음)
2. ✅ 모든 페이지에 `export const dynamic = 'force-dynamic'` 설정
3. ✅ `.next` 폴더에 HTML 파일 없음 (정적 생성 안 됨)

### 해결 방법
- 개발 모드에서는 항상 동적 렌더링
- 정적 빌드는 `npm run build` 시에만 발생
- 개발 서버는 항상 런타임에 렌더링

## 브라우저 접속

1. **홈페이지**: http://localhost:3000
2. **개발 로그인**: http://localhost:3000/dev/login

## 로그 확인

브라우저 콘솔(F12)에서 확인:
- `🔧 Mock data mode enabled by default`
- 네트워크 탭에서 API 요청 확인
