# Quick script to get current Ngrok webhook URL
# Use this to get webhook URL without restarting anything

Write-Host ""
Write-Host "Getting current Ngrok webhook URL..." -ForegroundColor Cyan
Write-Host ""

# Check if ngrok is running
try {
    $ngrokApi = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -Method Get -ErrorAction Stop
    
    if ($ngrokApi.tunnels.Count -eq 0) {
        Write-Host "Ngrok is running but no tunnels found!" -ForegroundColor Red
        Write-Host "Start ngrok first: .\start-with-ngrok.ps1" -ForegroundColor Yellow
        exit 1
    }
    
    $publicUrl = $ngrokApi.tunnels[0].public_url
    $webhookUrl = "$publicUrl/api/payment/payos/webhook"
    
    Write-Host ("=" * 80) -ForegroundColor Green
    Write-Host "NGROK WEBHOOK URL" -ForegroundColor Green
    Write-Host ("=" * 80) -ForegroundColor Green
    Write-Host ""
    Write-Host "Current Webhook URL:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "    $webhookUrl" -ForegroundColor White -BackgroundColor DarkBlue
    Write-Host ""
    Write-Host ("=" * 80) -ForegroundColor Green
    Write-Host ""
    
    # Copy to clipboard
    Set-Clipboard -Value $webhookUrl
    Write-Host "Copied to clipboard! You can Ctrl+V to paste" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "HOW TO PASTE IN PAYOS:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Step 1: Open browser, go to:" -ForegroundColor White
    Write-Host "        https://my.payos.vn/login" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Step 2: Login with your PayOS account" -ForegroundColor White
    Write-Host ""
    Write-Host "Step 3: Go to:" -ForegroundColor White
    Write-Host "        Cai dat -> Thong tin kenh thanh toan -> Webhook url" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Step 4: Click 'Tai lieu' button (green)" -ForegroundColor White
    Write-Host ""
    Write-Host "Step 5: Paste URL (Ctrl+V) in 'Webhook url' field" -ForegroundColor White
    Write-Host "        URL: $webhookUrl" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Step 6: Click 'Luu' or 'Cap nhat'" -ForegroundColor White
    Write-Host ""
    Write-Host ("=" * 80) -ForegroundColor Green
    Write-Host ""
    
    Write-Host "AFTER SETUP COMPLETE:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Scan QR PayOS -> Transfer money -> Auto complete!" -ForegroundColor Green
    Write-Host "No need to click 'Simulate Success' button anymore!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "NOTE:" -ForegroundColor Yellow
    Write-Host "   - This webhook URL will CHANGE when you restart ngrok" -ForegroundColor White
    Write-Host "   - If restart, run this script again to get new URL" -ForegroundColor White
    Write-Host "   - Ngrok dashboard: http://localhost:4040" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "Cannot connect to Ngrok!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check:" -ForegroundColor Yellow
    Write-Host "   1. Is Ngrok running?" -ForegroundColor White
    Write-Host "      Run: .\start-with-ngrok.ps1" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   2. Or open Ngrok dashboard:" -ForegroundColor White
    Write-Host "      http://localhost:4040" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}
