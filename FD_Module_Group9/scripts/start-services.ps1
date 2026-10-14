$ErrorActionPreference='Stop'
$projectRoot=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$localConfig=Join-Path $PSScriptRoot 'local.env.ps1'
if (!(Test-Path -LiteralPath $localConfig)) { throw 'Copy scripts/local.env.ps1.example to scripts/local.env.ps1 and set your MySQL credentials first.' }
. $localConfig
if (!$env:DB_PASSWORD -or $env:DB_PASSWORD -eq 'CHANGE_ME') { throw 'Set your actual local MySQL password in scripts/local.env.ps1.' }
if (!$env:JWT_SECRET -or $env:JWT_SECRET.Length -lt 32 -or $env:JWT_SECRET -like 'CHANGE_ME*') { throw 'Set JWT_SECRET (at least 32 random characters) in scripts/local.env.ps1. auth-service will not start without it.' }
$runtimeDir=Join-Path $projectRoot 'runtime'
New-Item -ItemType Directory -Path $runtimeDir -Force | Out-Null
$pidFile=Join-Path $runtimeDir 'services.json'
if (Test-Path -LiteralPath $pidFile) {
 foreach ($record in (Get-Content -LiteralPath $pidFile -Raw | ConvertFrom-Json)) {
  if (Get-Process -Id $record.ProcessId -ErrorAction SilentlyContinue) { throw 'A previous service process still exists. Run scripts/stop-services.ps1 first.' }
 }
}
$services=@('auth-service','fd-account-service','interest-batch-service','statement-service','notification-service')
$records=@()
try {
 foreach ($service in $services) {
  $jar=Join-Path $projectRoot "artifacts/$service.jar"
  if (!(Test-Path -LiteralPath $jar)) { throw "Missing built JAR: $jar" }
  if ($service -eq 'interest-batch-service') {$env:SERVICE_DB_URL=$env:BATCH_DB_URL}
  if ($service -eq 'statement-service') {$env:SERVICE_DB_URL=$env:STATEMENT_DB_URL}
  if ($service -eq 'notification-service') {$env:SERVICE_DB_URL=$env:NOTIFY_DB_URL}
  $process=Start-Process -FilePath 'java' -ArgumentList @('-jar',('"'+$jar+'"')) -WindowStyle Hidden -PassThru -WorkingDirectory $projectRoot -RedirectStandardOutput (Join-Path $runtimeDir "$service.log") -RedirectStandardError (Join-Path $runtimeDir "$service-error.log")
  $records+=@{Service=$service;ProcessId=$process.Id;StartedUtc=$process.StartTime.ToUniversalTime().ToString('o')}
  $records | ConvertTo-Json | Set-Content -LiteralPath $pidFile -Encoding utf8
 }
 Write-Output 'Started five independent Java services. Check runtime/*.log and ports 8090 (auth), 8080, 8081, 8082, 8083. Kafka and MySQL must already be running.'
} catch { Write-Error $_; throw }
