$ErrorActionPreference='Stop'
$pidFile=Join-Path $PSScriptRoot '../runtime/services.json'
if (!(Test-Path -LiteralPath $pidFile)) { Write-Output 'No recorded service processes.';return }
foreach ($record in (Get-Content -LiteralPath $pidFile -Raw | ConvertFrom-Json)) {
 $process=Get-Process -Id $record.ProcessId -ErrorAction SilentlyContinue
 if ($process -and $process.ProcessName -eq 'java' -and $process.StartTime.ToUniversalTime().ToString('o') -eq $record.StartedUtc) { Stop-Process -Id $process.Id }
}
Remove-Item -LiteralPath $pidFile
# Safety net: the recorded start time can fail to match, which used to leave services running and holding the ports.
# Also stop any java process that was started from one of OUR four jars in this project's artifacts folder.
$artifacts=(Resolve-Path (Join-Path $PSScriptRoot '../artifacts')).Path
foreach ($p in Get-CimInstance Win32_Process -Filter "Name='java.exe'") {
 if ($p.CommandLine -and $p.CommandLine -like "*$artifacts*" -and $p.CommandLine -match '(auth-service|fd-account-service|interest-batch-service|statement-service|notification-service)\.jar') { Stop-Process -Id $p.ProcessId -Force }
}
Write-Output 'Stopped only the recorded Java service processes. MySQL and Kafka are unchanged.'
