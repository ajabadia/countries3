@echo off
REM Countries3 Project Stop Script
REM This script stops all Docker containers for the project

echo ========================================
echo  Countries3 - Stopping Docker Containers
echo ========================================
echo.

docker compose -f docker-compose.dev.yml down

echo.
echo All containers stopped successfully!
echo.
pause
