# Banking Technology Lab — Help Guide

## Project overview

Root `docker-compose.yml` starts seven backend services: Auth (8090), Product & Pricing (8080), Calculator (8084), FD Account (8086), Interest Batch (8081), Statement (8082), and Notification (8083). The Angular frontend runs on 4200 from `uno-frontend (1)/uno-frontend`.

Four MySQL server containers expose ports 3307–3310; the Group 9 server holds multiple service schemas. Root Kafka uses `localhost:19092` for host clients and `kafka:9092` for container clients. Mailpit exposes SMTP 1025 and inbox 8025.

## Build and start

Run the ordered [Maven build commands](usage.md#building-jars) first. `init_all_services.sh` rebuilds most modules with tests skipped, but omits the batch service JAR required by Compose; the full reactor build covers that prerequisite. There is no root `pom.xml`; auth and Group 9 images copy prebuilt JARs, so Docker rebuilds alone do not compile changed source.

From the project root:

```bash
# Backend stack
bash init_all_services.sh

# Or backend plus frontend
bash start_all.sh
```

Java 21 and Maven are required for JAR builds. Use Node compatible with the installed Angular 22.2 CLI; its package engine range is the authority. The frontend's npm package manager is pinned in `package.json`.

For manual container startup after building JARs:

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f fd-account-service
```

For host-based statement-service startup, see its [service guide](FD_Module_Group9/statement-service/backend.md#starting-the-service). The older Group 9 `compose.yaml --profile full` references a removed auth target and is not the integrated startup route.

To stop while retaining database volumes:

```bash
docker compose down
```

`docker compose down -v` additionally deletes the stack's volumes, including stored data. Ctrl+C in `start_all.sh` stops the frontend; Docker backends remain running.

## Health and verification

```bash
curl http://localhost:8090/health
curl http://localhost:8080/actuator/health
curl http://localhost:8084/actuator/health
curl http://localhost:8086/health
python3 smoke_test.py
```

Smoke tests exercise a subset of APIs, not every endpoint. The scripts can create test data. Historical test totals in old handovers do not establish current pass results. Unit/integration test commands are in [usage](usage.md#building-jars).

## Authentication and example calls

Use an existing seeded account, or create a CUSTOMER via public signup. Staff accounts require seed data or an ADMIN operation. Obtain a token:

```bash
TOKEN=$(curl -fsS http://localhost:8090/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin1","password":"admin123"}' | python3 -c 'import json,sys; print(json.load(sys.stdin)["accessToken"])')

curl http://localhost:8086/api/fd/interest/quote \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"principal":10000,"annualRate":7.5,"months":12,"mode":"MONTHLY_COMPOUND"}'
```

The account quote modes are SIMPLE and MONTHLY_COMPOUND. Root account/batch services disable HTTP Basic. Roles are endpoint-specific: ADMIN is not automatically BANK_OFFICER, and `/create-with-txn` requires BANK_OFFICER.

Public `/signup` does not enforce OTP; the optional `/init-signup` → `/verify-otp` flow verifies email. Logout revokes the refresh token, not existing access JWTs.

## APIs and reports

See [endpoints.md](endpoints.md) for field shapes and [postman.md](postman.md) for request examples. Product Swagger: http://localhost:8080/swagger-ui.html. Calculator Swagger: http://localhost:8084/swagger-ui/index.html. Account service includes Springdoc, but its Swagger UI/API-doc routes are protected by the service authentication rules.

Product create/update/retire permits BANK_OFFICER and ADMIN; permanent deletion requires ADMIN. Product reads/validation/rates permit CUSTOMER too, while the active feed is public. The legacy `/api/fd/**` calculator on Product port 8080 is distinct from the calculator on 8084; both require authentication.

Account `/withdraw` cancels a pending customer application; `/withdrawal` performs early settlement of an ACTIVE FD. Do not interchange them.

Reports support JSON, CSV, PDF and XLSX. Most default to JSON; `interest-report` defaults to PDF and `transaction-report` to XLSX. Staff must provide a customer ID for portfolio requests; customers are scoped to their login.

```bash
curl -f -H "Authorization: Bearer $TOKEN" \
  'http://localhost:8086/api/report/fd-summary?status=ACTIVE&format=pdf' -o fd-summary.pdf
curl -f -H "Authorization: Bearer $TOKEN" \
  'http://localhost:8086/api/report/customer-portfolio?customerId=CUST001&format=xlsx' -o portfolio.xlsx
```

Manual extract/report generation uses `POST /api/report/extract/run?date=YYYY-MM-DD` and `POST /api/report/python?date=YYYY-MM-DD`, both staff-accessible. Python runs in the account service's environment; see its application properties and `FD_Module_Group9/reports/python/requirements.txt`.

## Email and WhatsApp

The notification service **is included in root Compose** and sends email to Mailpit with email mock mode disabled. View its inbox at http://localhost:8025. Mailpit has persistent storage and root Compose defaults `SMTP_RELAY_ENABLED` to true; external relay still requires valid provider settings. Auth OTP mail goes directly through the auth service's SMTP settings.

Copy the relevant values from `notifications.env.example` into the root `.env`, preserving existing settings. Configure `SMTP_RELAY_HOST`, `SMTP_RELAY_PORT`, `SMTP_RELAY_USERNAME`, `SMTP_RELAY_PASSWORD`, `SMTP_RELAY_STARTTLS`, `SMTP_RELAY_AUTH`, `SMTP_RELAY_ENABLED` and `NOTIFY_EMAIL_FROM`. Recreate affected containers after changes:

```bash
docker compose up -d mailpit notification-service fd-auth-service
```

WhatsApp is independent of Mailpit and defaults to mocked delivery in root Compose. Configure `TWILIO_SID`, `TWILIO_TOKEN`, `TWILIO_WHATSAPP_FROM`, optional `TWILIO_WHATSAPP_CONTENT_SID`, and `NOTIFY_WHATSAPP_MOCK_ONLY=false` for the implemented Twilio path.

Not all application settings are forwarded from the shell by Compose: for example, root Compose hardcodes email mock mode off. To change that behavior, change its container environment configuration and recreate the container.

Inspect notification logs through:

```bash
curl -H "Authorization: Bearer $TOKEN" 'http://localhost:8083/api/notifications?limit=50'
docker compose logs notification-service
```

Statuses include SENT, MOCKED, FAILED, BATCHED and SKIPPED. SENT means provider acceptance, not confirmed mailbox/handset delivery. Accrual emails are batched every 30 seconds; old business dates can be skipped. Batches are in memory and not durable; failed sends are not automatically replayed. There is no HTTP flush endpoint. See the [notification guide](FD_Module_Group9/notification-service/backend.md).

## Time travel

Root Compose enables the business-clock feature by default. GET `/api/fd/clock` shows its state; POST `/advance` accepts `{"days":1}` and triggers accrual/maturity. All three roles currently have access. POST `/reset` restores the real-date offset but does not undo postings. Manual maturity remains ADMIN-only. Real-time cron schedules do not advance with the clock.

## Troubleshooting

- **Startup fails:** check `docker compose ps`, `startup.log` and the failing service logs. Confirm ports, database readiness and prebuilt JARs before retrying startup.
- **Java changes not reflected:** rebuild the affected Maven module/reactor, then rebuild/recreate its image.
- **JWT rejected:** align `JWT_SECRET` and `JWT_ISSUER` and obtain a fresh token. Check endpoint-specific roles.
- **Kafka unreachable from a local JVM:** use `localhost:19092` for the root broker, not its container listener.
- **Schema mismatch:** initialization scripts do not rerun on existing volumes; apply applicable migrations rather than assuming a restart changes the schema.
- **No email:** inspect channel status, contacts, batching/skipping rules, SMTP configuration and Mailpit before treating a notification as delivered.

## Frontend

```bash
cd 'uno-frontend (1)/uno-frontend'
npm install
npm start
```

Routes include `/`, `/login`, `/signup`, `/verify-otp`, `/dashboard`, `/admin`, `/officer`, `/apply-fd`, `/calculator`, `/compare`, `/help-center`, `/contact`, `/terms` and `/privacy`, plus staff login/signup screens. Public backend signup always creates CUSTOMER accounts regardless of screen name.
