# 개발 서버 시작 스크립트
Write-Host "🚀 Melt 개발 서버 시작 중..." -ForegroundColor Green
Write-Host ""

# 기존 Node 프로세스 종료
Write-Host "기존 Node 프로세스 확인 중..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "기존 Node 프로세스 발견: $($nodeProcesses.Count)개" -ForegroundColor Yellow
    $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "기존 프로세스 종료 완료" -ForegroundColor Green
    Start-Sleep -Seconds 2
}

# 포트 확인
Write-Host "포트 3000 확인 중..." -ForegroundColor Yellow
$port3000 = netstat -ano | findstr :3000
if ($port3000) {
    Write-Host "포트 3000이 사용 중입니다!" -ForegroundColor Red
    Write-Host "다음 명령으로 프로세스를 종료하세요:" -ForegroundColor Yellow
    Write-Host "  netstat -ano | findstr :3000" -ForegroundColor Cyan
    Write-Host "  Stop-Process -Id <PID> -Force" -ForegroundColor Cyan
    exit 1
}

# 캐시 삭제 (선택적)
Write-Host "캐시 삭제 중..." -ForegroundColor Yellow
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    Write-Host "캐시 삭제 완료" -ForegroundColor Green
}

# 환경 변수 설정
$env:NEXT_PUBLIC_FORCE_MOCK = "true"
$env:NEXT_PUBLIC_API_URL = "http://localhost:3001"

Write-Host ""
Write-Host "📍 작업 디렉토리: $(Get-Location)" -ForegroundColor Cyan
Write-Host "🔧 더미 데이터 모드: 활성화" -ForegroundColor Yellow
Write-Host ""
Write-Host "서버 시작 중..." -ForegroundColor Green
Write-Host "브라우저에서 http://localhost:3000 접속" -ForegroundColor Cyan
Write-Host ""

# 서버 시작
npm run dev
