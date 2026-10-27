# End-to-end lifecycle test (Lab L20) against the RUNNING system: MySQL, Kafka and all 4 services.
#   S1  full life: create -> interest accrual + payout -> maturity, with idempotency checks (no double payout)
#   S2  premature withdrawal with penalty
#   S3  withdrawing a MATURED / closed account is rejected and nothing changes
#   S4  notifications for creation, interest, maturity and closure (each exactly once)
#   +   role matrix and the reports
#
# The business clock only moves forward and one run uses ~490 days, so a run needs a fresh database:
#   .\scripts\lifecycle-test.ps1 -FreshStart      (resets the demo DB, restarts services, then tests - recommended)
# Without -FreshStart the script checks that the clock is near 0 and no FD is ACTIVE, and stops with advice if not.
# E-mail is mock-only during -FreshStart runs so the test never mails anyone (add -RealEmail to allow real mail).
param([switch]$FreshStart, [switch]$RealEmail)
$ErrorActionPreference = 'Stop'
if ($FreshStart) {
    if ($RealEmail) { & (Join-Path $PSScriptRoot 'reset-demo.ps1') -RealEmail } else { & (Join-Path $PSScriptRoot 'reset-demo.ps1') }
}

$FD = 'http://localhost:8080'; $BATCH = 'http://localhost:8081'; $STMT = 'http://localhost:8082'; $NOTIF = 'http://localhost:8083'; $AUTH = 'http://localhost:8090'
function Hdr($u, $p) { @{ Authorization = 'Basic ' + [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("${u}:${p}")) } }
$admin = Hdr 'admin1' 'admin123'; $officer = Hdr 'officer1' 'officer123'; $customer = Hdr 'customer1' 'customer123'
$pass = 0; $fail = 0
function Check($name, $ok, $detail = '') {
    if ($ok) { $script:pass++; Write-Host "  PASS  $name" -ForegroundColor Green }
    else { $script:fail++; Write-Host "  FAIL  $name $detail" -ForegroundColor Red }
}
function Section($t) { Write-Host "`n== $t ==" -ForegroundColor Cyan }
function Api($method, $url, $h, $body = $null) {
    $p = @{ Uri = $url; Method = $method; Headers = $h; UseBasicParsing = $true }
    if ($null -ne $body) { $p.Body = ($body | ConvertTo-Json); $p.ContentType = 'application/json' }
    try {
        $r = Invoke-WebRequest @p
        $json = $null
        if ($r.Content -is [string] -and $r.Content.Length -gt 0 -and ($r.Content[0] -eq '{' -or $r.Content[0] -eq '[')) { $json = $r.Content | ConvertFrom-Json }
        return @{ Status = [int]$r.StatusCode; Json = $json; Raw = $r }
    } catch {
        $code = 0; if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode.value__ }
        return @{ Status = $code; Json = $null; Error = $_.Exception.Message }
    }
}
# Short, safe text for failure details (the Raw web response is deliberately left out).
function Dump($r) { if ($null -eq $r) { return '' }; $b = ''; if ($r.Json) { $b = $r.Json | ConvertTo-Json -Depth 4 -Compress }; "status=$($r.Status) $b $($r.Error)" }
function Login($user, $password) { Api 'POST' "$AUTH/api/auth/login" @{} @{ username = $user; password = $password } }
function Bearer($token) { @{ Authorization = "Bearer $token" } }
function Rows($json) { @($json | ForEach-Object { $_ }) }
function WaitFor($sb, $tries = 30) { for ($i = 0; $i -lt $tries; $i++) { $v = & $sb; if ($v) { return $v }; Start-Sleep -Seconds 2 }; return $null }
function Money($x) { [math]::Round([decimal]$x, 2) }
# The leading comma keeps a one-element result an array (PowerShell 5.1 would otherwise unwrap it).
function Txns($acc) { , @(Rows (Api 'GET' "$FD/api/fd/account/$acc/transactions" $officer).Json) }
function SumType($rows, $type) { $s = [decimal]0; foreach ($r in $rows) { if ($r.txnType -eq $type) { $s += [decimal]$r.amount } }; Money $s }
function GlNet($rows, $gl) {
    $s = [decimal]0
    foreach ($r in $rows) { if ($r.creditGlAccount -eq $gl) { $s += [decimal]$r.amount }; if ($r.debitGlAccount -eq $gl) { $s -= [decimal]$r.amount } }
    Money $s
}
function AccountStatus($acc) { (Api 'GET' "$FD/api/fd/account/$acc" $officer).Json.status }
function Batch($type, $date, $acc = $null, $id = $null) {
    if (-not $id) { $id = [guid]::NewGuid().ToString() }
    $b = @{ requestId = $id; businessDate = $date; type = $type }; if ($acc) { $b.fdAccountNo = $acc }
    $r = Api 'POST' "$BATCH/api/admin/interest-batches" $admin $b
    if ($r.Status -ne 202) { return $r }
    return WaitFor { $j = Api 'GET' "$BATCH/api/admin/interest-batches/$id" $admin; if ($j.Json -and $j.Json.status -ne 'QUEUED') { $j } }
}
function Notifs($acc) { Rows (Api 'GET' "$NOTIF/api/notifications?fdAccountNo=$acc&limit=200" $admin).Json }
# Every event is logged once per channel; EMAIL is the default channel for the "exactly once" checks.
function CountEvent($acc, $type, $channel = 'EMAIL') { @(Notifs $acc | Where-Object { $_.event_type -eq $type -and $_.channel -eq $channel }).Count }
function WaitEvent($acc, $type) { $null -ne (WaitFor { if ((CountEvent $acc $type) -ge 1) { $true } }) }
function AdvanceClock($days) { (Api 'POST' "$FD/api/fd/clock/advance" $admin @{ days = $days }).Json }
function NewFd { Api 'POST' "$FD/api/fd/account/create-with-txn" $officer @{ customerId = 'CUST001'; productCode = 'FDSTD'; principalAmount = 100000; termMonths = 12; branchCode = 'BR001' } }

# ---------------------------------------------------------------- preflight
Section 'Preflight'
$clock = Api 'GET' "$FD/api/fd/clock" $admin
Check 'FD service up and clock readable' ($clock.Status -eq 200) $clock.Error
if ($clock.Status -ne 200) { throw 'fd-account-service is not reachable on 8080. Start everything first (or use -FreshStart).' }
if (-not $clock.Json.timeTravelEnabled) { throw 'Time travel is OFF. Set APP_TIME_TRAVEL_ENABLED=true in scripts/local.env.ps1 and restart.' }
foreach ($svc in @(@('batch', "$BATCH/api/admin/interest-batches", $admin), @('statement', "$STMT/api/statements/summary/all", $admin), @('notification', "$NOTIF/api/notifications?limit=1", $admin))) {
    Check "$($svc[0]) service up" ((Api 'GET' $svc[1] $svc[2]).Status -eq 200)
}
$activeNow = @((Api 'GET' "$FD/api/fd/interest/accounts" $admin).Json | ForEach-Object { $_ } | Where-Object { $_.status -eq 'ACTIVE' }).Count
if ($clock.Json.offsetDays -gt 300 -or $activeNow -gt 0) {
    throw "The system is not fresh (clock offset $($clock.Json.offsetDays) days, $activeNow ACTIVE FDs). Run:  .\scripts\lifecycle-test.ps1 -FreshStart"
}
$adminLogin = Login 'admin1' 'admin123'
Check 'auth service up and issues tokens' ($adminLogin.Status -eq 200 -and $adminLogin.Json.accessToken) (Dump $adminLogin)
Write-Host "  business date: $($clock.Json.businessDate) (offset $($clock.Json.offsetDays))"

# ---------------------------------------------------------------- role matrix
Section 'Role matrix'
Check 'no login -> 401' ((Api 'GET' "$FD/api/report/fd-summary" @{}).Status -eq 401)
Check 'customer cannot open an FD (403)' ((Api 'POST' "$FD/api/fd/account/create-with-txn" $customer @{ customerId = 'CUST001'; productCode = 'FDSTD'; principalAmount = 100000; termMonths = 12; branchCode = 'BR001' }).Status -eq 403)
Check 'officer cannot use the clock (403)' ((Api 'GET' "$FD/api/fd/clock" $officer).Status -eq 403)
Check 'officer cannot run maturity (403)' ((Api 'POST' "$FD/api/fd/maturity/run" $officer @{}).Status -eq 403)
$batchBody = @{ requestId = [guid]::NewGuid().ToString(); businessDate = $clock.Json.businessDate; type = 'ACCRUAL' }
# These three services only know admin1/officer1 (no customer login exists there), so a customer is refused at login: 401.
Check 'customer cannot start a batch (401, no customer login on that service)' ((Api 'POST' "$BATCH/api/admin/interest-batches" $customer $batchBody).Status -eq 401)
Check 'officer cannot start a batch (403, ADMIN only)' ((Api 'POST' "$BATCH/api/admin/interest-batches" $officer $batchBody).Status -eq 403)
Check 'customer cannot read the fd-summary report (403)' ((Api 'GET' "$FD/api/report/fd-summary" $customer).Status -eq 403)
Check 'customer cannot read notifications (401, no customer login on that service)' ((Api 'GET' "$NOTIF/api/notifications" $customer).Status -eq 401)
Check 'customer cannot read statements (401)' ((Api 'GET' "$STMT/api/statements/summary/all" $customer).Status -eq 401)
Check 'officer cannot run the extract (403)' ((Api 'POST' "$FD/api/report/extract/run" $officer).Status -eq 403)

# ---------------------------------------------------------------- JWT login
Section 'JWT login (auth-service) and Bearer access'
$tokAdmin = $adminLogin.Json.accessToken
$loginOfficer = Login 'officer1' 'officer123'; $tokOfficer = $loginOfficer.Json.accessToken
$loginCustomer = Login 'customer1' 'customer123'; $tokCustomer = $loginCustomer.Json.accessToken
Check 'officer and customer can log in' ($tokOfficer -and $tokCustomer)
Check 'token response says Bearer with a lifetime' ($adminLogin.Json.tokenType -eq 'Bearer' -and $adminLogin.Json.expiresIn -gt 0)
Check 'wrong password -> 401' ((Login 'admin1' 'wrong').Status -eq 401)
Check 'unknown user gets the same 401' ((Login 'nobody' 'x').Status -eq 401)
Check 'admin token opens the clock (200)' ((Api 'GET' "$FD/api/fd/clock" (Bearer $tokAdmin)).Status -eq 200)
Check 'officer token is refused on the clock (403)' ((Api 'GET' "$FD/api/fd/clock" (Bearer $tokOfficer)).Status -eq 403)
Check 'officer token reads the fd-summary report (200)' ((Api 'GET' "$FD/api/report/fd-summary" (Bearer $tokOfficer)).Status -eq 200)
Check 'customer token is refused on fd-summary (403)' ((Api 'GET' "$FD/api/report/fd-summary" (Bearer $tokCustomer)).Status -eq 403)
Check 'admin token starts nothing it should not: batch list works (200)' ((Api 'GET' "$BATCH/api/admin/interest-batches" (Bearer $tokAdmin)).Status -eq 200)
Check 'customer token on the batch service is 403 (real login, wrong role)' ((Api 'GET' "$BATCH/api/admin/interest-batches" (Bearer $tokCustomer)).Status -eq 403)
Check 'customer token on statements is 403' ((Api 'GET' "$STMT/api/statements/summary/all" (Bearer $tokCustomer)).Status -eq 403)
Check 'officer token reads notifications (200)' ((Api 'GET' "$NOTIF/api/notifications?limit=1" (Bearer $tokOfficer)).Status -eq 200)
Check 'customer token on notifications is 403' ((Api 'GET' "$NOTIF/api/notifications" (Bearer $tokCustomer)).Status -eq 403)
Check 'garbage token -> 401' ((Api 'GET' "$FD/api/fd/clock" (Bearer 'not.a.token')).Status -eq 401)
$flipped = $tokAdmin.Substring(0, $tokAdmin.Length - 2) + $(if ($tokAdmin.EndsWith('AA')) { 'BB' } else { 'AA' })
Check 'token with a damaged signature -> 401' ((Api 'GET' "$FD/api/fd/clock" (Bearer $flipped)).Status -eq 401)
$parts = $tokCustomer.Split('.')
$payload = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String(($parts[1].Replace('-', '+').Replace('_', '/') + ('=' * ((4 - $parts[1].Length % 4) % 4)))))
$forgedPayload = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($payload.Replace('CUSTOMER', 'ADMIN'))).TrimEnd('=').Replace('+', '-').Replace('/', '_')
Check 'customer token edited to say ADMIN is rejected (401)' ((Api 'GET' "$FD/api/fd/clock" (Bearer ($parts[0] + '.' + $forgedPayload + '.' + $parts[2]))).Status -eq 401)
# ---------------------------------------------------------------- scenario 1
Section 'Scenario 1: full lifecycle to maturity with interest payout'
$a = NewFd
Check 'FD created' ($a.Status -eq 200) $a.Error
$s1 = $a.Json.fdAccountNo; Write-Host "  account $s1"
Check 'status is ACTIVE' ((AccountStatus $s1) -eq 'ACTIVE')
$t = Txns $s1
Check 'one DEPOSIT of 100000 posted' ($t.Count -eq 1 -and $t[0].txnType -eq 'DEPOSIT' -and (Money $t[0].amount) -eq 100000)
$acct = (Api 'GET' "$FD/api/fd/account/$s1" $officer).Json
$maturity = [datetime]::Parse($acct.maturityDate)

$d1 = (AdvanceClock 31).businessDate
$acc = Batch 'ACCRUAL' $d1
Check 'accrual batch COMPLETED' ($acc.Json.status -eq 'COMPLETED') (Dump $acc)
$payId = [guid]::NewGuid().ToString()
$pay = Batch 'PAYOUT' $d1 $s1 $payId
Check 'interest payout COMPLETED' ($pay.Json.status -eq 'COMPLETED') (Dump $pay)
$paid1 = SumType (Txns $s1) 'INTEREST'
$count1 = (Txns $s1).Count
Check "interest paid after 31 days is positive ($paid1)" ($paid1 -gt 0)
$dup = Api 'POST' "$BATCH/api/admin/interest-batches" $admin @{ requestId = $payId; businessDate = $d1; type = 'PAYOUT'; fdAccountNo = $s1 }
Check 'identical retry of the payout request is not a server error' ($dup.Status -in 200, 202, 409) "status $($dup.Status)"
Start-Sleep -Seconds 4
$null = Batch 'PAYOUT' $d1 $s1
Check 'payout is idempotent: no second payment for the same days' ((Txns $s1).Count -eq $count1 -and (SumType (Txns $s1) 'INTEREST') -eq $paid1)
$st = WaitFor { $r = Api 'GET' "$STMT/api/statements/$s1" $admin; if ($r.Json -and @(Rows $r.Json | Where-Object { [decimal]$_.interest_paid -gt 0 }).Count -ge 1) { $r } }
Check 'statement-service shows the interest paid (via Kafka)' ($null -ne $st)

$daysLeft = [int](($maturity - [datetime]::Parse($d1)).TotalDays) + 1
$d2 = (AdvanceClock $daysLeft).businessDate
Write-Host "  business date now $d2 (maturity $($maturity.ToString('yyyy-MM-dd')))"
$m = Api 'POST' "$FD/api/fd/maturity/run" $admin @{}
Check 'maturity run matured >= 1' ($m.Status -eq 200 -and $m.Json.matured -ge 1) (Dump $m)
Check 'status is MATURED' ((AccountStatus $s1) -eq 'MATURED')
$t = Txns $s1
Check 'maturity pays back the full principal' ((SumType $t 'MATURITY_PAYOUT') -eq 100000)
Check 'total interest = 6.5% of 100000 for 12 months (6500.00)' ([math]::Abs((SumType $t 'INTEREST') - 6500) -le 0.02) "got $(SumType $t 'INTEREST')"
Check 'deposit liability GL nets to zero (books balance)' ((GlNet $t 'LIABILITY_FD_DEPOSITS') -eq 0) "net $(GlNet $t 'LIABILITY_FD_DEPOSITS')"
$countM = $t.Count
$m2 = Api 'POST' "$FD/api/fd/maturity/run" $admin @{}
Check 'second maturity run changes nothing (no double payout)' ($m2.Status -eq 200 -and (Txns $s1).Count -eq $countM -and (AccountStatus $s1) -eq 'MATURED')

# ---------------------------------------------------------------- scenario 2
Section 'Scenario 2: premature withdrawal with penalty'
$b = NewFd
$s2 = $b.Json.fdAccountNo; Write-Host "  account $s2"
$null = AdvanceClock 120
$inq = Api 'GET' "$FD/api/fd/account/$s2/withdrawal-inquiry" $officer
Check 'inquiry returns a positive penalty' ($inq.Status -eq 200 -and [decimal]$inq.Json.penaltyAmount -gt 0) (Dump $inq)
Check 'inquiry writes nothing' ((Txns $s2).Count -eq 1 -and (AccountStatus $s2) -eq 'ACTIVE')
$w = Api 'POST' "$FD/api/fd/account/$s2/withdrawal" $officer @{ reason = 'lifecycle test' }
Check 'withdrawal accepted -> PREMATURELY_CLOSED' ($w.Status -eq 200 -and $w.Json.status -eq 'PREMATURELY_CLOSED') (Dump $w)
$t2 = Txns $s2
Check 'penalty posted equals the quoted penalty' ((SumType $t2 'PENALTY_DEBIT') -eq (Money $inq.Json.penaltyAmount))
Check 'customer receives exactly the quoted payout' ((Money ((SumType $t2 'INTEREST') + (SumType $t2 'PREMATURE_WITHDRAWAL'))) -eq (Money $inq.Json.finalPayoutAmount))
Check 'penalty income GL equals the penalty' ((GlNet $t2 'INCOME_PREMATURE_PENALTY') -eq (Money $inq.Json.penaltyAmount))
Check 'deposit liability GL nets to zero (books balance)' ((GlNet $t2 'LIABILITY_FD_DEPOSITS') -eq 0) "net $(GlNet $t2 'LIABILITY_FD_DEPOSITS')"

# ---------------------------------------------------------------- scenario 3
Section 'Scenario 3: closed / matured accounts cannot be withdrawn'
foreach ($pair in @(@('MATURED', $s1), @('PREMATURELY_CLOSED', $s2))) {
    $acctNo = $pair[1]; $before = (Txns $acctNo).Count
    Check "$($pair[0]): withdrawal rejected (400)" ((Api 'POST' "$FD/api/fd/account/$acctNo/withdrawal" $officer @{ reason = 'again' }).Status -eq 400)
    Check "$($pair[0]): inquiry rejected (400)" ((Api 'GET' "$FD/api/fd/account/$acctNo/withdrawal-inquiry" $officer).Status -eq 400)
    Check "$($pair[0]): ledger and status unchanged" ((Txns $acctNo).Count -eq $before -and (AccountStatus $acctNo) -eq $pair[0])
}
Check 'unknown account: withdrawal rejected (400)' ((Api 'POST' "$FD/api/fd/account/BR9999999999/withdrawal" $officer @{ reason = 'x' }).Status -eq 400)

Section 'Ownership with a customer token'
Check 'customer reads own FD (200)' ((Api 'GET' "$FD/api/fd/account/$s1" (Bearer $tokCustomer)).Status -eq 200)
Check 'customer reads own ledger (200)' ((Api 'GET' "$FD/api/fd/account/$s1/transactions" (Bearer $tokCustomer)).Status -eq 200)
Check 'customer asks about an FD that is not theirs / unknown (403)' ((Api 'GET' "$FD/api/fd/account/BR9999999999" (Bearer $tokCustomer)).Status -eq 403)
Check 'customer cannot withdraw from an FD that is not theirs (403)' ((Api 'POST' "$FD/api/fd/account/BR9999999999/withdrawal" (Bearer $tokCustomer) @{ reason = 'x' }).Status -eq 403)
# ---------------------------------------------------------------- scenario 4
Section 'Scenario 4: notifications'
Check 'S1 FdCreated' (WaitEvent $s1 'FdCreated')
Check 'S1 InterestPaid' (WaitEvent $s1 'InterestPaid')
Check 'S1 FdMatured' (WaitEvent $s1 'FdMatured')
Check 'S2 FdCreated' (WaitEvent $s2 'FdCreated')
Check 'S2 FdPrematurelyClosed' (WaitEvent $s2 'FdPrematurelyClosed')
Start-Sleep -Seconds 4
Check 'S1: every notification sent exactly once' ((CountEvent $s1 'FdCreated') -eq 1 -and (CountEvent $s1 'InterestPaid') -eq 1 -and (CountEvent $s1 'FdMatured') -eq 1)
Check 'S2: every notification sent exactly once; no mail for the final interest snapshot' ((CountEvent $s2 'FdCreated') -eq 1 -and (CountEvent $s2 'FdPrematurelyClosed') -eq 1 -and (CountEvent $s2 'InterestPaid') -eq 0)
$statuses = @(Notifs $s1) + @(Notifs $s2) | ForEach-Object { $_.status } | Sort-Object -Unique
Check 'WhatsApp is logged for every event too (once each)' ((CountEvent $s1 'FdCreated' 'WHATSAPP') -eq 1 -and (CountEvent $s1 'InterestPaid' 'WHATSAPP') -eq 1 -and (CountEvent $s1 'FdMatured' 'WHATSAPP') -eq 1 -and (CountEvent $s2 'FdPrematurelyClosed' 'WHATSAPP') -eq 1)
Write-Host "  notification statuses seen: $($statuses -join ', ')"
Check 'no notification FAILED' (-not ($statuses -contains 'FAILED'))

# ---------------------------------------------------------------- reports
Section 'Reports'
$sumM = Rows (Api 'GET' "$FD/api/report/fd-summary?status=MATURED" $officer).Json
Check 'fd-summary MATURED includes the matured FD' (@($sumM | Where-Object { $_.currency -eq 'INR' -and $_.total_accounts -ge 1 }).Count -eq 1)
$sumP = Rows (Api 'GET' "$FD/api/report/fd-summary?status=PREMATURELY_CLOSED" $admin).Json
Check 'fd-summary PREMATURELY_CLOSED includes the closed FD' (@($sumP | Where-Object { $_.currency -eq 'INR' -and $_.total_accounts -ge 1 }).Count -eq 1)
$csv = Api 'GET' "$FD/api/report/fd-summary?status=ACTIVE&format=csv" $officer
Check 'CSV report has its header even with no rows' ($csv.Status -eq 200 -and $csv.Raw.Content.StartsWith('product_code,currency,total_accounts'))
$pdf = Api 'GET' "$FD/api/report/fd-summary?status=MATURED&format=pdf" $officer
Check 'PDF report is a PDF' ($pdf.Status -eq 200 -and [Text.Encoding]::ASCII.GetString($pdf.Raw.Content, 0, 5) -eq '%PDF-')
$xlsx = Api 'GET' "$FD/api/report/fd-summary?status=MATURED&format=xlsx" $officer
Check 'Excel report is an xlsx file' ($xlsx.Status -eq 200 -and $xlsx.Raw.Content[0] -eq 0x50 -and $xlsx.Raw.Content[1] -eq 0x4B)
$pf = Rows (Api 'GET' "$FD/api/report/customer-portfolio?customerId=CUST001" $officer).Json
Check 'staff portfolio lists both FDs' (@($pf | Where-Object { $_.fd_account_no -in $s1, $s2 }).Count -eq 2)
$own = Rows (Api 'GET' "$FD/api/report/customer-portfolio?customerId=SOMEONE_ELSE" $customer).Json
Check 'customer portfolio ignores customerId and shows only own FDs' (@($own | Where-Object { $_.fd_account_no -in $s1, $s2 }).Count -eq 2)
$ih = Rows (Api 'GET' "$FD/api/report/interest-history/$s1" $customer).Json
Check 'customer can read interest history of own FD' ($ih.Count -ge 1)
$ex = Api 'POST' "$FD/api/report/extract/run" $admin
Check 'nightly extract written (>= 2 accounts)' ($ex.Status -eq 200 -and $ex.Json.accounts -ge 2) (Dump $ex)
$ex2 = Api 'POST' "$FD/api/report/extract/run" $admin
Check 'extract re-run is idempotent (created=false)' ($ex2.Status -eq 200 -and $ex2.Json.created -eq $false)
# The service itself decides whether Python is available (it may run in a container), so ask the service, not this PC.
$py = Api 'POST' "$FD/api/report/python" $admin
if ($py.Status -eq 200) {
    Check 'Python report generated (json + svg)' ($py.Json.scriptOutput -like 'report ok*') (Dump $py)
} elseif ($py.Status -eq 502) {
    Write-Host '  SKIP  Python report (python is not installed where fd-account-service runs)' -ForegroundColor Yellow
} else {
    Check 'Python report endpoint answers' $false (Dump $py)
}
# ---------------------------------------------------------------- summary
$end = (Api 'GET' "$FD/api/fd/clock" $admin).Json
Write-Host "`nBusiness clock is now $($end.businessDate) (offset $($end.offsetDays) days). It cannot go back: run again with -FreshStart." -ForegroundColor Yellow
Write-Host "Result: $pass passed, $fail failed" -ForegroundColor Cyan
if ($fail -gt 0) { exit 1 }

