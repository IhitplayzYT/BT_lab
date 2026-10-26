# Interest Batch Service

Java 21 / Spring Boot 3.3.4 service on **8081**, using MySQL **fd_batch**. It accepts interest commands and tracks their results; the account service performs the actual accrual/payout.

## Startup and configuration

Build the Group 9 reactor after installing Auth_Sec/security-common using the [root usage guide](../../usage.md#building-jars). From the project root:

```bash
docker compose up -d --build interest-batch-service
```

For a local JVM, configure `SERVICE_DB_URL` (root stack MySQL: `jdbc:mysql://localhost:3310/fd_batch?serverTimezone=Asia/Kolkata`), `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `JWT_ISSUER`, and `KAFKA_BOOTSTRAP_SERVERS=localhost:19092`. Container Kafka clients use `kafka:9092`.

[application.properties](src/main/resources/application.properties) enables SQL initialization and events by default. The real-time scheduler uses Spring property `interest.cron`, default `0 0 3 * * *`, in Asia/Kolkata. `app.time-travel.max-days-ahead` defaults to zero. It is a separate setting from the account business clock. Root Compose does not forward an override for it; add one to the service environment if required.

Root Compose disables HTTP Basic for this service. Use an ADMIN Bearer token for all three API routes.

## API

| Method | Path | Behavior |
| --- | --- | --- |
| POST | `/api/admin/interest-batches` | Validate and enqueue; HTTP 202 with durable request row |
| GET | `/api/admin/interest-batches` | Newest 100 requests, ordered by creation time descending |
| GET | `/api/admin/interest-batches/{id}` | Request row; unknown ID is a validation error |

```bash
curl -X POST http://localhost:8081/api/admin/interest-batches \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"requestId":"550e8400-e29b-41d4-a716-446655440000","businessDate":"2026-10-20","type":"ACCRUAL"}'
```

Use a fresh UUID for a new operation and a date suitable for the accounts being processed. `type` is ACCRUAL or PAYOUT. PAYOUT requires `fdAccountNo`. Dates cannot exceed real IST today plus configured max-days-ahead.

The response uses database labels: `request_id`, `request_type`, `business_date`, `fd_account_no`, `actor`, `status`, `result`, `created_at`. A 202 response means queued, not financially completed. Poll the request until a result arrives; statement projection can lag further.

## Classes and transaction flow

- `BatchController` validates the request DTO and requires ADMIN.
- `BatchService.request` validates UUID/type/date/account and checks prior requests. The same ID with the same type/date/account returns its existing row; conflicting inputs are rejected.
- A new request row and command outbox entry commit together. The shared relay subsequently publishes it.
- `DailyInterestScheduler.daily` runs at 03:00 IST for **yesterday's real date**. `BatchService.scheduled` uses a deterministic UUID from `daily:<date>` and a unique `scheduler_guard` business date to coordinate replicas.
- `ResultListener` consumes completion/failure events. `BatchService.result` checks schema version and consumed-event IDs, updates the request's status/result JSON, and records the event ID in one transaction. Unknown request results fail processing.

## Kafka contracts

| Direction | Topic | Event type |
| --- | --- | --- |
| Produce | `command.interest.accrual` | InterestBatchRequested |
| Produce | `command.interest.payout` | InterestPayoutRequested |
| Consume | `event.batch.completed` | InterestBatchCompleted / InterestPayoutCompleted |
| Consume | `event.batch.failed` | InterestRequestFailed |

Consumer group: `fd-batch-results-v1`. Commands include `requestId`, `businessDate`, `actor`; payout adds `fdAccountNo`. Accrual completion includes `accounts` and `accrualDays`, payout includes `amount`, and failures include `error`. See [event contracts](../docs/EVENT_CONTRACTS.md) for the envelope and retry behavior.

## Storage and verification

Use [schema.sql](src/main/resources/schema.sql) for `batch_requests`, `scheduler_guard`, `consumed_events` and `event_outbox`. Request/event IDs are VARCHAR(36); consumed_events has only the ID, not a consumed timestamp. Persistence uses JdbcTemplate rather than service JPA entities; shared event infrastructure supplies JDBC/Kafka dependencies.

Tests are in [src/test](src/test). Run the Group 9 Maven tests with shared dependencies installed. Old test totals are not current verification evidence.

If a request remains QUEUED, inspect its outbox, account consumer, result topics and DLTs. Retry an identical request with its original UUID; do not invent a new ID merely to replay a failed delivery. The batch service does not read the account service's advanced clock.
