# FD Platform Integration Plan
## Normalizing and Unifying Three Backends
## Executive Summary

This document identifies inconsistencies, redundancies, and integration challenges across three backend systems:

1. **FD Calculator** (`fd_calc/mod 4 backend`) - Port 8084
2. **Product & Pricing** (`product&pricing module/banking-product-backend`) - Port 8080
3. **FD Module Group9** (`FD_Module_Group9`) - Multi-service platform (ports 8080-8090)

**Critical Issues Found:**
- ~~Port conflicts (8080, 3308)~~ ✅ Resolved
- ~~JWT library incompatibility (jjwt vs NimbusDS)~~ ✅ Resolved
- ~~Java version mismatch (21 vs 25)~~ ✅ Resolved
- ~~Spring Boot version mismatch (3.3.4 vs 4.1.1)~~ ✅ Resolved
- ~~Duplicate Product entities~~ ✅ Partially resolved
- Inconsistent security configurations
- Different interest calculation engines

---

## Issue Categories

### 1. Port Conflicts ✅ COMPLETED

| Service | Current Port | Conflict With | Resolution |
|---------|--------------|---------------|----------------|
| **Product & Pricing** | 8080 | FD Module Group9 fd-account-service | No change |
| **FD Module Group9 fd-account-service** | 8086 | Product & Pricing | Moved to 8086 |
| **Product & Pricing MySQL** | 3308 | FD Module Group9 MySQL | No change |
| **FD Module Group9 MySQL** | 3310 | Product & Pricing MySQL | Moved to 3310 |

**Status:** Resolved - FD_Module_Group9 services moved to non-conflicting ports.

---

### 2. Java & Spring Boot Version Mismatch ✅ COMPLETED

| System | Java Version | Spring Boot | Compatibility |
|--------|--------------|-------------|---------------|
| FD Calculator | 21 | 3.3.4 | Stable |
| Product & Pricing | 21 | 3.3.4 | Stable |
| FD Module Group9 | 21 | 3.3.4 | Stable |

**Status:** Resolved - FD_Module_Group9 downgraded to Java 21 and Spring Boot 3.3.4.

---

### 3. JWT Implementation Incompatibility ✅ COMPLETED

| System | JWT Library | Implementation | Compatibility |
|--------|-------------|----------------|---------------|
| FD Calculator | io.jsonwebtoken (jjwt) | Custom JwtAuthConverter | Compatible |
| Product & Pricing | io.jsonwebtoken (jjwt) | Custom JwtAuthConverter | Compatible |
| FD Module Group9 | io.jsonwebtoken (jjwt) | security-common library | Compatible |

**Status:** Resolved - FD_Module_Group9 migrated from NimbusDS to jjwt. All systems now use the same JWT library.

---

### 4. Security Configuration Inconsistencies

| Aspect | FD Calculator | Product & Pricing | FD Module Group9 |
|--------|---------------|-------------------|------------------|
| HTTP Basic Auth | Disabled | Disabled | **Enabled by default** (demo users) |
| JWT Only Mode | Yes | Yes | No (mixed mode) |
| Security Config Location | `com.bank.calculator.config` | `com.bank.product.security` | `com.example.fdmodule.config` + `security-common` |
| Role Prefix | ROLE_ (auto-added) | ROLE_ (auto-added) | ROLE_ (auto-added) |
| Demo Users | None | None | admin1/officer1/customer1 |

**Issues:**
- FD Module Group9 has HTTP Basic enabled by default (security risk in production)
- Different package structures for security
- Demo users hardcoded in FD Module Group9

**To impl:**

- **[OPTION B]** Enable HTTP Basic in FD Calculator and Product & Pricing for consistency (not recommended for production)

---

### 5. Product Entity Duplication ✅ COMPLETED

All three systems have Product entities with different schema and bnames:

| Field | FD Calculator | Product & Pricing | FD Module Group9 |
|-------|---------------|-------------------|------------------|
| Product Code | `productCode` (String) | `productCode` (String) | `productCode` (String) |
| Product Name | `productName` (String) | `productName` (String) | `productName` (String) |
| Interest Type | `interestType` (enum: SIMPLE/COMPOUND/CREDIT) | `interestType` (String: CREDIT) | `interestType` (String) ✅ |
| Compounding Frequency | `compoundingFrequency` (enum) | `compoundingFrequency` (String) | `compoundingFrequency` (String) |
| Min/Max Principal | `minPrincipal`/`maxPrincipal` | `minDeposit`/`maxDeposit` | `minDeposit`/`maxDeposit` ✅ |
| Min/Max Rate | `rateLimit.min`/`rateLimit.max` | `rateLimit.min`/`rateLimit.max` | `minRate`/`maxRate` |
| Rate Cap Addon | Missing | Missing | `rateCapAddon` |
| Penalty % | Missing | Missing | `preMaturityPenaltyPct` |
| Currency | `currency` (String) | `currency` (String) | `currency` (String) |
| Status | `status` (String) | `status` (String) | `status` (String) |

**Status:** Partially resolved - Added `interestType` and `maxDeposit` fields to FD_Module_Group9 Product entity to align with other backends.
---

### 6. Interest Calculation Engine Duplication

| Aspect | FD Calculator | FD Module Group9 |
|--------|---------------|------------------|
| Class | `CalculationEngine` | `InterestEngine` |
| Interest Types | SIMPLE, COMPOUND, CREDIT | SIMPLE, MONTHLY_COMPOUND only |
| Compounding Frequencies | MONTHLY, QUARTERLY, HALF_YEARLY, YEARLY | MONTHLY only |
| Precision | BigDecimal with 12 decimals | MathContext.DECIMAL128 |
| Daily Interest Formula | `balance * rate / 36500` | `balance * rate / 36500` (same) |
| Compound Formula | `P * (1 + r/n)^(n*t)` | `P * (1 + r/1200)^months` |

**Issues:**
- Two different calculation engines
- FD Module Group9 missing CREDIT interest type
- FD Module Group9 missing quarterly/half-yearly compounding
- Different formula implementations

**Recommendations:**
Use wqhaytever suits best principles and make it work with customisable contracts for fd and has better archirtecture 
---

### 7. Configuration File Format Inconsistency ✅ COMPLETED

| System | Config Format | Profiles |
|--------|---------------|----------|
| FD Calculator | YAML (application.yml, application-prod.yml) | dev, prod |
| Product & Pricing | YAML (application.yml, application-prod.yml) | dev, prod |
| FD Module Group9 | YAML (application.yml) | dev, prod ✅ |

**Status:** Resolved - FD_Module_Group9 migrated from properties to YAML format with profile support.

---

### 8. Package Structure Inconsistency

| System | Root Package | Structure |
|--------|--------------|-----------|
| FD Calculator | `com.bank.calculator` | Standard layered (controller, service, dto, repository) |
| Product & Pricing | `com.bank.product` | Standard layered (controller, service, dto, repository) |
| FD Module Group9 | `com.example.fdmodule` | Mixed (some services in subpackages) |

**Issues:**
- Different base packages (com.bank vs com.example)
- Inconsistent naming conventions
- Difficult to share code

**Recommendations:**
- **[OPTION A]** Standardize all to `com.bank.fdplatform` with submodules (calculator, product, account, auth, etc.)
- **[OPTION B]** Keep separate packages but create shared library with common code
- **[OPTION C]** Keep as-is (not recommended for long-term maintenance)

**Recommended Action:** OPTION A - unified package structure for shared code.

---

### 9. Docker Compose Inconsistency ✅ COMPLETED

| System | Docker Compose | Network | Health Checks |
|--------|----------------|---------|---------------|
| FD Calculator | docker-compose.yml | shared-network | Yes |
| Product & Pricing | docker-compose.yml | shared-network | Yes |
| FD Module Group9 | compose.yaml | Default network | Yes |
| **Unified** | **docker-compose.yml (root)** | **banking-network** | **Yes** ✅ |

**Status:** Resolved - Created unified docker-compose.yml at root with all services on shared banking-network.

---

### 10. Exception Handling Inconsistency ✅ COMPLETED

| System | Exception Classes | Error Response Format |
|--------|-------------------|----------------------|
| FD Calculator | 8 custom exceptions | Standardized ErrorResponse DTO |
| Product & Pricing | 5 custom exceptions | Standardized ErrorDetails DTO |
| FD Module Group9 | Enhanced ApiExceptionHandler | Structured error response ✅ |

**Status:** Resolved - Enhanced FD_Module_Group9 ApiExceptionHandler with comprehensive exception handling for authentication, authorization, validation, and general errors.

---

### 11. DTO Pattern Inconsistency

| System | DTO Style | Validation |
|--------|-----------|------------|
| FD Calculator | Records | Jakarta validation annotations |
| Product & Pricing | Records | Jakarta validation annotations |
| FD Module Group9 | Mix of classes and records | Jakarta validation annotations |

**Issues:**
- Inconsistent DTO patterns (records vs classes)
- FD Module Group9 uses traditional classes for some DTOs

**Recommendations:**
- **[OPTION A]** Migrate all DTOs to records (Java 16+ feature)
- **[OPTION B]** Keep classes for mutable DTOs, records for immutable
- **[OPTION C]** Keep as-is

**Recommended Action:** OPTION A - records are more concise and immutable by design.

---

### 12. Database Schema Inconsistency

| System | Database | Tables | Schema Management |
|--------|----------|--------|------------------|
| FD Calculator | fd-mysql | calculation_audit, (others via Product Service) | JPA ddl-auto: update |
| Product & Pricing | product-mysql | products, rate_variations, charges | JPA ddl-auto: update |
| FD Module Group9 | banking_technology_lab | fd_accounts, products, fd_transactions, gl_accounts, outbox, clock | SQL scripts + JPA validate |

**Issues:**
- FD Module Group9 has comprehensive FD account tables (fd_accounts, fd_transactions, gl_accounts)
- FD Calculator only has audit table
- Product & Pricing has product catalog
- No shared database strategy

**Recommendations:**
- **[OPTION A]** Keep separate databases per service (microservices best practice)

**Recommended Action:** OPTION A - microservices should own their databases and only if they need to interact then nmale the tabless conisstent 

---

### 14. Event-Driven Architecture

| System | Message Broker | Event Pattern |
|--------|----------------|---------------|
| FD Calculator | None | None |
| Product & Pricing | None | None |
| FD Module Group9 | Kafka (port 9092) | Outbox pattern, domain events |

**Issues:**
- FD Module Group9 has Kafka-based event architecture
- FD Calculator and Product & Pricing are synchronous only
- No event integration between systems

**Recommendations:**
- **[OPTION A]** Add Kafka to FD Calculator and Product & Pricing for event publishing
- **[OPTION B]** Keep FD Calculator and Product & Pricing synchronous, use FD Module Group9 for async operations
- **[OPTION C]** Migrate all to event-driven architecture (complex)

**Recommended Action:** OPTION B - hybrid approach for gradual migration.

---

### 15. Redundant Code Patterns

**Duplicate Product Validation Logic:**
- FD Module Group9 has `ProductValidationService`
- Product & Pricing has product validation in controller/service layer
- Both validate product existence, status, term ranges

**Duplicate Interest Calculation:**
- FD Calculator has `CalculationEngine`
- FD Module Group9 has `InterestEngine`
- Both calculate simple and compound interest

**Duplicate JWT Handling:**
- FD Calculator has custom JWT auth converter
- Product & Pricing has custom JWT auth converter
- FD Module Group9 has security-common library ✅ (migrated to jjwt)

**Status:** JWT handling now standardized across all systems. Interest calculation engine consolidation pending.

---

## Integration Strategy Options

### Strategy A: Minimal Integration (Quickest) ✅ COMPLETED
**Goal:** Fix only critical conflicts, keep systems mostly independent

**Actions Completed:**
1. ✅ Resolve port conflicts (move FD Module Group9 fd-account-service to 8086, MySQL to 3310)
2. ✅ Downgrade FD Module Group9 to Java 21 and Spring Boot 3.3.4
3. ✅ Migrate FD Module Group9 from NimbusDS to jjwt JWT library
4. ✅ Normalize Product entity schemas (added interestType and maxDeposit to FD_Module_Group9)
5. ✅ Migrate FD Module Group9 config to YAML with profiles
6. ✅ Create unified docker-compose.yml with shared network
7. ✅ Add exception handling to FD_Module_Group9

**Remaining Actions:**
- Add API endpoint in FD Module Group9 to call Product & Pricing for product data
- Add API endpoint in FD Module Group9 to call FD Calculator for interest calculations
- Disable HTTP Basic in FD Module Group9 for production

---

## Appendix: File Locations

### FD Calculator
- Root: `/home/ihitplayzyt/Downloads/BT_LAB/fd_calc/mod 4 backend`
- Config: `src/main/resources/application-prod.yml`
- Security: `src/main/java/com/bank/calculator/config/SecurityConfig.java`
- JWT: `src/main/java/com/bank/calculator/security/JwtAuthConverter.java`
- Calculation Engine: `src/main/java/com/bank/calculator/service/CalculationEngine.java`

### Product & Pricing
- Root: `/home/ihitplayzyt/Downloads/BT_LAB/product&pricing module/product&pricing module/banking-product-backend`
- Config: `src/main/resources/application-prod.yml`
- Security: `src/main/java/com/bank/product/security/SecurityConfig.java`
- JWT: `src/main/java/com/bank/product/security/JwtAuthConverter.java`
- Product Entity: `src/main/java/com/bank/product/entity/Product.java`

### FD Module Group9
- Root: `/home/ihitplayzyt/Downloads/BT_LAB/FD_Module_Group9`
- Config: `fd-account-service/src/main/resources/application.properties`
- Security: `fd-account-service/src/main/java/com/example/fdmodule/config/SecurityConfig.java`
- Security Common: `security-common/src/main/java/com/example/fdsecurity/JwtSupport.java`
- Auth Service: `auth-service/src/main/java/com/example/fdauth/AuthController.java`
- Product Entity: `fd-account-service/src/main/java/com/example/fdmodule/entity/Product.java`
- Interest Engine: `fd-account-service/src/main/java/com/example/fdmodule/interest/InterestEngine.java`
- Docker Compose: `compose.yaml`
