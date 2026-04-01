@echo off
echo ========================================
echo   Starting Zenla Mart Server
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Check if .env exists
if not exist ".env" (
    echo Creating .env file from env-example.txt...
    copy env-example.txt .env
    echo.
)

echo Starting server...
echo.
call npm start

pause
