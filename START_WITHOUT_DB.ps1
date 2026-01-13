# Start servers without database (for testing UI/UX)

Write-Host "Starting servers without database..." -ForegroundColor Yellow
Write-Host "Note: Database features will not work, but UI/UX can be tested" -ForegroundColor Cyan

# Stop existing Node processes
Write-Host "`nStopping existing Node processes..." -ForegroundColor Cyan
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Clean Next.js cache
Write-Host "Cleaning Next.js cache..." -ForegroundColor Cyan
$nextDir = "web\.next"
if (Test-Path $nextDir) {
    try {
        Get-ChildItem $nextDir -Recurse | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
        Remove-Item $nextDir -Force -ErrorAction SilentlyContinue
    } catch {
        Write-Host "Warning: Could not fully remove .next directory" -ForegroundColor Yellow
    }
}

# Start backend
Write-Host "`nStarting backend server..." -ForegroundColor Cyan
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Backend Server: http://localhost:3001' -ForegroundColor Green; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start frontend
Write-Host "Starting frontend server..." -ForegroundColor Cyan
$frontendPath = Join-Path $PSScriptRoot "web"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Frontend Server: http://localhost:3000' -ForegroundColor Green; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 5

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Servers Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nAccess URLs:" -ForegroundColor Yellow
Write-Host "  - Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  - Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "  - Dev Login: http://localhost:3000/dev/login" -ForegroundColor Cyan

Write-Host "`nNote: Database is not set up. Use dev login for testing UI/UX." -ForegroundColor Yellow
Write-Host "To set up database, install Docker and run: .\SETUP_COMPLETE.ps1" -ForegroundColor Yellow
