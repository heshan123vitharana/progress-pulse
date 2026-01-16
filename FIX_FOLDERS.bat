@echo off
cd /d "%~dp0"

echo ========================================================
echo      PROGRESS PULSE FOLDER FIXER
echo ========================================================
echo.
echo 1. Force closes Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
echo Done.

echo.
echo 2. Deleting the broken 'progress-pulse-frontend' folder...
rmdir /s /q "progress-pulse-frontend"

if exist "progress-pulse-frontend" (
    echo.
    echo [ERROR] Could not delete 'progress-pulse-frontend'.
    echo.
    echo CAUSE: The folder is locked by a program (likely VS Code).
    echo SOLUTION:
    echo    1. CLOSE VS CODE COMPLETELY.
    echo    2. RUN THIS SCRIPT AGAIN.
    echo.
    pause
    exit /b
)

echo.
echo 3. Renaming 'frontend' to 'progress-pulse-frontend'...
rename "frontend" "progress-pulse-frontend"

if not exist "progress-pulse-frontend" (
    echo.
    echo [ERROR] Rename failed. Check if 'frontend' folder exists.
    pause
    exit /b
)

echo.
echo ========================================================
echo   SUCCESS! 
echo   The folder is now named: 'progress-pulse-frontend'
echo   You can re-open VS Code now.
echo ========================================================
pause
