# Smoke test for L18 (notifications) + L20 (time travel). Needs: MySQL, Kafka, all 4 services running,
# APP_TIME_TRAVEL_ENABLED=true (fd-account-service) and APP_TIME_TRAVEL_MAX_DAYS_AHEAD=400 (interest-batch-service).
# NOTE: the business clock only moves forward. Use a demo database (docker compose down -v resets it).
$ErrorActionPreference = 'Stop'
$FD='http://localhost:8080'; $BATCH='http://localhost:8081'; $NOTIF='http://localhost:8083'
function Hdr($u,$p){ @{ Authorization = 'Basic ' + [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("${u}:${p}")) } }
$admin=Hdr 'admin1' 'admin123'; $officer=Hdr 'officer1' 'officer123'
$pass=0; $fail=0
function Check($name,$ok,$detail=''){ if($ok){$script:pass++;Write-Host "  PASS  $name" -ForegroundColor Green}else{$script:fail++;Write-Host "  FAIL  $name $detail" -ForegroundColor Red} }
function Api($method,$url,$h,$body=$null){
  $p=@{Uri=$url;Method=$method;Headers=$h;UseBasicParsing=$true}
  if($null -ne $body){$p.Body=($body|ConvertTo-Json);$p.ContentType='application/json'}
  try{ $r=Invoke-WebRequest @p; return @{Status=[int]$r.StatusCode;Json=($r.Content|ConvertFrom-Json)} }
  catch{ $c=0; if($_.Exception.Response){$c=[int]$_.Exception.Response.StatusCode.value__}; return @{Status=$c;Json=$null;Error=$_.Exception.Message} }
}
function WaitFor($sb,$tries=25){ for($i=0;$i -lt $tries;$i++){ $v=& $sb; if($v){return $v}; Start-Sleep -Seconds 2 }; return $null }
function HasEvent($acc,$type){ WaitFor { $n=Api 'GET' "$NOTIF/api/notifications?fdAccountNo=$acc" $admin; if($n.Json -and @($n.Json|Where-Object{$_.event_type -eq $type}).Count -ge 1){$n} } }
function Batch($type,$date,$acc=$null){
  $id=[guid]::NewGuid().ToString(); $b=@{requestId=$id;businessDate=$date;type=$type}; if($acc){$b.fdAccountNo=$acc}
  $r=Api 'POST' "$BATCH/api/admin/interest-batches" $admin $b; if($r.Status -ne 202){return $r}
  return WaitFor { $j=Api 'GET' "$BATCH/api/admin/interest-batches/$id" $admin; if($j.Json -and $j.Json.status -ne 'QUEUED'){$j} }
}
$newFd=@{customerId='CUST001';productCode='FDSTD';principalAmount=100000;termMonths=12;branchCode='BR001'}

Write-Host "`n== Time travel clock ==" -ForegroundColor Cyan
$c=Api 'GET' "$FD/api/fd/clock" $admin
Check 'Clock endpoint reachable (admin)' ($c.Status -eq 200) $c.Error
if(-not $c.Json.timeTravelEnabled){ throw 'Time travel is OFF. Set APP_TIME_TRAVEL_ENABLED=true and restart fd-account-service.' }
Check 'Officer cannot use the clock (403)' ((Api 'GET' "$FD/api/fd/clock" $officer).Status -eq 403)
Write-Host "  business date: $($c.Json.businessDate) (offset $($c.Json.offsetDays))"

Write-Host "`n== Scenario A: create -> notify -> interest -> maturity ==" -ForegroundColor Cyan
$a=Api 'POST' "$FD/api/fd/account/create-with-txn" $officer $newFd
Check 'FD created' ($a.Status -eq 200) $a.Error
$acc=$a.Json.fdAccountNo; Write-Host "  account $acc"
Check 'Notification: FdCreated logged' ($null -ne (HasEvent $acc 'FdCreated'))
$d=(Api 'POST' "$FD/api/fd/clock/advance" $admin @{days=31}).Json.businessDate
Check "Clock advanced to $d" ($null -ne $d)
$acr=Batch 'ACCRUAL' $d
Check 'Accrual batch COMPLETED' ($acr.Json.status -eq 'COMPLETED') ($acr | ConvertTo-Json -Depth 4)
$pay=Batch 'PAYOUT' $d $acc
Check 'Interest payout COMPLETED' ($pay.Json.status -eq 'COMPLETED') ($pay | ConvertTo-Json -Depth 4)
Check 'Notification: InterestPaid logged' ($null -ne (HasEvent $acc 'InterestPaid'))
$d2=(Api 'POST' "$FD/api/fd/clock/advance" $admin @{days=340}).Json.businessDate
Write-Host "  business date now $d2 (past maturity)"
$m=Api 'POST' "$FD/api/fd/maturity/run" $admin @{}
Check 'Maturity run matured >= 1' ($m.Status -eq 200 -and $m.Json.matured -ge 1) ($m | ConvertTo-Json -Depth 4)
Check 'Account status MATURED' ((Api 'GET' "$FD/api/fd/account/$acc" $officer).Json.status -eq 'MATURED')
Check 'Notification: FdMatured logged' ($null -ne (HasEvent $acc 'FdMatured'))

Write-Host "`n== Scenario B: premature withdrawal ==" -ForegroundColor Cyan
$b=Api 'POST' "$FD/api/fd/account/create-with-txn" $officer $newFd
$acc2=$b.Json.fdAccountNo; Write-Host "  account $acc2"
Api 'POST' "$FD/api/fd/clock/advance" $admin @{days=120} | Out-Null
$inq=Api 'GET' "$FD/api/fd/account/$acc2/withdrawal-inquiry" $officer
Check 'Withdrawal inquiry shows a penalty' ($inq.Status -eq 200 -and $null -ne $inq.Json.penaltyAmount) ($inq | ConvertTo-Json -Depth 4)
$w=Api 'POST' "$FD/api/fd/account/$acc2/withdrawal" $officer @{reason='smoke test'}
Check 'Withdrawal accepted' ($w.Status -eq 200 -and $w.Json.status -eq 'PREMATURELY_CLOSED') ($w | ConvertTo-Json -Depth 4)
Check 'Notification: FdPrematurelyClosed logged' ($null -ne (HasEvent $acc2 'FdPrematurelyClosed'))
$again=Api 'POST' "$FD/api/fd/account/$acc2/withdrawal" $officer @{reason='again'}
Check 'Scenario 3: second withdrawal rejected' ($again.Status -ge 400)

Write-Host "`n== Notification log ==" -ForegroundColor Cyan
(Api 'GET' "$NOTIF/api/notifications?limit=10" $admin).Json | Format-Table event_type,fd_account_no,channel,recipient,status
Write-Host "`nResult: $pass passed, $fail failed" -ForegroundColor Cyan
if($fail -gt 0){ exit 1 }
