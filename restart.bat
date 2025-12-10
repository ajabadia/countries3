@echo off
REM Countries3 Project Restart Script
REM This script restarts all Docker containers for the project

echo ========================================
echo  Countries3 - Restarting Containers
echo ========================================
echo.

echo Restarting all services...
docker compose -f docker-compose.dev.yml restart

echo.
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo  Services Restarted Successfully!
echo ========================================
echo.
echo  Frontend: http://localhost:3000
echo  Backend:  http://localhost:3001
echo.
pause
