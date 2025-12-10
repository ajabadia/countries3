@echo off
REM Countries3 Project Startup Script
REM This script starts all Docker containers for the project

echo ========================================
echo  Countries3 - Starting Docker Containers
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [1/3] Stopping any existing containers...
docker compose -f docker-compose.dev.yml down

echo.
echo [2/3] Starting containers...
docker compose -f docker-compose.dev.yml up -d

echo.
echo [3/3] Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo  Services Started Successfully!
echo ========================================
echo.
echo  Frontend: http://localhost:3000
echo  Backend:  http://localhost:3001
echo  MongoDB:  localhost:27017
echo.
echo  Login credentials:
echo  - Admin: ajabadia@gmail.com / 111111
echo  - User:  readyuser@test.com / password123
echo.
echo Press any key to view logs (Ctrl+C to exit)...
pause >nul

echo.
echo Showing logs (press Ctrl+C to stop)...
docker compose -f docker-compose.dev.yml logs -f
