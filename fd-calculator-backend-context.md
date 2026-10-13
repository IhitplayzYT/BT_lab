# FD Calculator Backend Context

## Project Overview

**Service Name:** FD Calculator Service  
**Port:** 8084  
**Base Path:** `/api/v1/fd`  
**Technology Stack:** Spring Boot 3.3.4, Java 21, Maven, MySQL, Kafka, Spring Security OAuth2  
**Purpose:** Simulation-only Fixed Deposit maturity estimation microservice

---

## Project Structure

```
fd_calc/mod 4 backend/
├── src/main/java/com/bank/calculator/
│   ├── FdCalculatorApplication.java          # Main Spring Boot application
│   ├── config/                               # Configuration classes
│   │   ├── CacheConfig.java                  # Caffeine cache configuration
│   │   ├── CategoryBonusProperties.java      # Category bonus properties
│   │   ├── FeignConfig.java                  # Feign client configuration
│   │   ├── MetricsConfig.java                # Micrometer metrics configuration
│   │   ├── OpenApiConfig.java                # Swagger/OpenAPI configuration
│   │   └── SecurityConfig.java               # Spring Security OAuth2 configuration
│   ├── controller/
│   │   └── FdCalculationController.java      # REST API controller
│   ├── client/                               # Feign clients for external services
│   │   ├── CustomerClient.java               # Customer Service client
│   │   ├── ProductClient.java                # Product Service client
│   │   ├── dto/
│   │   │   ├── CustomerCategoriesDto.java    # Customer categories DTO
│   │   │   └── ProductConfigDto.java         # Product configuration DTO
│   │   └── mock/
│   │       ├── MockCustomerClient.java        # Mock Customer Service client
│   │       └── MockProductClient.java         # Mock Product Service client
│   ├── dto/                                  # Data Transfer Objects
│   │   ├── BatchCalculationRequest.java      # Batch calculation request
│   │   ├── BatchCalculationResponse.java     # Batch calculation response
│   │   ├── request/
│   │   │   ├── CalculationRequest.java       # Single calculation request
│   │   │   ├── ComparisonOptionDto.java      # Comparison option DTO
│   │   │   ├── ComparisonRequest.java        # Comparison request
│   │   │   └── TermDto.java                 # Term DTO
│   │   └── response/
│   │       ├── CalculationResponse.java      # Calculation response (Java record)
│   │       ├── CategoryBenefitDto.java       # Category benefit DTO
│   │       ├── ComparisonResponse.java       # Comparison response
│   │       ├── ErrorResponse.java            # Error response
│   │       └── ProductPreviewResponse.java   # Product preview response
│   ├── exception/                            # Custom exceptions
│   │   ├── CalculationNotFoundException.java
│   │   ├── FdCalculatorException.java
│   │   ├── GlobalExceptionHandler.java
│   │   ├── InactiveProductException.java
│   │   ├── InvalidPrincipalException.java
│   │   ├── InvalidTermException.java
│   │   ├── ProductNotFoundException.java
│   │   └── ServiceUnavailableException.java
│   ├── model/                                # JPA entities and enums
│   │   ├── CalculationAudit.java              # Audit entity
│   │   └── enums/
│   │       ├── CompoundingFrequency.java
│   │       ├── CustomerCategory.java
│   │       ├── InterestType.java
│   │       ├── PayoutMode.java
│   │       └── TermUnit.java
│   ├── repository/                           # JPA repositories
│   │   └── CalculationAuditRepository.java
│   ├── service                               # Service layer
│   │   ├── AuditService.java                 # Audit service interface
│   │   ├── CalculationEngine.java            # Calculation engine interface
│   │   ├── CategoryBonusService.java          # Category bonus service interface
│   │   ├── ExplainService.java               # Explanation service interface
│   │   ├── ExportService.java                # Export service interface
│   │   ├── FdCalculatorService.java          # Main calculator service interface
│   │   ├── ProductCatalogService.java        # Product catalog service interface
│   │   └── impl/
│   │       ├── CalculationEngineImpl.java   # Calculation engine implementation
│   │       ├── CategoryBonusServiceImpl.java # Category bonus service implementation
│   │       ├── ExplainServiceImpl.java      # Explanation service implementation
│   │       └── FdCalculatorServiceImpl.java  # Main calculator service implementation
│   └── kafka/                                # Kafka configuration
│       └── KafkaConfig.java                  # Kafka producer/consumer configuration
├── src/main/resources/
│   ├── application.yml                       # Base configuration
│   ├── application-dev.yml                   # Development profile
│   ├── logback-spring.xml                    # Structured logging configuration
│   └── data.sql                              # Sample data (optional)
├── pom.xml                                  # Maven configuration
└── Dockerfile                               # Docker configuration
```

---

## Key Components

### Controllers

**FdCalculationController**
- Base path: `/api/v1/fd`
- Security: Requires JWT with `CUSTOMER` role
- Endpoints:
  - `POST /calculations` - Calculate FD maturity
  - `POST /calculations/compare` - Compare multiple products
  - `GET /calculations/{calculationId}` - Retrieve saved calculation
  - `GET /calculations/uuid/{uuid}` - Retrieve by UUID
  - `POST /cache/rates/evict` - Evict cached rates
  - `GET /calculations/{calculationId}/export` - Export as CSV
  - `POST /calculations/{calculationId}/explain` - Get explanation
  - `GET /products/{productCode}/preview` - Preview product constraints
  - `POST /batch/calculations` - Batch calculations

### Services

**FdCalculatorService**
- Main business logic for FD calculations
- Delegates to CalculationEngine for math
- Integrates with ProductCatalogService for rate lookups
- Integrates with CategoryBonusService for customer category benefits
- Integrates with AuditService for persistence

**CalculationEngine**
- Core FD calculation logic
- Handles SIMPLE and COMPOUND interest
- Supports CUMULATIVE and PERIODIC payout modes
- Calculates maturity amount, interest earned, APY

**ProductCatalogService**
- Caches product rate configurations
- Fetches from Product Service via Feign
- Provides product preview data
- Cache eviction support

**CategoryBonusService**
- Calculates category-based rate bonuses
- Configurable bonus rates per category
- Enforces bonus caps
- Supports: SENIOR_CITIZEN, EMPLOYEE, CORPORATE

**ExplainService**
- Generates plain-language explanations
- Template-based (no AI)
- Deterministic output

**ExportService**
- Exports calculations to CSV
- Handles file download headers

**AuditService**
- Persists calculation results
- Enforces ownership (customer can only access their calculations)
- Generates calculation IDs and UUIDs

### Repositories

**CalculationAuditRepository**
- JPA repository for CalculationAudit entity
- Custom queries:
  - `findByCalculationIdAndCustomerId`
  - `findByUuid`
  -.findByCustomerIdOrderByCreatedAtDesc

### DTOs

**Request DTOs (Java Records)**
- `CalculationRequest` - Single calculation request
- `ComparisonRequest` - Comparison request with 2-3 options
- `TermDto` - Term value and unit
- `ComparisonOptionDto` - Product/term option for comparison
- `BatchCalculationRequest` - Batch calculation request

**Response DTOs (Java Records)**
- `CalculationResponse` - Comprehensive calculation result
- `ComparisonResponse` - Comparison results
- `ProductPreviewResponse` - Product constraints preview
- `ErrorResponse` - Standardized error response
- `BatchCalculationResponse` - Batch operation result

### Entities

**CalculationAudit**
- JPA entity for calculation audit trail
- Table: `fd_calculation_audit`
- Audit columns: createdAt, updatedAt, uuid, oooUserId, oooWsId, ldbid, oooAcptTs, oooHostTs, oooLocalTs, oooAcptTsUtcOfst, ruleSystemId
- Uses @PrePersist and @PreUpdate hooks for automatic field population
- Implements Persistable for custom ID generation

### Enums

**PayoutMode**
- `CUMULATIVE` - Interest paid at maturity
- `PERIODIC` - Interest paid periodically

**InterestType**
- `SIMPLE` - Simple interest
- `COMPOUND` - Compound interest

**CompoundingFrequency**
- `DAILY`, `MONTHLY`, `QUARTERLY`, `YEARLY`

**TermUnit**
- `DAYS`, `MONTHS`, `YEARS`

**CustomerCategory**
- `GENERAL`, `SENIOR_CITIZEN`, `EMPLOYEE`, `CORPORATE`

### Configuration Classes

**SecurityConfig**
- OAuth2 Resource Server configuration
- JWT validation with HMAC-256 (dev) or JWKS (prod)
- Role-based access control (CUSTOMER required)
- CORS configuration

**CacheConfig**
- Caffeine cache for product rate configurations
- Cache eviction support
- Cache metrics

**OpenApiConfig**
- Swagger/OpenAPI configuration
- Security scheme: bearerAuth
- API documentation at `/swagger-ui/index.html`
- OpenAPI spec at `/v3/api-docs`

**MetricsConfig**
- Custom business metrics:
  - `fd.calculations.total` - Total calculations
  - `fd.calculations.errors` - Calculation errors
  - `fd.calculations.duration` - Calculation duration timer
  - `fd.cache.hits` - Cache hits
  - `fd.cache.misses` - Cache misses

**FeignConfig**
- Feign client configuration
- Timeout settings
- Error decoder

**KafkaConfig**
- Kafka producer for batch calculations
- Kafka producer for audit logs
- Topics:
  - `fd-calculator-batch-calculations`
  - `fd-calculator-audit-logs`

---

## Conventions

### Naming Conventions
- **Java fields:** camelCase
- **Database columns:** snake_case
- **API endpoints:** kebab-case in URLs
- **DTOs:** Java Records for immutability
- **Services:** Interface + Impl pattern
- **Exceptions:** Descriptive names ending with "Exception"

### Code Conventions
- Use Java Records for DTOs (immutable)
- Use Lombok for entities (builder pattern)
- Use @Valid for request validation
- Use @NotNull, @NotBlank, @DecimalMin, @Digits for field validation
- Use @Operation and @ApiResponse for Swagger documentation
- Use @SecurityRequirement for endpoint security

### Monetary Values
- All monetary values use `BigDecimal`
- Currency amounts: scale 2
- Rates: scale 2-6
- Rounding mode: HALF_UP

### Audit Pattern
- All entities use @PrePersist and @PreUpdate hooks
- Automatic population of audit fields
- Consistent audit column names across services

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
- JJWT (JWT library)

### Observability
- Micrometer Core
- Logstash Logback Encoder (JSON logging)

---

## Configuration

### Environment Variables
- `DB_URL` - Database connection URL
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_DRIVER` - Database driver class
- `JWT_SECRET` - JWT secret key (dev only)
- `JWT_ISSUER_URI` - JWT issuer URI (default: http://localhost:8081)
- `PRODUCT_SERVICE_URL` - Product Service URL (default: http://localhost:8083)
- `CUSTOMER_SERVICE_URL` - Customer Service URL (default: http://localhost:8082)
- `KAFKA_BOOTSTRAP_SERVERS` - Kafka bootstrap servers (default: localhost:9092)
- `SERVER_PORT` - Server port (default: 8084)

### Application Configuration
- Profile-based configuration (dev, prod)
- JPA ddl-auto: validate (prod), update (dev)
- Actuator endpoints: health, info, metrics, prometheus
- Structured JSON logging with correlation IDs
- Cache configuration for product rates
- Category bonus configuration

---

## Architecture Patterns

### Layered Architecture
```
Controller → Service → Repository → Database
           ↓
         DTO
```

### Service Communication
- Feign clients for REST calls to Product Service and Customer Service
- Mock clients for development/testing
- Circuit breaker pattern (via Feign)

### Caching Strategy
- Caffeine cache for product rate configurations
- Cache eviction on logout or admin refresh
- Cache metrics for monitoring

### Audit Trail
- All calculations persisted to audit table
- Ownership enforcement (customer can only access their calculations)
- UUID for persistent identification
- Calculation ID for business key

### Batch Processing
- Kafka for batch calculation logging
- Correlation ID for tracking
- Async processing with manual ack

---

## Key Business Logic

### Calculation Flow
1. Validate request (principal, term, product code)
2. Fetch product configuration from Product Service (cached)
3. Fetch customer category from Customer Service
4. Apply category bonuses (with cap enforcement)
5. Calculate effective rate
6. Calculate maturity amount using CalculationEngine
7. Generate explanation
8. Persist to audit table
9. Return comprehensive response

### Comparison Flow
1. Validate request (principal, 2-3 options)
2. For each option:
   - Fetch product configuration
   - Calculate maturity
3. Sort results by maturity amount descending
4. Return comparison response

### Batch Calculation Flow
1. Validate batch request
2. Process each calculation
3. Send results to Kafka for logging
4. Return summary response

---

## Error Handling

### Custom Exceptions
- `CalculationNotFoundException` - Calculation not found
- `ProductNotFoundException` - Product not found
- `InactiveProductException` - Product is inactive
- `InvalidPrincipalException` - Invalid principal amount
- `InvalidTermException` - Invalid term
- `ServiceUnavailableException` - External service unavailable

### Global Exception Handler
- Maps exceptions to HTTP status codes
- Returns standardized ErrorResponse
- Logs errors with correlation IDs

---

## Testing Strategy

### Unit Tests
- Service layer tests
- Calculation engine tests
- Category bonus tests
- Export service tests

### Integration Tests
- Controller tests with MockMvc
- Repository tests with @DataJpaTest
- Feign client tests with WireMock

### Test Data
- Sample products in data.sql
- Mock customer data
- Test scenarios for edge cases

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

## Monitoring

### Actuator Endpoints
- `/actuator/health` - Health check
- `/actuator/info` - Application info
- `/actuator/metrics` - Metrics
- `/actuator/prometheus` - Prometheus metrics

### Custom Metrics
- Calculation count and errors
- Calculation duration
- Cache hit/miss ratio
- Batch operation count

### Logging
- JSON structured logging
- Correlation ID in all logs
- Log levels: INFO (com.bank.calculator), WARN (org.springframework.security)

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

## Integration Points

### Product Service
- Endpoint: `/internal/products/{productCode}/calculator-config`
- Purpose: Fetch product configuration for calculations
- Cached: Yes (Caffeine)
- Fallback: Mock client (dev)

### Customer Service
- Endpoint: `/customers/{customerId}/category`
- Purpose: Fetch customer category for bonus calculation
- Cached: No
- Fallback: Mock client (dev)

### Kafka
- Topics:
  - `fd-calculator-batch-calculations` - Batch calculation results
  - `fd-calculator-audit-logs` - Audit log events
- Purpose: Batch processing and logging

---

## Future Enhancements

- WebSocket for real-time calculation updates
- Additional export formats (PDF, Excel)
- Advanced comparison features
- Historical calculation trends
- Calculation templates
- Multi-currency support
