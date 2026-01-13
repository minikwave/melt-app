# Melt 서버 시작 스크립트 (Windows)

Write-Host "🚀 Melt 서버 시작 중..." -ForegroundColor Green

# 백엔드 서버 시작
Write-Host "`n📡 백엔드 서버 시작 중..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '🚀 Backend Server (http://localhost:3001)' -ForegroundColor Green; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

# 프론트엔드 서버 시작
Write-Host "`n🌐 프론트엔드 서버 시작 중..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "web"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host '🌐 Frontend Server (http://localhost:3000)' -ForegroundColor Green; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host "`n✅ 서버 시작 완료!" -ForegroundColor Green
Write-Host "`n📱 접속 주소:" -ForegroundColor Yellow
Write-Host "   - 프론트엔드: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   - 백엔드 API: http://localhost:3001" -ForegroundColor Cyan
Write-Host "   - Health Check: http://localhost:3001/health" -ForegroundColor Cyan
Write-Host "`n💡 개발 모드 로그인: http://localhost:3000/dev/login" -ForegroundColor Yellow
Write-Host "💡 실제 OAuth 로그인: http://localhost:3000/auth/naver" -ForegroundColor Yellow
Write-Host "`n⚠️  서버를 중지하려면 각 PowerShell 창에서 Ctrl+C를 누르세요." -ForegroundColor Yellow
