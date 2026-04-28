# Zendrive 一键启动 (Windows PowerShell)
# 用法:  .\start-dev.ps1
#
# 如果出现 "禁止运行脚本" 错误，请先运行:
#   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "=== Zendrive 本地开发启动 ===" -ForegroundColor Red

# 1. Backend
Write-Host "`n[1/3] 启动 Backend (http://localhost:8000) ..." -ForegroundColor Yellow
$backend = Join-Path $root "zendrive_backend"
Start-Process powershell -ArgumentList "-NoExit","-Command", @"
cd '$backend'
if (-not (Test-Path '.venv')) {
    Write-Host 'Creating virtual environment...' -ForegroundColor Cyan
    python -m venv .venv
}
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt -q
python run.py
"@
Start-Sleep -Seconds 2

# 2. User
Write-Host "[2/3] 启动 User 前端 (http://localhost:3000) ..." -ForegroundColor Yellow
$user = Join-Path $root "zendrive_user"
Start-Process powershell -ArgumentList "-NoExit","-Command", @"
cd '$user'
if (-not (Test-Path 'node_modules')) { npm install }
npm start
"@
Start-Sleep -Seconds 1

# 3. Admin
Write-Host "[3/3] 启动 Admin 前端 (http://localhost:3001) ..." -ForegroundColor Yellow
$admin = Join-Path $root "zendrive_admin"
Start-Process powershell -ArgumentList "-NoExit","-Command", @"
cd '$admin'
if (-not (Test-Path 'node_modules')) { npm install }
npm start
"@

Write-Host "`n三个窗口已启动，请稍等片刻：" -ForegroundColor Green
Write-Host "   Backend API   -> http://localhost:8000/docs" -ForegroundColor White
Write-Host "   User 前端     -> http://localhost:3000" -ForegroundColor White
Write-Host "   Admin 后台    -> http://localhost:3001" -ForegroundColor White
Write-Host "`n   默认管理员: admin@zendrive.com / Zendrive@2026" -ForegroundColor Cyan
