# Mini Coursera Development Environment Starter
Write-Host "🚀 Starting Mini Coursera Development Environment..." -ForegroundColor Cyan
Write-Host ""

# Function to start in new terminal
function Start-InNewTerminal {
    param(
        [string]$Title,
        [string]$Command,
        [string]$WorkingDirectory
    )
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$WorkingDirectory'; Write-Host '$Title' -ForegroundColor Green; $Command"
}

# Start Backend
Write-Host "📦 Starting Backend Server (Port 3002)..." -ForegroundColor Yellow
Start-InNewTerminal -Title "🔧 Backend Server" -Command "`$env:PORT=3002; npm start" -WorkingDirectory "E:\mini-coursera-ui-tailwind\backend"

# Wait for backend to start
Write-Host "⏳ Waiting 3 seconds for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Start Frontend  
Write-Host "🎨 Starting Frontend Server (Port 5173)..." -ForegroundColor Yellow
Start-InNewTerminal -Title "🎨 Frontend Server" -Command "npm run dev" -WorkingDirectory "E:\mini-coursera-ui-tailwind"

Write-Host ""
Write-Host "=" * 50 -ForegroundColor Green
Write-Host "✅ Development Environment Started!" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Green
Write-Host "🔧 Backend:  http://localhost:3002" -ForegroundColor Cyan
Write-Host "🎨 Frontend: http://localhost:5173" -ForegroundColor Cyan  
Write-Host "🔐 Auth Page: http://localhost:5173/auth" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")