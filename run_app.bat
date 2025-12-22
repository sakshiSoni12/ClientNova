@echo off
setlocal
echo ===================================================
echo   Client Management System - Fail-Safe Launcher
echo ===================================================

echo [1/4] Cleaning up old processes...
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM "Next.js" /T 2>nul
rmdir /S /Q ".next\dev\lock" 2>nul
timeout /t 2 >nul

echo [2/4] Starting Development Server...
echo       (This may take 10-20 seconds to compile)...
start "Next.js Server" /min cmd /c "npm run dev & pause"

echo [3/4] Waiting for server to be ready on port 3000...
:wait_loop
timeout /t 2 >nul
netstat -ano | findstr "LISTENING" | findstr ":3000" >nul
if %errorlevel% neq 0 (
    echo       ...still waiting for server...
    goto wait_loop
)

echo [4/4] Server is up! Launching browser...
timeout /t 2 >nul
start http://localhost:3000

echo.
echo SUCCESS: Application is running.
echo You can close this window, but keep the "Next.js Server" window open.
pause
