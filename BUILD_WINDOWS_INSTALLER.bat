@echo off
setlocal
cd /d "%~dp0"
title Build Exciting AI Windows Installer
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js LTS from https://nodejs.org/ first.
  pause
  exit /b 1
)
if not exist "node_modules\electron\dist\electron.exe" call npm install
if errorlevel 1 goto failed
call npm run dist
if errorlevel 1 goto failed
echo.
echo Installer output is in the release folder.
pause
exit /b 0
:failed
echo Build failed. Read the error message above.
pause
exit /b 1
