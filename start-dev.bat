@echo off
echo 🚀 Starting Mini Coursera Development Environment...
echo.

REM Kill existing processes
echo 🔥 Cleaning up existing processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

REM Check if ports are free
echo 🔍 Checking ports...
netstat -ano | findstr ":3001" >nul
if %errorlevel% == 0 (
    echo ⚠️  Port 3001 is still occupied, trying to free it...
    for /f "tokens=5" %%i in ('netstat -ano ^| findstr ":3001"') do taskkill /f /pid %%i >nul 2>&1
    timeout /t 2 >nul
)

netstat -ano | findstr ":5173" >nul
if %errorlevel% == 0 (
    echo ⚠️  Port 5173 is still occupied, trying to free it...
    for /f "tokens=5" %%i in ('netstat -ano ^| findstr ":5173"') do taskkill /f /pid %%i >nul 2>&1
    timeout /t 2 >nul
)

echo.
echo 🎯 Starting Backend Server (Port 3001) with nodemon...
start "Backend Server" cmd /k "cd /d E:\mini-coursera-ui-tailwind\backend && npm run dev"

echo ⏳ Waiting for backend to initialize...
timeout /t 5 >nul

echo.
echo 🎨 Starting Frontend Server (Port 5173) with Vite...
start "Frontend Server" cmd /k "cd /d E:\mini-coursera-ui-tailwind && npm run dev"

echo.
echo ✅ Development servers are starting!
echo 📱 Frontend: http://localhost:5173
echo 🔧 Backend:  http://localhost:3001
echo 🔑 Auth Page: http://localhost:5173/auth
echo.
echo 💡 Both servers will auto-restart when you modify files.
echo 🛑 To stop servers, close the terminal windows or press Ctrl+C in each.
echo.
echo Press any key to close this window...
pause > nul