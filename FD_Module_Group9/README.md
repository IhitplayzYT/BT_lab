# Fixed Deposit Module — Group 9

The FD module implements account applications and approval, deposits and GL transactions, daily interest, maturity, premature withdrawal, reports and Kafka notifications. The current build uses **Java 21 and Spring Boot 3.3.4**.

## Services and shared libraries

| Component | Port | Database | Purpose |
| --- | --- | --- | --- |
| fd-account-service | 8086 | banking_technology_lab | Accounts, ledger, lifecycle, reports and business clock |
| interest-batch-service | 8081 | fd_batch | Daily 03:00 IST accrual command and admin requests |
| notification-service | 8083 | fd_notifications | Lifecycle email and WhatsApp notifications |
| statement-service | 8082 | fd_statements | Interest-event statement projection; started separately |
| event-common | — | — | Event envelope, outbox relay, retries and dead-letter topics |
| ../Auth_Sec/security-common | — | — | Shared JWT validation and token issuance utilities |

Authentication is implemented in `../Auth_Sec/auth-service` on port 8090 with persistent `auth_db` users and refresh tokens. Product & Pricing runs on 8080 and the dedicated calculator on 8084. Account creation fetches product rules/rates over HTTP; integration is implemented. The Angular UI is in `../uno-frontend (1)/uno-frontend` and uses Bearer JWTs.

## Build and run

From the **project root**, follow [usage.md](../usage.md#building-jars) to install Auth_Sec shared libraries, build the product/calculator modules and package the Group 9 reactor. Then:

```bash
docker compose -f docker-compose.yml up -d --build
```

The Group 9 Dockerfile copies prebuilt JARs from `target`, so rebuild those before rebuilding images after Java changes. Root Compose uses MySQL 8.0 and Confluent Platform Kafka image 7.5.0 with ZooKeeper. Host Kafka clients use `localhost:19092`; containers use `kafka:9092`.

The root stack does not start statement-service. Follow its [startup guide](statement-service/backend.md#starting-the-service). The older `compose.yaml` in this directory has a `full` profile pointing to a removed local auth-service Docker target; it is not a working replacement for the root stack. Older PowerShell/demo/dashboard scripts also require adaptation to the integrated layout.

## Domain behavior

- Customer applications await staff approval. Direct staff creation and approved accounts record an initial DEPOSIT transaction.
- Daily accrual uses ACTUAL/365 and six-decimal intermediate amounts. Financial GL postings occur on capitalization or payout.
- Maturity runs at 04:00 IST, or through an ADMIN endpoint. It settles due active accounts once under row locks.
- Early closure uses the accrued balance and product penalty rules. Settlement is represented by GL entries; no external savings/payment transfer is implemented.
- State changes and events share a transaction through `event_outbox`. Delivery is at least once with consumer deduplication.
- Clock advance triggers accrual and maturity. The current controller permits CUSTOMER, BANK_OFFICER and ADMIN; the feature must be enabled. Reset changes the offset, not historical financial postings.

## Documentation

- [Account implementation](fd-account-service/backend.md)
- [Batch implementation](interest-batch-service/backend.md)
- [Statements](statement-service/backend.md)
- [Notifications](notification-service/backend.md)
- [API contracts](docs/API_CONTRACTS.md)
- [Event contracts](docs/EVENT_CONTRACTS.md)
- [Architecture and deployment](docs/ARCHITECTURE_AND_DEPLOYMENT.md)
- [Handover](docs/HANDOVER.md)
- [Historical Lab 16 handover](fd-account-service/docs/LAB16_HANDOVER.md)

## Verification and limits

Run `mvn -f FD_Module_Group9/pom.xml verify` from the project root after installing the shared security dependency. Older reports' 148-test and 84-check totals describe previous snapshots, not verified results for the present worktree.

Account-number generation uses an in-memory sequence and database collision checks; this is not a distributed sequence allocator. Notification provider calls are not atomic with database commits, and the accrual email batch is held in memory. See the notification guide for delivery/restart limits. Azure deployment remains a proposal.
