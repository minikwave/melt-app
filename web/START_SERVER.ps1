# 프론트엔드 서버 시작 스크립트
Write-Host "🚀 Melt 프론트엔드 서버 시작 중..." -ForegroundColor Green
Write-Host ""

$env:NEXT_PUBLIC_FORCE_MOCK = "true"
$env:NEXT_PUBLIC_API_URL = "http://localhost:3001"

cd $PSScriptRoot

Write-Host "📍 작업 디렉토리: $(Get-Location)" -ForegroundColor Cyan
Write-Host "🔧 더미 데이터 모드: 활성화" -ForegroundColor Yellow
Write-Host ""

npm run dev
