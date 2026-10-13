# Frontend API Documentation

## Overview

This document provides comprehensive API endpoint documentation for building the frontend for the Banking Technology Lab microservices architecture. The system consists of two main backend services:

- **FD Calculator Service** (Port 8084) - Fixed Deposit maturity calculations and comparisons
- **Product & Pricing Service** (Port 8080) - Banking product management and rate calculations

## Authentication

All API endpoints require JWT authentication with the `Bearer` scheme. The token should be included in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

### Required Roles

- **CUSTOMER** - For FD Calculator endpoints
- **BANK_OFFICER** - For Product Service read/write operations
- **ADMIN** - For Product Service admin operations (retire products)

---

## FD Calculator Service API

**Base URL:** `http://localhost:8084`
**API Prefix:** `/api/v1/fd`
**Swagger UI:** `http://localhost:8084/swagger-ui/index.html`

### Endpoints

#### 1. Calculate FD Maturity Estimate

**Endpoint:** `POST /api/v1/fd/calculations`

**Description:** Calculates a simulation-only FD maturity estimate for the authenticated customer. Rates and customer categories are fetched from authoritative internal services.

**Request Body:**
```json
{
  "principal": 100000.00,
  "term": {
    "value": 12,
    "unit": "MONTHS"
  },
  "productCode": "FD001",
  "payoutMode": "CUMULATIVE",
  "startDate": "2026-10-08"
}
```

**Request Fields:**
- `principal` (BigDecimal, required) - Principal amount in INR (must be > 0)
- `term` (TermDto, required) - FD term with value and unit
  - `value` (Integer) - Numeric term value
  - `unit` (Enum) - Unit: DAYS, MONTHS, YEARS
- `productCode` (String, required) - Product code identifying the FD product
- `payoutMode` (Enum, optional) - CUMULATIVE (default) or PERIODIC
- `startDate` (LocalDate, optional) - FD start date (defaults to current date)

**Response (CalculationResponse):**
```json
{
  "calculationId": "CALC-20260911-0001",
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "productCode": "FD001",
  "productName": "Fixed Deposit - Short Term",
  "principal": 100000.00,
  "term": {
    "value": 12,
    "unit": "MONTHS"
  },
  "payoutMode": "CUMULATIVE",
  "startDate": "2026-10-08",
  "estimatedMaturityDate": "2027-10-08",
  "interestType": "COMPOUND",
  "compoundingFrequency": "MONTHLY",
  "baseRate": 6.50,
  "categoryBenefits": [],
  "requestedTotalBonus": 1.00,
  "appliedTotalBonus": 1.00,
  "bonusCap": 2.00,
  "effectiveRate": 7.50,
  "apy": 7.76,
  "rateCapped": false,
  "interestEarned": 7778.00,
  "maturityAmount": 107778.00,
  "periodicPayoutAmount": null,
  "currency": "INR",
  "calculationExplanation": "Your FD of ₹100,000 for 12 months at 7.50% will mature to ₹107,778",
  "generatedAt": "2026-10-08T12:00:00Z"
}
```

**Response Fields:**
- `calculationId` - Business key identifier (e.g., CALC-20260911-0001)
- `uuid` - Persistent unique audit record identifier
- `productCode` - FD product code
- `productName` - FD product display name
- `principal` - Principal amount in INR
- `term` - Term as submitted in the request
- `payoutMode` - Payout mode used (CUMULATIVE or PERIODIC)
- `startDate` - Start date used for calculation
- `estimatedMaturityDate` - Estimated maturity date
- `interestType` - Interest calculation method (SIMPLE or COMPOUND)
- `compoundingFrequency` - Compounding frequency (applicable for COMPOUND)
- `baseRate` - Product base rate (%)
- `categoryBenefits` - Category benefits applied
- `requestedTotalBonus` - Sum of all requested category bonuses (%)
- `appliedTotalBonus` - Total bonus actually applied after cap enforcement (%)
- `bonusCap` - Maximum combined bonus allowed (%)
- `effectiveRate` - Effective rate used in calculation (%)
- `apy` - Annual Percentage Yield (%)
- `rateCapped` - True if the effective rate was capped at product maximum
- `interestEarned` - Estimated total interest earned (INR)
- `maturityAmount` - Estimated maturity amount (INR)
- `periodicPayoutAmount` - Periodic payout installment amount (INR) if payoutMode is PERIODIC
- `currency` - Currency code (INR)
- `calculationExplanation` - Human-readable explanation of the calculation
- `generatedAt` - Timestamp when this estimate was generated

---

#### 2. Compare FD Maturity Across Products

**Endpoint:** `POST /api/v1/fd/calculations/compare`

**Description:** Accepts one principal and 2–3 product/term options. Returns results ordered by maturity amount descending.

**Request Body:**
```json
{
  "principal": 100000.00,
  "options": [
    {
      "productCode": "FD001",
      "term": {
        "value": 12,
        "unit": "MONTHS"
      }
    },
    {
      "productCode": "FD002",
      "term": {
        "value": 24,
        "unit": "MONTHS"
      }
    }
  ]
}
```

**Request Fields:**
- `principal` (BigDecimal, required) - Principal amount in INR
- `options` (List<ComparisonOptionDto>, required) - 2 to 3 product/term options to compare
  - `productCode` (String) - Product code
  - `term` (TermDto) - Term with value and unit

**Response (ComparisonResponse):**
```json
{
  "principal": 100000.00,
  "comparisons": [
    {
      "productCode": "FD002",
      "productName": "Fixed Deposit - Long Term",
      "term": {
        "value": 24,
        "unit": "MONTHS"
      },
      "maturityAmount": 115500.00,
      "effectiveRate": 7.50,
      "apy": 7.76
    },
    {
      "productCode": "FD001",
      "productName": "Fixed Deposit - Short Term",
      "term": {
        "value": 12,
        "unit": "MONTHS"
      },
      "maturityAmount": 107778.00,
      "effectiveRate": 7.50,
      "apy": 7.76
    }
  ]
}
```

---

#### 3. Retrieve Saved Calculation

**Endpoint:** `GET /api/v1/fd/calculations/{calculationId}`

**Description:** Returns the saved simulation result. Enforces ownership — a customer can only retrieve their own calculations.

**Path Parameters:**
- `calculationId` (String) - Calculation ID, e.g., CALC-20260911-0001

**Response:** Same as CalculationResponse (see endpoint 1)

---

#### 4. Retrieve Calculation by UUID

**Endpoint:** `GET /api/v1/fd/calculations/uuid/{uuid}`

**Description:** Returns the saved simulation result by persistent UUID. Enforces ownership.

**Path Parameters:**
- `uuid` (String) - Persistent calculation UUID

**Response:** Same as CalculationResponse (see endpoint 1)

---

#### 5. Evict Cached Product Rates

**Endpoint:** `POST /api/v1/fd/cache/rates/evict`

**Description:** Invalidates cached product rate configuration. Called on customer logout or administrative refresh.

**Response:** 200 OK (no body)

---

#### 6. Export Calculation as CSV

**Endpoint:** `GET /api/v1/fd/calculations/{calculationId}/export`

**Description:** Downloads the calculation as a CSV file. Only the owning customer may export their calculation.

**Path Parameters:**
- `calculationId` (String) - Calculation ID

**Query Parameters:**
- `format` (String, default: "csv") - Export format (currently only 'csv' is supported)

**Response:** CSV file with Content-Disposition header

---

#### 7. Get Calculation Explanation

**Endpoint:** `POST /api/v1/fd/calculations/{calculationId}/explain`

**Description:** Returns a deterministic template-based plain-language explanation of the stored calculation.

**Path Parameters:**
- `calculationId` (String) - Calculation ID

**Response:** Plain text explanation string

---

#### 8. Preview Product Constraints

**Endpoint:** `GET /api/v1/fd/products/{productCode}/preview`

**Description:** Returns calculator-safe product constraints (min/max principal, term, base rate, interest type).

**Path Parameters:**
- `productCode` (String) - FD product code

**Response (ProductPreviewResponse):**
```json
{
  "productCode": "FD001",
  "productName": "Fixed Deposit - Short Term",
  "currency": "INR",
  "minPrincipal": 1000.00,
  "maxPrincipal": 10000000.00,
  "minTermMonths": 3,
  "maxTermMonths": 36,
  "baseRate": 6.50,
  "maxRate": 7.50,
  "interestType": "COMPOUND",
  "compoundingFrequency": "MONTHLY",
  "supportsPeriodicPayout": true
}
```

---

#### 9. Batch FD Calculations

**Endpoint:** `POST /api/v1/fd/batch/calculations`

**Description:** Processes multiple FD calculation requests in a single call. Results are sent to Kafka for logging.

**Request Body (BatchCalculationRequest):**
```json
{
  "correlationId": "batch-123",
  "calculations": [
    {
      "principal": 100000.00,
      "term": {
        "value": 12,
        "unit": "MONTHS"
      },
      "productCode": "FD001",
      "payoutMode": "CUMULATIVE"
    },
    {
      "principal": 50000.00,
      "term": {
        "value": 24,
        "unit": "MONTHS"
      },
      "productCode": "FD002",
      "payoutMode": "CUMULATIVE"
    }
  ]
}
```

**Response (BatchCalculationResponse):**
```json
{
  "correlationId": "batch-123",
  "totalCalculations": 2,
  "successfulCalculations": 2,
  "failedCalculations": 0,
  "results": [
    // Array of CalculationResponse objects
  ],
  "status": "COMPLETED",
  "message": "All calculations completed successfully"
}
```

---

## Product & Pricing Service API

**Base URL:** `http://localhost:8080`
**API Prefix:** `/api/v1/products`
**Swagger UI:** `http://localhost:8080/swagger-ui/index.html`

### Endpoints

#### 1. Create Banking Product

**Endpoint:** `POST /api/v1/products`

**Description:** Requires BANK_OFFICER or ADMIN role. Creates a banking product with term, rate, charges, allowed roles and variations.

**Request Body (ProductRequestDTO):**
```json
{
  "productCode": "FD001",
  "productName": "Fixed Deposit - Short Term",
  "productType": "FD",
  "currency": "INR",
  "effectiveDate": "2026-01-01",
  "endDate": null,
  "termLimit": {
    "min": 3,
    "max": 36
  },
  "rateLimit": {
    "min": 5.00,
    "max": 8.00
  },
  "status": "ACTIVE",
  "interestType": "CREDIT",
  "minAge": 18,
  "minDeposit": 1000.00,
  "maxDeposit": 10000000.00,
  "minWithdrawal": 0.00,
  "maxWithdrawal": 0.00,
  "allowedTransactionTypes": "DEPOSIT,WITHDRAWAL",
  "balanceTypes": "SAVINGS",
  "charges": {
    "interestCreditFrequency": "ON_MATURITY",
    "taxDeduction": true,
    "withdrawalFees": 0.00
  },
  "allowedRoles": ["CUSTOMER", "SENIOR_CITIZEN"],
  "rateVariations": [
    {
      "customerCategory": "SENIOR_CITIZEN",
      "rateModifier": 1.00
    }
  ]
}
```

**Request Fields:**
- `productCode` (String, required) - Unique product code (max 50 chars)
- `productName` (String, required) - Product name (max 100 chars)
- `productType` (String, required) - Product type (max 20 chars): FD, SAVINGS, LOAN
- `currency` (String, required) - Currency code (max 10 chars)
- `effectiveDate` (LocalDate, required) - Product effective date
- `endDate` (LocalDate, optional) - Product end date
- `termLimit` (TermLimitDTO, optional) - Term limits
  - `min` (Integer) - Minimum term in months
  - `max` (Integer) - Maximum term in months
- `rateLimit` (RateLimitDTO, optional) - Rate limits
  - `min` (BigDecimal) - Minimum rate (%)
  - `max` (BigDecimal) - Maximum rate (%)
- `status` (String, required) - Status: ACTIVE, INACTIVE, DRAFT, SUSPENDED, RETIRED
- `interestType` (String, optional) - Interest type: CREDIT or DEBIT
- `minAge` (Integer, optional) - Minimum age requirement
- `minDeposit` (BigDecimal, optional) - Minimum deposit amount
- `maxDeposit` (BigDecimal, optional) - Maximum deposit amount
- `minWithdrawal` (BigDecimal, optional) - Minimum withdrawal amount
- `maxWithdrawal` (BigDecimal, optional) - Maximum withdrawal amount
- `allowedTransactionTypes` (String, optional) - Allowed transaction types
- `balanceTypes` (String, optional) - Balance types
- `charges` (ChargesDTO, optional) - Product charges
  - `interestCreditFrequency` (String) - Interest credit frequency
  - `taxDeduction` (Boolean) - Tax deduction flag
  - `withdrawalFees` (BigDecimal) - Withdrawal fees
- `allowedRoles` (List<String>, optional) - Allowed customer roles
- `rateVariations` (List<RateVariationDTO>, optional) - Rate variations by category
  - `customerCategory` (String) - Customer category
  - `rateModifier` (BigDecimal) - Rate modifier (%)

**Response (ProductResponseDTO):**
```json
{
  "productId": 1,
  "productCode": "FD001",
  "productName": "Fixed Deposit - Short Term",
  "productType": "FD",
  "currency": "INR",
  "effectiveDate": "2026-01-01",
  "endDate": null,
  "termLimit": {
    "min": 3,
    "max": 36
  },
  "rateLimit": {
    "min": 5.00,
    "max": 8.00
  },
  "status": "ACTIVE",
  "interestType": "CREDIT",
  "minAge": 18,
  "minDeposit": 1000.00,
  "maxDeposit": 10000000.00,
  "minWithdrawal": 0.00,
  "maxWithdrawal": 0.00,
  "allowedTransactionTypes": "DEPOSIT,WITHDRAWAL",
  "balanceTypes": "SAVINGS",
  "charges": {
    "interestCreditFrequency": "ON_MATURITY",
    "taxDeduction": true,
    "withdrawalFees": 0.00
  },
  "allowedRoles": ["CUSTOMER", "SENIOR_CITIZEN"],
  "rateVariations": [
    {
      "customerCategory": "SENIOR_CITIZEN",
      "rateModifier": 1.00
    }
  ],
  "createdBy": "admin",
  "updatedBy": "admin",
  "createdAt": "2026-01-01T10:00:00",
  "updatedAt": "2026-01-01T10:00:00"
}
```

**Response Code:** 201 Created

---

#### 2. Update Banking Product

**Endpoint:** `PUT /api/v1/products/{productCode}`

**Description:** Requires BANK_OFFICER or ADMIN role. Updates product specifications.

**Path Parameters:**
- `productCode` (String) - Unique code of the product to update

**Request Body:** Same as ProductRequestDTO (see endpoint 1)

**Response:** Same as ProductResponseDTO (see endpoint 1)

**Response Code:** 200 OK

---

#### 3. Retire Product

**Endpoint:** `DELETE /api/v1/products/{productCode}`

**Description:** Requires ADMIN role. Transitions product lifecycle status to RETIRED without hard-deleting.

**Path Parameters:**
- `productCode` (String) - Unique code of the product to retire

**Response:** Same as ProductResponseDTO (see endpoint 1)

**Response Code:** 200 OK

---

#### 4. Search Products

**Endpoint:** `GET /api/v1/products/search`

**Description:** Requires BANK_OFFICER or ADMIN role. Retrieves products filtered by product type, status, and effective date range with pagination.

**Query Parameters:**
- `productType` (String, optional) - Type of product (e.g., FD, SAVINGS, LOAN)
- `startDate` (LocalDate, optional) - Start effective date for filtering (yyyy-MM-dd)
- `endDate` (LocalDate, optional) - End effective date for filtering (yyyy-MM-dd)
- `status` (String, optional) - Status of product (ACTIVE, INACTIVE, DRAFT, SUSPENDED, RETIRED)
- `page` (Integer, default: 0) - Zero-based page index
- `size` (Integer, default: 50) - Page size
- `sortBy` (String, default: "productId") - Sort by field

**Response:** Array of ProductResponseDTO objects

---

#### 5. List Active Products

**Endpoint:** `GET /api/v1/products/active`

**Description:** Feeds the FD creation form's product dropdown by product type.

**Query Parameters:**
- `type` (String, optional) - Filter by product type (e.g., FD)

**Response:** Array of ProductResponseDTO objects

---

#### 6. Get Product by Code

**Endpoint:** `GET /api/v1/products/{productCode}`

**Description:** Requires BANK_OFFICER or ADMIN role. Retrieves complete specifications of a banking product.

**Path Parameters:**
- `productCode` (String) - Unique code of the product to fetch

**Response:** Same as ProductResponseDTO (see endpoint 1)

---

#### 7. Validate Product Configuration

**Endpoint:** `GET /api/v1/products/{productCode}/validate`

**Description:** Validates that product exists, is ACTIVE, within effective dates, and conforms to term, deposit amount, and minimum age limits.

**Path Parameters:**
- `productCode` (String) - Unique product code

**Query Parameters:**
- `termMonths` (Integer, optional) - Requested FD term in months
- `amount` (Double, optional) - Requested deposit amount
- `age` (Integer, optional) - Customer age in years

**Response (ProductValidationResponseDTO):**
```json
{
  "valid": true,
  "productCode": "FD001",
  "productName": "Fixed Deposit - Short Term",
  "status": "ACTIVE",
  "message": "Product configuration and criteria validated successfully for account creation",
  "effectiveDate": "2026-01-01",
  "termMonths": 12,
  "amount": 100000.00,
  "age": 30,
  "minTerm": 3,
  "maxTerm": 36,
  "minDeposit": 1000.00,
  "maxDeposit": 10000000.00,
  "minAge": 18
}
```

---

#### 8. Calculate Final Interest Rate

**Endpoint:** `POST /api/v1/products/{productCode}/rate`

**Description:** Calculates base rate for term plus category adjustment (Senior Citizen, Employee), clamped within product min/max rate.

**Path Parameters:**
- `productCode` (String) - Unique product code

**Request Body (RateCalculationRequestDTO):**
```json
{
  "termMonths": 12,
  "customerCategory": "SENIOR_CITIZEN",
  "age": 65
}
```

**Request Fields:**
- `termMonths` (Integer) - Term in months
- `customerCategory` (String) - Customer category (e.g., GENERAL, SENIOR_CITIZEN, EMPLOYEE, CORPORATE)
- `age` (Integer) - Customer age (auto-detects SENIOR_CITIZEN if age >= 60 and category is GENERAL)

**Response (RateCalculationResponseDTO):**
```json
{
  "productCode": "FD001",
  "productName": "Fixed Deposit - Short Term",
  "termMonths": 12,
  "customerCategory": "SENIOR_CITIZEN",
  "baseRate": 6.50,
  "rateModifier": 1.00,
  "finalRate": 7.50,
  "minRateLimit": 5.00,
  "maxRateLimit": 8.00
}
```

---

#### 9. Get Product Defaults

**Endpoint:** `GET /api/v1/products/{productCode}/defaults`

**Description:** Provides default values to copy onto an account (term, amount, charges, roles).

**Path Parameters:**
- `productCode` (String) - Unique product code

**Response (ProductDefaultsResponseDTO):**
```json
{
  "productCode": "FD001",
  "productName": "Fixed Deposit - Short Term",
  "productType": "FD",
  "currency": "INR",
  "defaultTermMonths": 12,
  "minTermMonths": 3,
  "maxTermMonths": 36,
  "defaultAmount": 10000.00,
  "minDeposit": 1000.00,
  "maxDeposit": 10000000.00,
  "defaultRate": 6.50,
  "minRate": 5.00,
  "maxRate": 8.00,
  "interestType": "CREDIT",
  "charges": {
    "interestCreditFrequency": "ON_MATURITY",
    "taxDeduction": true,
    "withdrawalFees": 0.00
  },
  "allowedRoles": ["CUSTOMER", "SENIOR_CITIZEN"],
  "rateVariations": [
    {
      "customerCategory": "SENIOR_CITIZEN",
      "rateModifier": 1.00
    }
  ]
}
```

---

#### 10. Internal Calculator Config

**Endpoint:** `GET /api/v1/products/internal/products/{productCode}/calculator-config`

**Description:** Internal endpoint for FD Calculator service to fetch product configuration. Requires valid JWT for service-to-service communication.

**Path Parameters:**
- `productCode` (String) - Unique product code

**Response (CalculatorConfigDTO):**
```json
{
  "productCode": "FD001",
  "productName": "Fixed Deposit - Short Term",
  "productType": "FD",
  "status": "ACTIVE",
  "currency": "INR",
  "minPrincipal": 1000.00,
  "maxPrincipal": 10000000.00,
  "termLimit": {
    "minMonths": 3,
    "maxMonths": 36
  },
  "rateLimit": {
    "minRate": 5.00,
    "maxRate": 8.00
  },
  "baseRate": 6.50,
  "interestType": "CREDIT",
  "compoundingFrequency": "MONTHLY",
  "supportsPeriodicPayout": true
}
```

---

#### 11. Batch Create Products

**Endpoint:** `POST /api/v1/products/batch`

**Description:** Requires BANK_OFFICER or ADMIN role. Creates multiple products in a single request with Kafka-based logging.

**Request Body (BatchProductRequest):**
```json
{
  "correlationId": "batch-123",
  "products": [
    // Array of ProductRequestDTO objects
  ]
}
```

**Response (BatchProductResponse):**
```json
{
  "correlationId": "batch-123",
  "totalProducts": 2,
  "successfulProducts": 2,
  "failedProducts": 0,
  "results": [
    // Array of ProductResponseDTO objects
  ],
  "status": "COMPLETED",
  "message": "All products created successfully"
}
```

---

## Common Response Codes

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **400 Bad Request** - Malformed request or validation error
- **401 Unauthorized** - Missing or invalid JWT
- **403 Forbidden** - Authenticated user lacks required role
- **404 Not Found** - Resource not found
- **409 Conflict** - Duplicate resource (e.g., duplicate product code)
- **422 Unprocessable Entity** - Invalid business logic (e.g., inactive product, term out of range)
- **503 Service Unavailable** - Dependency service unavailable

---

## Error Response Format

```json
{
  "timestamp": "2026-10-08T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Principal must be greater than zero",
  "path": "/api/v1/fd/calculations"
}
```

---

## Data Types

### Monetary Values
All monetary values use `BigDecimal` with scale 2 for currency amounts and scale 2-6 for rates.

### Dates
- `LocalDate` - For dates without time (e.g., effectiveDate, startDate)
- `LocalDateTime` - For timestamps with time (e.g., createdAt, updatedAt)
- `Instant` - For UTC timestamps (e.g., generatedAt)

### Enums

**PayoutMode:**
- `CUMULATIVE` - Interest paid at maturity
- `PERIODIC` - Interest paid periodically

**Term Unit:**
- `DAYS`
- `MONTHS`
- `YEARS`

**InterestType:**
- `SIMPLE` - Simple interest
- `COMPOUND` - Compound interest

**CompoundingFrequency:**
- `DAILY`
- `MONTHLY`
- `QUARTERLY`
- `YEARLY`

**Product Status:**
- `ACTIVE`
- `INACTIVE`
- `DRAFT`
- `SUSPENDED`
- `RETIRED`

**Customer Categories:**
- `GENERAL`
- `SENIOR_CITIZEN`
- `EMPLOYEE`
- `CORPORATE`

---

## Frontend Implementation Notes

### JWT Token Management
- Store JWT token in secure storage (httpOnly cookie or secure localStorage)
- Include token in Authorization header for all API calls
- Handle token expiration and refresh

### Form Validation
- Implement client-side validation matching server-side constraints
- Display validation errors from API responses
- Use appropriate input types (number, date, select)

### Loading States
- Show loading indicators during API calls
- Handle long-running operations (batch calculations)
- Provide feedback for successful/failed operations

### Error Handling
- Display user-friendly error messages
- Handle network errors gracefully
- Implement retry logic for transient failures

### Pagination
- Implement pagination for search endpoints
- Allow sorting by different fields
- Maintain query parameters in URL

### File Downloads
- Handle CSV export with proper filename
- Use blob response type for file downloads
- Trigger browser download programmatically

### Real-time Updates
- Consider WebSocket for real-time calculation updates (future enhancement)
- Use polling for batch operation status if needed

---

## Environment Variables

### FD Calculator Service
- `DB_URL` - Database connection URL
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT secret key
- `JWT_ISSUER_URI` - JWT issuer URI (default: http://localhost:8081)
- `PRODUCT_SERVICE_URL` - Product Service URL (default: http://localhost:8083)
- `CUSTOMER_SERVICE_URL` - Customer Service URL (default: http://localhost:8082)
- `KAFKA_BOOTSTRAP_SERVERS` - Kafka bootstrap servers (default: localhost:9092)

### Product & Pricing Service
- `DB_URL` - Database connection URL
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT secret key
- `JWT_ISSUER_URI` - JWT issuer URI (default: http://localhost:8081)
- `KAFKA_BOOTSTRAP_SERVERS` - Kafka bootstrap servers (default: localhost:9092)

---

## CORS Configuration

Both services have CORS configured for development:
- Allowed origins: http://localhost:4200, http://127.0.0.1:4200

In production, CORS should be handled by an API Gateway.
