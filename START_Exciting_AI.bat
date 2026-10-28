@echo off
setlocal
cd /d "%~dp0"
title Exciting AI

REM 1. Launch the compiled standalone Electron app if built
if exist "%~dp0release\win-unpacked\Exciting AI.exe" (
  start "" "%~dp0release\win-unpacked\Exciting AI.exe"
  exit /b 0
)

REM 2. Launch via local Electron installed in node_modules
if exist "%~dp0node_modules\electron\dist\electron.exe" (
  start "" "%~dp0node_modules\electron\dist\electron.exe" "%~dp0."
  exit /b 0
)

REM 3. Fallback: Launch via npm script
where npm >nul 2>nul
if %errorlevel% equ 0 (
  call npm run electron
  exit /b 0
)

echo Exciting AI Electron application could not be launched.
echo Please run BUILD_WINDOWS_INSTALLER.bat or npm install first.
pause
exit /b 1
