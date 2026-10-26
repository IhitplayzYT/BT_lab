# Comprehensive Guide: Banking Product & Pricing Backend Module

**Academic / Enterprise Context**: Derived from Banking Lab L5 (Product & Pricing APIs), Lab L9 (Login/JWT Integration), and Lab L13 (FD Account Creation Integration).  
**Technology Stack**: Java 21, Spring Boot 3.3.4, Spring Security 6.3, JJWT 0.12.6, Spring Data JPA, Hibernate, MySQL, H2 Database, Springdoc OpenAPI 3.0, Spring Boot Actuator.  
**Scope**: Backend Architecture, REST API Design, Business Rules Enforcement, Security, and Module Integration.

---

## 1. Executive Summary & Objective

In modern core banking architectures, a **Product** is a financial blueprint or contract template. Accounts (such as Fixed Deposit accounts, Savings accounts, or Personal Loan accounts) are never created as ad-hoc, freeform records; they are strictly **instantiated from a defined Product**.

The **Product & Pricing Module** acts as the central catalog and governance engine for these products. It encapsulates:
- Product identification and eligibility criteria.
- Allowed term ranges and interest rate bounds.
- Applicable fees, tax deduction rules, and charge schedules.
- Customer role assignments (Owner, Co-owner, Nominee).
- Tiered rate variations based on customer attributes (Senior Citizen, Bank Employee, Corporate Client).
- Complete lifecycle management (`DRAFT` → `ACTIVE` → `SUSPENDED` → `RETIRED`).

External modules (such as the Fixed Deposit Account Opening Wizard and the FD Maturity Calculator) consume product data and pricing logic **exclusively via secure REST APIs**.

---

## 2. System Architecture & Component Design

The module adheres to a clean, layered, hexagonal-inspired architecture:

```
[ Client / Frontend (Angular) / Other Modules ]
                     │  (HTTP / JSON with Authorization: Bearer <JWT>)
                     ▼
       ┌─────────────────────────────┐
       │   JwtAuthenticationFilter   │  ◄── Validates signature, extracts roles
       └─────────────┬───────────────┘
                     ▼
       ┌─────────────────────────────┐
       │      ProductController      │  ◄── Enforces @PreAuthorize("hasRole(...)")
       └─────────────┬───────────────┘
                     ▼
       ┌─────────────────────────────┐
       │     ProductServiceImpl      │  ◄── Enforces 11 Business Rules & @Cacheable
       └─────────────┬───────────────┘
                     ▼
       ┌─────────────────────────────┐
       │      ProductRepository      │  ◄── Spring Data JPA & Dynamic Specifications
       └─────────────┬───────────────┘
                     ▼
       ┌─────────────────────────────┐
       │      MySQL / H2 Database    │  ◄── Normalized Relational Schema
       └─────────────────────────────┘
```

### Layer Responsibilities

1. **Security Layer (`com.bank.product.security`)**:
   - Intercepts all incoming requests before they reach the controller.
   - Extracts and verifies the JSON Web Token (JWT).
   - Establishes a stateless `SecurityContext` with granted authorities (`ROLE_ADMIN`, `ROLE_BANK_OFFICER`).
   - Returns HTTP error responses on authentication failure (`401`) or unauthorized access (`403`).

2. **Controller Layer (`com.bank.product.controller`)**:
   - Exposes RESTful endpoints conforming to HTTP standards.
   - Validates incoming request payloads via Bean Validation (`@Valid`, `@NotBlank`, `@Positive`).
   - Guards endpoints with role annotations (`@PreAuthorize`).
   - Defines OpenAPI / Swagger annotations for automated interactive API documentation.

3. **Service Layer (`com.bank.product.service.impl`)**:
   - Implements transactional business logic (`@Transactional`).
   - Enforces all 11 core banking business rules (ranges, dates, interest types, age checks).
   - Manages product read caching with automatic cache eviction on mutations.
   - Provides integration logic for the Fixed Deposit module (pre-validation, rate resolution, defaults).

4. **Data Access Layer (`com.bank.product.repository`)**:
   - Manages persistence using Spring Data JPA.
   - Supports dynamic, multi-predicate filtering via `ProductSpecifications` (by product type, date range, and status).
   - Supports pagination and sorting (`Pageable`, `Sort`).

---

## 3. Relational Data Model

The database schema is normalized to accommodate 1-to-many relationships for rules, charges, roles, and rate variations.

### Table Schema Breakdown

| Table Name | Primary Key | Foreign Key | Purpose |
|---|---|---|---|
| `products` | `product_id` (INT) | None | Core product definition, limits, dates, status, interest type, and audit columns |
| `product_business_rules` | `rule_id` (INT) | `product_id` → `products` | Term limits (`minTerm`, `maxTerm`) and interest rate bounds (`rateLimitMin`, `rateLimitMax`) |
| `product_charges` | `charge_id` (INT) | `product_id` → `products` | Fees and charges (interest credit, tax deduction, withdrawal fees, fee types) |
| `product_roles` | `role_id` (INT) | `product_id` → `products` | Permissible account holder roles (Owner, Co-owner, Nominee) |
| `product_rate_variations` | No declared primary key in schema.sql | `product_id` → `products` | Rate bonuses by customer category (`SENIOR_CITIZEN`, `EMPLOYEE`, `CORPORATE`) |
| `fd_calculations` | `calculation_id` (BIGINT) | None | Audit log of computed maturity calculations |

### Key Entity Columns in `products`
- `productCode`: Unique natural business key (e.g. `FD001`, `SAV001`, `LN001`). Indexed with a unique constraint.
- `productType`: Banking category (`FD`, `TD`, `CASA`, `SAVINGS`, `LOAN`).
- `currency`: ISO-4217 currency code (`INR`, `USD`).
- `effectiveDate` & `endDate`: Temporal validity boundaries.
- `status`: Enum (`DRAFT`, `ACTIVE`, `SUSPENDED`, `RETIRED`, `INACTIVE`).
- `interestType`: `CREDIT` for deposit/savings products; `DEBIT` for loans.
- `minAge`: Minimum customer age required to open an account against this product.
- `minDeposit` & `maxDeposit`: Permissible deposit bounds.

### Standardized Enterprise Audit Columns
To satisfy regulatory compliance and core banking audit traceability, the persistence layer captures an 11-column audit block:

| Audit Column | Data Type | Constraint / Default | Banking Purpose |
|---|---|---|---|
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | System record creation timestamp |
| `updated_at` | `TIMESTAMP` | `ON UPDATE CURRENT_TIMESTAMP` | Last modified timestamp |
| `ldbid` | `INT` | `DEFAULT 1` | Logical Database Identifier |
| `ooo_acpt_ts_utc_ofst` | `VARCHAR(6)` | `DEFAULT '+05:30'` | UTC offset of transaction acceptance timestamp |
| `ooo_user_id` | `VARCHAR(32)` | Extracted from JWT | Authenticated user / operator ID who executed transaction |
| `ooo_ws_id` | `VARCHAR(32)` | `DEFAULT 'DEFAULT'` | Workstation or terminal identifier |
| `rule_system_id` | `VARCHAR(32)` | `DEFAULT 'RULES_SYS'` | Enterprise business rules engine version identifier |
| `uuid` | `VARCHAR(36)` | Unique UUIDv4 | Globally unique transaction/record identifier |
| `ooo_acpt_ts` | `DATETIME(6)` | High precision ts | Central acceptance timestamp |
| `ooo_host_ts` | `DATETIME(6)` | High precision ts | Host application server timestamp |
| `ooo_local_ts` | `DATETIME(6)` | High precision ts | Local workstation/branch timestamp |

---

## 4. Security & Role-Based Authorization (Lab L9)

### 4.1 Stateless Authentication
The backend does not maintain server-side HTTP sessions (`SessionCreationPolicy.STATELESS`). Protected requests supply credentials in the HTTP header:
```http
Authorization: Bearer <eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...>
```

### 4.2 Role Segregation

ADMIN and BANK_OFFICER can create, update and retire products. Only ADMIN can permanently delete a product (`DELETE /api/product/{code}/permanent`). CUSTOMER can search, read, validate, calculate rates and read defaults. The active-products endpoint is public. The embedded legacy `/api/fd/**` calculator requires authentication but has no additional controller role restriction. The same product permissions apply to `/api/v1/products` aliases.

### 4.3 Audit Logging
When an Admin creates a product or a Bank Officer updates one, `Product.java` intercepts the persistence lifecycle via `@PrePersist` and `@PreUpdate`:
```java
Authentication auth = SecurityContextHolder.getContext().getAuthentication();
String currentUser = auth.getName(); // Injected directly into ooo_user_id and updated_by
```

---

## 5. Core Business Rules (Service Layer)

The service layer rigorously enforces **11 distinct business rules**:

1. **Unique Product Code**: Duplicate product codes are blocked before persistence and backed by a database unique constraint, returning `409 Conflict`.
2. **Positive Term Limits**: `minTerm <= maxTerm`, both strictly greater than 0 months.
3. **Non-Negative Rate Range**: `minRate <= maxRate`, both non-negative (`>= 0.0%`).
4. **Deposit & Withdrawal Bounds**: `minDeposit <= maxDeposit` and `minWithdrawal <= maxWithdrawal`.
5. **Effective Date Validity**: `effectiveDate` cannot be set after `endDate`.
6. **Interest Type Alignment**: Deposits (`FD`, `SAVINGS`) must have interest type `CREDIT`. Loans must have `DEBIT`. Mismatches are rejected with `400 Bad Request`.
7. **Minimum Age Eligibility**: Customer age is evaluated against the product's `minAge` requirement.
8. **Active Status & Effective Date Check**: Accounts can only be created against products that are in `ACTIVE` status and whose current date falls within `[effectiveDate, endDate]`. Violations throw `422 Unprocessable Entity` (`PRODUCT_INACTIVE`).
9. **Lifecycle Management**: Normal DELETE retires a product. The separate ADMIN-only `/permanent` endpoint hard-deletes it.
10. **Contract Integrity on Updates**: Updates are constrained to prevent breaking existing active accounts (e.g. rate limits remain within valid bounds).
11. **Account Defaulting**: The system provides canonical defaults (default term, default amount, charges, roles) to ensure consistent account instantiation.

---

## 6. FD Module Integration APIs (Lab L13)

The Fixed Deposit (FD) module integrates with the Product module through four specialized endpoints:

### 6.1 Product Validation (`GET /api/product/{productCode}/validate`)
- **Query Parameters**: `termMonths`, `amount`, `age`.
- **Logic**:
  1. Verifies that the product exists.
  2. Ensures product status is `ACTIVE` and current date is within validity boundaries.
  3. Verifies that `termMonths` falls within `[minTerm, maxTerm]`.
  4. Verifies that `amount` falls within `[minDeposit, maxDeposit]`.
  5. Verifies that applicant `age >= minAge`.
- **Response (`200 OK`)**:
```json
{
  "valid": true,
  "productCode": "FD001",
  "productName": "Fixed Deposit - Short Term",
  "status": "ACTIVE",
  "message": "Product configuration and criteria validated successfully for account creation",
  "termMonths": 12,
  "amount": 50000.0,
  "age": 30,
  "minTerm": 3,
  "maxTerm": 36,
  "minDeposit": 5000.0,
  "maxDeposit": 10000000.0,
  "minAge": 18
}
```

### 6.2 Rate Determination (`POST /api/product/{productCode}/rate`)
- **Request Body**: `{ "termMonths": 12, "customerCategory": "SENIOR_CITIZEN", "age": 65 }`
- **Logic**:
  1. Resolves product base interest rate.
  2. Auto-detects `SENIOR_CITIZEN` if customer `age >= 60`.
  3. Looks up rate modifier in `product_rate_variations` (e.g. `+1.0%` for Senior Citizens, `+0.5%` for Employees).
  4. Computes `effectiveRate = baseRate + modifier`.
  5. **Clamps** the final rate so it never exceeds `maxRate` or drops below `minRate`.
- **Response (`200 OK`)**:
```json
{
  "productCode": "FD001",
  "productName": "Fixed Deposit - Short Term",
  "termMonths": 12,
  "customerCategory": "SENIOR_CITIZEN",
  "baseRate": 5.5,
  "rateModifier": 1.0,
  "finalRate": 6.5,
  "minRateLimit": 5.5,
  "maxRateLimit": 7.5
}
```

### 6.3 Active Products Dropdown (`GET /api/product/active?type=FD`)
- Returns all currently active products matching the requested type to populate frontend dropdown menus.

### 6.4 Account Defaults (`GET /api/product/{productCode}/defaults`)
- Returns pre-configured defaults (default term of 12 months, default deposit amount, allowed roles like `OWNER` / `NOMINEE`) to auto-populate the account creation form.

---

## 7. Standardized Error Handling

Controller business errors are caught by [`GlobalExceptionHandler`](src/main/java/com/bank/product/exception/GlobalExceptionHandler.java) and converted to a uniform JSON body:

```json
{
  "timestamp": "2026-10-06T23:45:00",
  "status": 409,
  "errorCode": "DUPLICATE_PRODUCT",
  "message": "Product with code FD001 already exists",
  "path": "/api/product"
}
```

### Status Code Mapping

| Status Code | Error Code | Common Cause |
|---|---|---|
| `400 Bad Request` | `VALIDATION_FAILED` | Missing mandatory fields, blank strings, invalid formats |
| `400 Bad Request` | `INVALID_PRODUCT` | Range rule violation (`min > max`, applicant underage, term out of range) |
| `401 Unauthorized` | `UNAUTHORIZED` | Missing, expired, or malformed JWT Bearer token |
| `403 Forbidden` | `FORBIDDEN` | Valid token provided, but user lacks required role (e.g. Officer calling Admin endpoint) |
| `404 Not Found` | `PRODUCT_NOT_FOUND` | Specified `productCode` does not exist |
| `409 Conflict` | `DUPLICATE_PRODUCT` | Attempt to register an existing `productCode` |
| `422 Unprocessable`| `PRODUCT_INACTIVE` | Attempting to validate or create accounts on `INACTIVE`, `SUSPENDED`, or expired products |

---

## 8. Verification & Test Suite

The following list records historical test coverage; counts and results must be checked against the current test run:

1. **`ProductEndToEndIntegrationTest`** (4 tests):
   - Real Spring Boot application test without mocks.
   - Tests end-to-end HTTP calls against an in-memory database using real JWT tokens issued by `http://localhost:8090/api/auth/login`.
   - Verifies the complete lifecycle: Admin creates product → Officer updates → FD module validates → Rate calculates with modifier → Admin retires → Retired product rejected.
2. **`ProductSecurityTest`** (6 tests):
   - Verifies security filters: 401 on missing token, 403 on invalid role, 403 on role escalation, 201 on Admin creation, 200 on Officer read.
3. **`ProductControllerTest`** (10 tests):
   - WebMvc layer slice test verifying HTTP contracts, JSON payloads, and validation error messages.
4. **`ProductServiceTest`** (16 tests):
   - Service unit tests verifying all 11 business rules, rate clamping, and calculations.
5. **`FdCalculatorServiceTest`** (7 tests):
   - Regression suite verifying that FD maturity calculations and compound interest formulas continue functioning seamlessly.
6. **`OpenApiExportTest`** (1 test):
   - Boots context and exports [`openapi.json`](openapi.json).

---

## 9. Deliverables & Integration Artifacts

- **Backend Folder**: [current directory](.)
- **OpenAPI 3.0 Specification**: [`openapi.json`](openapi.json)
- **Postman Collection**: [`postman_collection.json`](postman_collection.json)
- **Automated Smoke Test Script**: [`smoke_test_endpoints.sh`](smoke_test_endpoints.sh)
- **Database Scripts**: [`schema.sql`](schema.sql) and [`insert_dummy_data.sql`](insert_dummy_data.sql)
