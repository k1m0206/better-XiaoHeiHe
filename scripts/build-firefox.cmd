@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "PS_SCRIPT=%SCRIPT_DIR%build-firefox.ps1"

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%" -PauseOnExit

if errorlevel 1 (
  echo.
  echo Build failed. Check the message above.
  echo If a log was created, it is in: %SCRIPT_DIR%..\build\build-firefox.log
  echo.
  pause
)
