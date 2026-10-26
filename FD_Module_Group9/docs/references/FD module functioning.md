# FD module functioning — current implementation

This walkthrough describes the integrated BT_LAB code. Earlier notes at this path described a different prototype with a gateway, Flyway, renewal instructions and separate Python HTTP services; those are not features of this implementation.

## Application and approval

The Angular frontend calls Auth_Sec on 8090 for login and sends Bearer JWTs directly to backend services. The FD account service runs on 8086. Product & Pricing runs on 8080; the dedicated calculator runs on 8084.

A customer submits `POST /api/fd/account/apply`. The service validates the request, retrieves Product service data, and records a pending application. Staff use `/approve` with APPROVE or REJECT. Approval activates the FD and records the initial deposit; rejection changes its application state. Bundles group multiple FD applications. `/withdraw` cancels a customer's pending application; `/withdrawal` closes an active FD early. These are different operations.

Staff can also create accounts directly through `/create`; `/create-with-txn` is BANK_OFFICER-only. Account numbers use a branch prefix, in-memory sequence and checksum with collision checks. Database uniqueness is the final guard, not a distributed sequence allocator.

## Product validation and calculation

`ProductValidationService` fetches product data over HTTP and checks ACTIVE status, effective/end dates, FD type, term bounds and deposit bounds. `RateService` obtains the rate from Product & Pricing, mapping SENIOR to SENIOR_CITIZEN. The local products table is a legacy schema artifact, not the authoritative catalog.

The dedicated calculator produces estimates, including product-based and custom calculations. It does not open FDs or move funds. Its calculations and the account service's actual daily accrual are separate paths. See the [calculator guide](<../../../fd_calc/mod 4 backend/README.md>).

## Interest and ledger

`InterestPostingService` locks accounts and interest state and catches up daily interest through the permitted date, capped before maturity. Accrual uses ACTUAL/365 with six decimal places. Original principal, current balance and unsettled accrued interest have separate meanings. Daily accrual records are not daily cash/GL payouts; financial entries occur on capitalization or payout.

The batch service submits an accrual command at 03:00 IST for the previous real date. Admin requests use `POST /api/admin/interest-batches` on 8081. Request IDs make identical retries idempotent; reuse with different inputs is rejected. Completion is asynchronous and must be checked through the batch status API.

## Maturity and withdrawal

Maturity runs at 04:00 IST or through ADMIN `POST /api/fd/maturity/run`. It locks due ACTIVE accounts, catches up interest, pays unsettled interest and deposit balance, zeroes the balance state and marks MATURED. It emits `InterestPaid` and `FdMatured` through the outbox. There is no implemented automatic renewal-instruction workflow.

Early withdrawal uses the actual balance state through yesterday. Penalty is a percentage of earned interest, read from Product service `charges.withdrawalFees`; a product lookup failure falls back to 1%. The response reports original principal, interest, penalty and final payout. A quote runs the closure logic and rolls back; it can differ from a later withdrawal if dates, rates or state change.

GL rows represent balanced debit/credit entries. External savings or payment transfers are not implemented. Closure marks PREMATURELY_CLOSED and emits final interest and closure events. Account status and row locks prevent ordinary duplicate closure, but repeated account-creation requests can create separate FDs.

## Kafka and notifications

Business writes and `event_outbox` inserts share a database transaction. A relay publishes after commit, retries pending records, and marks success after Kafka acknowledgment. Consumer IDs handle replay; transport remains at least once. There is no exactly-once guarantee for external email/WhatsApp delivery.

The notification service on 8083 consumes lifecycle and interest events. It learns contacts on `FdCreated`, masks the log recipient field, and sends through SMTP/Twilio or records mocked/failed status. Accrual emails are grouped in an in-memory batch and flushed every 30 seconds. Old accrual dates are skipped by the current real-date filter. See [notification behavior and limits](../../notification-service/backend.md).

The separate statement service on 8082 consumes interest events into one row per FD/date, with six-decimal accrual/outstanding amounts and two-decimal balances. It is not started by root Compose. Statement APIs are staff-only.

## Reports and business clock

Java report endpoints under `/api/report` return JSON, CSV, PDF or XLSX; `/api/charts` returns chart data. Customer portfolio/history access is scoped to the login. Staff reports require BANK_OFFICER or ADMIN; manual maturity requires ADMIN.

Python runs as a subprocess for extracts and customer PDF generation, not as a separately exposed HTTP reporting service. Extracts run at 05:30 IST and reuse an existing file for the requested date.

`POST /api/fd/clock/advance` advances the business-date offset and triggers accrual/maturity. All three roles currently have access. Reset clears the offset without reversing financial history. Cron schedules still use real time, and the batch service's future-date allowance is separate.

## Startup and verification

Use the [root usage guide](../../../usage.md). Build shared libraries/JARs before rebuilding auth and Group 9 Docker images. The root stack has six Java services, four MySQL containers, Kafka/ZooKeeper and Mailpit; statements are started separately. Schema initialization runs on fresh volumes, with additional migrations needed for existing databases.

Run the checked-in tests and integrated smoke checks to establish results for the current worktree. Historical prototype test totals and claims about Flyway, a deployed gateway, Kubernetes, renewals or independent Python services do not establish behavior here.
