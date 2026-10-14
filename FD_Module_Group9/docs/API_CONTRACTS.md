# REST API reference

Two ways to log in (every service accepts both): a JWT from auth-service (`Authorization: Bearer <token>`, see "Login" below) or, in demo mode, HTTP Basic with admin1/admin123, officer1/officer123 and customer1/customer123 (the batch, statement and notification services only have the first two as Basic users). Set `APP_SECURITY_BASIC_ENABLED=false` to accept tokens only. The dashboard and statement service are administrative; customers cannot read arbitrary statements.

| Method and path | Service | Role |
| --- | --- | --- |
| POST /api/fd/account/create-with-txn | FD :8080 | BANK_OFFICER |
| GET /api/fd/account/{account}/transactions | FD :8080 | Existing role rules |
| POST /api/fd/interest/quote | FD :8080 | ADMIN BANK_OFFICER CUSTOMER |
| GET /api/fd/interest/accounts | FD :8080 | ADMIN BANK_OFFICER |
| PUT /api/fd/interest/{account}/settings | FD :8080 | ADMIN |
| POST /api/fd/maturity/run | FD :8080 | ADMIN |
| POST /api/admin/interest-batches | Batch :8081 | ADMIN |
| GET /api/admin/interest-batches | Batch :8081 | ADMIN |
| GET /api/admin/interest-batches/{id} | Batch :8081 | ADMIN |
| GET /api/statements/{account} | Statements :8082 | ADMIN BANK_OFFICER |
| GET /api/statements/summary/all | Statements :8082 | ADMIN BANK_OFFICER |

Quote: `{"principal":100000,"annualRate":12,"months":12,"mode":"MONTHLY_COMPOUND"}`. Returns maturityAmount 112682.50, interest 12682.50 and quote basis. Modes: SIMPLE, MONTHLY_COMPOUND.

Configure: `{"mode":"MONTHLY_COMPOUND"}`. Only before the account's first accrual.

Accrual request: `{"requestId":"fresh UUID","businessDate":"2026-10-11","type":"ACCRUAL","fdAccountNo":null}`.
Payout request: same shape with type PAYOUT and a real fdAccountNo. Future dates are rejected. Reuse the same UUID only for an identical retry. A different input with the same UUID is rejected.

POST commands return HTTP 202 with the durable batch record. GET requests return its status QUEUED/COMPLETED/FAILED and a result JSON string. HTTP 202 is acceptance, not financial completion. Poll until complete; statement projection can lag afterwards.

Statement fields follow snake_case database labels: statement_date, opening_balance, interest_accrued, interest_credited, interest_paid, closing_balance, outstanding_interest and identity fields. Summary response: statements count and totalsByCurrency array. Never sum amounts across different currencies.

Errors: 400 validation/business rejection, 401 missing/invalid login, 403 wrong role, 409 concurrent duplicate enqueue. Unexpected storage/transient errors are not disguised as success. Original FD error handling and endpoint limitations remain documented in the inherited report.

Maturity run (L18/L19): `{"businessDate":"2026-10-13"}` (optional; defaults to today in Asia/Kolkata). Runs synchronously and returns `{"businessDate","matured","skipped","failed"}`. Future dates are rejected. Rerunning a date is safe: already matured FDs are not paid again.

## Business clock (L20, FD :8080, ADMIN only)

`GET /api/fd/clock`, `POST /api/fd/clock/advance {"days":n}` (1..3650, forward only), `POST /api/fd/clock/reset`. Works only when the service is started with `APP_TIME_TRAVEL_ENABLED=true`.

## Notifications (L18, Notification :8083, ADMIN BANK_OFFICER)

`GET /api/notifications?fdAccountNo=&limit=` lists the notification log (recipient is masked; status SENT, MOCKED or FAILED). Each event is logged once per channel: `EMAIL` (SMTP, e.g. Gmail app password) and `WHATSAPP` (Twilio sandbox). A channel with no credentials runs in MOCK mode (logs and stores MOCKED). A customer with no e-mail or phone on file gets a FAILED row for that channel, never a silent drop.

## Reports (L21, FD :8080)

All GET reports take `format=json` (default), `csv`, `pdf` or `xlsx`; files come back as attachments. CSV is RFC 4180 (CRLF), always has the header row, and defuses text that starts with `= + - @`. Totals are always grouped by currency.

| Method and path | Role | Notes |
| --- | --- | --- |
| GET /api/report/fd-summary?status= | BANK_OFFICER ADMIN | status ACTIVE (default), MATURED or PREMATURELY_CLOSED. Per product and currency: total_accounts, total_principal, total_interest_accrued, total_interest_posted |
| GET /api/report/customer-portfolio?customerId= | CUSTOMER BANK_OFFICER ADMIN | A customer always gets their own deposits (found from the login) and the customerId parameter is ignored. Staff must pass customerId |
| GET /api/report/maturity-summary?days=30 | BANK_OFFICER ADMIN | ACTIVE FDs maturing within 1..3650 days of the business date, soonest first, with days_to_maturity |
| GET /api/report/interest-history/{fdAccountNo} | CUSTOMER BANK_OFFICER ADMIN | A customer gets 403 for an FD that is not theirs; unknown account is 400 |
| POST /api/report/extract/run?date= | ADMIN | Writes `extracts/fd-accounts-<date>.csv` for the business date (default today). Idempotent: an existing file is never overwritten (`created:false`). Future dates are rejected |
| POST /api/report/python?date= | ADMIN | Runs `reports/python/generate_fd_report.py` on that extract and writes `fd_report_<date>.json` and `.svg` under `extracts/python/<date>/`. 502 if Python is missing or fails |

The same extract is written automatically every night at 05:30 IST (`app.extract.cron`, switch off with `app.extract.enabled=false`; folder `app.extract.dir`, default `extracts`). Python settings: `app.python.executable` (default `python`), `app.python.script`, `app.python.timeout-seconds`.

## Login (JWT, auth-service :8090)

`POST /api/auth/login` with `{"username":"officer1","password":"officer123"}` returns `{"accessToken":"...","tokenType":"Bearer","expiresIn":3600,"username":"officer1","roles":["BANK_OFFICER"]}`. Send it on every call as `Authorization: Bearer <accessToken>`.

Token format (same as the Product and Calculator teams use, so one token works everywhere): JWT signed HS256 with the shared secret `JWT_SECRET` (32+ characters, environment variable only, never in code). Claims: `sub` = username, `roles` = array such as `["BANK_OFFICER"]` (a comma string or the lab manual's single `role` claim are also understood), `iss` = `fd-platform-auth` (`JWT_ISSUER`), `iat`, `exp` (default 60 minutes, `JWT_TTL_MINUTES`), `jti`. A service refuses a token with a wrong signature, wrong issuer, expired `exp`, a different algorithm or `alg:none` (401). A valid token with the wrong role is 403.

Errors: 400 missing username or password, 401 wrong username or password (the same answer for an unknown user, so usernames cannot be probed), 429 after 5 wrong passwords in a row for a username (locked for 60 seconds).

Demo users (replace `UserDirectory` when Group 1's customer module is ready): admin1 (ADMIN), officer1 (BANK_OFFICER), customer1 (CUSTOMER, linked to CUST001).

Ownership rule (FD :8080): `GET /api/fd/account/{n}`, `GET /api/fd/account/{n}/transactions`, `GET /api/fd/account/{n}/withdrawal-inquiry`, `POST /api/fd/account/{n}/withdrawal` and `GET /api/report/interest-history/{n}` are allowed for staff on any FD, but a CUSTOMER only reaches FDs of the customer profile linked to their login (users.username -> customer_profile.user_id -> fd_accounts.customer_id). Someone else's FD and an unknown FD both answer 403, so account numbers cannot be probed.