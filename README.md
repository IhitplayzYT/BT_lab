# UNO Bank Fixed Deposit Platform

UNO Bank is a local demonstration banking platform for fixed-deposit products and accounts. It combines Angular applications, Java/Spring services, MySQL databases and Kafka events. It supports authentication, product catalog management, FD applications (including bundles), officer approval, interest accrual and posting, maturity and withdrawal workflows, statements, notifications, reporting, and optional AI-assisted screens.

This is an educational/demo application. The calculator returns estimates; it does not move funds. Docker development defaults are not production credentials. Configure secrets and external providers before exposing any service outside a trusted development environment.

## Project map

| Area | Location | Purpose |
|---|---|---|
| Authentication | `Auth_Sec/` | Signup, OTP, login, JWT/refresh tokens, user administration |
| Product and legacy calculator | `banking-product-backend/` | Product catalog, rates, charges, eligibility, older calculator API |
| FD calculator | `fd_calc/mod 4 backend/` | Product-aware calculation, comparison, export and explanation |
| FD account platform | `FD_Module_Group9/` | Accounts, applications/bundles, ledger, interest, clock, reports and supporting services |
| Main Angular app | `uno-frontend (1)/uno-frontend/` | Customer, officer and admin UI |
| Alternate Angular app | `uno-frontend-light/` | Alternate frontend implementation |
| Interest dashboard | `FD_Module_Group9/interest-dashboard/` | Separate dashboard app for interest operations |
| Optional AI assistant | `ai-assistant/` | Local FastAPI/Ollama chat, FD advisor and aggregate relation-net insight |

More detailed module guides are in each module's `README.md`. The endpoint reference is [endpoints.md](endpoints.md), and build/run notes are in [usage.md](usage.md). A generated system overview is [UNO_Bank_Project_Report.docx](UNO_Bank_Project_Report.docx) when present.

## Architecture at a glance

The frontends call the services directly over HTTP with JWT bearer tokens; there is no deployed API gateway. The auth service issues tokens signed with the shared `JWT_SECRET` and issuer. Product and calculation configuration is read from the product catalog. The account service owns FD applications/accounts and its ledger. Account lifecycle changes are recorded transactionally with an outbox; Kafka delivers events to the interest batch, notification and statement projections. Each service uses its own schema/database. The optional AI assistant is a separate local process and is not part of Docker Compose.

Root Compose starts the Java services on ports **8090** (auth), **8080** (product), **8084** (FD calculator), **8086** (FD account), **8081** (interest batch), **8083** (notifications), and **8082** (statements). MySQL is exposed on 3307–3310; Kafka is available to host tools at 19092 and to containers at `kafka:9092`. Mailpit's UI is at 8025. Angular is started separately and normally uses port 4200.

## Local startup

Prerequisites: Java 21, Maven, Docker Compose, Node/npm, and enough disk/RAM for the database and Kafka containers. Copy `.env.example` to `.env` if available and set local secrets. Never commit real credentials.

From the repository root, build the shared Java libraries and service jars as described in [usage.md](usage.md#building-jars), then start infrastructure and services:

```bash
docker compose up -d --build
```

Start the primary frontend in a separate terminal:

```bash
cd "uno-frontend (1)/uno-frontend"
npm install
npm start
```

Open `http://localhost:4200`. Login/signup flows use Auth on port 8090. Docker's database volumes persist between runs; the SQL init scripts are applied only when a database volume is first created. For an existing volume, apply the relevant migration files under `FD_Module_Group9/fd-account-service/sql/` or `banking-product-backend/` before using code that depends on them.

The optional AI service runs on `127.0.0.1:8091` and expects a separately running Ollama server with the configured model. See [ai-assistant/README.md](ai-assistant/README.md). It is not required for core banking workflows.

## Verification

Java modules use Maven/JUnit. Frontends use Angular CLI unit tests and production builds. The Python assistant currently has no maintained automated test suite. Run tests module by module; integration tests may require local MySQL/Kafka and configured environment. Examples:

```bash
mvn -f Auth_Sec/pom.xml test
mvn -f banking-product-backend/pom.xml test
mvn -f FD_Module_Group9/pom.xml test
```

For frontend verification, run `npm test -- --watch=false` and `npm run build` from the selected Angular app directory. In this checkout, the alternate `uno-frontend-light` test suite runs; the primary app's Angular/Vitest builder reports “No test files found” even though its spec files appear in the include list. Treat that result as a test-discovery issue, not a passing suite. See [usage.md](usage.md) for shared-library build order and configuration.

## API guide

The major public API groups are:

- Authentication: `/api/auth/**` on 8090.
- Catalog and product configuration: `/api/product/**` and `/api/v1/products/**` on 8080.
- Modern calculator: `/api/v1/fd/**` on 8084. Legacy calculation: `/api/fd/**` on 8080.
- Accounts, applications and bundles: `/api/fd/account/**` on 8086.
- Interest settings and quotes: `/api/fd/interest/**` on 8086.
- Business clock and maturity: `/api/fd/clock/**` and `/api/fd/maturity/**` on 8086.
- Ledger, journal, charts and reports: `/api/fd/ledger/**`, `/api/fd/journal/**`, `/api/charts/**`, `/api/report/**` on 8086.
- Interest batch administration: `/api/admin/interest-batches/**` on 8081.
- Notifications: `/api/notifications/**` on 8083.
- Statements: `/api/statements/**` on 8082.

Most business APIs require a bearer token. Role rules and endpoint details are documented in [endpoints.md](endpoints.md) and module guides.
