@echo off
echo Stopping any existing instances on port 3000...
:: Use PowerShell to find and kill the process listening on port 3000
powershell -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }"

:: Wait a moment to ensure port is freed
timeout /t 2 >nul

echo Starting Client Management System...
echo Note: Press Ctrl+C in this window to stop the server.

:: Start a separate background process that waits ~5 seconds using ping (to let server boot) then opens the URL
start /b cmd /c "ping -n 6 127.0.0.1 >nul && start http://localhost:3000"

:: Start the Next.js server
cmd /c "npm run dev"
pause
