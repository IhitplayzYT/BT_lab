# FD Calculator Microservice

> **Simulation-only** Fixed Deposit maturity calculator – Banking Technology Lab.
> This service calculates and explains estimated FD maturity values.
> It does **not** create accounts, move funds, or schedule financial events.

---

## Architecture and responsibilities

The integrated frontend calls services directly. Auth_Sec on **8090** issues tokens; Product & Pricing on **8080** supplies configuration; the account service on **8086** supplies customer categories; this calculator runs on **8084**. No gateway, Eureka or separate report HTTP service is deployed by root Compose.

Root Compose uses the prod profile and real HTTP clients, with customer URL `http://fd-account-service:8086`. Standalone dev settings use MySQL and mock product/customer clients; the dev URL defaults are not integrated service addresses.

## Public Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/actuator/health` | None | Health check |
| `GET` | `/actuator/metrics` | Authenticated | Metrics endpoint |
| `GET` | `/actuator/prometheus` | Authenticated | Prometheus metrics |
| `GET` | `/swagger-ui/index.html` | None | API documentation |
| `GET` | `/api/v1/fd/products/{code}/preview` | CUSTOMER / BANK_OFFICER / ADMIN | Product constraints |
| `POST` | `/api/v1/fd/calculations` | CUSTOMER / BANK_OFFICER / ADMIN | Calculate maturity |
| `POST` | `/api/v1/fd/calculations/compare` | CUSTOMER / BANK_OFFICER / ADMIN | Compare products |
| `GET` | `/api/v1/fd/calculations/{id}` | CUSTOMER / BANK_OFFICER / ADMIN | Retrieve calculation |
| `GET` | `/api/v1/fd/calculations/uuid/{uuid}` | CUSTOMER / BANK_OFFICER / ADMIN | Retrieve by UUID |
| `POST` | `/api/v1/fd/cache/rates/evict` | CUSTOMER / BANK_OFFICER / ADMIN | Evict cached rates |
| `GET` | `/api/v1/fd/calculations/{id}/export` | CUSTOMER / BANK_OFFICER / ADMIN | Export as CSV |
| `POST` | `/api/v1/fd/calculations/{id}/explain` | CUSTOMER / BANK_OFFICER / ADMIN | Plain-language explanation |
| `POST` | `/api/v1/fd/batch/calculations` | CUSTOMER / BANK_OFFICER / ADMIN | Batch calculations |

## JWT flow and local run

Obtain a token from `POST http://localhost:8090/api/auth/login`. Send it as `Authorization: Bearer <token>`. Shared `JwtSupport` checks HS256 signature, timestamps and issuer; audience configuration is not enforced by that decoder. Identity comes from the authenticated principal. Saved calculation lookup is scoped to that identity even for staff.

From the project root, install shared security and run the calculator:

```bash
mvn -f Auth_Sec/pom.xml -pl security-common -am install
export JWT_SECRET='<same signing secret as Auth_Sec>'
export JWT_ISSUER=fd-platform-auth
export DB_URL='jdbc:mysql://localhost:3307/fd_calculator'
export DB_USER=fd_user
export DB_PASSWORD='<calculator database password>'
mvn -f 'fd_calc/mod 4 backend/pom.xml' spring-boot:run -Dspring-boot.run.profiles=dev
```

Dev uses MySQL with `ddl-auto=update` and mock dependent clients. For integrated real clients, use the root Docker stack. There is no checked-in `docs/generate_dev_token.sh` helper.

### Swagger UI

```
http://localhost:8084/swagger-ui/index.html
```

Click **Authorize**, paste your JWT (without `Bearer `), then try any endpoint.

### Database and Docker

The current dev profile uses MySQL; it does not enable an H2 console. Tests may use H2 via their own configuration.

Use root Compose for the integrated deployment:

```bash
# From project root, after building shared dependencies/JARs
 docker compose up -d --build fd-calculator
```

See [root usage](../../usage.md) for database initialization and shared JWT settings. The runtime image uses Java 21 and a non-root user. Standalone container startup must supply DB credentials, JWT secret/issuer and reachable service URLs; `docker run` without configuration is insufficient for the prod image.

## Observability

### Structured Logging
- JSON structured logging via Logstash Encoder
- Correlation IDs in all logs
- Log files written to `./logs/fd-calculator.log`
- 30-day log retention

### Metrics
- Actuator endpoints: `/actuator/health`, `/actuator/metrics`, `/actuator/prometheus`
- Custom business metrics:
  - `fd.calculations.total` - Total calculations
  - `fd.calculations.errors` - Calculation errors
  - `fd.calculations.duration` - Calculation duration
  - `fd.cache.hits` - Cache hits
  - `fd.cache.misses` - Cache misses

### Kafka Integration

Topic names/configuration exist, but batchCalculate only logs results; Kafka publishing is a placeholder. Do not interpret this list as evidence of emitted messages.
- Topics:
  - `fd-calculator-batch-calculations` - Batch calculation results
  - `fd-calculator-audit-logs` - Audit log events
- Environment variable: `KAFKA_BOOTSTRAP_SERVERS` (default: localhost:9092)

---

## Docker Compose

```bash
# Build and start (uses prod profile + MySQL)
docker compose up --build

# Required environment variables (create a .env file or export):
# DB_PASSWORD=fd_secret
# JWT_SECRET=ChangeThisInProductionMustBe32CharsMinimum!
# JWT_ISSUER=http://localhost:8081
```

Service starts on **port 8084**. MySQL on **port 3307**.

---

## External JWT issuer migration

RSA/JWKS support is a future migration, not enabled by setting `JWT_ISSUER_URI` alone. The calculator imports `Auth_Sec/security-common` JWT beans. Replacing those beans/configuration and reviewing issuer, role, audience and outbound-token handling is required before adopting an external issuer.

## Running Tests

```bash
# All unit + controller tests
mvn test

# Full build including integration tests
mvn verify

# Single test class
mvn test -Dtest=CalculationEngineImplTest
```

### Test coverage

| Test Class | What is tested |
|---|---|
| `CalculationEngineImplTest` | Simple, compound (all frequencies), rounding, edge values |
| `CategoryBonusServiceImplTest` | No/single/multiple categories, cap, product-max cap, unknown categories |
| `FdCalculatorServiceImplTest` | Happy paths, inactive, not found, invalid term, payout mode, 503, categories from service |
| `FdCalculationControllerTest` | 401, 403, 400 validation, 200 response contract |
| `FdCalculatorIntegrationTest` | Full context + WireMock + H2 + bonus application |

---

## Project Structure

```
src/main/java/com/bank/calculator/
├── FdCalculatorApplication.java
├── config/
│   ├── CacheConfig.java
│   ├── CategoryBonusProperties.java
│   ├── FeignConfig.java
│   ├── MetricsConfig.java
│   ├── OpenApiConfig.java
│   └── SecurityConfig.java
├── controller/
│   └── FdCalculationController.java
├── client/
│   ├── ProductClient.java
│   ├── CustomerClient.java
│   ├── dto/
│   │   ├── ProductConfigDto.java
│   │   └── CustomerCategoriesDto.java
│   └── mock/
│       ├── MockProductClient.java
│       └── MockCustomerClient.java
├── dto/
│   ├── BatchCalculationRequest.java
│   ├── BatchCalculationResponse.java
│   ├── request/
│   │   ├── CalculationRequest.java
│   │   ├── ComparisonOptionDto.java
│   │   ├── ComparisonRequest.java
│   │   └── TermDto.java
│   └── response/
│       ├── CalculationResponse.java
│       ├── CategoryBenefitDto.java
│       ├── ComparisonResponse.java
│       ├── ErrorResponse.java
│       └── ProductPreviewResponse.java
├── exception/
│   ├── CalculationNotFoundException.java
│   ├── FdCalculatorException.java
│   ├── GlobalExceptionHandler.java
│   ├── InactiveProductException.java
│   ├── InvalidPrincipalException.java
│   ├── InvalidTermException.java
│   ├── ProductNotFoundException.java
│   └── ServiceUnavailableException.java
├── model/
│   ├── CalculationAudit.java
│   └── enums/
│       ├── CompoundingFrequency.java
│       ├── CustomerCategory.java
│       ├── InterestType.java
│       ├── PayoutMode.java
│       └── TermUnit.java
├── repository/
│   └── CalculationAuditRepository.java
├── service/
│   ├── AuditService.java
│   ├── CalculationEngine.java
│   ├── CategoryBonusService.java
│   ├── ExplainService.java
│   ├── ExportService.java
│   ├── FdCalculatorService.java
│   ├── ProductCatalogService.java
│   └── impl/
│       ├── CalculationEngineImpl.java
│       ├── CategoryBonusServiceImpl.java
│       ├── ExplainServiceImpl.java
│       └── FdCalculatorServiceImpl.java
└── kafka/
    └── KafkaConfig.java
```
