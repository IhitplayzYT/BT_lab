> Historical README from Parth Gupta's L14/L17 contribution, kept for reference. The current project README is the one in the repository root; where the two disagree (service count, Kafka version, test counts), the root README is correct.

# Parth Gupta Fixed Deposit Interest and Statements L14 L17

This contribution extends Vritika's L12/L13 and Anirudh's L16 source with simple/monthly interest, the 03:00 IST scheduler, statements and an Angular administrator dashboard. Three independent Spring Boot microservices communicate asynchronously through Apache Kafka. Each owns a separate database schema and can be started, stopped and scaled independently.

## Local startup

Shortcut: `docker compose up -d` starts MySQL (port 3308, loads all SQL scripts on first start) and Kafka (9092), replacing steps 1 and 3. Point `scripts/local.env.ps1` at port 3308 with user `root` and password `12345`.

Requires Java 25, local MySQL 8+, Apache Kafka binary distribution, and Node 24. Source builds also require Maven 3.9+ and pnpm 11. Spring Boot 4.1.1 manages Spring Kafka 4.1.1, Kafka clients 4.2.1 and Jackson 3. The 4.x clients work with the local 3.9.1 broker below. Download the binary Kafka 3.9.1 distribution from https://archive.apache.org/dist/kafka/3.9.1/ and extract it to a short directory such as C:\kafka. Do not use the source archive.

1. In MySQL Workbench, run `scripts/init-local-databases.sql`. For a new FD database, run `fd-account-service/sql/l12_l13_setup.sql`, `l16_fd_transactions.sql`, then `l14_l17_interest.sql`, in that order. Review compatibility before applying additions to an existing team database. No existing data is dropped.
2. Copy `scripts/local.env.ps1.example` to `scripts/local.env.ps1` and set your local MySQL username/password and database URLs. Each schema belongs to exactly one service. For stronger isolation, give each service a database account limited to its own schema.
3. In a separate PowerShell terminal at the project root, run `.\scripts\start-kafka.ps1 -KafkaHome 'C:\kafka'` and keep that terminal open. The script formats a new KRaft store once and preserves it on restart. Kafka listens on localhost:9092.
4. Run `.\scripts\start-services.ps1`. This starts the three included executable JARs; inspect `runtime/*.log` for startup failures. Kafka topics are declared by the services.
5. Run `node scripts/serve-dashboard.mjs` in another terminal. Open http://localhost:4200 and sign in as `admin1 / admin123`.
6. Run `.\scripts\demo.ps1` to create an FD, submit a Kafka-driven accrual request, poll for completion and verify its statement projection.

The built dashboard server uses Node's standard library and requires no npm dependencies. For Angular development, use the source workflow below. The server binds to loopback and proxies /api/fd to 8080, /api/admin to 8081 and /api/statements to 8082.

## Architecture

| Service | Port | Owned state |
| --- | --- | --- |
| fd-account-service | 8080 | Original accounts, interest balances/accruals, ledger, processed requests and outbox |
| interest-batch-service | 8081 | 03:00 schedule, manual requests, status and command outbox |
| statement-service | 8082 | fd_statements and consumed-event IDs |
| Angular dashboard and Node local server | 4200 | Presentation only |
| Apache Kafka | 9092 | Event topics and consumer-group offsets |

Batch outbox -> Kafka command topic -> FD consumer -> atomic interest/ledger/outbox transaction -> Kafka interest/result topics -> statement projection and batch result consumers. Money updates stay in the account owner. There is no shared writable domain database. HTTP accepts administrator requests and queries views; interservice work flows through events.

## Build and verification

```powershell
mvn -B clean verify
cd interest-dashboard
pnpm install --frozen-lockfile --ignore-scripts
pnpm run build
pnpm start
```

The standard Angular CLI development server uses the supplied API proxy. Windows hosts that restrict child-process launches can build with `scripts/build-ui.ps1`; it runs strict Angular template checks and bundles directly with esbuild. Three built JARs and the verified UI are in `artifacts/`.

52 automated tests passed, including the original 21. Real embedded KRaft tests verify acknowledged delivery to independent consumer groups and dead-letter publication. A live three-process Kafka demonstration verified accrual, asynchronous statements, payout and retry deduplication using three isolated H2 databases. Local MySQL was detected but the supplied demo password was not accepted, so native MySQL end-to-end validation remains pending with the developer's actual credentials. See docs/test-evidence and docs/live-kafka-evidence.json.

## Stop and restart

Run `scripts/stop-services.ps1` to stop only the Java processes recorded by the launcher. Ctrl+C stops the dashboard server or Kafka terminal. Database and broker data are retained. Local credentials, logs and runtime state are excluded from this handover.

## Financial rules and next developer

Quote: SIMPLE `P + P*r*months/1200`, monthly `P*(1+r/1200)^months`. Posting uses ACTUAL/365, six-decimal accrual, opening date inclusive and maturity date exclusive. Monthly capitalization precedes anniversary-day accrual. Legacy accounts default to SIMPLE; select MONTHLY_COMPOUND before first accrual. Original principal is immutable; current balance includes capitalization and precise accrued state retains unpaid/sub-cent interest. Equal-month quotations can differ from daily postings.

Read docs/HANDOVER.md, docs/EVENT_CONTRACTS.md, docs/API_CONTRACTS.md and the Word report before extending maturity/withdrawal. The full official lab manual was not supplied; date/rounding choices are documented assumptions. Real payment transfer and central JWT remain future team integration work.
