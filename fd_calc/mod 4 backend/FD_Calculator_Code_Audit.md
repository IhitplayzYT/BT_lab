# FD Calculator Service - Code Audit Report

**Generated:** 2026-10-14 00:11:58  
**Service:** FD Calculator Microservice  
**Port:** 8084  
**API Prefix:** /api/v1/fd  
**Technology Stack:** Spring Boot 3.3.4, Java 21, Maven, MySQL, Kafka, Spring Security OAuth2

---

## Executive Summary

The FD Calculator Service is a simulation-only Fixed Deposit maturity estimation microservice. It calculates and explains estimated FD maturity values without creating accounts, moving funds, or scheduling financial events. The service has been standardized with the Product & Pricing Service for consistency in configuration, observability, and deployment.

---

## Architecture Overview

### Service Communication
```
Angular UI → API Gateway → FD Calculator (8084)
                            ↓
                    Product Service (8080)
                    Customer Service (8082)
```

### Key Integrations
- **Product Service:** Fetches product configuration and rates via REST
- **Customer Service:** Fetches customer categories via REST
- **Kafka:** Batch calculation logging and audit events
- **MySQL:** Calculation audit persistence

---

## API Endpoints

### Public Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /actuator/health | None | Health check |
| GET | /actuator/metrics | None | Metrics endpoint |
| GET | /actuator/prometheus | None | Prometheus metrics |
| GET | /swagger-ui/index.html | None | API documentation |
| GET | /api/v1/fd/products/{code}/preview | CUSTOMER | Product constraints |
| POST | /api/v1/fd/calculations | CUSTOMER | Calculate maturity |
| POST | /api/v1/fd/calculations/compare | CUSTOMER | Compare products |
| GET | /api/v1/fd/calculations/{id} | CUSTOMER | Retrieve calculation |
| GET | /api/v1/fd/calculations/uuid/{uuid} | CUSTOMER | Retrieve by UUID |
| POST | /api/v1/fd/cache/rates/evict | CUSTOMER | Evict cached rates |
| GET | /api/v1/fd/calculations/{id}/export | CUSTOMER | Export as CSV |
| POST | /api/v1/fd/calculations/{id}/explain | CUSTOMER | Plain-language explanation |
| POST | /api/v1/fd/batch/calculations | CUSTOMER | Batch calculations |

---

## Configuration

### Environment Variables
- `DB_URL` - Database connection URL
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT secret key (dev only)
- `JWT_ISSUER_URI` - JWT issuer URI (default: http://localhost:8081)
- `PRODUCT_SERVICE_URL` - Product Service URL (default: http://localhost:8083)
- `CUSTOMER_SERVICE_URL` - Customer Service URL (default: http://localhost:8082)
- `KAFKA_BOOTSTRAP_SERVERS` - Kafka bootstrap servers (default: localhost:9092)
- `SERVER_PORT` - Server port (default: 8084)

### Standardized Configuration
- Profile-based configuration (dev, prod)
- JPA ddl-auto: validate (prod), update (dev)
- Actuator endpoints: health, info, metrics, prometheus
- Structured JSON logging with correlation IDs
- Cache configuration for product rates
- Category bonus configuration

---

## Security

### Authentication
- OAuth2 Resource Server
- JWT validation
- HMAC-256 (dev) or JWKS (prod)

### Authorization
- Role-based access control
- CUSTOMER role required for all endpoints
- Method-level security with @PreAuthorize

### CORS
- Allowed origins: http://localhost:4200, http://127.0.0.1:4200
- To be removed when API Gateway is implemented

---

## Observability

### Structured Logging
- JSON structured logging via Logstash Encoder (logstash-logback-encoder 7.4)
- Correlation IDs in all logs
- Log files written to ./logs/fd-calculator.log
- 30-day log retention
- Configuration: logback-spring.xml

### Metrics
- Actuator endpoints: /actuator/health, /actuator/metrics, /actuator/prometheus
- Custom business metrics (MetricsConfig):
  - fd.calculations.total - Total calculations
  - fd.calculations.errors - Calculation errors
  - fd.calculations.duration - Calculation duration timer
  - fd.cache.hits - Cache hits
  - fd.cache.misses - Cache misses

### Kafka Integration
- Topics:
  - fd-calculator-batch-calculations - Batch calculation results
  - fd-calculator-audit-logs - Audit log events
- Environment variable: KAFKA_BOOTSTRAP_SERVERS (default: localhost:9092)

---

## Data Model

### CalculationAudit Entity
- Table: fd_calculation_audit
- Primary Key: id (String with CALC- prefix)
- Persistent UUID: uuid (String)
- Customer: customerId (String)
- Product: productCode (String)
- Financial: principal, termMonths, baseRate, effectiveRate, interestEarned, maturityAmount
- Audit Columns: createdAt, updatedAt, uuid, oooUserId, oooWsId, ldbid, oooAcptTs, oooHostTs, oooLocalTs, oooAcptTsUtcOfst, ruleSystemId
- Uses @PrePersist and @PreUpdate hooks for automatic field population

---

## Conventions

### Naming Conventions
- Java fields: camelCase
- Database columns: snake_case
- API endpoints: kebab-case
- DTOs: Java Records for immutability
- Services: Interface + Impl pattern
- Exceptions: Descriptive names ending with "Exception"

### Code Conventions
- Use Java Records for DTOs (immutable)
- Use Lombok for entities (builder pattern)
- Use @Valid for request validation
- Use @NotNull, @NotBlank, @DecimalMin, @Digits for field validation
- Use @Operation and @ApiResponse for Swagger documentation
- Use @SecurityRequirement for endpoint security

### Monetary Values
- All monetary values use BigDecimal
- Currency amounts: scale 2
- Rates: scale 2-6
- Rounding mode: HALF_UP

---

## Key Components

### Controllers
- FdCalculationController - REST API endpoints

### Services
- FdCalculatorService - Main business logic
- CalculationEngine - Core FD calculation logic
- ProductCatalogService - Product rate caching
- CategoryBonusService - Category-based rate bonuses
- ExplainService - Plain-language explanations
- ExportService - CSV export
- AuditService - Calculation persistence

### Repositories
- CalculationAuditRepository - JPA repository for audit trail

### DTOs (Java Records)
- CalculationRequest, ComparisonRequest, TermDto
- CalculationResponse, ComparisonResponse, ProductPreviewResponse
- BatchCalculationRequest, BatchCalculationResponse

### Enums
- PayoutMode: CUMULATIVE, PERIODIC
- InterestType: SIMPLE, COMPOUND
- CompoundingFrequency: DAILY, MONTHLY, QUARTERLY, YEARLY
- TermUnit: DAYS, MONTHS, YEARS
- CustomerCategory: GENERAL, SENIOR_CITIZEN, EMPLOYEE, CORPORATE

---

## Dependencies

### Core Spring
- Spring Boot Starter Web
- Spring Boot Starter Validation
- Spring Boot Starter Security
- Spring Boot Starter OAuth2 Resource Server
- Spring Boot Starter Actuator

### Database
- Spring Boot Starter Data JPA
- MySQL Connector
- H2 Database (dev/testing)

### External Services
- Spring Cloud OpenFeign
- Spring Boot Starter Kafka

### Documentation
- Springdoc OpenAPI Starter WebMVC UI

### Utilities
- Lombok
- MapStruct
- JJWT

### Observability
- Micrometer Core
- Logstash Logback Encoder 7.4

---

## Deployment

### Docker
- Base image: eclipse-temurin:21-jre-alpine
- Non-root user: appuser
- Container support enabled
- MaxRAMPercentage: 75%
- Port: 8084

### Build
```bash
mvn clean package
```

### Run
```bash
docker build -t fd-calculator .
docker run -p 8084:8084 fd-calculator
```

---

## Testing

### Test Coverage
- CalculationEngineImplTest - Simple, compound, rounding, edge values
- CategoryBonusServiceImplTest - Category bonuses, caps
- FdCalculatorServiceImplTest - Happy paths, inactive, not found, invalid term
- FdCalculationControllerTest - 401, 403, 400 validation, 200 response
- FdCalculatorIntegrationTest - Full context + WireMock + H2

### Running Tests
```bash
mvn test
mvn verify
```

---

## Integration Points

### Product Service
- Endpoint: /internal/products/{productCode}/calculator-config
- Purpose: Fetch product configuration
- Cached: Yes (Caffeine)
- Fallback: Mock client (dev)

### Customer Service
- Endpoint: /customers/{customerId}/category
- Purpose: Fetch customer category
- Cached: No
- Fallback: Mock client (dev)

### Kafka
- Topics: fd-calculator-batch-calculations, fd-calculator-audit-logs
- Purpose: Batch processing and logging

---

## Recent Updates

### Standardization Improvements
1. **Actuator Configuration** - Added Prometheus metrics export, standardized endpoint exposure
2. **Structured Logging** - Added JSON logging with Logstash Encoder, correlation IDs, 30-day retention
3. **Metrics** - Added custom business metrics via MetricsConfig
4. **Audit Entity** - Standardized @PrePersist/@PreUpdate hooks for audit columns
5. **Docker** - Created Dockerfile matching Product Service structure
6. **API Documentation** - Standardized security scheme name to bearerAuth

---

## Compliance

### Banking Standards
- Audit trail with 11 standardized columns
- UUID for persistent identification
- Ownership enforcement
- Calculation ID for business key
- Timestamp tracking (acceptance, host, local)

### Security Standards
- JWT-based authentication
- Role-based authorization
- Stateless session management
- CORS configuration (dev only)

---

## Future Enhancements

- WebSocket for real-time calculation updates
- Additional export formats (PDF, Excel)
- Advanced comparison features
- Historical calculation trends
- Calculation templates
- Multi-currency support

---

## Documentation

- Swagger UI: http://localhost:8084/swagger-ui/index.html
- OpenAPI Spec: http://localhost:8084/v3/api-docs
- Health: http://localhost:8084/actuator/health
- Metrics: http://localhost:8084/actuator/metrics
- Prometheus: http://localhost:8084/actuator/prometheus

---

## Contact

**Team:** Banking Technology Lab – Calculator Team  
**Email:** calc-team@bank.internal  
**Repository:** FD Calculator Service

---

*End of Code Audit Report*
