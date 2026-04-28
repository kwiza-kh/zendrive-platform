@echo off
REM dev.cmd - cmd.exe wrapper around dev.ps1 for Zendrive
REM Usage:
REM   dev                         show help
REM   dev start                   start all services (backend 8000, user 3000, admin 3001)
REM   dev start -Service backend
REM   dev status -Output json
REM   dev stop -Service all -Yes
REM   dev install -Service all
REM   dev env
REM
REM All arguments are forwarded verbatim to dev.ps1.

setlocal
set "SCRIPT_DIR=%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%dev.ps1" %*
exit /b %ERRORLEVEL%
