# =====================================================
# Execute SQL Insert Script for Pending Courses & Reports
# =====================================================

Write-Host "🚀 Executing SQL insert script..." -ForegroundColor Cyan
Write-Host ""

# SQL Server connection details
$ServerInstance = "localhost"
$Database = "MiniCoursera_Primary"
$Username = "sa"
$Password = "123456"
$SqlFile = "$PSScriptRoot\insert-pending-courses-and-reports.sql"

# Check if SQL file exists
if (-not (Test-Path $SqlFile)) {
    Write-Host "❌ Error: SQL file not found at $SqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "📂 SQL File: $SqlFile" -ForegroundColor Yellow
Write-Host "🔗 Server: $ServerInstance" -ForegroundColor Yellow
Write-Host "💾 Database: $Database" -ForegroundColor Yellow
Write-Host ""

# Execute using sqlcmd
try {
    Write-Host "⚡ Executing SQL script with sqlcmd..." -ForegroundColor Cyan
    
    $sqlcmd = "sqlcmd -S $ServerInstance -U $Username -P $Password -d $Database -i `"$SqlFile`" -b"
    
    Invoke-Expression $sqlcmd
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ SQL script executed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎯 Next steps:" -ForegroundColor Cyan
        Write-Host "  1. Open admin panel in browser" -ForegroundColor White
        Write-Host "  2. Navigate to 'Khóa học chờ duyệt' tab" -ForegroundColor White
        Write-Host "  3. You should see 3 new pending courses" -ForegroundColor White
        Write-Host "  4. Navigate to 'Báo cáo giảng viên' tab" -ForegroundColor White
        Write-Host "  5. You should see updated instructor statistics" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ SQL script execution failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error executing SQL script: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Alternative method: Open SQL Server Management Studio and run the script manually" -ForegroundColor Yellow
    exit 1
}
