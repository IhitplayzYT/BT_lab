# FD Calculator Microservice

> **Simulation-only** Fixed Deposit maturity calculator – Banking Technology Lab.
> This service calculates and explains estimated FD maturity values.
> It does **not** create accounts, move funds, or schedule financial events.

---

## Architecture Diagram

```
 ┌─────────────────────────────────────────────────────────────────┐
 │                        Banking Platform                          │
 │                                                                  │
 │   Angular UI                                                     │
 │      │                                                           │
 │      ▼                                                           │
 │   API Gateway (8080)                                             │
 │   CORS │ JWT forward │ routing │ correlation ID                  │
 │      │                                                           │
 │      ├──────────────────────────────────────┐                   │
 │      │                                       │                   │
 │      ▼                                       │                   │
 │   Auth Service (8081)           FD Calculator Service (8084) ◄──┤
 │   login/JWT issuance               │                             │
 │                           ┌────────┴────────┐                   │
 │                           ▼                 ▼                   │
 │               Customer Service (8082)  Product/Pricing (8083)   │
 │               customer categories     rates, products            │
 │                                                                  │
 │   Report Service (8085) – optional PDF/CSV                       │
 │   Eureka (8761)          – optional service discovery            │
 └─────────────────────────────────────────────────────────────────┘
```

## Service Responsibilities

| Service | Port | Responsibility |
|---|---|---|
| API Gateway | 8080 | Public entry point, CORS, JWT forwarding, routing |
| Auth/Login | 8081 | Login, JWT issuance, password hashing |
| Customer | 8082 | Customer profiles, authoritative categories |
| Product & Pricing | 8080 | FD product catalogue, rate matrix, constraints |
| **FD Calculator** | **8084** | **This service**: validation, bonus, calculation, audit |
| Report | 8085 | PDF/CSV generation (optional) |
| Eureka | 8761 | Service discovery (optional) |

## Public Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/actuator/health` | None | Health check |
| `GET` | `/actuator/metrics` | None | Metrics endpoint |
| `GET` | `/actuator/prometheus` | None | Prometheus metrics |
| `GET` | `/swagger-ui/index.html` | None | API documentation |
| `GET` | `/api/v1/fd/products/{code}/preview` | CUSTOMER | Product constraints |
| `POST` | `/api/v1/fd/calculations` | CUSTOMER | Calculate maturity |
| `POST` | `/api/v1/fd/calculations/compare` | CUSTOMER | Compare products |
| `GET` | `/api/v1/fd/calculations/{id}` | CUSTOMER | Retrieve calculation |
| `GET` | `/api/v1/fd/calculations/uuid/{uuid}` | CUSTOMER | Retrieve by UUID |
| `POST` | `/api/v1/fd/cache/rates/evict` | CUSTOMER | Evict cached rates |
| `GET` | `/api/v1/fd/calculations/{id}/export` | CUSTOMER | Export as CSV |
| `POST` | `/api/v1/fd/calculations/{id}/explain` | CUSTOMER | Plain-language explanation |
| `POST` | `/api/v1/fd/batch/calculations` | CUSTOMER | Batch calculations |

## JWT Flow

```
1. Customer logs in to Auth Service → receives JWT (CUSTOMER role)
2. Angular attaches JWT in Authorization: Bearer header
3. API Gateway validates signature, forwards JWT
4. FD Calculator also validates JWT (resource server):
   - Signature (HMAC-256 in dev, extensible to RSA/JWKS in prod)
   - Expiry, issuer, audience, CUSTOMER role
5. Username extracted from JWT sub claim (never from request body)
```

### Run

```bash
git clone <repo>
cd fd-calculator

# Run with dev profile (H2 in-memory, mock Product/Customer clients)
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

The service starts on **port 8084**.

### Generate a dev JWT

```bash
# Helper script (requires Java)
./docs/generate_dev_token.sh
```

Or use the `jjwt` dependency directly in a test to generate a token with:
```json
{
  "sub": "alice",
  "roles": ["CUSTOMER"],
  "iss": "http://localhost:8081"
}
```
signed with secret `DevOnlyHmacSecretMustBeAtLeast32CharsLong!Dev`.

### Swagger UI

```
http://localhost:8084/swagger-ui/index.html
```

Click **Authorize**, paste your JWT (without `Bearer `), then try any endpoint.

### H2 Console (dev only)

```
http://localhost:8084/h2-console
JDBC URL: jdbc:h2:mem:fd_calc_db
Username: sa  Password: (blank)
```

---

## Docker

```bash
# Build Docker image
docker build -t fd-calculator .

# Run container
docker run -p 8084:8084 \
  -e DB_URL=jdbc:mysql://host.docker.internal:3306/fd_calculator_db \
  -e DB_USER=root \
  -e DB_PASSWORD=your_password \
  -e JWT_SECRET=your_jwt_secret \
  -e JWT_ISSUER_URI=http://localhost:8081 \
  fd-calculator
```

The Dockerfile uses:
- Base image: `eclipse-temurin:21-jre-alpine`
- Non-root user: `appuser`
- Container support enabled
- MaxRAMPercentage: 75%

---

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

## Production Migration: HMAC → RSA/External JWT Issuer

To switch from HMAC-256 to an external JWKS-backed JWT issuer (no code changes needed):

1. Add to `application-prod.yml`:
   ```yaml
   spring:
     security:
       oauth2:
         resourceserver:
           jwt:
             issuer-uri: ${JWT_ISSUER_URI}
   ```
2. Remove the `app.jwt.secret` property.
3. Comment out or remove the custom `JwtDecoder` bean in `SecurityConfig`.

Spring Boot auto-configures OIDC/JWKS RSA validation automatically.

---

## Running Tests

```bash
# All unit + controller tests
./mvnw test

# Full build including integration tests
./mvnw verify

# Single test class
./mvnw test -Dtest=CalculationEngineImplTest
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
