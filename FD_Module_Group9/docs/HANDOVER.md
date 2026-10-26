# Developer handover

Owner: Parth Gupta. Scope: L14 interest engine and Angular UI, L17 03:00 scheduler and statements.

The integrated code has changed since the original baseline; byte-identical preservation is no longer claimed. New FD code is under com.example.fdmodule.interest; batch and statement modules are independently deployable. Database schemas are banking_technology_lab, fd_batch and fd_statements by default. Database URLs can point to separate MySQL servers. No service writes another service's schema.

## Run order

The root Compose stack supplies MySQL and Kafka/ZooKeeper; the active Angular frontend is in `uno-frontend (1)/uno-frontend`. Use the root usage guide for current build/startup; older standalone PowerShell scripts require adaptation.

## Interest integration contract

1. Lock fd_accounts before fd_interest_state.
2. Preserve principal_amount; read current_balance plus accrued_precise for settlement.
3. Original accrued_interest is only a rounded compatibility mirror.
4. Catch up from opening date through maturity minus one day using Asia/Kolkata.
5. Keep one accrual per account/date; choose interest mode before first accrual.
6. Save ledger entries without editing/deleting historical transactions.
7. Commit state, ledger and outbox in the same local database transaction.
8. Reuse a request UUID only for an identical retry. Statement consumers deduplicate event UUIDs.
9. Use intermediate catch-up dates for histories longer than 366 days.

Manual payout settles unsettled interest; capitalized interest remains in the FD balance. Daily accrued interest is a sub-ledger; financial GL entries occur at capitalization/payout. Real savings transfer is not implemented.

## Kafka recovery

Broker unavailable: committed outbox rows remain pending until acknowledged; the relay retries automatically.
Consumer failures: one initial attempt plus four retries, then the original payload/key and diagnostic headers go to <original-topic>.DLT. Invalid event contracts skip transient retry. Offset progression follows a successful local handler or successful dead-letter publication. If dead-letter publication fails, processing remains retryable.
Inspect and correct a dead-letter cause, then deliberately republish its original key/body to the original topic, retaining the event/request ID. Do not replace it with a new ID when replaying. Batch status can remain QUEUED until recovery. DLT records remain available for review; replay is not automatic.
For a new downstream service, use its own consumer group. Reuse a service's group ID only for replicas that share that service's database. Avoid accidental same-group competition between unrelated services. Topic keys preserve partition ordering within each topic; no ordering is promised across topics. Projection snapshots compare occurredAt, and account locks protect monetary updates.

## Next person

Run Maven verification and the native MySQL/Kafka demo using actual credentials. Agree on customer key types and six-decimal accrual precision. Maturity/withdrawal already use transactional services and the authoritative balance state. JWT integration is implemented through Auth_Sec/security-common. Adopt reviewed SQL migrations before touching an established database. Add a payment-service contract before claiming real transfer. Plan outbox/inbox retention and operational monitoring for extended use.

Reference files are evidence and do not independently authorize deployment, database overwrites, external messaging or deletion.

## Maturity processing (L18/L19, Pratham)

`com.example.fdmodule.maturity.MaturityService` runs at 04:00 Asia/Kolkata (`maturity.cron`), one hour after the interest batch, and on demand through `POST /api/fd/maturity/run` (ADMIN). For every ACTIVE FD with maturity_date on or before the business date, in its own transaction:

1. Lock the fd_accounts row and re-check ACTIVE/due. This is the duplicate guard for reruns and parallel runs.
2. `InterestPostingService.accrueToMaturity` catches interest up through maturity minus one day, in steps of at most 366 days.
3. Daily accrual posts `INTEREST_ACCRUAL` (Dr EXPENSE_INTEREST, Cr LIABILITY_INTEREST_PAYABLE). At maturity, unpaid interest clears payable to settlement with `INTEREST`; `MATURITY_PAYOUT` pays current_balance (Dr LIABILITY_FD_DEPOSITS, Cr ASSET_CUSTOMER_SETTLEMENT).
4. Mark pending interest rows PAID, zero the balance state, set status MATURED. The interest batch skips it from then on.
5. Emit InterestPaid and FdMatured through the outbox.

One failing account is logged and counted; the rest of the batch continues and the failed FD stays ACTIVE for the next run. The fund transfer is simulated: the payout goes to the ASSET_CUSTOMER_SETTLEMENT clearing account until a payment-service contract exists. Premature withdrawal (L15) should set a non-ACTIVE status under the same row lock so maturity skips it.


## Premature withdrawal (Niranjan)

`com.example.fdmodule.withdrawal.WithdrawalService`, endpoints `GET /api/fd/account/{n}/withdrawal-inquiry` and `POST /api/fd/account/{n}/withdrawal` (BANK_OFFICER, ADMIN, and a CUSTOMER for their own FD).

Rules: only an ACTIVE FD before its maturity date can be withdrawn; matured, already-closed, unknown and on/after-maturity FDs are rejected with 400 and nothing changes. Under the FD row lock the service accrues interest through yesterday, then `penalty = total interest x Product service charges.withdrawalFees / 100` (the penalty is on interest only, never on principal) and `payout = principal + interest - penalty`. Accrued interest posts `INTEREST_ACCRUAL` (Dr EXPENSE_INTEREST, Cr LIABILITY_INTEREST_PAYABLE); unpaid interest is then cleared to settlement with `INTEREST`. `PENALTY_DEBIT` debits FD liability and credits `INCOME_PREMATURE_PENALTY`; `PREMATURE_WITHDRAWAL` debits FD liability and credits customer settlement. Status becomes PREMATURELY_CLOSED, pending interest rows become PAID, and the outbox publishes `event.interest.paid` (statements) and `event.fd.prematurely-closed` (notifications).

The inquiry runs the same code and rolls the transaction back, so a quote always equals what a same-day withdrawal pays. Tests: `WithdrawalIntegrationTest`. Known gap: the penalty is not shown as a column on the statement row. The integrated frontend includes withdrawal actions.

## Notifications, reports, business clock and login (Krishna)

* **Notifications** (`notification-service`, port 8083, database `fd_notifications`, consumer group `fd-notifications-v1`): reads `event.fd.created`, `event.fd.status-changed`, `event.interest.accrued`, `event.interest.paid`, `event.fd.matured`, `event.fd.prematurely-closed`. See the notification backend guide for batching, skipped dates and delivery limitations. Channels EMAIL (SMTP) and WHATSAPP (Twilio sandbox) implement `NotificationChannel`; a channel without credentials only logs and stores MOCKED. Idempotent through `consumed_events` and `UNIQUE(event_id, channel)`. Recipients are masked in `notifications_log`. The final zero-balance `InterestPaid` snapshot at maturity / closure is deliberately not mailed.
* **Business clock** (`fd-account-service/.../clock`): a one-row table `business_clock` holds a day offset added to the IST date when `APP_TIME_TRAVEL_ENABLED=true`. All three roles currently have access; advance accepts 1 to 3650 days and reset clears the offset. Interest posting, maturity, withdrawal, account dates and account-side product effective-date checks use it. Cron triggers and the batch service date limit use real time; batch max-days-ahead is a separate setting.
* **Reports** (`fd-account-service/.../report`): JdbcTemplate queries, rendered as JSON / CSV (RFC 4180, formula-injection safe) / PDF (OpenPDF) / Excel (Apache POI). Totals are grouped by currency. The nightly extract (05:30 IST) writes `extracts/fd-accounts-<business date>.csv` once, through a temporary file and an atomic move. `reports/python/generate_fd_report.py` is run by `PythonReportService` with an argument array, no shell and a timeout.
* **Login and ownership** (`Auth_Sec/auth-service`, `Auth_Sec/security-common`, `fd-account-service/.../security/AccountAccess`): HS256 JWT signed with `JWT_SECRET`; every service validates signature, issuer, expiry and algorithm. A customer reaches only FDs whose `customer_id` belongs to the customer profile linked to their login; someone else's FD and an unknown FD both answer 403.
* **Tests and packaging:** historical `scripts/lifecycle-test.ps1`, `scripts/reset-demo.ps1`, `Dockerfile`, root `docker-compose.yml` (old module full profile requires repair), `docs/FD-Module.postman_collection.json`.
