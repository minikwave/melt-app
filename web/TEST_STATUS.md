# 🧪 프론트엔드 테스트 상태

## 현재 상태
- Node 프로세스: 실행 중 (4개)
- 포트 3000: 확인 필요

## 테스트 방법

### 1. Cursor 브라우저에서 열기
- URL: `http://localhost:3000`
- 개발 로그인: `http://localhost:3000/dev/login`

### 2. 서버 재시작 (필요시)
```powershell
cd web
$env:NEXT_PUBLIC_FORCE_MOCK="true"
npm run dev
```

### 3. 문제 해결
- 포트가 사용 중이면 다른 포트 사용: `npm run dev -- -p 3001`
- Node 프로세스 종료: `Get-Process node | Stop-Process -Force`

## 더미 데이터 모드
- `NEXT_PUBLIC_FORCE_MOCK=true` 환경 변수로 자동 활성화
- 서버 체크 없이 즉시 더미 데이터 사용
- 모든 GET 요청이 더미 데이터로 응답
