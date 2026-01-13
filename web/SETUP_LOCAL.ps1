# Melt Frontend 로컬 설정 스크립트 (Windows)

Write-Host "🚀 Melt Frontend 로컬 설정 시작..." -ForegroundColor Green

# .env.local 파일 생성
Write-Host "`n📝 .env.local 파일 설정 중..." -ForegroundColor Yellow

$envContent = @"
# API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# Mock Mode (false = use real API, true = use mock data)
NEXT_PUBLIC_FORCE_MOCK=false
"@

$envPath = ".\web\.env.local"
if (Test-Path $envPath) {
    Write-Host "⚠️  .env.local 파일이 이미 존재합니다. 백업 후 업데이트합니다." -ForegroundColor Yellow
    Copy-Item $envPath "$envPath.backup" -ErrorAction SilentlyContinue
}

Set-Content -Path $envPath -Value $envContent -Encoding UTF8
Write-Host "✅ .env.local 파일 생성 완료: $envPath" -ForegroundColor Green

# 의존성 설치 확인
Write-Host "`n📦 의존성 확인 중..." -ForegroundColor Yellow

if (-not (Test-Path ".\web\node_modules")) {
    Write-Host "npm install 실행 중..." -ForegroundColor Cyan
    Set-Location ".\web"
    npm install
    Set-Location ".."
} else {
    Write-Host "✅ node_modules 존재" -ForegroundColor Green
}

Write-Host "`n✅ 설정 완료!" -ForegroundColor Green
Write-Host "`n다음 단계:" -ForegroundColor Yellow
Write-Host "1. 백엔드 서버가 실행 중인지 확인" -ForegroundColor Cyan
Write-Host "2. 프론트엔드 서버 실행: cd web; npm run dev" -ForegroundColor Cyan
Write-Host "3. 브라우저에서 http://localhost:3000 접속" -ForegroundColor Cyan
