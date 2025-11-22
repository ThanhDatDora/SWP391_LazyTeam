# Run All Tests - Automated Test Execution Script
# PowerShell script to run all testing suites
# Usage: .\testing\run-all-tests.ps1

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     EXAM SYSTEM - AUTOMATED TEST EXECUTION SUITE          ║" -ForegroundColor Cyan
Write-Host "║     Mini Coursera Project - SWP391                         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Configuration
$PROJECT_ROOT = "e:\mini-coursera-ui-tailwind"
$BACKEND_PORT = 3001
$FRONTEND_PORT = 5173

# Test tracking
$TOTAL_TESTS = 0
$PASSED_TESTS = 0
$FAILED_TESTS = 0

# Function to check if server is running
function Test-ServerRunning {
    param($Port)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet
        return $connection
    } catch {
        return $false
    }
}

# Function to run command and capture exit code
function Invoke-TestCommand {
    param(
        [string]$Command,
        [string]$Description
    )
    
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
    Write-Host "📋 $Description" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
    
    Write-Host "⚡ Executing: $Command" -ForegroundColor Gray
    
    Invoke-Expression $Command
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host "✅ $Description - PASSED" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ $Description - FAILED (Exit code: $exitCode)" -ForegroundColor Red
        return $false
    }
}

# Start execution
Write-Host "🚀 Starting automated test execution..." -ForegroundColor Cyan
Write-Host "📁 Project root: $PROJECT_ROOT" -ForegroundColor Gray
Write-Host ""

# Step 1: Check prerequisites
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "STEP 1: Checking Prerequisites" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta

# Check Node.js
Write-Host "🔍 Checking Node.js..." -ForegroundColor Cyan
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "  ✅ Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  ❌ Node.js not found! Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Check Python
Write-Host "🔍 Checking Python..." -ForegroundColor Cyan
$pythonVersion = python --version 2>$null
if ($pythonVersion) {
    Write-Host "  ✅ Python: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Python not found (optional for Selenium)" -ForegroundColor Yellow
}

# Check if servers are running
Write-Host "🔍 Checking servers..." -ForegroundColor Cyan

$backendRunning = Test-ServerRunning -Port $BACKEND_PORT
if ($backendRunning) {
    Write-Host "  ✅ Backend server running on port $BACKEND_PORT" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Backend server not running on port $BACKEND_PORT" -ForegroundColor Yellow
    Write-Host "     Please start backend with: npm run dev:backend" -ForegroundColor Gray
    $answer = Read-Host "Continue anyway? (y/n)"
    if ($answer -ne "y") {
        exit 1
    }
}

$frontendRunning = Test-ServerRunning -Port $FRONTEND_PORT
if ($frontendRunning) {
    Write-Host "  ✅ Frontend server running on port $FRONTEND_PORT" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Frontend server not running on port $FRONTEND_PORT" -ForegroundColor Yellow
    Write-Host "     Please start frontend with: npm run dev" -ForegroundColor Gray
    $answer = Read-Host "Continue anyway? (y/n)"
    if ($answer -ne "y") {
        exit 1
    }
}

Write-Host ""

# Step 2: Run Jest Unit Tests
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "STEP 2: Running Jest Unit Tests" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta

Set-Location $PROJECT_ROOT

Write-Host "`n🧪 Running Backend Unit Tests..." -ForegroundColor Cyan
$result = Invoke-TestCommand -Command "npm test testing/unit-tests/exam-routes.test.js --silent" -Description "Backend API Unit Tests"
if ($result) { $PASSED_TESTS++ } else { $FAILED_TESTS++ }
$TOTAL_TESTS++

Write-Host "`n🧪 Running Frontend Component Tests..." -ForegroundColor Cyan
$result = Invoke-TestCommand -Command "npm test testing/unit-tests/exam-components.test.jsx --silent" -Description "Frontend Component Tests"
if ($result) { $PASSED_TESTS++ } else { $FAILED_TESTS++ }
$TOTAL_TESTS++

# Step 3: Generate Coverage Report
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "STEP 3: Generating Coverage Report" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta

$result = Invoke-TestCommand -Command "npm run test:coverage -- --silent" -Description "Code Coverage Analysis"
if ($result) { $PASSED_TESTS++ } else { $FAILED_TESTS++ }
$TOTAL_TESTS++

Write-Host "`n📊 Coverage report generated at: testing\reports\coverage\index.html" -ForegroundColor Cyan

# Step 4: Run Selenium E2E Tests (if Python available)
if ($pythonVersion) {
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
    Write-Host "STEP 4: Running Selenium E2E Tests" -ForegroundColor Magenta
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
    
    if ($backendRunning -and $frontendRunning) {
        Set-Location "$PROJECT_ROOT\testing\e2e-tests"
        
        Write-Host "`n🌐 Running E2E Tests..." -ForegroundColor Cyan
        $result = Invoke-TestCommand -Command "pytest exam_e2e_selenium.py -v --html=..\reports\e2e-report.html --self-contained-html" -Description "Selenium E2E Tests"
        if ($result) { $PASSED_TESTS++ } else { $FAILED_TESTS++ }
        $TOTAL_TESTS++
        
        Write-Host "`n📊 E2E report generated at: testing\reports\e2e-report.html" -ForegroundColor Cyan
        
        Set-Location $PROJECT_ROOT
    } else {
        Write-Host "`n⚠️  Skipping E2E tests - servers not running" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n⚠️  Skipping E2E tests - Python not installed" -ForegroundColor Yellow
}

# Step 5: Summary
Write-Host "`n`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                   TEST EXECUTION SUMMARY                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`n📊 Results:" -ForegroundColor White
Write-Host "   Total Test Suites: $TOTAL_TESTS" -ForegroundColor Gray
Write-Host "   ✅ Passed: $PASSED_TESTS" -ForegroundColor Green
Write-Host "   ❌ Failed: $FAILED_TESTS" -ForegroundColor Red

$passRate = if ($TOTAL_TESTS -gt 0) { [math]::Round(($PASSED_TESTS / $TOTAL_TESTS) * 100, 1) } else { 0 }
Write-Host "   📈 Pass Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 90) { "Green" } elseif ($passRate -ge 70) { "Yellow" } else { "Red" })

Write-Host "`n📁 Generated Reports:" -ForegroundColor White
Write-Host "   📄 Jest Coverage:    testing\reports\coverage\index.html" -ForegroundColor Gray
Write-Host "   📄 E2E Test Report:  testing\reports\e2e-report.html" -ForegroundColor Gray

Write-Host "`n🔍 To view reports:" -ForegroundColor Cyan
Write-Host "   start testing\reports\coverage\index.html" -ForegroundColor Gray
Write-Host "   start testing\reports\e2e-report.html" -ForegroundColor Gray

# Final status
Write-Host ""
if ($FAILED_TESTS -eq 0) {
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║              ✅ ALL TESTS PASSED SUCCESSFULLY!             ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    exit 0
} else {
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║          ❌ SOME TESTS FAILED - REVIEW REQUIRED!          ║" -ForegroundColor Red
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Red
    exit 1
}
