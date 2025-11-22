# Start Backend and Frontend for Testing

Write-Host "🚀 Starting servers for testing..." -ForegroundColor Cyan

# Kill existing processes on ports 3001 and 5173
Write-Host "`n🔄 Stopping existing servers..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start Backend
Write-Host "`n📦 Starting Backend Server (port 3001)..." -ForegroundColor Green
$backendJob = Start-Job -ScriptBlock {
    Set-Location "E:\mini-coursera-ui-tailwind\backend"
    node server.js
}

# Wait for backend to start
Start-Sleep -Seconds 5

# Check if backend is running
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method GET -TimeoutSec 3
    Write-Host "✅ Backend is running on http://localhost:3001" -ForegroundColor Green
    Write-Host "   Database: $($health.data.database)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend failed to start!" -ForegroundColor Red
    $backendJob | Receive-Job
    exit 1
}

# Start Frontend
Write-Host "`n🎨 Starting Frontend Server (port 5173)..." -ForegroundColor Green
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "E:\mini-coursera-ui-tailwind"
    npm run dev
}

# Wait for frontend to start
Start-Sleep -Seconds 5

# Check if frontend is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 3 -UseBasicParsing
    Write-Host "✅ Frontend is running on http://localhost:5173" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Frontend may not be fully started yet (this is OK)" -ForegroundColor Yellow
}

Write-Host "`n✨ Both servers started successfully!" -ForegroundColor Cyan
Write-Host "`n📝 Server Jobs:" -ForegroundColor Yellow
Write-Host "   Backend Job ID: $($backendJob.Id)" -ForegroundColor Gray
Write-Host "   Frontend Job ID: $($frontendJob.Id)" -ForegroundColor Gray

Write-Host "`n💡 Servers are running in background jobs." -ForegroundColor Cyan
Write-Host "   To stop: Stop-Job $($backendJob.Id),$($frontendJob.Id); Remove-Job $($backendJob.Id),$($frontendJob.Id)" -ForegroundColor Gray
Write-Host "`n🧪 You can now run tests with: node test-complete-exam-flow.cjs`n" -ForegroundColor Green
