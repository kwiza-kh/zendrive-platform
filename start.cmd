@echo off
setlocal
set "ROOT=%~dp0"

echo.
echo  =====================================================
echo    ZENDRIVE  --  Dev Startup
echo  =====================================================
echo.
echo  Starting 3 services in separate windows...
echo.

:: ── 1. Backend (FastAPI :8000) ────────────────────────
echo  [1/3]  Backend    http://localhost:8000/docs
start "Zendrive - Backend" /d "%ROOT%zendrive_backend" cmd /k "if not exist .venv python -m venv .venv && call .venv\Scripts\activate.bat && pip install -r requirements.txt -q && python run.py"

:: ── 2. User Frontend (React :3000) ───────────────────
echo  [2/3]  User       http://localhost:3000
start "Zendrive - User" /d "%ROOT%zendrive_user" cmd /k "if not exist node_modules npm install && npm start"

:: ── 3. Admin Frontend (React :3001) ──────────────────
echo  [3/3]  Admin      http://localhost:3001
start "Zendrive - Admin" /d "%ROOT%zendrive_admin" cmd /k "if not exist node_modules npm install && set PORT=3001 && npm start"

echo.
echo  ─────────────────────────────────────────────────────
echo   All windows launched.  Wait ~15 sec for boot.
echo.
echo    Backend API  ->  http://localhost:8000/docs
echo    User site    ->  http://localhost:3000
echo    Admin panel  ->  http://localhost:3001
echo.
echo    Admin login  :  admin@zendrive.com
echo    Password     :  Zendrive@2026
echo  ─────────────────────────────────────────────────────
echo.
endlocal
