# Notification Service

Consumes FD lifecycle and interest events and sends email/WhatsApp notifications. Runs on **8083**, using **fd_notifications**. The root Docker stack includes this service.

## Startup and configuration

Build shared libraries and the service using the [root usage guide](../../usage.md), then run from the project root:

```bash
docker compose up -d --build notification-service
```

For a process outside Docker, set `SERVICE_DB_URL`, `DB_USER`, `DB_PASSWORD`, `KAFKA_BOOTSTRAP_SERVERS`, `JWT_SECRET`, and `JWT_ISSUER`. Against the root stack use MySQL `localhost:3310/fd_notifications` and Kafka `localhost:19092`. Container clients use `fd-group9-mysql:3306` and `kafka:9092`.

Configuration is defined in [application.properties](src/main/resources/application.properties):

| Setting | Purpose |
| --- | --- |
| `EVENTS_ENABLED` | Enable event infrastructure/listeners; default true |
| `APP_SECURITY_BASIC_ENABLED` | Optional Basic authentication configuration; use Bearer tokens for integrated API calls |
| `SPRING_MAIL_HOST`, `SPRING_MAIL_PORT` | SMTP server |
| `SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD` | SMTP credentials |
| `SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH` | SMTP authentication switch |
| `SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE` | STARTTLS switch |
| `NOTIFY_EMAIL_FROM` | Sender address |
| `NOTIFY_EMAIL_MOCK_ONLY` | Suppress real email when true |
| `TWILIO_SID`, `TWILIO_TOKEN` | WhatsApp provider credentials |
| `TWILIO_WHATSAPP_FROM` | Sender, including `whatsapp:` prefix |
| `TWILIO_WHATSAPP_CONTENT_SID` | Optional template ID |
| `NOTIFY_WHATSAPP_MOCK_ONLY` | Suppress real WhatsApp sending when true |

The root Compose configuration sends notification mail to Mailpit (`mailpit:1025`), with mock email disabled. Mailpit's inbox is at http://localhost:8025. SMTP relay is enabled by default in that Compose file, subject to working provider credentials; it is not necessarily local-only delivery. WhatsApp defaults to mock mode in the root stack. Auth signup OTP mail goes directly through the auth service's SMTP configuration.

An environment variable only changes a container if Compose forwards it. For example, root Compose hardcodes `NOTIFY_EMAIL_MOCK_ONLY=false`; changing a shell variable alone does not override that value.

## API

`GET /api/notifications` requires ADMIN or BANK_OFFICER. Optional parameters are `fdAccountNo` and `limit` (default 50, clamped to 1–200). Results are newest first.

```bash
curl 'http://localhost:8083/api/notifications?limit=20' \
  -H "Authorization: Bearer $TOKEN"
```

Returned columns: `id`, `event_type`, `fd_account_no`, `customer_id`, `channel`, `recipient`, `subject`, `status`, `error`, `created_at`. Recipient values are masked. The endpoint does not return the stored body or event ID.

There is no HTTP endpoint to flush accrual batches. `AccrualBatchScheduler` calls `flushAllBatchedAccruals()` every 30 seconds after a 30-second initial delay.

## Classes and event flow

| Class | Responsibility |
| --- | --- |
| `Application` | Spring Boot entry point and event infrastructure |
| `NotificationListener` | Deserializes `DomainEvent` and calls `NotificationService.handle` |
| `NotificationService` | Validates events, resolves contacts, sends/logs or batches notifications |
| `NotificationController` | Staff-only log query |
| `NotificationChannel` | Channel interface and send result |
| `EmailChannel`, `WhatsAppChannel` | SMTP and Twilio delivery/mock behavior |
| `MessageTemplates` | Individual and consolidated message rendering |
| `InterestAccrualBatch` | In-memory entries grouped by customer |
| `AccrualBatchScheduler` | Periodic consolidated email flush |

Consumer group: `fd-notifications-v1`. Subscribed topics:

- `event.fd.created`: `FdCreated`.
- `event.fd.status-changed`: `FdApplied` and `FdStatusChanged`.
- `event.interest.accrued`: `InterestAccrued`.
- `event.interest.paid`: `InterestPaid`.
- `event.fd.matured`: `FdMatured`.
- `event.fd.prematurely-closed`: `FdPrematurelyClosed`.

`handle` requires schema version 1, a supported event type, customer ID and account number. It skips recorded event IDs. `FdCreated` refreshes the local contact record; event contact fields take precedence for immediate delivery. Final zero-balance or zero-payment `InterestPaid` snapshots do not generate an extra notification.

Recent accruals enter the in-memory batch and get `BATCHED` log rows. The implementation compares the business date with the JVM's real local date: today, yesterday and future dates qualify; dates at least two days old are `SKIPPED`. This is not a two-hour window and does not use the advanced business clock.

A flush sends one consolidated **email** per customer using the stored contact record, updates email rows to `InterestAccruedBatch` and the send status, and clears that customer's batch. WhatsApp accrual rows are not flushed by this path. Without a stored email, the batch is cleared and its log rows can remain `BATCHED`.

## Storage and delivery limits

See [schema.sql](src/main/resources/schema.sql) for `notification_contacts`, `notifications_log`, `consumed_events`, and `event_outbox`. The log has a unique `(event_id, channel)` constraint. Only the recipient column is masked; contact details and message bodies are stored separately.

Kafka delivery is at least once. Event IDs and log uniqueness prevent ordinary replay duplicates, but sending to an external provider is not atomic with the database commit. A crash after sending can duplicate delivery. Failed sends are recorded rather than automatically resent. In-memory accrual batches are not durable and can be lost on restart; they also lack synchronization between the scheduler and listener.

Statuses include `SENT`, `MOCKED`, `FAILED`, `BATCHED`, and `SKIPPED`. `SENT` means the provider accepted the request, not confirmed recipient delivery.

## Verification and troubleshooting

Checked-in tests are under [src/test](src/test). Run the Group 9 reactor tests after installing the shared security library; see [usage](../../usage.md). No test pass count is asserted here.

For missing notifications, inspect the account outbox, Kafka listener logs, `consumed_events`, contact records and channel status. Check whether the accrual is skipped, awaiting flush, or has no stored contact before assuming delivery succeeded.
