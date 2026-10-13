# Integration Plan: FD Calculator & Product & Pricing Modules

## Executive Summary

This document identifies all integration issues between the FD Calculator Service and Product & Pricing Service, and provides potential solutions to normalize them into a cohesive microservices-based REST architecture with proper authentication, authorization, security principles, and batch processing capabilities.

**Module 1:** FD Calculator Service (`fd_calc/mod 4 backend/`) - Port 8084  
**Module 2:** Product & Pricing Service (`product&pricing module/product&pricing module/banking-product-backend/`) - Port 8080

---

## 0. ARCHITECTURE PRINCIPLE: DATABASE PER SERVICE (HIGH PRIORITY)

### Principle: Decoupled Databases

**Requirement:** Each microservice must have its own dedicated database. Services communicate via REST endpoints only, never via direct database access.

**Rationale:**
- **Loose Coupling:** Services are decoupled; changes in one service's schema don't affect others
- **Failure Isolation:** Database failures in one service don't cascade to others
- **Deployment Independence:** Each service can deploy schema changes independently

**Implementation Guidelines:**
- **FD Calculator Service:** Owns `fd_calculation_audit` table for calculation audit trails
- **Product Service:** Owns `products`, `productBusinessRules`, `productCharges`, `productRoles`, `product_rate_variations` tables
- **Communication:** Services communicate via REST endpoints, not database joins
- **Data Consistency:** Use eventual consistency patterns for cross-service data
- **No Shared Tables:** Never share database tables between services
- **No Direct DB Access:** Services never connect to another service's database

**Impact on Existing Issues:**
- Issue 3.5 (Different Database Table Names) - **RESOLVED:** Each service keeps its own tables; no consolidation needed
- Issue 4.1 (Different Database Configurations) - Each service configures its own database independently
- Issue 4.2 (No Database Migration Tool) - Each service manages its own migrations independently

---

## 1. AUTHENTICATION & AUTHORIZATION INCONSISTENCIES


### Issue 1.5: Dev-Only Token Endpoint

**Problem:**
- **Product & Pricing:</strong> Has `/api/auth/token` endpoint only in dev profile
- **FD Calculator:</strong> No token generation endpoint (relies on external Auth Service)

**To impl:** Create Dedicated Auth Service
- Create separate Auth Service microservice
- Both services call Auth Service for token validation
- Auth Service provides token generation for dev
- Benefits: Proper microservices architecture


---

## 2. API INCONSISTENCIES

### Issue 2.3: Different Response Formats

**Status:** **COMPLETED** - Product Service's RateCalculationResponseDTO converted to Java record with comprehensive fields and BigDecimal for all monetary values. Both services now use Java records for key DTOs with consistent field naming and types.

---

### Issue 2.5: Missing Internal Endpoint for Service-to-Service Communication

**Status:** **RESOLVED** - Internal endpoint `/internal/products/{productCode}/calculator-config` already exists in ProductController for FD Calculator service integration.

**Potential Solutions:**

**Option A (Recommended):** Add Internal Endpoint to Product Service
- Add `GET /internal/products/{code}/calculator-config` to Product service
- Return product configuration needed for calculations
- Protect with internal authentication (service-to-service JWT)
- Benefits: Proper service-to-service communication

**Option B:** Use Public Endpoint with Service Account
- Use existing public endpoint with service account authentication
- Drawbacks: Less secure, exposes internal data

**Recommendation:** Option A - Add dedicated internal endpoint

---

### Issue 2.6: No Batch Processing Endpoints

**Status:** **RESOLVED** - Batch processing endpoint `/api/v1/products/batch` added to ProductController with correlation ID tracking. Kafka configuration exists in application.yml for batch products and audit logs topics.

**Problem:**
- **FD Calculator:</strong> Only single calculation endpoints
- **Product Service:</strong> No batch operations
- Neither service has bulk calculation or bulk product creation endpoints

**Impact:**
- Inefficient for bulk operations
- No support for batch processing requirements
- Poor performance for multiple calculations

**Potential Solutions:**

**To impl:** Add Batch Processing Endpoints
- Add `POST /api/v1/fd/calculations/batch` to FD Calculator
- Accept array of calculation requests
- Return array of calculation responses
- Implement async processing for large batches
- Add batch product operations to Product service
- Add batch processing to database operations 
- Benefits: Efficient bulk operations, meets batch processing requirement


---

## 3. DATA MODEL INCONSISTENCIES

### Issue 3.1: DTOs Not Using Java Records

**Status:** **RESOLVED** - Key DTOs (RateLimitDTO, TermLimitDTO) converted to Java records. Other DTOs remain as Lombok classes for backward compatibility with existing mappers and builders.

---

### Issue 3.2: Inconsistent Monetary Value Types

**Status:** **COMPLETED** - All monetary values in Product Service now use `BigDecimal` (rateLimitMin, rateLimitMax in ProductBusinessRule, RateLimitDTO, withdrawalFees in ChargesDTO, chargeValue in ProductCharge, rateModifier in RateVariation and RateVariationDTO, and all rate fields in RateCalculationResponseDTO). Service implementation updated to use BigDecimal arithmetic with HALF_UP rounding.

---

### Issue 3.3: Different Field Naming Conventions

**Status:** **COMPLETED** - Both services already follow standard naming conventions: camelCase for all Java fields and snake_case for all database columns. Hibernate/JPA handles the mapping correctly. Audit columns are consistently named across both services.

----

### Issue 3.4: Different Audit Column Implementations

**Status:** **COMPLETED** - Both services now use consistent audit column implementations with @PrePersist and @PreUpdate hooks. CalculationAudit in FD Calculator now has the same audit behavior as Product entity in Product Service, with automatic population of audit fields (uuid, oooUserId, oooWsId, timestamps, etc.).

---

### Issue 3.5: Different Database Table Names

**Status:** **RESOLVED** - Each service keeps its own tables; no consolidation needed

----

## 4. DATABASE INCONSISTENCIES

### Issue 4.1: Different Database Configurations

**Problem:**
- **FD Calculator:</strong> Uses H2 in dev, MySQL in prod, configurable via environment
- **Product Service:</strong> Uses MySQL by default, H2 for tests only

**Status:** **ACCEPTABLE** - Per Database Per Service principle, each service can have its own database configuration

**Resolution:**
- Each service configures its own database independently based on its needs
- FD Calculator use MySQL for all environmensts
- Product Service can use MySQL for all environments
- No need to standardize across services
- Each service manages its own connection strings and credentials

---

### Issue 4.2: No Database Migration Tool

**Status:** **RESOLVED** - Both services now use `ddl-auto: validate` in base configuration and `ddl-auto: update` in dev profile

---

### Issue 4.3: Different Primary Key Strategies

**Status:** **RESOLVED** - Both services now use UUID primary keys with prefixes (CALC- for FD Calculator, PROD- for Product Service). Business keys retained for backward compatibility.

---

## 5. ARCHITECTURE INCONSISTENCIES

### Issue 5.1: Monolithic vs Microservice Design

**Problem:**
- **FD Calculator:</strong> Pure microservice, single responsibility
- **Product & Pricing:</strong> Monolithic, combines product management and FD calculation

**Impact:**
- Violates single responsibility principle
- Difficult to scale independently
- Tight coupling between unrelated features
- Violates microservices architecture

**Potential Solutions:**

**Option A (Recommended):** Split Product Service into Microservices
- Extract FD calculator from Product service
- Create separate Product Catalog Service
- Create separate FD Calculator Service (already exists)
- Services communicate via REST only
- Benefits: Microservices architecture, independent scaling

**Recommendation:** Option A - Split into separate microservices

---

### Issue 5.2: No API Gateway

**Problem:**
- **FD Calculator:</strong> Designed to work behind API Gateway but none exists
- **Product Service:</strong> Direct frontend access, no gateway



**To impl:** Implement API Gateway
- Add Spring Cloud Gateway or Kong
- Centralize authentication (JWT validation)
- Centralize CORS configuration
- Implement rate limiting
- Route requests to appropriate services
- Benefits: Security, centralized control, microservices pattern

**Recommendation:** Option A - Implement Spring Cloud Gateway

---

## 6. CONFIGURATION INCONSISTENCIES

### Issue 6.1: Different Application.yml Structures

**Status:** **COMPLETED** - Product Service configuration structure now matches FD Calculator with standardized organization: spring.application.name, spring.profiles.active, spring.jpa, spring.datasource, spring.security.oauth2, server, management.endpoints, springdoc, app.cors, app.security.jwt, logging, and spring.kafka sections.

---

### Issue 6.2: Different Environment Variable Naming

**Status:** **COMPLETED** - Product Service now uses standardized environment variable names: `DB_URL`, `DB_USER`, `DB_PASSWORD`, `DB_DRIVER`, `JWT_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE`, `JWT_ROLES_CLAIM`, matching FD Calculator.

---

### Issue 6.3: Different CORS Configurations

**Problem:**
- **FD Calculator:</strong> No CORS (designed for API Gateway)
- **Product Service:</strong> CORS configured for localhost:4200, 127.0.0.1:4200

**Option A (Recommended):** Remove CORS from Services, Handle in API Gateway
- Remove CORS configuration from both services
- Handle CORS in API Gateway
- Benefits: Centralized CORS, services don't need to know about origins

**Recommendation:** Option A - Handle CORS in API Gateway

---

## 7. SECURITY INCONSISTENCIES

### Issue 7.1: Missing Standard Security Headers

**Status:** **RESOLVED** - Both services have standard security headers configured (CSP, X-XSS-Protection, HSTS, X-Content-Type-Options, Frame-Options) in their SecurityConfig classes.

- Use Spring Security headers configuration
- Benefits: Consistent security posture
---

### Issue 7.2: No Rate Limiting

**Problem:**
- Neither service has rate limiting
- Vulnerable to abuse/DoS attacks

**Impact:**
- No protection against abuse
- Potential service disruption
- No fair usage enforcement

**Potential Solutions:**

**Option A (Recommended):** Add Rate Limiting in API Gateway
- Implement rate limiting in API Gateway
- Per-user, per-endpoint rate limits
- Benefits: Centralized, efficient

**Recommendation:** Option A - Handle in API Gateway

---

### Issue 7.3: No Input Sanitization

**Status:** **RESOLVED** - Both services have comprehensive input validation (Jakarta Bean Validation annotations on DTOs) and GlobalExceptionHandlers with proper error responses for validation errors, malformed JSON, type mismatches, and domain-specific exceptions.

---

### Issue 7.4: Hardcoded Secrets

**Status:** **RESOLVED** - All JWT secrets now use `${JWT_SECRET}` environment variable with fallback defaults in dev profiles. Base configurations require environment variables.

---

**Impact:**
- FD Calculator has hardcoded secret (dev profile)
- Risk of accidentally committing secrets

**Potential Solutions:**

**Option A (Recommended):** Remove All Defaults, Require Environment Variables
- Remove all default secrets from configuration files
- Require all secrets via environment variables
- Fail startup if secrets not provided
- Benefits: No accidental secret exposure

**Recommendation:** Option A - Remove defaults, require environment variables

---

## 8. OBSERVABILITY INCONSISTENCIES

### Issue 8.1: Different Actuator Endpoint Configurations

**Status:** **COMPLETED** - Both services now expose consistent actuator endpoints: health, info, metrics, prometheus with Prometheus metrics export enabled. Health details set to when-authorized.

---

### Issue 8.2: No Structured Logging

**Status:** **COMPLETED** - Both services now use JSON structured logging via logback-spring.xml with logstash-logback-encoder. Correlation IDs are included in logging patterns and MDC. Logs are written to both console (JSON) and rolling files with 30-day retention.

---

### Issue 8.3: No Metrics Standardization

**Status:** **COMPLETED** - Both services now have MetricsConfig with custom business metrics: FD Calculator has calculation counters, error counters, calculation timer, and cache metrics. Product Service has product creation/update counters, rate calculation counters/timers, cache metrics, and batch operation counters. All metrics use standardized naming with service tags.

---

## 9. TESTING INCONSISTENCIES

### Issue 9.1: Different Testing Approaches

**Problem:**
- **FD Calculator:</strong> Unit tests, integration tests with WireMock
- **Product Service:</strong> Unit tests only, no integration tests

**Impact:**
- Inconsistent test coverage
- Product service may have integration bugs
- Different testing strategies

**Potential Solutions:**

**Option A (Recommended):** Standardize Testing Strategy
- Both services have:
  - Unit tests (service layer)
  - Integration tests (controller layer with TestRestTemplate/MockMvc)
  - Contract tests (Pact)
  - End-to-end tests
- Use WireMock for external service mocking
- Target 80%+ code coverage
- Benefits: Consistent quality, confidence

**Recommendation:** Option A - Standardize testing strategy

---

### Issue 9.2: No Contract Testing

**Problem:**
- No contract testing between services
- API changes can break consumers
- No consumer-driven contracts

**Impact:**
- Risk of breaking changes
- No API versioning enforcement
- Integration issues

**Potential Solutions:**

**Option A (Recommended):** Add Contract Testing
- Use Spring Cloud Contract or Pact
- Define API contracts
- Verify contracts in CI/CD
- Benefits: API stability, consumer confidence

**Recommendation:** Option A - Add Spring Cloud Contract or Pact

---

## 10. DEPLOYMENT INCONSISTENCIES

### Issue 10.1: Different Docker Configurations

**Status:** **COMPLETED** - Product Service now has a Dockerfile matching FD Calculator's structure: eclipse-temurin:21-jre-alpine base image, non-root user (appuser), container support enabled, MaxRAMPercentage 75%, and appropriate port exposure (8080 for Product Service, 8084 for FD Calculator).

---

### Issue 10.2: Different deployment strategies
- No container orchestration strategy

**Potential Solutions:**

**Option A (Recommended):** Standardize Docker Configuration
- Create Dockerfile for each service
- Create docker-compose.yml for local development
- Use multi-stage builds for optimization
- Define standard base image
- Benefits: Consistent deployment, containerization

**Option B:** Use Kubernetes
- Create Kubernetes manifests
- Benefits: Orchestration, scaling
- Drawbacks: More complex

**Recommendation:** Option A - Standardize Docker, then Option B for production

---

## 11. DOCUMENTATION INCONSISTENCIES

### Issue 11.1: Different API Documentation Paths

**Status:** **COMPLETED** - Both services now use consistent API documentation paths: `/swagger-ui/index.html` for Swagger UI and `/v3/api-docs` for OpenAPI JSON. Security scheme name standardized to `bearerAuth` across both services with consistent JWT authentication configuration.

---

### Issue 11.2: No API Versioning Strategy

**Status:** **RESOLVED** - Both services use `/api/v1/` prefix in their @RequestMapping annotations (FD Calculator: `/api/v1/fd`, Product Service: `/api/v1/products`).

**Impact:**
- Difficult to evolve APIs
- Breaking changes affect all consumers
- No backward compatibility strategy

**Potential Solutions:**

**Option A (Recommended):** Define API Versioning Strategy
- All APIs use `/api/v1/` prefix followed by the module name
- Use semantic versioning for breaking changes
- Support multiple versions during transition
- Document deprecation timeline
- Benefits: Controlled API evolution

**Recommendation:** Option A - Define and implement API versioning strategy

---

## 12. FRONTEND INTEGRATION ISSUES

### Issue 12.1: Frontend Only for Product Service

**Problem:**
- Product service has Angular frontend
- FD Calculator service has no frontend
- Frontend only talks to Product service

**Impact:**
- FD Calculator functionality not accessible via UI
- Inconsistent user experience
- Frontend needs to integrate with multiple services

**Potential Solutions:**

**Option A (Recommended):** Create Unified Frontend
- Extend Angular frontend to integrate with FD Calculator
- Add FD Calculator screens
- Use API Gateway for backend communication
- Benefits: Unified user experience

---

### Issue 12.2: No Shared Frontend Components

**Problem:**
- No shared UI components between potential frontends
- Different design systems

**Impact:**
- Inconsistent UI/UX
- Duplicate development effort

**Potential Solutions:**

**Option A (Recommended):** Create Shared Component Library
- Create Angular component library
- Shared components: buttons, forms, tables, etc.
- Both frontends use shared library
- Benefits: Consistency, reuse

**Recommendation:** Option A - Create shared component library

---