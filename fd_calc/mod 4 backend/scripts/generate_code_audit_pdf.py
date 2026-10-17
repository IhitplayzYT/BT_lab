#!/usr/bin/env python3
"""
Code Audit PDF Generator for Banking Technology Lab
Generates comprehensive documentation for backend services
"""

import os
import sys
from datetime import datetime

def generate_fd_calculator_audit():
    """Generate FD Calculator service code audit documentation"""
    
    content = f"""# FD Calculator Service - Code Audit Report

**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  
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
| GET | /api/v1/fd/products/{{code}}/preview | CUSTOMER | Product constraints |
| POST | /api/v1/fd/calculations | CUSTOMER | Calculate maturity |
| POST | /api/v1/fd/calculations/compare | CUSTOMER | Compare products |
| GET | /api/v1/fd/calculations/{{id}} | CUSTOMER | Retrieve calculation |
| GET | /api/v1/fd/calculations/uuid/{{uuid}} | CUSTOMER | Retrieve by UUID |
| POST | /api/v1/fd/cache/rates/evict | CUSTOMER | Evict cached rates |
| GET | /api/v1/fd/calculations/{{id}}/export | CUSTOMER | Export as CSV |
| POST | /api/v1/fd/calculations/{{id}}/explain | CUSTOMER | Plain-language explanation |
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
- Endpoint: /internal/products/{{productCode}}/calculator-config
- Purpose: Fetch product configuration
- Cached: Yes (Caffeine)
- Fallback: Mock client (dev)

### Customer Service
- Endpoint: /customers/{{customerId}}/category
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
"""
    
    return content

def generate_product_pricing_audit():
    """Generate Product & Pricing service code audit documentation"""
    
    content = f"""# Product & Pricing Service - Code Audit Report

**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  
**Service:** Product & Pricing Microservice  
**Port:** 8080  
**API Prefix:** /api/v1/products  
**Technology Stack:** Spring Boot 3.3.2, Java 21, Maven, MySQL, Kafka, Spring Security OAuth2

---

## Executive Summary

The Product & Pricing Service acts as the central catalog and governance engine for banking products (FD, SAVINGS, LOAN). It encapsulates product identification, eligibility criteria, term ranges, interest rate bounds, fees, customer role assignments, and tiered rate variations. External modules consume product data and pricing logic exclusively via secure REST APIs.

---

## Architecture Overview

### Service Communication
```
Angular UI → API Gateway → Product Service (8080)
                            ↓
                    FD Calculator Service (8084)
                    Customer Service (8082)
```

### Key Integrations
- **FD Calculator Service:** Provides product configuration via internal endpoint
- **Kafka:** Batch product creation logging and audit events
- **MySQL:** Product persistence with normalized schema

---

## API Endpoints

### Public Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /actuator/health | None | Health check |
| GET | /actuator/metrics | None | Metrics endpoint |
| GET | /actuator/prometheus | None | Prometheus metrics |
| GET | /swagger-ui/index.html | None | API documentation |
| POST | /api/v1/products | BANK_OFFICER, ADMIN | Create product |
| PUT | /api/v1/products/{{code}} | BANK_OFFICER, ADMIN | Update product |
| DELETE | /api/v1/products/{{code}} | ADMIN | Retire product |
| GET | /api/v1/products/search | BANK_OFFICER, ADMIN | Search products |
| GET | /api/v1/products/active | BANK_OFFICER, ADMIN | List active products |
| GET | /api/v1/products/{{code}} | BANK_OFFICER, ADMIN | Get product by code |
| GET | /api/v1/products/{{code}}/validate | BANK_OFFICER, ADMIN | Validate product |
| POST | /api/v1/products/{{code}}/rate | BANK_OFFICER, ADMIN | Calculate rate |
| GET | /api/v1/products/{{code}}/defaults | BANK_OFFICER, ADMIN | Get defaults |
| GET | /api/v1/products/internal/products/{{code}}/calculator-config | Service-to-Service | Calculator config |
| POST | /api/v1/products/batch | BANK_OFFICER, ADMIN | Batch create |

---

## Configuration

### Environment Variables
- `DB_URL` - Database connection URL
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT secret key (dev only)
- `JWT_ISSUER_URI` - JWT issuer URI (default: http://localhost:8081)
- `JWT_AUDIENCE` - JWT audience (default: product-service)
- `JWT_ROLES_CLAIM` - JWT roles claim (default: roles)
- `KAFKA_BOOTSTRAP_SERVERS` - Kafka bootstrap servers (default: localhost:9092)
- `SERVER_PORT` - Server port (default: 8080)
- `APP_CORS_ALLOWED_ORIGINS` - CORS allowed origins (default: http://localhost:4200,http://127.0.0.1:4200)

### Standardized Configuration
- Profile-based configuration (dev, prod)
- JPA ddl-auto: validate (prod), update (dev)
- Actuator endpoints: health, info, metrics, prometheus
- Structured JSON logging with correlation IDs
- Kafka configuration for batch processing
- CORS configuration (to be removed when API Gateway is implemented)

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

## Observability

### Structured Logging
- JSON structured logging via Logstash Encoder (logstash-logback-encoder 7.4)
- Correlation IDs in all logs
- Log files written to ./logs/product-service.log
- 30-day log retention
- Configuration: logback-spring.xml

### Metrics
- Actuator endpoints: /actuator/health, /actuator/metrics, /actuator/prometheus
- Custom business metrics (MetricsConfig):
  - product.creation.total - Total products created
  - product.update.total - Total products updated
  - product.rate.calculations.total - Total rate calculations
  - product.rate.calculations.duration - Rate calculation duration timer
  - product.cache.hits - Cache hits
  - product.cache.misses - Cache misses
  - product.batch.operations.total - Total batch operations

### Kafka Integration
- Topics:
  - product-service-batch-products - Batch product creation events
  - product-service-audit-logs - Audit log events
- Environment variable: KAFKA_BOOTSTRAP_SERVERS (default: localhost:9092)

---

## Data Model

### Product Entity
- Table: product
- Primary Key: productId (UUID)
- Business Key: productCode (unique)
- Relationships:
  - One-to-many: ProductBusinessRule
  - One-to-many: ProductCharge
  - One-to-many: ProductRole
  - One-to-many: RateVariation (embeddable)
- Audit Columns: createdAt, updatedAt, createdBy, updatedBy
- Uses @PrePersist and @PreUpdate hooks

### Related Entities
- ProductBusinessRule - Term and rate limits
- ProductCharge - Fees and charges
- ProductRole - Allowed customer roles
- RateVariation - Rate variations by category

---

## Conventions

### Naming Conventions
- Java fields: camelCase
- Database columns: snake_case
- API endpoints: kebab-case
- DTOs: Lombok @Data, @Builder for mutable DTOs, Java Records for immutable DTOs
- Services: Interface + Impl pattern
- Exceptions: Descriptive names ending with "Exception"

### Code Conventions
- Use Lombok for DTOs and Entities (builder pattern)
- Use Java Records for immutable DTOs (RateCalculationResponseDTO, TermLimitDTO, RateLimitDTO)
- Use @Valid for request validation
- Use @NotNull, @NotBlank, @DecimalMin, @DecimalMax, @Pattern for field validation
- Use @Operation and @ApiResponse for Swagger documentation
- Use @SecurityRequirement for endpoint security
- Use @PreAuthorize for role-based authorization

### Monetary Values
- All monetary values use BigDecimal
- Currency amounts: precision 18, scale 2
- Rates: precision 6, scale 2
- Rounding mode: HALF_UP

---

## Key Components

### Controllers
- ProductController - REST API endpoints

### Services
- ProductService - Main business logic
- ProductServiceImpl - Service implementation

### Repositories
- ProductRepository - JPA repository
- ProductSpecifications - JPA specifications for dynamic queries

### Mappers
- ProductMapper - Entity-DTO mapping

### DTOs
- ProductRequestDTO, ProductResponseDTO (Lombok)
- RateCalculationResponseDTO (Java Record)
- TermLimitDTO, RateLimitDTO (Java Records)
- ChargesDTO, RateVariationDTO

### Entities
- Product, ProductBusinessRule, ProductCharge, ProductRole
- RateVariation (embeddable)

### Enums
- ProductStatus: ACTIVE, INACTIVE, DRAFT, SUSPENDED, RETIRED
- ChargeType: interestCredit, tax, withdrawalFee

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

## Testing

### Test Coverage
- ProductEndToEndIntegrationTest - Full context with real JWT
- ProductSecurityTest - Security filters and role authorization
- ProductControllerTest - HTTP contracts and validation
- ProductServiceTest - Business rules and calculations
- FdCalculatorServiceTest - FD calculation regression
- OpenApiExportTest - OpenAPI spec export

### Running Tests
```bash
mvn test
```

---

## Integration Points

### FD Calculator Service
- Endpoint: /internal/products/{{productCode}}/calculator-config
- Purpose: Provide product configuration for FD calculations
- Authentication: JWT required
- Response: CalculatorConfigDTO

### Kafka
- Topics: product-service-batch-products, product-service-audit-logs
- Purpose: Batch processing and logging

---

## Recent Updates

### Standardization Improvements
1. **Monetary Values** - All monetary values standardized to BigDecimal
2. **Response Formats** - RateCalculationResponseDTO converted to Java record
3. **Environment Variables** - Standardized to DB_URL, DB_USER, DB_PASSWORD, JWT_SECRET
4. **Configuration Structure** - Reorganized to match FD Calculator
5. **Actuator Configuration** - Added Prometheus metrics export
6. **Structured Logging** - Added JSON logging with Logstash Encoder, correlation IDs
7. **Metrics** - Added custom business metrics via MetricsConfig
8. **Audit Entity** - Standardized @PrePersist/@PreUpdate hooks
9. **Docker** - Created Dockerfile matching FD Calculator structure
10. **API Documentation** - Standardized security scheme name to bearerAuth

---

## Compliance

### Banking Standards
- 11-column audit trail (created_at, updated_at, uuid, ooo_user_id, ooo_ws_id, ldbid, ooo_acpt_ts, ooo_host_ts, ooo_local_ts, ooo_acpt_ts_utc_ofst, rule_system_id)
- UUID for persistent identification
- CreatedBy/UpdatedBy tracking
- Automatic audit field population

### Security Standards
- JWT-based authentication
- Role-based authorization (ADMIN, BANK_OFFICER)
- Stateless session management
- CORS configuration (dev only)

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

---

## Documentation

- Swagger UI: http://localhost:8080/swagger-ui/index.html
- OpenAPI Spec: http://localhost:8080/v3/api-docs
- Health: http://localhost:8080/actuator/health
- Metrics: http://localhost:8080/actuator/metrics
- Prometheus: http://localhost:8080/actuator/prometheus

---

## Contact

**Team:** Banking Technology Lab – Product Team  
**Email:** product-team@bank.internal  
**Repository:** Product & Pricing Service

---

*End of Code Audit Report*
"""
    
    return content

def main():
    """Main function to generate code audit reports"""
    
    base_dir = "/home/ihitplayzyt/Downloads/BT_LAB"
    
    # Generate FD Calculator audit
    fd_audit = generate_fd_calculator_audit()
    fd_output = f"{base_dir}/fd_calc/mod 4 backend/FD_Calculator_Code_Audit.md"
    with open(fd_output, 'w') as f:
        f.write(fd_audit)
    print(f"FD Calculator audit report generated: {fd_output}")
    
    # Generate Product & Pricing audit
    pp_audit = generate_product_pricing_audit()
    pp_output = f"{base_dir}/banking-product-backend/Product_Pricing_Code_Audit.md"
    with open(pp_output, 'w') as f:
        f.write(pp_audit)
    print(f"Product & Pricing audit report generated: {pp_output}")
    
    print("\nTo convert to PDF, use pandoc:")
    print(f"pandoc {fd_output} -o {fd_output.replace('.md', '.pdf')}")
    print(f"pandoc {pp_output} -o {pp_output.replace('.md', '.pdf')}")

if __name__ == "__main__":
    main()
