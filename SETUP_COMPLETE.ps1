# Melt Complete Setup Script (Windows)
# Sets up PostgreSQL with Docker and starts all servers

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Melt Complete Setup" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

# 1. Check Docker
Write-Host "`n[1/9] Checking Docker..." -ForegroundColor Yellow
$dockerInstalled = $null
try {
    $dockerInstalled = Get-Command docker -ErrorAction Stop
} catch {
    $dockerInstalled = $null
}

if (-not $dockerInstalled) {
    Write-Host "Docker is not installed." -ForegroundColor Red
    Write-Host "`nPlease install Docker Desktop:" -ForegroundColor Yellow
    Write-Host "  1. Download from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Cyan
    Write-Host "  2. Install and run Docker Desktop" -ForegroundColor Cyan
    Write-Host "  3. Run this script again" -ForegroundColor Cyan
    Write-Host "`nOr install PostgreSQL directly:" -ForegroundColor Yellow
    Write-Host "  https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
    exit 1
}

Write-Host "Docker found: $($dockerInstalled.Version)" -ForegroundColor Green

# 2. Check Docker service
Write-Host "`n[2/9] Checking Docker service..." -ForegroundColor Yellow
try {
    docker info 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not running"
    }
    Write-Host "Docker service is running" -ForegroundColor Green
} catch {
    Write-Host "Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# 3. Check/Create PostgreSQL container
Write-Host "`n[3/9] Setting up PostgreSQL container..." -ForegroundColor Yellow
$existingContainer = docker ps -a --filter "name=melt-postgres" --format "{{.Names}}" 2>$null

if ($existingContainer -eq "melt-postgres") {
    $running = docker ps --filter "name=melt-postgres" --format "{{.Names}}" 2>$null
    if ($running -eq "melt-postgres") {
        Write-Host "PostgreSQL container is already running" -ForegroundColor Green
    } else {
        Write-Host "Starting existing container..." -ForegroundColor Cyan
        docker start melt-postgres 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Container started" -ForegroundColor Green
            Start-Sleep -Seconds 3
        } else {
            Write-Host "Failed to start container" -ForegroundColor Red
            exit 1
        }
    }
} else {
    Write-Host "Creating new PostgreSQL container..." -ForegroundColor Cyan
    docker run --name melt-postgres `
        -e POSTGRES_PASSWORD=postgres `
        -e POSTGRES_DB=melt `
        -p 5432:5432 `
        -d postgres:14 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Container created" -ForegroundColor Green
        Write-Host "Waiting for database initialization (10 seconds)..." -ForegroundColor Cyan
        Start-Sleep -Seconds 10
    } else {
        Write-Host "Failed to create container" -ForegroundColor Red
        exit 1
    }
}

# 4. Check database connection
Write-Host "`n[4/9] Checking database connection..." -ForegroundColor Yellow
$maxRetries = 5
$retryCount = 0
$connected = $false

while ($retryCount -lt $maxRetries -and -not $connected) {
    $result = docker exec melt-postgres psql -U postgres -d melt -c "SELECT 1;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        $connected = $true
        Write-Host "Database connection successful" -ForegroundColor Green
    } else {
        $retryCount++
        Write-Host "Waiting for database... ($retryCount/$maxRetries)" -ForegroundColor Yellow
        Start-Sleep -Seconds 3
    }
}

if (-not $connected) {
    Write-Host "Failed to connect to database" -ForegroundColor Red
    exit 1
}

# 5. Apply schema
Write-Host "`n[5/9] Applying database schema..." -ForegroundColor Yellow

$schemaFiles = @(
    "backend\db\schema.sql",
    "backend\db\migrations\001_add_channel_urls.sql",
    "backend\db\migrations\002_add_follows_and_reads.sql"
)

foreach ($file in $schemaFiles) {
    $fullPath = Join-Path $PSScriptRoot $file
    if (Test-Path $fullPath) {
        Write-Host "  Applying: $file" -ForegroundColor Cyan
        Get-Content $fullPath | docker exec -i melt-postgres psql -U postgres -d melt 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Done" -ForegroundColor Green
        } else {
            Write-Host "  Warning (may already be applied)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  File not found: $file" -ForegroundColor Yellow
    }
}

# 6. Check environment files
Write-Host "`n[6/9] Checking environment files..." -ForegroundColor Yellow

$backendEnv = Join-Path $PSScriptRoot "backend\.env"
if (-not (Test-Path $backendEnv)) {
    Write-Host "Creating backend/.env..." -ForegroundColor Cyan
    $envContent = @"
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/melt
JWT_SECRET=zyFSbgJTjkePDxrPQI7vCYzE6auSc9J5uk8EG2tBxUc
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=254d0c26d420fe59704afc236033ab855d1da0a3fe34afb5623ecf1fd08d2003
CHZZK_CLIENT_ID=adbe2be0-a1c7-43a5-bdfd-408491968f3b
CHZZK_CLIENT_SECRET=ahHose2CWgcApBBrxtlmzPf5THLxEURXwr5s7uc2OFk
CHZZK_REDIRECT_URI=http://localhost:3001/auth/chzzk/callback
FRONTEND_URL=http://localhost:3000
PORT=3001
NODE_ENV=development
"@
    Set-Content -Path $backendEnv -Value $envContent -Encoding UTF8
    Write-Host "backend/.env created" -ForegroundColor Green
} else {
    Write-Host "backend/.env exists" -ForegroundColor Green
}

$frontendEnv = Join-Path $PSScriptRoot "web\.env.local"
if (-not (Test-Path $frontendEnv)) {
    Write-Host "Creating web/.env.local..." -ForegroundColor Cyan
    $envContent = @"
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FORCE_MOCK=false
"@
    Set-Content -Path $frontendEnv -Value $envContent -Encoding UTF8
    Write-Host "web/.env.local created" -ForegroundColor Green
} else {
    Write-Host "web/.env.local exists" -ForegroundColor Green
}

# 7. Check dependencies
Write-Host "`n[7/9] Checking dependencies..." -ForegroundColor Yellow

$backendNodeModules = Join-Path $PSScriptRoot "backend\node_modules"
if (-not (Test-Path $backendNodeModules)) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
    Set-Location (Join-Path $PSScriptRoot "backend")
    npm install
    Set-Location $PSScriptRoot
    Write-Host "Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "Backend dependencies exist" -ForegroundColor Green
}

$frontendNodeModules = Join-Path $PSScriptRoot "web\node_modules"
if (-not (Test-Path $frontendNodeModules)) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
    Set-Location (Join-Path $PSScriptRoot "web")
    npm install
    Set-Location $PSScriptRoot
    Write-Host "Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "Frontend dependencies exist" -ForegroundColor Green
}

# 8. Clean Next.js cache
Write-Host "`n[8/9] Cleaning Next.js build cache..." -ForegroundColor Yellow
$nextDir = Join-Path $PSScriptRoot "web\.next"
if (Test-Path $nextDir) {
    try {
        Get-ChildItem $nextDir -Recurse | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
        Remove-Item $nextDir -Force -ErrorAction SilentlyContinue
        Write-Host ".next directory removed" -ForegroundColor Green
    } catch {
        Write-Host "Warning: Could not fully remove .next directory (may be in use)" -ForegroundColor Yellow
    }
}

$cacheDir = Join-Path $PSScriptRoot "web\node_modules\.cache"
if (Test-Path $cacheDir) {
    Remove-Item -Recurse -Force $cacheDir -ErrorAction SilentlyContinue
    Write-Host "Cache directory removed" -ForegroundColor Green
}

# 9. Start servers
Write-Host "`n[9/9] Starting servers..." -ForegroundColor Yellow

# Stop existing Node processes
Write-Host "Stopping existing Node processes..." -ForegroundColor Cyan
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start backend
Write-Host "Starting backend server..." -ForegroundColor Cyan
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Backend Server: http://localhost:3001' -ForegroundColor Green; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start frontend
Write-Host "Starting frontend server..." -ForegroundColor Cyan
$frontendPath = Join-Path $PSScriptRoot "web"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Frontend Server: http://localhost:3000' -ForegroundColor Green; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 5

# Check server status
Write-Host "`nChecking server status..." -ForegroundColor Yellow

try {
    $backendHealth = Invoke-WebRequest -Uri "http://localhost:3001/health" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
    Write-Host "Backend server is running: $($backendHealth.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Backend server is starting... (check http://localhost:3001/health)" -ForegroundColor Yellow
}

try {
    $frontendHealth = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
    Write-Host "Frontend server is running: $($frontendHealth.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Frontend server is starting... (check http://localhost:3000)" -ForegroundColor Yellow
}

# Completion message
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nAccess URLs:" -ForegroundColor Yellow
Write-Host "  - Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  - Backend API: http://localhost:3001" -ForegroundColor Cyan
Write-Host "  - Health Check: http://localhost:3001/health" -ForegroundColor Cyan

Write-Host "`nLogin:" -ForegroundColor Yellow
Write-Host "  - Dev Mode: http://localhost:3000/dev/login" -ForegroundColor Cyan
Write-Host "  - OAuth: http://localhost:3000/auth/naver" -ForegroundColor Cyan

Write-Host "`nDatabase:" -ForegroundColor Yellow
Write-Host "  - Container: melt-postgres" -ForegroundColor Cyan
Write-Host "  - Port: 5432" -ForegroundColor Cyan
Write-Host "  - Database: melt" -ForegroundColor Cyan
Write-Host "  - User: postgres" -ForegroundColor Cyan
Write-Host "  - Password: postgres" -ForegroundColor Cyan

Write-Host "`nUseful commands:" -ForegroundColor Yellow
Write-Host "  - Stop container: docker stop melt-postgres" -ForegroundColor Cyan
Write-Host "  - Start container: docker start melt-postgres" -ForegroundColor Cyan
Write-Host "  - Remove container: docker rm -f melt-postgres" -ForegroundColor Cyan
Write-Host "  - Seed data: cd backend; npm run seed" -ForegroundColor Cyan

Write-Host "`nPress Ctrl+C in each PowerShell window to stop servers." -ForegroundColor Yellow
