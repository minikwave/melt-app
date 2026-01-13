# Melt Setup with Docker (Windows)
# Finds Docker and sets up PostgreSQL

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Melt Setup with Docker" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

# Find Docker executable
Write-Host "`n[1/10] Finding Docker..." -ForegroundColor Yellow
$dockerExe = $null

# Check common Docker Desktop paths
$dockerPaths = @(
    "C:\Program Files\Docker\Docker\resources\bin\docker.exe",
    "C:\Program Files (x86)\Docker\Docker\resources\bin\docker.exe",
    "$env:ProgramFiles\Docker\Docker\resources\bin\docker.exe",
    "$env:LOCALAPPDATA\Docker\resources\bin\docker.exe"
)

foreach ($path in $dockerPaths) {
    if (Test-Path $path) {
        $dockerExe = $path
        Write-Host "Found Docker at: $path" -ForegroundColor Green
        break
    }
}

# Check PATH
if (-not $dockerExe) {
    try {
        $dockerCmd = Get-Command docker -ErrorAction Stop
        $dockerExe = $dockerCmd.Source
        Write-Host "Found Docker in PATH: $dockerExe" -ForegroundColor Green
    } catch {
        Write-Host "Docker not found in PATH" -ForegroundColor Yellow
    }
}

if (-not $dockerExe) {
    Write-Host "`nDocker Desktop is not found or not in PATH." -ForegroundColor Red
    Write-Host "`nPlease ensure:" -ForegroundColor Yellow
    Write-Host "  1. Docker Desktop is installed" -ForegroundColor Cyan
    Write-Host "  2. Docker Desktop is running" -ForegroundColor Cyan
    Write-Host "  3. Docker is added to PATH (usually automatic)" -ForegroundColor Cyan
    Write-Host "`nOr restart PowerShell/terminal after installing Docker Desktop" -ForegroundColor Yellow
    exit 1
}

# Create docker alias function
function docker {
    & $dockerExe $args
}

# Check Docker service
Write-Host "`n[2/10] Checking Docker service..." -ForegroundColor Yellow
try {
    docker info 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not running"
    }
    Write-Host "Docker service is running" -ForegroundColor Green
} catch {
    Write-Host "Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    Write-Host "Waiting 10 seconds for Docker to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    try {
        docker info 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw "Still not running"
        }
        Write-Host "Docker service is now running" -ForegroundColor Green
    } catch {
        Write-Host "Docker is still not running. Please start Docker Desktop manually." -ForegroundColor Red
        exit 1
    }
}

# Check/Create PostgreSQL container
Write-Host "`n[3/10] Setting up PostgreSQL container..." -ForegroundColor Yellow
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
            Start-Sleep -Seconds 5
        } else {
            Write-Host "Failed to start container. Removing and recreating..." -ForegroundColor Yellow
            docker rm -f melt-postgres 2>&1 | Out-Null
            $existingContainer = $null
        }
    }
}

if ($existingContainer -ne "melt-postgres") {
    Write-Host "Creating new PostgreSQL container..." -ForegroundColor Cyan
    docker run --name melt-postgres `
        -e POSTGRES_PASSWORD=postgres `
        -e POSTGRES_DB=melt `
        -p 5432:5432 `
        -d postgres:14 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Container created" -ForegroundColor Green
        Write-Host "Waiting for database initialization (15 seconds)..." -ForegroundColor Cyan
        Start-Sleep -Seconds 15
    } else {
        Write-Host "Failed to create container" -ForegroundColor Red
        exit 1
    }
}

# Check database connection
Write-Host "`n[4/10] Checking database connection..." -ForegroundColor Yellow
$maxRetries = 10
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
    Write-Host "Failed to connect to database after $maxRetries attempts" -ForegroundColor Red
    Write-Host "Container logs:" -ForegroundColor Yellow
    docker logs melt-postgres --tail 20
    exit 1
}

# Apply schema
Write-Host "`n[5/10] Applying database schema..." -ForegroundColor Yellow

$schemaFiles = @(
    "backend\db\schema.sql",
    "backend\db\migrations\001_add_channel_urls.sql",
    "backend\db\migrations\002_add_follows_and_reads.sql"
)

foreach ($file in $schemaFiles) {
    $fullPath = Join-Path $PSScriptRoot $file
    if (Test-Path $fullPath) {
        Write-Host "  Applying: $file" -ForegroundColor Cyan
        Get-Content $fullPath -Raw | docker exec -i melt-postgres psql -U postgres -d melt 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Done" -ForegroundColor Green
        } else {
            Write-Host "  Warning (may already be applied)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  File not found: $file" -ForegroundColor Yellow
    }
}

# Check environment files
Write-Host "`n[6/10] Checking environment files..." -ForegroundColor Yellow

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
    # Update DATABASE_URL if needed
    $envContent = Get-Content $backendEnv -Raw
    if ($envContent -notmatch "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/melt") {
        Write-Host "Updating DATABASE_URL in backend/.env..." -ForegroundColor Cyan
        $envContent = $envContent -replace "DATABASE_URL=.*", "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/melt"
        Set-Content -Path $backendEnv -Value $envContent -Encoding UTF8
    }
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
    # Ensure FORCE_MOCK is false for real API mode
    $envContent = Get-Content $frontendEnv -Raw
    if ($envContent -match "NEXT_PUBLIC_FORCE_MOCK=true") {
        Write-Host "Updating NEXT_PUBLIC_FORCE_MOCK to false..." -ForegroundColor Cyan
        $envContent = $envContent -replace "NEXT_PUBLIC_FORCE_MOCK=true", "NEXT_PUBLIC_FORCE_MOCK=false"
        Set-Content -Path $frontendEnv -Value $envContent -Encoding UTF8
    }
}

# Check dependencies
Write-Host "`n[7/10] Checking dependencies..." -ForegroundColor Yellow

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

# Clean Next.js cache
Write-Host "`n[8/10] Cleaning Next.js build cache..." -ForegroundColor Yellow
$nextDir = Join-Path $PSScriptRoot "web\.next"
if (Test-Path $nextDir) {
    try {
        Get-ChildItem $nextDir -Recurse | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
        Remove-Item $nextDir -Force -ErrorAction SilentlyContinue
        Write-Host ".next directory removed" -ForegroundColor Green
    } catch {
        Write-Host "Warning: Could not fully remove .next directory" -ForegroundColor Yellow
    }
}

$cacheDir = Join-Path $PSScriptRoot "web\node_modules\.cache"
if (Test-Path $cacheDir) {
    Remove-Item -Recurse -Force $cacheDir -ErrorAction SilentlyContinue
    Write-Host "Cache directory removed" -ForegroundColor Green
}

# Stop existing Node processes
Write-Host "`n[9/10] Stopping existing Node processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start servers
Write-Host "`n[10/10] Starting servers..." -ForegroundColor Yellow

# Start backend
Write-Host "Starting backend server..." -ForegroundColor Cyan
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '========================================' -ForegroundColor Cyan; Write-Host 'Backend Server' -ForegroundColor Green; Write-Host '========================================' -ForegroundColor Cyan; Write-Host 'URL: http://localhost:3001' -ForegroundColor Yellow; Write-Host 'Health: http://localhost:3001/health' -ForegroundColor Yellow; Write-Host ''; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 5

# Start frontend
Write-Host "Starting frontend server..." -ForegroundColor Cyan
$frontendPath = Join-Path $PSScriptRoot "web"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host '========================================' -ForegroundColor Cyan; Write-Host 'Frontend Server' -ForegroundColor Green; Write-Host '========================================' -ForegroundColor Cyan; Write-Host 'URL: http://localhost:3000' -ForegroundColor Yellow; Write-Host 'Dev Login: http://localhost:3000/dev/login' -ForegroundColor Yellow; Write-Host 'OAuth Login: http://localhost:3000/auth/naver' -ForegroundColor Yellow; Write-Host ''; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 8

# Check server status
Write-Host "`nChecking server status..." -ForegroundColor Yellow

$backendOk = $false
$frontendOk = $false

try {
    $backendHealth = Invoke-WebRequest -Uri "http://localhost:3001/health" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    if ($backendHealth.StatusCode -eq 200) {
        $backendOk = $true
        Write-Host "Backend server: OK (200)" -ForegroundColor Green
    }
} catch {
    Write-Host "Backend server: Starting... (check http://localhost:3001/health)" -ForegroundColor Yellow
}

try {
    $frontendHealth = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    if ($frontendHealth.StatusCode -eq 200) {
        $frontendOk = $true
        Write-Host "Frontend server: OK (200)" -ForegroundColor Green
    }
} catch {
    Write-Host "Frontend server: Starting... (check http://localhost:3000)" -ForegroundColor Yellow
}

# Completion message
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nAccess URLs:" -ForegroundColor Yellow
Write-Host "  - Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  - Backend API: http://localhost:3001" -ForegroundColor Cyan
Write-Host "  - Health Check: http://localhost:3001/health" -ForegroundColor Cyan

Write-Host "`nLogin Options:" -ForegroundColor Yellow
Write-Host "  - Dev Mode (Mock): http://localhost:3000/dev/login" -ForegroundColor Cyan
Write-Host "  - Real OAuth: http://localhost:3000/auth/naver" -ForegroundColor Cyan

Write-Host "`nDatabase:" -ForegroundColor Yellow
Write-Host "  - Container: melt-postgres" -ForegroundColor Cyan
Write-Host "  - Port: 5432" -ForegroundColor Cyan
Write-Host "  - Database: melt" -ForegroundColor Cyan
Write-Host "  - User: postgres" -ForegroundColor Cyan
Write-Host "  - Password: postgres" -ForegroundColor Cyan

Write-Host "`nUseful Commands:" -ForegroundColor Yellow
Write-Host "  - Stop container: docker stop melt-postgres" -ForegroundColor Cyan
Write-Host "  - Start container: docker start melt-postgres" -ForegroundColor Cyan
Write-Host "  - View logs: docker logs melt-postgres" -ForegroundColor Cyan
Write-Host "  - Seed data: cd backend; npm run seed" -ForegroundColor Cyan

Write-Host "`nPress Ctrl+C in each PowerShell window to stop servers." -ForegroundColor Yellow
