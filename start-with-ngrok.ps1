# Auto-start Backend + Ngrok with webhook auto-update
# This script will:
# 1. Start backend server
# 2. Start ngrok tunnel
# 3. Get ngrok webhook URL
# 4. Display webhook URL for PayOS dashboard

Write-Host "Starting Mini Coursera with PayOS Ngrok..." -ForegroundColor Cyan

# Check if ngrok is installed
$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue
if (-not $ngrokInstalled) {
    Write-Host "Ngrok not installed!" -ForegroundColor Red
    Write-Host "Installing ngrok..." -ForegroundColor Yellow
    
    # Download and install ngrok
    $ngrokUrl = "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip"
    $ngrokZip = "$env:TEMP\ngrok.zip"
    $ngrokDir = "$env:USERPROFILE\ngrok"
    
    Write-Host "Downloading ngrok..." -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri $ngrokUrl -OutFile $ngrokZip -ErrorAction Stop
        
        Write-Host "Extracting..." -ForegroundColor Yellow
        Expand-Archive -Path $ngrokZip -DestinationPath $ngrokDir -Force
        
        # Add to PATH
        $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
        if ($currentPath -notlike "*$ngrokDir*") {
            [Environment]::SetEnvironmentVariable("Path", "$currentPath;$ngrokDir", "User")
            $env:Path = "$env:Path;$ngrokDir"
        }
        
        Write-Host "Ngrok installed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "Failed to download ngrok automatically." -ForegroundColor Red
        Write-Host "Please install manually:" -ForegroundColor Yellow
        Write-Host "1. Go to: https://ngrok.com/download" -ForegroundColor White
        Write-Host "2. Download Windows version" -ForegroundColor White
        Write-Host "3. Extract and add to PATH" -ForegroundColor White
        exit 1
    }
    
    Write-Host ""
    Write-Host "IMPORTANT: You need to sign up for free ngrok account" -ForegroundColor Yellow
    Write-Host "1. Go to: https://ngrok.com" -ForegroundColor White
    Write-Host "2. Click Sign Up (free)" -ForegroundColor White
    Write-Host "3. Get your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken" -ForegroundColor White
    Write-Host "4. Run: ngrok config add-authtoken YOUR_TOKEN" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter after you have setup ngrok authtoken"
}

# Kill existing processes
Write-Host "Stopping existing processes..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "ngrok" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start backend in background
Write-Host "Starting backend server..." -ForegroundColor Cyan
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm start" -WindowStyle Normal

Write-Host "Waiting for backend to start (10 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check if backend is running
$backendRunning = netstat -ano | findstr ":3001"
if (-not $backendRunning) {
    Write-Host "Backend failed to start!" -ForegroundColor Red
    exit 1
}
Write-Host "Backend running on http://localhost:3001" -ForegroundColor Green

# Start ngrok
Write-Host "Starting ngrok tunnel..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 3001" -WindowStyle Normal

Write-Host "Waiting for ngrok to start (5 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Get ngrok URL from API
try {
    $ngrokApi = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -Method Get
    $publicUrl = $ngrokApi.tunnels[0].public_url
    
    if ($publicUrl) {
        $webhookUrl = "$publicUrl/api/payment/payos/webhook"
        
        Write-Host ""
        Write-Host ("=" * 80) -ForegroundColor Green
        Write-Host "NGROK TUNNEL CREATED SUCCESSFULLY!" -ForegroundColor Green
        Write-Host ("=" * 80) -ForegroundColor Green
        Write-Host ""
        Write-Host "Public URL: $publicUrl" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "WEBHOOK URL (Copy to PayOS Dashboard):" -ForegroundColor Yellow
        Write-Host $webhookUrl -ForegroundColor White -BackgroundColor DarkBlue
        Write-Host ""
        Write-Host "Steps to configure PayOS:" -ForegroundColor Cyan
        Write-Host "1. Go to: https://my.payos.vn/login" -ForegroundColor White
        Write-Host "2. Login to your PayOS account" -ForegroundColor White
        Write-Host "3. Go to: Cai dat -> Thong tin kenh thanh toan" -ForegroundColor White
        Write-Host "4. Click 'Tai lieu' button (green)" -ForegroundColor White
        Write-Host "5. Paste webhook URL in 'Webhook url' field" -ForegroundColor White
        Write-Host "6. Click 'Luu' or 'Cap nhat'" -ForegroundColor White
        Write-Host ""
        Write-Host ("=" * 80) -ForegroundColor Green
        Write-Host ""
        
        # Copy to clipboard
        Set-Clipboard -Value $webhookUrl
        Write-Host "Webhook URL copied to clipboard!" -ForegroundColor Green
        Write-Host ""
        
        Write-Host "IMPORTANT: Ngrok URL changes on restart!" -ForegroundColor Red
        Write-Host "Each time you run this script, update webhook URL in PayOS dashboard" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Payment flow:" -ForegroundColor Cyan
        Write-Host "   1. User scans QR PayOS" -ForegroundColor White
        Write-Host "   2. Transfer money successfully" -ForegroundColor White
        Write-Host "   3. PayOS sends webhook -> $webhookUrl" -ForegroundColor White
        Write-Host "   4. Backend receives webhook -> Update payment -> Create enrollment" -ForegroundColor White
        Write-Host "   5. Frontend polling detects -> Auto complete!" -ForegroundColor White
        Write-Host ""
        
    } else {
        Write-Host "Could not get ngrok URL" -ForegroundColor Red
    }
} catch {
    Write-Host "Could not connect to ngrok API" -ForegroundColor Yellow
    Write-Host "Check ngrok dashboard at: http://localhost:4040" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Ready to test PayOS payment!" -ForegroundColor Green
Write-Host "Backend logs window is open" -ForegroundColor Cyan
Write-Host "Ngrok dashboard: http://localhost:4040" -ForegroundColor Cyan
Write-Host ""

# Keep script running
Write-Host "Press Ctrl+C to stop all services..." -ForegroundColor Yellow
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "Stopping services..." -ForegroundColor Yellow
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Stop-Process -Name "ngrok" -Force -ErrorAction SilentlyContinue
}
