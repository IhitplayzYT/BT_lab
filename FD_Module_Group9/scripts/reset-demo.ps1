# Gives you a pristine demo: new MySQL volume (re-runs every SQL seed), new Kafka, business clock back to 0,
# empty extracts folder, then restarts the 4 services from artifacts/*.jar.
# The business clock only moves forward, so use this between lifecycle/time-travel runs.
# Build the jars first if the code changed:  .\mvnw.cmd -B clean package  and copy the 4 jars to artifacts\.
# By default e-mail and WhatsApp run in mock-only mode (nothing is sent even if SPRING_MAIL_* / TWILIO_* are set). Use -RealEmail to allow real messages.
param([switch]$RealEmail)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Push-Location $root
try {
    if ($RealEmail) { Remove-Item Env:NOTIFY_EMAIL_MOCK_ONLY -ErrorAction SilentlyContinue; Remove-Item Env:NOTIFY_WHATSAPP_MOCK_ONLY -ErrorAction SilentlyContinue } else { $env:NOTIFY_EMAIL_MOCK_ONLY = 'true'; $env:NOTIFY_WHATSAPP_MOCK_ONLY = 'true' }

    Write-Host 'Stopping services...'
    & (Join-Path $PSScriptRoot 'stop-services.ps1') | Out-Null

    # docker writes progress text to stderr, which PowerShell 5.1 would treat as an error, so run it through cmd.
    Write-Host 'Recreating MySQL + Kafka (this deletes the demo database volume)...'
    cmd /c 'docker compose down -v >nul 2>&1'
    cmd /c 'docker compose up -d >nul 2>&1'
    if ($LASTEXITCODE -ne 0) { throw 'docker compose up failed. Is Docker Desktop running?' }

    $mysqlId = (cmd /c 'docker compose ps -q mysql').Trim()
    for ($i = 0; $i -lt 60; $i++) {
        $health = (cmd /c "docker inspect -f {{.State.Health.Status}} $mysqlId").Trim()
        if ($health -eq 'healthy') { break }
        Start-Sleep -Seconds 3
    }
    if ($health -ne 'healthy') { throw 'MySQL did not become healthy in time.' }
    for ($i = 0; $i -lt 40 -and -not (Test-NetConnection localhost -Port 9092 -WarningAction SilentlyContinue -InformationLevel Quiet); $i++) { Start-Sleep -Seconds 3 }

    if (Test-Path -LiteralPath (Join-Path $root 'extracts')) { Remove-Item -LiteralPath (Join-Path $root 'extracts') -Recurse -Force }

    Write-Host 'Starting services...'
    & (Join-Path $PSScriptRoot 'start-services.ps1') | Out-Null
    $deadline = (Get-Date).AddSeconds(120)
    do {
        $up = 8090, 8080, 8081, 8082, 8083 | Where-Object { Test-NetConnection localhost -Port $_ -WarningAction SilentlyContinue -InformationLevel Quiet }
        if ($up.Count -eq 5) { break }
        Start-Sleep -Seconds 4
    } while ((Get-Date) -lt $deadline)
    if ($up.Count -ne 5) { throw "Only ports $($up -join ',') came up. Check runtime/*.log" }
    Write-Host 'Fresh demo ready: ports 8090 and 8080-8083 up, business clock at 0.' -ForegroundColor Green
} finally { Pop-Location }
