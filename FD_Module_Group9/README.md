# Fixed Deposit Account and Operations Platform

This Java 21 / Spring Boot 3.3.4 Maven reactor contains the FD account service and supporting event-driven services. Its core account service owns application and account lifecycle data, ledger transactions, interest processing, business-date controls, maturity and withdrawal handling, reports and charts.

## Services

| Module | Port | Database/schema | Responsibility |
|---|---:|---|---|
| `fd-account-service` | 8086 | `banking_technology_lab` | Applications, bundles, accounts, approval, ledger, interest controls, clock, maturity, reports/charts |
| `interest-batch-service` | 8081 | `fd_batch` | Admin batch requests and scheduled interest processing coordination |
| `notification-service` | 8083 | `fd_notifications` | Notification history and event-driven email/WhatsApp delivery |
| `statement-service` | 8082 | `fd_statements` | Kafka-backed statement projection and statement/summary queries |
| `event-common` | — | — | Event envelope, transactional outbox relay, delivery retries and deduplication support |

The root Compose file starts all four services plus MySQL, Kafka and Zookeeper. Auth on 8090 and product/catalog on 8080 are neighboring modules outside this reactor. The main Angular UI is in `../uno-frontend (1)/uno-frontend`.

## Main API groups

- `/api/fd/account/**`: application, bundle application, officer approval, account details and transactions.
- `/api/fd/interest/**`: quotes, account interest views, and admin interest-mode settings.
- `/api/fd/clock/**` and `/api/fd/maturity/**`: business date and maturity processing controls.
- `/api/fd/ledger/**`, `/api/fd/journal/**`: ledger and journal queries.
- `/api/report/**` and `/api/charts/**`: reports, exports and dashboard summaries.
- `/api/admin/interest-batches/**` (port 8081): submit and inspect admin batch requests.
- `/api/notifications/**` (port 8083): notification history.
- `/api/statements/**` (port 8082): account statements and aggregate summaries.

Business endpoints generally require JWT bearer authentication and role checks. Account ownership is enforced for customer-facing reads and operations. See `docs/API_CONTRACTS.md`, `docs/EVENT_CONTRACTS.md`, and `endpoints.md` at project root for more details.

## Business behavior and boundaries

- Customers submit individual FD applications or multi-FD bundle applications. Officers/admins review pending requests; bundle approval is a bundle-level workflow.
- Product eligibility and rate rules are obtained from Product & Pricing. Initial deposits create transaction/GL entries.
- Daily interest accrual uses the account service's business date and configured calculation mode. Rate quotes are estimates; actual daily accrual can differ.
- Maturity processing settles eligible accounts idempotently under database locking. Premature withdrawal applies configured product rules and records accounting entries; no external payment transfer is implemented.
- Account mutations and event-outbox rows are committed transactionally. Kafka consumers are at-least-once and use deduplication where configured; failed messages may be routed to dead-letter topics.
- Statement rows are built from events. Delivery/processing latency means a statement projection can lag the account transaction.
- Clock advance is a development/demo feature and requires `APP_TIME_TRAVEL_ENABLED`. It updates the business clock and triggers applicable scheduled processing; do not use it to model real settlement.

## Build and run

Build the shared Auth security library and this Maven reactor following [root usage.md](../usage.md#building-jars). The Docker image copies packaged artifacts, so rebuild JARs before rebuilding affected service images.

```bash
mvn -f ../Auth_Sec/pom.xml -pl security-common -am install
mvn -f pom.xml test
docker compose -f ../docker-compose.yml up -d --build
```

For the full stack, run the Compose command from the project root after all JARs are packaged. Root Compose exposes Kafka to host tools at `localhost:19092`; containers use `kafka:9092`. MySQL schema initialization runs only on new database volumes. Existing installations require the relevant SQL migrations under `fd-account-service/sql/`.

## Verification

Run `mvn -B test` from this directory after installing `Auth_Sec/security-common`. Verification on 26 October 2026 passed 139 tests across the reactor: event-common 8, account 80, batch 8, notification 34, and statement 9. Coverage includes outbox/event behavior, account/application/interest/maturity/withdrawal/security/report flows, statement projection, batch and notification services. Tests use configured test profiles and do not certify a separately deployed Kafka/MySQL environment.

See each service's `backend.md` for configuration and implementation notes. The older nested `compose.yaml`, lab scripts, and handover notes are historical/supporting material; root `docker-compose.yml` is the integrated stack entry point.
