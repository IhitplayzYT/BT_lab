# Kafka event contracts version 1

Transport: Apache Kafka; String keys/JSON values, acks=all, idempotent producer, disabled consumer auto-commit and RECORD acknowledgment. The database outbox remains the atomic boundary for local business state and event creation. Its routing_key column stores the Kafka topic name; retained column naming avoids unnecessary schema changes.

| Topic | Event type | Consumer group |
| --- | --- | --- |
| command.interest.accrual | InterestBatchRequested | fd-interest-posting-v1 |
| command.interest.payout | InterestPayoutRequested | fd-interest-posting-v1 |
| event.interest.accrued | InterestAccrued | fd-statements-v1, fd-notifications-v1 |
| event.batch.completed | InterestBatchCompleted / InterestPayoutCompleted | fd-batch-results-v1 |
| event.batch.failed | InterestRequestFailed | fd-batch-results-v1 |
| event.fd.created | FdCreated | fd-notifications-v1 |
| event.fd.status-changed | FdApplied / FdStatusChanged | fd-notifications-v1 |
| event.interest.paid | InterestPaid (also read by notifications) | fd-statements-v1, fd-notifications-v1 |
| event.fd.matured | FdMatured | fd-notifications-v1 |
| event.fd.prematurely-closed | FdPrematurelyClosed | fd-notifications-v1 |

Each topic has a matching <topic>.DLT with the same partition count. Services declare 3 partitions and replication factor 1 for a local single broker. KAFKA_TOPIC_PARTITIONS and KAFKA_TOPIC_REPLICAS configure new topic declarations. Changes to existing topics require administrator review. Replication factor 1 is a development setup without broker-failure redundancy.

Envelope: schemaVersion=1, eventId (UUID), eventType, occurredAt (UTC ISO instant), aggregateId, data (JSON object). Kafka key is aggregateId. Commands use request UUID as aggregateId; financial events use FD account number. All decimals are BigDecimal JSON numbers. Consumers validate schema/event type before applying business changes.

Example InterestAccrued data:
```json
{"fdAccountNo":"BR0010000016","customerId":"CUST001","businessDate":"2026-10-11","currency":"INR","openingBalance":100000.00,"interestAccrued":17.808219,"interestCapitalized":0,"interestPaid":0,"closingBalance":100000.00,"outstandingInterest":17.808219,"actor":"admin1"}
```

Commands: requestId, businessDate, actor; payout adds fdAccountNo. Completion includes requestId/status, accrual adds accounts/accrualDays/businessDate, payout adds amount. Failure includes requestId/status/error. EventInterest snapshot fields are shown above.

Relay marks published_at only after the Kafka send future succeeds. Failure/timeout leaves it pending. A crash after acknowledgment can cause replay; producer idempotence alone does not eliminate that application-level replay. Requests and consumed_events IDs provide business deduplication. Delivery is at least once, without an exactly-once transport claim. Data commits precede listener acknowledgment. Database deduplication handles replay, but external notification sends can duplicate and in-memory accrual batches can be lost on restart.

One initial consumer attempt plus four retries with a one-second backoff precedes DLT publication. Exceptions classified as InvalidEventException skip retry; other validation failures can use the normal retry path. DLT publication must succeed before the failed record is recovered. Consumers have separate groups and replay history from earliest when starting a new group. The 03:00 scheduler and local DB guard prevent duplicate daily requests across scheduler replicas.

Ordering exists only within a topic partition. Late snapshots cannot overwrite newer statement snapshots; a payout and an accrual can arrive in either order. Independent future reporting/notification services must use their own consumer groups. Do not mix monetary currencies in totals.

Transport verification uses a real embedded KRaft Kafka broker in the automated tests. The historical end-to-end script targets the older standalone layout and must be adapted before using it as evidence for the current integrated stack.

FdMatured data (L18/L19): fdAccountNo, customerId, currency, maturityDate, businessDate, depositPaid (principal plus capitalized interest), interestPaid, totalPaid, actor. Maturity also emits a normal InterestPaid snapshot (closingBalance 0, outstandingInterest 0) dated on the maturity date, so statements need no change.

FdCreated data (L18, topic event.fd.created, emitted in the same transaction as the account and its DEPOSIT row): fdAccountNo, customerId, customerName, email, phone, principal, currency, annualRate, termMonths, maturityDate, businessDate, actor. email/phone prefer FD applicant fields, with users/customer_profile fallback; they let the notification service send alerts without calling back into the FD service (trade-off: contact data travels in the event). A missing contact is sent as null and the notification is logged as FAILED ("No e-mail address on file"), never dropped silently.

FdPrematurelyClosed data (premature withdrawal): fdAccountNo, customerId, currency, maturityDate, businessDate, interest, penalty, totalPaid, reason, actor. Like maturity, it also emits a final InterestPaid snapshot (closingBalance 0); the notification service deliberately does not mail that snapshot because FdMatured / FdPrematurelyClosed already cover it.

Notification service (L18, consumer group fd-notifications-v1, own database fd_notifications; channels EMAIL and WHATSAPP): listens to event.fd.created, event.fd.status-changed, event.interest.accrued, event.interest.paid, event.fd.matured and event.fd.prematurely-closed. Database replay protection uses two guards: consumed_events records every processed eventId, and notifications_log has UNIQUE(event_id, channel). Recipients are stored masked (k***@gmail.com).

Business date: lifecycle events use the relevant business date; catch-up accrual events retain each accrual day and maturity snapshots use maturity date. The batch scheduler still uses yesterday in real IST time. Accrual notification filtering uses the JVM real local date, not the advanced business clock.
