$ErrorActionPreference = 'Stop'
$base = 'http://localhost:4200'
$officerToken = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes('officer1:officer123'))
$adminToken = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes('admin1:admin123'))
$fd = Invoke-RestMethod -Uri "$base/api/fd/account/create-with-txn" -Method Post -Headers @{Authorization="Basic $officerToken"} -ContentType 'application/json' -Body (@{customerId='CUST001';productCode='FDSTD';principalAmount=100000;termMonths=12;branchCode='BR001'} | ConvertTo-Json)
Invoke-RestMethod -Uri "$base/api/fd/interest/$($fd.fdAccountNo)/settings" -Method Put -Headers @{Authorization="Basic $adminToken"} -ContentType 'application/json' -Body '{"mode":"MONTHLY_COMPOUND"}'
$bankNow = [TimeZoneInfo]::ConvertTimeBySystemTimeZoneId([DateTime]::UtcNow, 'India Standard Time')
$requestId = [guid]::NewGuid().ToString()
$body = @{requestId=$requestId;businessDate=$bankNow.ToString('yyyy-MM-dd');type='ACCRUAL'} | ConvertTo-Json
Invoke-RestMethod -Uri "$base/api/admin/interest-batches" -Method Post -Headers @{Authorization="Basic $adminToken"} -ContentType 'application/json' -Body $body
for ($attempt=0;$attempt -lt 30;$attempt++) {
    Start-Sleep -Seconds 2
    $job=Invoke-RestMethod -Uri "$base/api/admin/interest-batches/$requestId" -Headers @{Authorization="Basic $adminToken"}
    if ($job.status -ne 'QUEUED') { break }
}
if ($job.status -ne 'COMPLETED') { throw "Processing did not complete: $($job | ConvertTo-Json)" }
# Statements are projected asynchronously; allow a short propagation delay.
for ($attempt=0;$attempt -lt 15;$attempt++) {
    $statements=Invoke-RestMethod -Uri "$base/api/statements/$($fd.fdAccountNo)" -Headers @{Authorization="Basic $adminToken"}
    if ($statements.Count -gt 0) { break }; Start-Sleep -Seconds 2
}
if ($statements.Count -lt 1) { throw 'Statement event projection did not arrive' }
$statements | Format-Table
Write-Output "Demo passed. FD account: $($fd.fdAccountNo). Request: $requestId"
# Exercise the manual payout flow and replay the exact accepted request.
$payoutId=[guid]::NewGuid().ToString()
$payoutBody=@{requestId=$payoutId;businessDate=$bankNow.ToString('yyyy-MM-dd');type='PAYOUT';fdAccountNo=$fd.fdAccountNo} | ConvertTo-Json
Invoke-RestMethod -Uri "$base/api/admin/interest-batches" -Method Post -Headers @{Authorization="Basic $adminToken"} -ContentType 'application/json' -Body $payoutBody | Out-Null
for ($attempt=0;$attempt -lt 30;$attempt++) {
    Start-Sleep -Seconds 2
    $payout=Invoke-RestMethod -Uri "$base/api/admin/interest-batches/$payoutId" -Headers @{Authorization="Basic $adminToken"}
    if ($payout.status -ne 'QUEUED') { break }
}
if ($payout.status -ne 'COMPLETED') { throw 'Kafka payout did not complete.' }
for ($attempt=0;$attempt -lt 15;$attempt++) {
    $statements=Invoke-RestMethod -Uri "$base/api/statements/$($fd.fdAccountNo)" -Headers @{Authorization="Basic $adminToken"}
    if (@($statements | Where-Object { $_.interest_paid -gt 0 }).Count -gt 0) { break }
    Start-Sleep -Seconds 2
}
if (@($statements | Where-Object { $_.interest_paid -gt 0 }).Count -lt 1) { throw 'Payout statement projection did not arrive.' }
$historyUri="$base/api/fd/account/$($fd.fdAccountNo)/transactions"
$before=Invoke-RestMethod -Uri $historyUri -Headers @{Authorization="Basic $adminToken"} | ConvertTo-Json -Depth 10
Invoke-RestMethod -Uri "$base/api/admin/interest-batches" -Method Post -Headers @{Authorization="Basic $adminToken"} -ContentType 'application/json' -Body $payoutBody | Out-Null
Start-Sleep -Seconds 2
$after=Invoke-RestMethod -Uri $historyUri -Headers @{Authorization="Basic $adminToken"} | ConvertTo-Json -Depth 10
if ($before -ne $after) { throw 'Identical payout replay changed the ledger.' }
Write-Output "Kafka payout, statement projection and identical-request replay passed. Payout request: $payoutId"
