<#
.SYNOPSIS
  Zendrive dev CLI — agent-friendly orchestrator for backend / user / admin.

.DESCRIPTION
  Non-interactive, flag-driven, idempotent. Designed so coding agents and humans can
  drive local dev reliably. Every action is expressible as flags; no prompts.

  Usage:
    .\dev.ps1 <command> [options]

  Commands:
    start      Start one or more services
    stop       Stop running services (by port)
    status     Show which services are up (machine-readable)
    install    Install deps for one or more services (idempotent)
    env        Copy .env.example -> .env where missing
    help       Show help for a command

  Run `.\dev.ps1 <command> -Help` for command-specific examples.

.EXAMPLE
  .\dev.ps1 start -Service all
.EXAMPLE
  .\dev.ps1 start -Service backend -Foreground
.EXAMPLE
  .\dev.ps1 start -Service user,admin -DryRun
.EXAMPLE
  .\dev.ps1 status -Output json
.EXAMPLE
  .\dev.ps1 stop -Service all -Yes
#>

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [ValidateSet('start','stop','status','install','env','help','')]
    [string]$Command = '',

    [ValidateSet('all','backend','user','admin')]
    [string[]]$Service = @('all'),

    [switch]$Foreground,
    [switch]$DryRun,
    [switch]$Yes,
    [switch]$Help,
    [ValidateSet('text','json')]
    [string]$Output = 'text'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$Services = @{
    backend = @{ Path = 'zendrive_backend'; Port = 8000; Url = 'http://localhost:8000/docs'; Kind = 'python' }
    user    = @{ Path = 'zendrive_user';    Port = 3000; Url = 'http://localhost:3000';      Kind = 'node'   }
    admin   = @{ Path = 'zendrive_admin';   Port = 3001; Url = 'http://localhost:3001';      Kind = 'node'   }
}

function Resolve-Services {
    param([string[]]$Names)
    if ($Names -contains 'all') { return @('backend','user','admin') }
    return $Names
}

function Test-Port {
    param([int]$Port)
    try {
        $c = New-Object Net.Sockets.TcpClient
        $c.Connect('127.0.0.1', $Port)
        $c.Close()
        return $true
    } catch { return $false }
}

function Get-PortPid {
    param([int]$Port)
    $line = (netstat -ano | Select-String ":$Port\s.*LISTENING" | Select-Object -First 1)
    if (-not $line) { return $null }
    return ($line.ToString().Trim() -split '\s+')[-1]
}

function Show-RootHelp {
    @"
Zendrive dev CLI

Usage:
  .\dev.ps1 <command> [options]

Commands:
  start      Start one or more services
  stop       Stop services bound to known ports
  status     Report port + URL for each service
  install    Install deps (idempotent)
  env        Copy .env.example -> .env where missing
  help       Show command help

Services (and default ports):
  backend  -> http://localhost:8000  (FastAPI, zendrive_backend\run.py)
  user     -> http://localhost:3000  (React, zendrive_user)
  admin    -> http://localhost:3001  (React, zendrive_admin)

Common options:
  -Service all|backend|user|admin   (comma-separated; default: all)
  -DryRun                           Print plan, change nothing
  -Yes                              Skip confirmations on destructive ops
  -Output text|json                 Machine-readable output (default: text)
  -Foreground                       For 'start': run in current window

Examples:
  .\dev.ps1 start -Service all
  .\dev.ps1 start -Service backend -Foreground
  .\dev.ps1 status -Output json
  .\dev.ps1 stop -Service user,admin -Yes
  .\dev.ps1 install -Service backend -DryRun
  .\dev.ps1 env

Run `.\dev.ps1 <command> -Help` for per-command examples.
"@
}

function Show-CommandHelp {
    param([string]$Cmd)
    switch ($Cmd) {
        'start' {
@"
start - launch services

Options:
  -Service       backend|user|admin|all (default: all)
  -Foreground    Run in current window (one service only); default backgrounds each
  -DryRun        Print plan only

Examples:
  .\dev.ps1 start -Service all
  .\dev.ps1 start -Service backend -Foreground
  .\dev.ps1 start -Service user,admin -DryRun
"@
        }
        'stop' {
@"
stop - kill processes listening on known service ports

Options:
  -Service   backend|user|admin|all (default: all)
  -Yes       Skip confirmation (required for actual kill)
  -DryRun    Print plan only

Examples:
  .\dev.ps1 stop -Service all -Yes
  .\dev.ps1 stop -Service backend -DryRun
"@
        }
        'status' {
@"
status - report each service's port + reachability

Options:
  -Service   Filter (default: all)
  -Output    text|json

Examples:
  .\dev.ps1 status
  .\dev.ps1 status -Service backend -Output json
"@
        }
        'install' {
@"
install - install dependencies (idempotent: skips when up-to-date)

Options:
  -Service   Default: all
  -DryRun    Print plan only

Examples:
  .\dev.ps1 install -Service all
  .\dev.ps1 install -Service backend -DryRun
"@
        }
        'env' {
@"
env - copy .env.example to .env where missing (never overwrites)

Examples:
  .\dev.ps1 env
  .\dev.ps1 env -Service backend
  .\dev.ps1 env -DryRun
"@
        }
        default { Show-RootHelp }
    }
}

function Invoke-Install {
    param([string]$Name)
    $svc = $Services[$Name]
    $path = Join-Path $root $svc.Path
    if (-not (Test-Path $path)) {
        Write-Error "Error: service path not found: $path`n  Fix: run from the Zendrive root, or check the folder name matches '$($svc.Path)'."
    }
    if ($DryRun) { Write-Host "[dry-run] install $Name in $path"; return }

    Push-Location $path
    try {
        if ($svc.Kind -eq 'python') {
            if (-not (Test-Path '.venv')) { python -m venv .venv }
            & .\.venv\Scripts\Activate.ps1
            pip install -q python-dotenv
            pip install -r requirements.txt -q
            Write-Host "${Name}: deps installed"
        } else {
            if (-not (Test-Path 'node_modules')) {
                npm install
                Write-Host "${Name}: node_modules installed"
            } else {
                Write-Host "${Name}: node_modules present, skipping (delete it and rerun to force)"
            }
        }
    } finally { Pop-Location }
}

function Invoke-Start {
    param([string]$Name)
    $svc = $Services[$Name]
    $path = Join-Path $root $svc.Path

    if (-not (Test-Path $path)) {
        Write-Error "Error: service path not found: $path`n  Fix: run from the Zendrive root."
    }

    if (Test-Port -Port $svc.Port) {
        Write-Host "${Name}: already running on port $($svc.Port) - no-op (idempotent)"
        return
    }

    if ($DryRun) {
        Write-Host "[dry-run] start $Name (port $($svc.Port)) in $path"
        return
    }

    $cmd = if ($svc.Kind -eq 'python') {
        "cd '$path'; if (-not (Test-Path '.venv')) { python -m venv .venv }; .\.venv\Scripts\Activate.ps1; pip install -q python-dotenv; pip install -r requirements.txt -q; python run.py"
    } else {
        "cd '$path'; if (-not (Test-Path 'node_modules')) { npm install }; npm start"
    }

    if ($Foreground) {
        Invoke-Expression $cmd
    } else {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmd | Out-Null
        Write-Host "${Name}: started in background window (port $($svc.Port), $($svc.Url))"
    }
}

function Invoke-Stop {
    param([string]$Name)
    $svc = $Services[$Name]
    $procPid = Get-PortPid -Port $svc.Port
    if (-not $procPid) { Write-Host "${Name}: not running on port $($svc.Port) - no-op"; return }
    if ($DryRun) { Write-Host "[dry-run] stop $Name pid=$procPid (port $($svc.Port))"; return }
    if (-not $Yes) {
        Write-Error "Error: refusing to kill pid $procPid without confirmation.`n  .\dev.ps1 stop -Service $Name -Yes"
    }
    taskkill /PID $procPid /F | Out-Null
    Write-Host "${Name}: stopped (pid=$procPid)"
}

function Invoke-Status {
    $names = Resolve-Services -Names $Service
    $rows = foreach ($n in $names) {
        $svc = $Services[$n]
        [pscustomobject]@{
            service = $n
            port    = $svc.Port
            url     = $svc.Url
            up      = (Test-Port -Port $svc.Port)
            pid     = (Get-PortPid -Port $svc.Port)
        }
    }
    if ($Output -eq 'json') {
        $rows | ConvertTo-Json -Depth 3
    } else {
        $rows | Format-Table -AutoSize
    }
}

function Invoke-Env {
    param([string]$Name)
    $svc = $Services[$Name]
    $path = Join-Path $root $svc.Path
    $src = Join-Path $path '.env.example'
    $dst = Join-Path $path '.env'
    if (-not (Test-Path $src)) { Write-Host "${Name}: no .env.example, skipping"; return }
    if (Test-Path $dst)        { Write-Host "${Name}: .env exists, skipping (idempotent)"; return }
    if ($DryRun)               { Write-Host "[dry-run] copy $src -> $dst"; return }
    Copy-Item $src $dst
    Write-Host "${Name}: created .env"
}

# ---- Dispatch ----

if (-not $Command -or $Command -eq 'help' -or ($Help -and -not $Command)) {
    Show-RootHelp
    exit 0
}

if ($Help) { Show-CommandHelp -Cmd $Command; exit 0 }

$targets = Resolve-Services -Names $Service

switch ($Command) {
    'start'   { foreach ($n in $targets) { Invoke-Start   -Name $n } }
    'stop'    { foreach ($n in $targets) { Invoke-Stop    -Name $n } }
    'install' { foreach ($n in $targets) { Invoke-Install -Name $n } }
    'env'     { foreach ($n in $targets) { Invoke-Env     -Name $n } }
    'status'  { Invoke-Status }
    default   { Show-RootHelp; exit 2 }
}
