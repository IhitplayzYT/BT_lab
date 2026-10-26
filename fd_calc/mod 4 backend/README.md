# FD Calculator Service

Java 21 / Spring Boot microservice on port **8084**. This service computes FD maturity estimates, compares products, saves calculation audit records, and provides product previews, exports and explanations. It is a calculator only: it does not open accounts, post ledger entries or move money.

## Integration

The integrated deployment uses real HTTP clients: catalog/rate configuration comes from Product & Pricing on 8080, and customer category data comes from FD Account on 8086. Root Compose enables the production profile and connects the calculator to MySQL on host port 3307. Standalone development settings can use mock clients; mock mode is for local development only. Authentication uses shared JWT validation and the same issuer/secret as Auth.

## API

Base URL: `http://localhost:8084`. Business endpoints require an authenticated JWT and role authorization.

| Method/path | Purpose |
|---|---|
| `GET /actuator/health` | Health check |
| `GET /api/v1/fd/products/{code}/preview` | Product constraints and calculator preview data |
| `POST /api/v1/fd/calculations` | Calculate one product/tenure scenario |
| `POST /api/v1/fd/calculations/compare` | Compare requested scenarios |
| `GET /api/v1/fd/calculations/{id}` | Fetch a saved calculation |
| `GET /api/v1/fd/calculations/uuid/{uuid}` | Fetch a saved calculation by UUID |
| `GET /api/v1/fd/calculations/{id}/export` | Export saved calculation as CSV |
| `POST /api/v1/fd/calculations/{id}/explain` | Return a plain-language explanation |
| `POST /api/v1/fd/batch/calculations` | Calculate a list of scenarios |
| `POST /api/v1/fd/calculations/custom` | Calculate using supplied custom inputs where supported |
| `POST /api/v1/fd/cache/rates/evict` | Clear cached rate data |

Swagger UI is available at `/swagger-ui/index.html`; OpenAPI JSON is at `/v3/api-docs`. Check the generated contract and controller annotations for exact request fields and access rules. Actuator metrics/prometheus exposure depends on the active profile and security settings.

## Calculation behavior

The calculator resolves product rates and configured category modifiers from the catalog/customer services. Product and term limits are validated before calculation. The calculator supports simple and compound interest, configurable compounding, comparison, and rounding. A result is an estimate and may differ from account-side daily accrual, which follows account settings and business dates.

## Build and run

From the project root, install `Auth_Sec/security-common` and build the service as described in [usage.md](../../usage.md#building-jars). Root Compose is the supported integrated run path:

```bash
docker compose up -d --build fd-calculator
```

Standalone dev run (after installing the shared library and setting the matching DB/JWT configuration):

```bash
mvn -f 'fd_calc/mod 4 backend/pom.xml' spring-boot:run -Dspring-boot.run.profiles=dev
```

## Tests

Run `mvn -f 'fd_calc/mod 4 backend/pom.xml' test`. Verification on 26 October 2026 passed the one checked-in test (`ProductBonusTest`), which covers product bonus behavior. Broader arithmetic, controller, security and persistence coverage is not present in this module's current `src/test` tree. The Kafka batch integration described in older materials is not a live publishing path unless implemented by the current service code.
