# FD Account Service

Java 21 / Spring Boot 3.3.4 service on port **8086**. It owns FD applications, bundles, accounts and ledger state. Supporting functions include transaction history, interest quotes/settings, business clock, maturity, withdrawals, reports and chart data.

## Core routes

- `POST /api/fd/account/apply` and `POST /api/fd/account/bundle/apply`: customer applications.
- `GET /api/fd/account/pending`, `GET /api/fd/account/all-applications`: staff application queues.
- `POST /api/fd/account/approve`: approve/reject a single application.
- `GET /api/fd/account/bundle/pending`, `GET /api/fd/account/bundle/my-bundles`, `POST /api/fd/account/bundle/{bundleId}/approve`: bundle review and approval.
- `POST /api/fd/account/create` / `create-with-txn`: staff account creation with initial deposit bookkeeping.
- `GET /api/fd/account/my-applications`, `GET /api/fd/account/{fdAccountNo}`: customer application/account views with ownership checks.
- `GET /api/fd/account/{fdAccountNo}/transactions`: account transaction history.
- `GET /api/fd/interest/accounts`, `/mine`, `/quote`, and `PUT /api/fd/interest/{account}/settings`: interest views, estimate, and admin configuration.
- `/api/fd/clock/**`, `/api/fd/maturity/run`, `/api/fd/account/{account}/withdrawal-inquiry`, and `/withdrawal`: operational lifecycle routes.
- `/api/fd/ledger/**`, `/api/fd/journal/**`, `/api/report/**`, `/api/charts/**`: accounting, report and dashboard data.

See [project endpoints.md](../../../endpoints.md) and [API contracts](../docs/API_CONTRACTS.md) for complete routes, DTOs and roles.

## Product and accounting integration

Eligibility, rates and product configuration are fetched from Product & Pricing at `PRODUCT_SERVICE_URL`; calculation calls may use the calculator at `CALCULATOR_SERVICE_URL`. Use a product code present in the integrated catalog (for example `FD_STD_SHORT` in the local seed), not a historical lab code. Initial deposits create a transaction and GL entry. A unique-deposit guard prevents duplicate initial deposits per account, but account creation itself is not a general idempotent request.

The root Compose file initializes SQL scripts only when the MySQL volume is new. Existing databases need any missing migrations under `sql/`; Hibernate validates rather than creating the account schema. The account service uses `FD_DB_URL`, `DB_USER`, `DB_PASSWORD`, JWT configuration, Kafka bootstrap and service URLs.

## Build and run

Use the root Maven build order in [usage.md](../../../usage.md#building-jars). Root Compose starts the service with MySQL, Kafka, Auth, product and calculator dependencies. Docker images consume prebuilt reactor JARs.

## Domain notes

Interest accrual follows the configured mode and business date; the quote endpoint explicitly indicates that monthly quotation may differ from actual daily accrual. Maturity is settled once for eligible accounts under database locking. Early closure records settlement/GL effects but does not issue an external payment. Outbox events are committed with business data and relayed asynchronously. Clock advance is a development/demo feature guarded by `APP_TIME_TRAVEL_ENABLED`.
