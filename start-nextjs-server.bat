@echo off
REM Next.js Development Server Starter
REM This script starts the Next.js frontend on port 3000

echo ========================================
echo Starting Next.js Frontend Server
echo ========================================
echo.
echo Server will run on: http://localhost:3000
echo API connected to: http://localhost:3000/api
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

cd /d "%~dp0frontend"
npm run dev

pause
