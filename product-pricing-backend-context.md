# Product & Pricing Backend Context

## Project Overview

**Service Name:** Product & Pricing Service  
**Port:** 8080  
**Base Path:** `/api/v1/products`  
**Technology Stack:** Spring Boot 3.3.2, Java 21, Maven, MySQL, Kafka, Spring Security OAuth2  
**Purpose:** Banking product management, rate calculations, and product configuration for FD creation

---

## Project Structure

```
product&pricing module/banking-product-backend/
├── src/main/java/com/bank/product/
│   ├── ProductApplication.java                # Main Spring Boot application
│   ├── config/                                # Configuration classes
│   │   ├── DatabaseConfig.java                # Database configuration
│   │   ├── MetricsConfig.java                  # Micrometer metrics configuration
│   │   └── OpenApiConfig.java                  # Swagger/OpenAPI configuration
│   ├── controller/
│   │   └── ProductController.java              # REST API controller
│   ├── dto/                                   # Data Transfer Objects
│   │   ├── AuthRequestDTO.java                # Authentication request
│   │   ├── AuthResponseDTO.java               # Authentication response
│   │   ├── BatchProductRequest.java           # Batch product creation request
│   │   ├── BatchProductResponse.java          # Batch product creation response
│   │   ├── CalculatorConfigDTO.java           # Calculator configuration DTO
│   │   ├── ChargesDTO.java                    # Product charges DTO
│   │   ├── ErrorDetails.java                  # Error details DTO
│   │   ├── ProductDefaultsResponseDTO.java   # Product defaults response
│   │   ├── ProductRequestDTO.java             # Product creation/update request
│   │   ├── ProductResponseDTO.java            # Product response
│   │   ├── ProductValidationResponseDTO.java   # Product validation response
│   │   ├── RateCalculationRequestDTO.java      # Rate calculation request
│   │   ├── RateCalculationResponseDTO.java     # Rate calculation response (Java record)
│   │   ├── RateLimitDTO.java                  # Rate limit DTO (Java record)
│   │   ├── RateVariationDTO.java              # Rate variation DTO
│   │   └── TermLimitDTO.java                  # Term limit DTO (Java record)
│   ├── entity/                                # JPA entities
│   │   ├── Product.java                       # Product entity
│   │   ├── ProductBusinessRule.java           # Business rule entity
│   │   ├── ProductCharge.java                 # Product charge entity
│   │   ├── ProductCharges.java                # Embeddable charges collection
│   │   ├── ProductRole.java                   # Product role entity
│   │   ├── RateVariation.java                 # Embeddable rate variation
│   │   └── enums/
│   │       ├── ProductStatus.java              # Product status enum
│   │       └── ChargeType.java                # Charge type enum
│   ├── exception/                             # Custom exceptions
│   │   ├── GlobalExceptionHandler.java         # Global exception handler
│   │   ├── InactiveProductException.java      # Inactive product exception
│   │   ├── InvalidProductException.java       # Invalid product exception
│   │   ├── ProductInactiveException.java      # Product inactive exception
│   │   └── ProductNotFoundException.java      # Product not found exception
│   ├── mapper/                                # Data mappers
│   │   └── ProductMapper.java                 # Entity-DTO mapper
│   ├── repository/                            # JPA repositories
│   │   ├── ProductRepository.java             # Product repository
│   │   └── ProductSpecifications.java         # JPA specifications
│   ├── security/                              # Security configuration
│   │   └── ProductAuthorization.java          # Authorization constants
│   └── service/                               # Service layer
│       ├── ProductService.java                 # Product service interface
│       └── impl/
│           └── ProductServiceImpl.java        # Product service implementation
├── src/main/resources/
│   ├── application.yml                         # Base configuration
│   ├── application-dev.yml                     # Development profile
│   └── logback-spring.xml                      # Structured logging configuration
├── pom.xml                                    # Maven configuration
└── Dockerfile                                 # Docker configuration
```

---

## Key Components

### Controllers

**ProductController**
- Base path: `/api/v1/products`
- Security: Requires JWT with BANK_OFFICER, ADMIN, or CUSTOMER role (varies by endpoint)
- Endpoints:
  - `POST /` - Create product (BANK_OFFICER, ADMIN)
  - `PUT /{productCode}` - Update product (BANK_OFFICER, ADMIN)
  - `DELETE /{productCode}` - Retire product (ADMIN)
  - `GET /search` - Search products (BANK_OFFICER, ADMIN)
  - `GET /active` - List active products (BANK_OFFICER, ADMIN)
  - `GET /{productCode}` - Get product by code (BANK_OFFICER, ADMIN)
  - `GET /{productCode}/validate` - Validate product (BANK_OFFICER, ADMIN)
  - `POST /{productCode}/rate` - Calculate final rate (BANK_OFFICER, ADMIN)
  - `GET /{productCode}/defaults` - Get product defaults (BANK_OFFICER, ADMIN)
  - `GET /internal/products/{productCode}/calculator-config` - Internal calculator config
  - `POST /batch` - Batch create products (BANK_OFFICER, ADMIN)

### Services

**ProductService**
- Main business logic for product management
- CRUD operations for products
- Product validation for account creation
- Rate calculation with category adjustments
- Product defaults for account creation
- Batch product creation with Kafka logging

### Repositories

**ProductRepository**
- JPA repository for Product entity
- Custom queries:
  - `findByProductCode`
  - `findByProductTypeIgnoreCaseAndStatus`
  - `findByStatus`
  - `findByStatusAndEffectiveDateBefore`
- Supports JPA Specifications for complex queries

**ProductSpecifications**
- JPA Specifications for dynamic query building
- Supports filtering by product type, status, date ranges
- Supports sorting and pagination

### Mappers

**ProductMapper**
- Entity to DTO mapping
- DTO to Entity mapping
- Handles nested objects (TermLimitDTO, RateLimitDTO, ChargesDTO, RateVariationDTO)
- Uses BigDecimal for all monetary values

### DTOs

**Request DTOs**
- `ProductRequestDTO` - Product creation/update (Lombok @Data, @Builder)
- `RateCalculationRequestDTO` - Rate calculation request (Lombok @Data)
- `BatchProductRequest` - Batch product creation request

**Response DTOs**
- `ProductResponseDTO` - Product response (Lombok @Data, @Builder)
- `RateCalculationResponseDTO` - Rate calculation response (Java record)
- `ProductValidationResponseDTO` - Validation response (Lombok @Data)
- `ProductDefaultsResponseDTO` - Defaults response (Lombok @Data)
- `CalculatorConfigDTO` - Calculator config (Lombok @Data)
- `BatchProductResponse` - Batch operation response (Lombok @Data)
- `ErrorDetails` - Error response (Lombok @Data)

**Nested DTOs (Java Records)**
- `TermLimitDTO` - Term limits (min, max)
- `RateLimitDTO` - Rate limits (min, max)
- `ChargesDTO` - Product charges
- `RateVariationDTO` - Rate variation by category

### Entities

**Product**
- JPA entity for banking products
- Table: `product`
- UUID primary key
- Relationships:
  - One-to-many: ProductBusinessRule
  - One-to-many: ProductCharge
  - One-to-many: ProductRole
  - One-to-many: RateVariation (embeddable)
- Audit columns: createdAt, updatedAt, createdBy, updatedBy
- Uses @PrePersist and @PreUpdate hooks

**ProductBusinessRule**
- JPA entity for product business rules
- Term limits (min/max months)
- Rate limits (min/max rate)
- BigDecimal for rate limits with precision/scale

**ProductCharge**
- JPA entity for product charges
- Charge type (interestCredit, tax, withdrawalFee)
- Charge value (BigDecimal with precision 18, scale 2)
- Charge unit (flat, percentage)
- Fee type (event-based, frequency-based)

**ProductRole**
- JPA entity for product roles
- Allowed customer roles for the product

**RateVariation**
- Embeddable entity for rate variations
- Customer category
- Rate modifier (BigDecimal with precision 6, scale 2)

### Enums

**ProductStatus**
- `ACTIVE` - Product is active and available
- `INACTIVE` - Product is inactive
- `DRAFT` - Product is in draft state
- `SUSPENDED` - Product is temporarily suspended
- `RETIRED` - Product is retired (soft delete)

**ChargeType**
- `interestCredit` - Interest credit frequency
- `tax` - Tax deduction
- `withdrawalFee` - Withdrawal fees

### Configuration Classes

**DatabaseConfig**
- JPA configuration
- Physical naming strategy
- Hibernate properties

**OpenApiConfig**
- Swagger/OpenAPI configuration
- Security scheme: bearerAuth
- API documentation at `/swagger-ui/index.html`
- OpenAPI spec at `/v3/api-docs`

**MetricsConfig**
- Custom business metrics:
  - `product.creation.total` - Total products created
  - `product.update.total` - Total products updated
  - `product.rate.calculations.total` - Total rate calculations
  - `product.rate.calculations.duration` - Rate calculation duration timer
  - `product.cache.hits` - Cache hits
  - `product.cache.misses` - Cache misses
  - `product.batch.operations.total` - Total batch operations

---

## Conventions

### Naming Conventions
- **Java fields:** camelCase
- **Database columns:** snake_case
- **API endpoints:** kebab-case in URLs
- **DTOs:** Lombok @Data, @Builder for mutable DTOs, Java Records for immutable DTOs
- **Services:** Interface + Impl pattern
- **Exceptions:** Descriptive names ending with "Exception"

### Code Conventions
- Use Lombok for DTOs and Entities (builder pattern)
- Use Java Records for immutable DTOs (RateCalculationResponseDTO, TermLimitDTO, RateLimitDTO)
- Use @Valid for request validation
- Use @NotNull, @NotBlank, @DecimalMin, @DecimalMax, @Pattern for field validation
- Use @Operation and @ApiResponse for Swagger documentation
- Use @SecurityRequirement for endpoint security
- Use @PreAuthorize for role-based authorization

### Monetary Values
- All monetary values use `BigDecimal`
- Currency amounts: precision 18, scale 2
- Rates: precision 6, scale 2
- Rounding mode: HALF_UP

### Audit Pattern
- All entities use @PrePersist and @PreUpdate hooks
- Automatic population of audit fields (createdAt, updatedAt, createdBy, updatedBy)
- Consistent audit column names across services

---

## Dependencies

### Core Spring
- Spring Boot Starter Web
- Spring Boot Starter Data JPA
- Spring Boot Starter Validation
- Spring Boot Starter Security
- Spring Boot Starter OAuth2 Resource Server
- Spring Boot Starter Actuator
- Spring Boot Starter Cache

### Database
- MySQL Connector
- H2 Database (dev/testing)

### External Services
- Spring Boot Starter Kafka

### Documentation
- Springdoc OpenAPI Starter WebMVC UI

### Utilities
- Lombok
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
- `JWT_AUDIENCE` - JWT audience (default: product-service)
- `JWT_ROLES_CLAIM` - JWT roles claim (default: roles)
- `KAFKA_BOOTSTRAP_SERVERS` - Kafka bootstrap servers (default: localhost:9092)
- `SERVER_PORT` - Server port (default: 8080)
- `APP_CORS_ALLOWED_ORIGINS` - CORS allowed origins (default: http://localhost:4200,http://127.0.0.1:4200)

### Application Configuration
- Profile-based configuration (dev, prod)
- JPA ddl-auto: validate (prod), update (dev)
- Actuator endpoints: health, info, metrics, prometheus
- Structured JSON logging with correlation IDs
- Kafka configuration for batch processing
- CORS configuration (to be removed when API Gateway is implemented)

---

## Architecture Patterns

### Layered Architecture
```
Controller → Service → Repository → Database
           ↓
         DTO
           ↓
         Mapper
```

### Service Communication
- Internal endpoint for FD Calculator service integration
- REST-only communication (no direct database access)
- Kafka for batch processing and audit logging

### Caching Strategy
- Spring Cache abstraction
- Cache for product lookups
- Cache metrics for monitoring

### Audit Trail
- All products have audit columns
- Automatic population via @PrePersist/@PreUpdate
- CreatedBy/UpdatedBy tracking

### Batch Processing
- Kafka for batch product creation logging
- Correlation ID for tracking
- Async processing with manual ack

---

## Key Business Logic

### Product Creation Flow
1. Validate request (product code uniqueness, required fields)
2. Map DTO to Entity
3. Persist to database
4. Return response with generated ID

### Product Update Flow
1. Validate product exists
2. Validate request
3. Map DTO to Entity
4. Update database
5. Return response

### Product Retirement Flow
1. Validate product exists
2. Update status to RETIRED
3. Soft delete (no hard delete)
4. Return response

### Rate Calculation Flow
1. Validate product exists and is ACTIVE
2. Fetch product business rules
3. Determine customer category (auto-detect Senior Citizen by age)
4. Look up rate modifier from rate variations
5. Apply default modifiers if no variation found
6. Calculate final rate = baseRate + rateModifier
7. Clamp within product min/max rate limits
8. Round to 2 decimal places
9. Return response

### Product Validation Flow
1. Validate product exists
2. Check product status is ACTIVE
3. Check product is within effective date range
4. Validate term within product limits
5. Validate amount within deposit limits
6. Validate age meets minimum requirement
7. Return validation result

### Batch Product Creation Flow
1. Validate batch request
2. Process each product creation
3. Send results to Kafka for logging
4. Return summary response

---

## Error Handling

### Custom Exceptions
- `ProductNotFoundException` - Product not found
- `ProductInactiveException` - Product is inactive
- `InactiveProductException` - Product is inactive (alternative)
- `InvalidProductException` - Invalid product configuration
- `ProductInactiveException` - Product is inactive

### Global Exception Handler
- Maps exceptions to HTTP status codes
- Returns standardized ErrorDetails
- Logs errors with correlation IDs

---

## Testing Strategy

### Unit Tests
- Service layer tests
- Mapper tests
- Validation tests

### Integration Tests
- Controller tests with MockMvc
- Repository tests with @DataJpaTest
- Kafka tests with @EmbeddedKafka

### Test Data
- Sample products in data.sql
- Test scenarios for edge cases

---

## Deployment

### Docker
- Base image: eclipse-temurin:21-jre-alpine
- Non-root user: appuser
- Container support enabled
- MaxRAMPercentage: 75%
- Port: 8080

### Build
```bash
mvn clean package
```

### Run
```bash
docker build -t product-service .
docker run -p 8080:8080 product-service
```

---

## Monitoring

### Actuator Endpoints
- `/actuator/health` - Health check
- `/actuator/info` - Application info
- `/actuator/metrics` - Metrics
- `/actuator/prometheus` - Prometheus metrics

### Custom Metrics
- Product creation/update count
- Rate calculation count and duration
- Cache hit/miss ratio
- Batch operation count

### Logging
- JSON structured logging
- Correlation ID in all logs
- Log levels: INFO (com.bank.product), WARN (org.springframework.security)

---

## Security

### Authentication
- OAuth2 Resource Server
- JWT validation
- HMAC-256 (dev) or JWKS (prod)

### Authorization
- Role-based access control via @PreAuthorize
- Roles: BANK_OFFICER, ADMIN, CUSTOMER
- Authorization constants in ProductAuthorization

### CORS
- Allowed origins: http://localhost:4200, http://127.0.0.1:4200
- To be removed when API Gateway is implemented

---

## Integration Points

### FD Calculator Service
- Endpoint: `/internal/products/{productCode}/calculator-config`
- Purpose: Provide product configuration for FD calculations
- Authentication: JWT required
- Response: CalculatorConfigDTO

### Kafka
- Topics:
  - `product-service-batch-products` - Batch product creation events
  - `product-service-audit-logs` - Audit log events
- Purpose: Batch processing and logging

---

## Database Schema

### Product Table
- `product_id` (UUID, Primary Key)
- `product_code` (VARCHAR, Unique)
- `product_name` (VARCHAR)
- `product_type` (VARCHAR)
- `currency` (VARCHAR)
- `effective_date` (DATE)
- `end_date` (DATE)
- `status` (VARCHAR)
- `interest_type` (VARCHAR)
- `min_age` (INTEGER)
- `min_deposit` (DECIMAL)
- `max_deposit` (DECIMAL)
- `min_withdrawal` (DECIMAL)
- `max_withdrawal` (DECIMAL)
- `allowed_transaction_types` (VARCHAR)
- `balance_types` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `created_by` (VARCHAR)
- `updated_by` (VARCHAR)
- Audit columns: `uuid`, `ooo_user_id`, `ooo_ws_id`, `ldbid`, `ooo_acpt_ts`, `ooo_host_ts`, `ooo_local_ts`, `ooo_acpt_ts_utc_ofst`, `rule_system_id`

### ProductBusinessRule Table
- `rule_id` (UUID, Primary Key)
- `product_id` (UUID, Foreign Key)
- `term_limit_min` (INTEGER)
- `term_limit_max` (INTEGER)
- `rate_limit_min` (DECIMAL)
- `rate_limit_max` (DECIMAL)

### ProductCharge Table
- `charge_id` (UUID, Primary Key)
- `product_id` (UUID, Foreign Key)
- `charge_type` (VARCHAR)
- `charge_value` (DECIMAL)
- `charge_unit` (VARCHAR)
- `fee_type` (VARCHAR)

### ProductRole Table
- `role_id` (UUID, Primary Key)
- `product_id` (UUID, Foreign Key)
- `role_name` (VARCHAR)

---

## Data Model Relationships

```
Product (1) ---- (*) ProductBusinessRule
Product (1) ---- (*) ProductCharge
Product (1) ---- (*) ProductRole
Product (1) ---- (*) RateVariation (embeddable)
```

---

## API Endpoint Matrix

| Endpoint | Method | Auth Required | Roles | Purpose |
|----------|--------|---------------|-------|---------|
| `/api/v1/products` | POST | Yes | BANK_OFFICER, ADMIN | Create product |
| `/api/v1/products/{code}` | PUT | Yes | BANK_OFFICER, ADMIN | Update product |
| `/api/v1/products/{code}` | DELETE | Yes | ADMIN | Retire product |
| `/api/v1/products/search` | GET | Yes | BANK_OFFICER, ADMIN | Search products |
| `/api/v1/products/active` | GET | Yes | BANK_OFFICER, ADMIN | List active products |
| `/api/v1/products/{code}` | GET | Yes | BANK_OFFICER, ADMIN | Get product by code |
| `/api/v1/products/{code}/validate` | GET | Yes | BANK_OFFICER, ADMIN | Validate product |
| `/api/v1/products/{code}/rate` | POST | Yes | BANK_OFFICER, ADMIN | Calculate rate |
| `/api/v1/products/{code}/defaults` | GET | Yes | BANK_OFFICER, ADMIN | Get defaults |
| `/api/v1/products/internal/products/{code}/calculator-config` | GET | Yes | Service-to-Service | Calculator config |
| `/api/v1/products/batch` | POST | Yes | BANK_OFFICER, ADMIN | Batch create |

---

## Future Enhancements

- Product versioning
- Product approval workflow
- Advanced search with full-text
- Product templates
- Bulk import/export
- Product lifecycle management
- Rate history tracking
- Dynamic rate calculation rules
