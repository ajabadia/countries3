@echo off
REM Quick Git Commit Script

if "%~1"=="" (
    echo ERROR: Please provide a commit message
    echo Usage: commit.bat "your commit message"
    pause
    exit /b 1
)

echo Adding all changes...
git add .

echo.
echo Committing with message: %~1
git commit -m "%~1"

echo.
echo Pushing to GitHub...
git push

echo.
echo Done!
pause
