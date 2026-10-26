# Statement Service

Java 21 / Spring Boot 3.3.4 service on **8082**, using **fd_statements**. It builds a daily read model from interest events; it does not calculate interest or make financial postings.

## Usage

### Starting the Service

Port **8082**, schema **fd_statements**. This service is **not included in the root `docker-compose.yml`**, so `start_all.sh` does not start it.

After building shared libraries and the Group 9 reactor (see [usage](../../usage.md)), run it separately against the root stack's MySQL and Kafka:

```bash
export SERVICE_DB_URL='jdbc:mysql://localhost:3310/fd_statements?serverTimezone=Asia/Kolkata'
export DB_USER=root
export DB_PASSWORD='<FD database password>'
export KAFKA_BOOTSTRAP_SERVERS=localhost:19092
export JWT_SECRET='<same signing secret as the other services>'
export JWT_ISSUER=fd-platform-auth
export APP_SECURITY_BASIC_ENABLED=false
java -jar FD_Module_Group9/statement-service/target/statement-service-1.0.0.jar
```

Create the `fd_statements` database if it is absent; `schema.sql` initializes tables, not the database. The older module `compose.yaml` has a statement target, but its full profile references a removed auth target and is not the integrated startup path.

## API

Both endpoints require ADMIN or BANK_OFFICER. Customers cannot query this service directly.

| Method | Path | Result |
| --- | --- | --- |
| GET | `/api/statements/{account}` | Rows for the account, newest statement date first |
| GET | `/api/statements/summary/all` | `statements` count and `totalsByCurrency` |

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8082/api/statements/summary/all
```

Rows use database names: `statement_id`, `fd_account_no`, `customer_id`, `currency`, `statement_date`, `opening_balance`, `interest_accrued`, `interest_credited`, `interest_paid`, `closing_balance`, `outstanding_interest`, and `last_occurred_at`.

## Classes and event projection

`StatementListener` subscribes to `event.interest.accrued` and `event.interest.paid` with group `fd-statements-v1`. `StatementService.project` accepts schema version 1 and event types InterestAccrued/InterestPaid. It checks consumed-event IDs before projecting.

The event data must contain account/customer/currency/date and all six numeric snapshot/delta fields: `openingBalance`, `interestAccrued`, `interestCapitalized`, `interestPaid`, `closingBalance`, and `outstandingInterest`. See [event contracts](../docs/EVENT_CONTRACTS.md) for a complete example.

Within a transaction, the service locks the account/date statement row. A new row uses the event values. Existing rows add the accrued/capitalized/paid deltas; closing balance and outstanding interest update only for a strictly later `occurredAt`. An InterestAccrued event also updates opening balance. The consumed-event ID commits with the projection, so ordinary replay does not double the amounts.

`StatementController` exposes the queries. Summary totals group by currency and sum accrued, capitalized and paid interest. Never add different currencies into one monetary total.

## Storage and configuration

[Schema](src/main/resources/schema.sql) defines `fd_statements`, `consumed_events` and `event_outbox`. The statement primary key is auto-increment `statement_id`, with a unique `(fd_account_no, statement_date)` constraint. Accrued/outstanding interest uses DECIMAL(18,6); balances and paid/capitalized amounts use DECIMAL(18,2). `last_occurred_at` is VARCHAR(40) containing an ISO instant, not a DATETIME column.

Configuration is in [application.properties](src/main/resources/application.properties). Set the local DB/Kafka/JWT variables shown above. `EVENTS_ENABLED` controls listeners/infrastructure; SQL initialization is enabled and creates tables in an existing database. Persistence uses JdbcTemplate; there are no service JPA entities.

## Verification and limits

Tests are in [src/test](src/test). Follow the root build order before running the Group 9 tests. No current pass count is asserted here.

Statements are asynchronous projections and can lag financial posting. They do not include a separate penalty column. For missing rows, check producer outbox records, listener logs, consumer group offsets, event numeric fields and dead-letter topics. Use this service's independent consumer group rather than sharing the notification or batch group.
