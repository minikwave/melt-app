# Melt Backend 로컬 설정 스크립트 (Windows)

Write-Host "🚀 Melt Backend 로컬 설정 시작..." -ForegroundColor Green

# 1. .env 파일 생성/업데이트
Write-Host "`n📝 .env 파일 설정 중..." -ForegroundColor Yellow

$envContent = @"
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/melt

# JWT
JWT_SECRET=zyFSbgJTjkePDxrPQI7vCYzE6auSc9J5uk8EG2tBxUc
JWT_EXPIRES_IN=7d

# Encryption (32 bytes hex)
ENCRYPTION_KEY=254d0c26d420fe59704afc236033ab855d1da0a3fe34afb5623ecf1fd08d2003

# 치지직 OAuth
CHZZK_CLIENT_ID=adbe2be0-a1c7-43a5-bdfd-408491968f3b
CHZZK_CLIENT_SECRET=ahHose2CWgcApBBrxtlmzPf5THLxEURXwr5s7uc2OFk
CHZZK_REDIRECT_URI=http://localhost:3001/auth/chzzk/callback

# Frontend
FRONTEND_URL=http://localhost:3000

# Server
PORT=3001
NODE_ENV=development
"@

$envPath = ".\backend\.env"
if (Test-Path $envPath) {
    Write-Host "⚠️  .env 파일이 이미 존재합니다. 백업 후 업데이트합니다." -ForegroundColor Yellow
    Copy-Item $envPath "$envPath.backup" -ErrorAction SilentlyContinue
}

Set-Content -Path $envPath -Value $envContent -Encoding UTF8
Write-Host "✅ .env 파일 생성 완료: $envPath" -ForegroundColor Green

# 2. PostgreSQL 확인
Write-Host "`n🗄️  PostgreSQL 확인 중..." -ForegroundColor Yellow

$pgInstalled = Get-Command psql -ErrorAction SilentlyContinue
if (-not $pgInstalled) {
    Write-Host "❌ PostgreSQL이 설치되어 있지 않거나 PATH에 없습니다." -ForegroundColor Red
    Write-Host "💡 PostgreSQL 설치 방법:" -ForegroundColor Yellow
    Write-Host "   1. https://www.postgresql.org/download/windows/ 에서 다운로드" -ForegroundColor Cyan
    Write-Host "   2. 설치 후 PATH에 추가하거나, 아래 Docker 옵션 사용" -ForegroundColor Cyan
    Write-Host "`n🐳 Docker로 PostgreSQL 실행:" -ForegroundColor Yellow
    Write-Host "   docker run --name melt-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=melt -p 5432:5432 -d postgres:14" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ PostgreSQL 발견: $($pgInstalled.Source)" -ForegroundColor Green

# 3. 데이터베이스 생성
Write-Host "`n📦 데이터베이스 생성 중..." -ForegroundColor Yellow

$dbExists = psql -U postgres -lqt 2>$null | Select-String -Pattern "^\s*melt\s"
if ($dbExists) {
    Write-Host "✅ 데이터베이스 'melt'가 이미 존재합니다." -ForegroundColor Green
} else {
    Write-Host "데이터베이스 'melt' 생성 중..." -ForegroundColor Cyan
    $env:PGPASSWORD = "postgres"
    $createDb = psql -U postgres -c "CREATE DATABASE melt;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 데이터베이스 생성 완료" -ForegroundColor Green
    } else {
        Write-Host "❌ 데이터베이스 생성 실패. 비밀번호를 확인하세요." -ForegroundColor Red
        Write-Host "💡 비밀번호가 다르면 .env 파일의 DATABASE_URL을 수정하세요." -ForegroundColor Yellow
        exit 1
    }
}

# 4. 스키마 적용
Write-Host "`n📋 스키마 적용 중..." -ForegroundColor Yellow

$env:PGPASSWORD = "postgres"
$schemaFiles = @(
    ".\backend\db\schema.sql",
    ".\backend\db\migrations\001_add_channel_urls.sql",
    ".\backend\db\migrations\002_add_follows_and_reads.sql"
)

foreach ($file in $schemaFiles) {
    if (Test-Path $file) {
        Write-Host "   적용 중: $file" -ForegroundColor Cyan
        $result = psql -U postgres -d melt -f $file 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ 완료" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  경고 (이미 적용되었을 수 있음): $($result -join ' ')" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ⚠️  파일 없음: $file" -ForegroundColor Yellow
    }
}

# 5. 의존성 설치 확인
Write-Host "`n📦 의존성 확인 중..." -ForegroundColor Yellow

if (-not (Test-Path ".\backend\node_modules")) {
    Write-Host "npm install 실행 중..." -ForegroundColor Cyan
    Set-Location ".\backend"
    npm install
    Set-Location ".."
} else {
    Write-Host "✅ node_modules 존재" -ForegroundColor Green
}

Write-Host "`n✅ 설정 완료!" -ForegroundColor Green
Write-Host "`n다음 단계:" -ForegroundColor Yellow
Write-Host "1. 백엔드 서버 실행: cd backend; npm run dev" -ForegroundColor Cyan
Write-Host "2. 프론트엔드 서버 실행: cd web; npm run dev" -ForegroundColor Cyan
Write-Host "3. 브라우저에서 http://localhost:3000 접속" -ForegroundColor Cyan
