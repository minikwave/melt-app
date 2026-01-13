# Melt 데이터베이스 설정 스크립트 (Windows)

Write-Host "🗄️  Melt 데이터베이스 설정 시작..." -ForegroundColor Green

# PostgreSQL 확인
$pgInstalled = Get-Command psql -ErrorAction SilentlyContinue
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue

if (-not $pgInstalled -and -not $dockerInstalled) {
    Write-Host "`n❌ PostgreSQL 또는 Docker가 설치되어 있지 않습니다." -ForegroundColor Red
    Write-Host "`n📥 설치 옵션:" -ForegroundColor Yellow
    Write-Host "1. PostgreSQL 직접 설치:" -ForegroundColor Cyan
    Write-Host "   https://www.postgresql.org/download/windows/" -ForegroundColor White
    Write-Host "   설치 후 PATH에 추가하세요." -ForegroundColor White
    Write-Host "`n2. Docker Desktop 설치 (권장):" -ForegroundColor Cyan
    Write-Host "   https://www.docker.com/products/docker-desktop/" -ForegroundColor White
    Write-Host "   설치 후 이 스크립트를 다시 실행하세요." -ForegroundColor White
    exit 1
}

# Docker로 PostgreSQL 실행
if ($dockerInstalled -and -not $pgInstalled) {
    Write-Host "`n🐳 Docker로 PostgreSQL 실행 중..." -ForegroundColor Yellow
    
    # 기존 컨테이너 확인
    $existing = docker ps -a --filter "name=melt-postgres" --format "{{.Names}}" 2>$null
    if ($existing -eq "melt-postgres") {
        Write-Host "기존 컨테이너 발견. 시작 중..." -ForegroundColor Cyan
        docker start melt-postgres 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ PostgreSQL 컨테이너 시작 완료" -ForegroundColor Green
            Start-Sleep -Seconds 3
        } else {
            Write-Host "❌ 컨테이너 시작 실패" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "새 PostgreSQL 컨테이너 생성 중..." -ForegroundColor Cyan
        docker run --name melt-postgres `
            -e POSTGRES_PASSWORD=postgres `
            -e POSTGRES_DB=melt `
            -p 5432:5432 `
            -d postgres:14 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ PostgreSQL 컨테이너 생성 완료" -ForegroundColor Green
            Write-Host "데이터베이스 초기화 대기 중..." -ForegroundColor Cyan
            Start-Sleep -Seconds 5
        } else {
            Write-Host "❌ 컨테이너 생성 실패" -ForegroundColor Red
            exit 1
        }
    }
    
    # Docker 컨테이너 내부에서 psql 사용
    $psqlCmd = "docker exec -i melt-postgres psql -U postgres"
} else {
    # 로컬 PostgreSQL 사용
    $psqlCmd = "psql -U postgres"
    $env:PGPASSWORD = "postgres"
}

# 데이터베이스 생성
Write-Host "`n📦 데이터베이스 확인 중..." -ForegroundColor Yellow

$dbCheck = & $psqlCmd -lqt 2>$null | Select-String -Pattern "^\s*melt\s"
if ($dbCheck) {
    Write-Host "✅ 데이터베이스 'melt'가 이미 존재합니다." -ForegroundColor Green
} else {
    Write-Host "데이터베이스 'melt' 생성 중..." -ForegroundColor Cyan
    & $psqlCmd -c "CREATE DATABASE melt;" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 데이터베이스 생성 완료" -ForegroundColor Green
    } else {
        Write-Host "❌ 데이터베이스 생성 실패" -ForegroundColor Red
        Write-Host "💡 비밀번호가 다르면 .env 파일의 DATABASE_URL을 수정하세요." -ForegroundColor Yellow
        exit 1
    }
}

# 스키마 적용
Write-Host "`n📋 스키마 적용 중..." -ForegroundColor Yellow

$schemaFiles = @(
    "backend\db\schema.sql",
    "backend\db\migrations\001_add_channel_urls.sql",
    "backend\db\migrations\002_add_follows_and_reads.sql"
)

foreach ($file in $schemaFiles) {
    if (Test-Path $file) {
        Write-Host "   적용 중: $file" -ForegroundColor Cyan
        if ($psqlCmd -like "*docker*") {
            Get-Content $file | docker exec -i melt-postgres psql -U postgres -d melt 2>&1 | Out-Null
        } else {
            & $psqlCmd -d melt -f $file 2>&1 | Out-Null
        }
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ 완료" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  경고 (이미 적용되었을 수 있음)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ⚠️  파일 없음: $file" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ 데이터베이스 설정 완료!" -ForegroundColor Green
Write-Host "`n다음 단계:" -ForegroundColor Yellow
Write-Host "1. 백엔드 서버 실행: cd backend; npm run dev" -ForegroundColor Cyan
Write-Host "2. (선택) 더미 데이터 생성: cd backend; npm run seed" -ForegroundColor Cyan
