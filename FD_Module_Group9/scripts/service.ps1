# Stop or start ONE service (to show that the others keep working, and that Kafka holds events for a service that is down).
#   .\scripts\service.ps1 -Name notification-service -Action stop
#   .\scripts\service.ps1 -Name notification-service -Action start
# Uses artifacts\<name>.jar and the settings in scripts\local.env.ps1, exactly like start-services.ps1.
# E-mail and WhatsApp stay in MOCK mode (nothing is sent) unless you add -RealEmail, the same rule as reset-demo.ps1.
# Use the SAME choice you used for reset-demo.ps1, so the whole system behaves consistently.
param(
    [Parameter(Mandatory)][ValidateSet('auth-service', 'fd-account-service', 'interest-batch-service', 'statement-service', 'notification-service')][string]$Name,
    [Parameter(Mandatory)][ValidateSet('start', 'stop')][string]$Action,
    [switch]$RealEmail
)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$jar = Join-Path $root "artifacts\$Name.jar"

function Find-Service {
    # The jar path is matched in full (the ValidateSet above already limits $Name to our five services).
    Get-CimInstance Win32_Process -Filter "Name='java.exe'" | Where-Object { $_.CommandLine -and $_.CommandLine.Contains($jar) }
}

if ($Action -eq 'stop') {
    $found = @(Find-Service)
    if ($found.Count -eq 0) { Write-Host "$Name was not running."; return }
    $found | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
    Write-Host "$Name stopped." -ForegroundColor Yellow
    return
}

if (@(Find-Service).Count -gt 0) { Write-Host "$Name is already running."; return }
if (-not (Test-Path -LiteralPath $jar)) { throw "Missing built JAR: $jar" }
. (Join-Path $PSScriptRoot 'local.env.ps1')
if ($RealEmail) { Remove-Item Env:NOTIFY_EMAIL_MOCK_ONLY, Env:NOTIFY_WHATSAPP_MOCK_ONLY -ErrorAction SilentlyContinue } else { $env:NOTIFY_EMAIL_MOCK_ONLY = 'true'; $env:NOTIFY_WHATSAPP_MOCK_ONLY = 'true' }
switch ($Name) {
    'interest-batch-service' { $env:SERVICE_DB_URL = $env:BATCH_DB_URL }
    'statement-service'      { $env:SERVICE_DB_URL = $env:STATEMENT_DB_URL }
    'notification-service'   { $env:SERVICE_DB_URL = $env:NOTIFY_DB_URL }
}
$runtime = Join-Path $root 'runtime'; New-Item -ItemType Directory -Path $runtime -Force | Out-Null
$null = Start-Process -FilePath 'java' -ArgumentList @('-jar', ('"' + $jar + '"')) -WindowStyle Hidden -PassThru -WorkingDirectory $root `
    -RedirectStandardOutput (Join-Path $runtime "$Name.log") -RedirectStandardError (Join-Path $runtime "$Name-error.log")
Write-Host "$Name starting (give it about 15 seconds). Log: runtime\$Name.log" -ForegroundColor Green
