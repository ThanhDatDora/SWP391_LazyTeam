# PowerShell script to force clear browser cache

Write-Host "Force clearing browser cache and reloading..." -ForegroundColor Yellow

# Create a cache-busting version parameter
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$cacheBuster = "?v=$timestamp"

# Check if Vite dev server is running and force reload
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5174" -Method GET -TimeoutSec 5
    Write-Host "✅ Frontend server is running on localhost:5174" -ForegroundColor Green
    
    # Instructions for user
    Write-Host ""
    Write-Host "🔄 BROWSER CACHE CLEARING INSTRUCTIONS:" -ForegroundColor Cyan
    Write-Host "1. Open your browser DevTools (F12)" -ForegroundColor White
    Write-Host "2. Right-click the Refresh button" -ForegroundColor White
    Write-Host "3. Select 'Empty Cache and Hard Reload'" -ForegroundColor White
    Write-Host "4. Or use Ctrl+Shift+R (Chrome/Edge) or Ctrl+F5" -ForegroundColor White
    Write-Host ""
    Write-Host "🎯 This will force reload all CSS/JS files with correct encoding!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Frontend server not running. Please start it first:" -ForegroundColor Red
    Write-Host "   npm run dev" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📝 If encoding issues persist, the problem might be:" -ForegroundColor Yellow
Write-Host "   1. Browser cache still holding old files" -ForegroundColor White  
Write-Host "   2. Source files saved with wrong encoding" -ForegroundColor White
Write-Host "   3. Need to restart Vite dev server" -ForegroundColor White