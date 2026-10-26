# Postman and curl Guide - Banking Technology Lab API

## Overview

This is a Markdown request guide, not an importable Postman JSON collection. Example response values depend on seed data and business date; common error bodies are illustrative and vary by service. Use returned IDs in later requests.

This document contains example API requests for the Banking Technology Lab microservices system, organized by service. Each endpoint includes its purpose, HTTP method, URL, request body (if applicable), and example curl command.

## System Architecture

The root Docker stack starts six backend services; statement-service is a separate module:

1. **Auth Service** (Port 8090) - JWT authentication and user management
2. **Product & Pricing Service** (Port 8080) - Product catalog and rate management
3. **FD Calculator Service** (Port 8084) - FD maturity calculations
4. **FD Account Service** (Port 8086) - FD account lifecycle management
5. **Notification Service** (Port 8083) - Email/WhatsApp
6. **Interest Batch Service** (Port 8081) - Interest commands
7. **Statement Service** (Port 8082, started separately) - Statements

The Angular frontend runs on port 4200.

## Authentication

Protected endpoints require JWT authentication. Health, public auth routes, the active-product feed are public; the embedded Product-service legacy calculator requires authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Test Users

Create users via signup endpoint. Default roles:
- **Signup creates:** CUSTOMER role
- **Staff accounts:** Created via seed data or admin operations

---

## Auth Service (Port 8090)

### 1. Health Check

**Purpose:** Check if Auth Service is running

**Method:** GET  
**URL:** `http://localhost:8090/health`  
**Auth:** None

**Curl:**
```bash
curl http://localhost:8090/health
```

**Response:**
```json
{
  "status": "UP",
  "service": "auth-service"
}
```

---

### 2. User Signup

**Purpose:** Create a new user account

**Method:** POST  
**URL:** `http://localhost:8090/api/auth/signup`  
**Auth:** None

**Request Body:**
```json
{
  "username": "string (max 100 chars)",
  "password": "string (8-200 chars)",
  "email": "string (max 255 chars)"
}
```

**Curl:**
```bash
curl -X POST http://localhost:8090/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",
    "email": "test@example.com"
  }'
```

**Response (201 Created):**
```json
{
  "accessToken": "eyJhbGciOiJIUzM4NCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3599,
  "refreshToken": "uuid-string",
  "username": "testuser",
  "roles": ["CUSTOMER"]
}
```

---

### 3. User Login

**Purpose:** Authenticate user and get JWT token

**Method:** POST  
**URL:** `http://localhost:8090/api/auth/login`  
**Auth:** None

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Curl:**
```bash
curl -X POST http://localhost:8090/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzM4NCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3599,
  "refreshToken": "uuid-string",
  "username": "testuser",
  "roles": ["CUSTOMER"]
}
```

---

### 4. Refresh Token

**Purpose:** Get a new access token using refresh token

**Method:** POST  
**URL:** `http://localhost:8090/api/auth/refresh`  
**Auth:** None

**Request Body:**
```json
{
  "refreshToken": "uuid-string"
}
```

**Curl:**
```bash
curl -X POST http://localhost:8090/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your-refresh-token-uuid"
  }'
```

**Response (200 OK):**
```json
{
  "accessToken": "new-jwt-token",
  "tokenType": "Bearer",
  "expiresIn": 3599,
  "refreshToken": "new-refresh-token-uuid",
  "username": "testuser",
  "roles": ["CUSTOMER"]
}
```

---

### 5. Logout

**Purpose:** Invalidate refresh token

**Method:** POST  
**URL:** `http://localhost:8090/api/auth/logout`  
**Auth:** None

**Request Body:**
```json
{
  "refreshToken": "uuid-string"
}
```

**Curl:**
```bash
curl -X POST http://localhost:8090/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your-refresh-token-uuid"
  }'
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

---

## Product & Pricing Service (Port 8080)

### 1. Health Check

**Purpose:** Check if Product Service is running

**Method:** GET  
**URL:** `http://localhost:8080/actuator/health`  
**Auth:** None

**Curl:**
```bash
curl http://localhost:8080/actuator/health
```

**Response:**
```json
{
  "status": "UP"
}
```

---

### 2. Get Active Products

**Purpose:** Retrieve all active products

**Method:** GET  
**URL:** `http://localhost:8080/api/v1/products/active`  
**Auth:** Required (BANK_OFFICER or ADMIN)

**Query Params:**
- `type` (optional) - Filter by product type (e.g., "FD")

**Curl:**
```bash
curl http://localhost:8080/api/v1/products/active \
  -H "Authorization: Bearer <your-jwt-token>"

# With type filter
curl http://localhost:8080/api/v1/products/active?type=FD \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
[
  {
    "productId": 1,
    "productCode": "FD001",
    "productName": "Fixed Deposit - Regular",
    "productType": "FD",
    "status": "ACTIVE",
    "effectiveDate": "2024-01-01",
    "expiryDate": "2025-12-31",
    "baseRate": 7.5,
    "termMinMonths": 6,
    "termMaxMonths": 120,
    "minDepositAmount": 10000,
    "maxDepositAmount": 10000000,
    "allowedRoles": ["CUSTOMER", "SENIOR_CITIZEN"]
  }
]
```

---

### 3. Get Product by Code

**Purpose:** Retrieve a specific product by its code

**Method:** GET  
**URL:** `http://localhost:8080/api/v1/products/{productCode}`  
**Auth:** Required (CUSTOMER, BANK_OFFICER or ADMIN)

**Curl:**
```bash
curl http://localhost:8080/api/v1/products/FD001 \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
{
  "productId": 1,
  "productCode": "FD001",
  "productName": "Fixed Deposit - Regular",
  "productType": "FD",
  "status": "ACTIVE",
  "effectiveDate": "2024-01-01",
  "expiryDate": "2025-12-31",
  "baseRate": 7.5,
  "termMinMonths": 6,
  "termMaxMonths": 120,
  "minDepositAmount": 10000,
  "maxDepositAmount": 10000000,
  "allowedRoles": ["CUSTOMER", "SENIOR_CITIZEN"]
}
```

---

### 4. Validate Product

**Purpose:** Validate product configuration for account creation

**Method:** GET  
**URL:** `http://localhost:8080/api/v1/products/{productCode}/validate`  
**Auth:** Required (CUSTOMER, BANK_OFFICER or ADMIN)

**Query Params:**
- `termMonths` (optional) - Term in months
- `amount` (optional) - Deposit amount
- `age` (optional) - Customer age

**Curl:**
```bash
curl "http://localhost:8080/api/v1/products/FD001/validate?termMonths=12&amount=100000&age=30" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
{
  "valid": true,
  "productCode": "FD001",
  "message": "Product configuration and criteria validated successfully for account creation"
}
```

---

### 5. Calculate Rate

**Purpose:** Calculate interest rate for a product

**Method:** POST  
**URL:** `http://localhost:8080/api/v1/products/{productCode}/rate`  
**Auth:** Required (CUSTOMER, BANK_OFFICER or ADMIN)

**Request Body:**
```json
{
  "termMonths": 12,
  "customerCategory": "REGULAR"
}
```

**Curl:**
```bash
curl -X POST http://localhost:8080/api/v1/products/FD001/rate \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "termMonths": 12,
    "customerCategory": "REGULAR"
  }'
```

**Response (200 OK):**
```json
{
  "productCode": "FD001",
  "baseRate": 7.5,
  "rateModifier": 0.5,
  "finalRate": 8.0
}
```

---

### 6. Get Product Defaults

**Purpose:** Get default configuration for a product

**Method:** GET  
**URL:** `http://localhost:8080/api/v1/products/{productCode}/defaults`  
**Auth:** Required (CUSTOMER, BANK_OFFICER or ADMIN)

**Curl:**
```bash
curl http://localhost:8080/api/v1/products/FD001/defaults \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
{
  "productCode": "FD001",
  "defaultTermMonths": 12,
  "defaultAmount": 100000
}
```

---

### 7. Search Products

**Purpose:** Search products with filters

**Method:** GET  
**URL:** `http://localhost:8080/api/v1/products/search`  
**Auth:** Required (CUSTOMER, BANK_OFFICER or ADMIN)

**Query Params:**
- `productType` (optional)
- `startDate` (optional, yyyy-MM-dd)
- `endDate` (optional, yyyy-MM-dd)
- `status` (optional)
- `page` (default: 0)
- `size` (default: 50)
- `sortBy` (default: productId)

**Curl:**
```bash
curl "http://localhost:8080/api/v1/products/search?productType=FD&status=ACTIVE&page=0&size=10" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
[
  {
    "productId": 1,
    "productCode": "FD001",
    "productName": "Fixed Deposit - Regular",
    "productType": "FD",
    "status": "ACTIVE"
  }
]
```

---

### 8. Create Product (Officer/Admin)

**Purpose:** Create a new product

**Method:** POST  
**URL:** `http://localhost:8080/api/v1/products`  
**Auth:** Required (BANK_OFFICER or ADMIN)

**Request Body:**
```json
{
  "productCode": "FD002",
  "productName": "Fixed Deposit - Special",
  "productType": "FD",
  "effectiveDate": "2024-01-01",
  "expiryDate": "2025-12-31",
  "baseRate": 8.0,
  "termMinMonths": 6,
  "termMaxMonths": 120,
  "minDepositAmount": 10000,
  "maxDepositAmount": 10000000,
  "allowedRoles": ["CUSTOMER"]
}
```

**Curl:**
```bash
curl -X POST http://localhost:8080/api/v1/products \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productCode": "FD002",
    "productName": "Fixed Deposit - Special",
    "productType": "FD",
    "effectiveDate": "2024-01-01",
    "expiryDate": "2025-12-31",
    "baseRate": 8.0,
    "termMinMonths": 6,
    "termMaxMonths": 120,
    "minDepositAmount": 10000,
    "maxDepositAmount": 10000000,
    "allowedRoles": ["CUSTOMER"]
  }'
```

**Response (201 Created):**
```json
{
  "productId": 2,
  "productCode": "FD002",
  "productName": "Fixed Deposit - Special",
  "productType": "FD",
  "status": "ACTIVE"
}
```

---

### 9. Update Product

**Purpose:** Update an existing product

**Method:** PUT  
**URL:** `http://localhost:8080/api/v1/products/{productCode}`  
**Auth:** Required (BANK_OFFICER or ADMIN)

**Request Body:** Same as Create Product

**Curl:**
```bash
curl -X PUT http://localhost:8080/api/v1/products/FD001 \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Fixed Deposit - Regular Updated",
    "baseRate": 7.75
  }'
```

**Response (200 OK):**
```json
{
  "productId": 1,
  "productCode": "FD001",
  "productName": "Fixed Deposit - Regular Updated"
}
```

---

### 10. Retire Product (Officer/Admin)

**Purpose:** Retire (deactivate) a product

**Method:** DELETE  
**URL:** `http://localhost:8080/api/v1/products/{productCode}`  
**Auth:** Required (BANK_OFFICER or ADMIN)

**Curl:**
```bash
curl -X DELETE http://localhost:8080/api/v1/products/FD001 \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
{
  "productId": 1,
  "productCode": "FD001",
  "status": "RETIRED"
}
```

---

## FD Calculator Service (Port 8084)

Health: `GET /actuator/health` (public). All `/api/v1/fd/**` APIs accept CUSTOMER, BANK_OFFICER or ADMIN. Stored lookup/export is still restricted to the authenticated username. Use returned IDs, and allow the asynchronous audit write to complete before exporting.

### Calculate maturity

```bash
curl -X POST http://localhost:8084/api/v1/fd/calculations \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"productCode":"FD001","principal":100000,"term":{"value":12,"unit":"MONTHS"},"payoutMode":"CUMULATIVE"}'
```

The request uses `term.value` and `term.unit`, not `termMonths`. Units are MONTHS or YEARS. Product rates/categories come from dependent services. The response includes `calculationId`, `uuid`, `term`, `effectiveRate`, `interestEarned`, `maturityAmount`, `estimatedMaturityDate` and other calculation details; see [endpoint field shapes](endpoints.md#fd-calculator-service-mod-4).

### Compare products

```bash
curl -X POST http://localhost:8084/api/v1/fd/calculations/compare \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"principal":100000,"options":[{"productCode":"FD001","term":{"value":12,"unit":"MONTHS"}},{"productCode":"FD002","term":{"value":24,"unit":"MONTHS"}}]}'
```

Supply two or three options. Response: `{"results": [...]}` with full calculation responses ordered by maturity amount descending. Comparison results are not persisted like single calculations.

### Custom simulation

```bash
curl -X POST http://localhost:8084/api/v1/fd/calculations/custom \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"principal":100000,"term":{"value":12,"unit":"MONTHS"},"interestRate":8.5,"interestType":"COMPOUND","compoundingFrequency":"MONTHLY"}'
```

Custom simulation bypasses Product lookup. Supported frequencies are MONTHLY, QUARTERLY, HALF_YEARLY and YEARLY.

### Other calculator operations

| Method | Path | Result |
| --- | --- | --- |
| GET | `/api/v1/fd/calculations/{id}` | Saved calculation for the caller |
| GET | `/api/v1/fd/calculations/uuid/{uuid}` | Saved calculation by UUID |
| GET | `/api/v1/fd/calculations/{id}/export?format=csv` | CSV attachment |
| POST | `/api/v1/fd/calculations/{id}/explain` | Plain text deterministic explanation |
| GET | `/api/v1/fd/products/{code}/preview` | Product limits/configuration |
| POST | `/api/v1/fd/cache/rates/evict` | HTTP 200 with empty body |
| POST | `/api/v1/fd/batch/calculations` | Batch response |

A batch request is `{"calculations":[<CalculationRequest>, ...],"correlationId":"optional"}`. The response has `correlationId`, `totalCalculations`, `successfulCalculations`, `failedCalculations`, `results`, `status`, and `message`. Results are calculation DTOs, not per-item success/error wrappers. Kafka publication of these results is a placeholder, not implemented delivery.

## FD Account Service (Port 8086)

### 1. Health Check

**Purpose:** Check if FD Account Service is running

**Method:** GET  
**URL:** `http://localhost:8086/health`  
**Auth:** None

**Curl:**
```bash
curl http://localhost:8086/health
```

**Response:**
```json
{
  "status": "UP",
  "service": "FD Module is running"
}
```

---

### 2. Create FD Account (Officer/Admin)

**Purpose:** Create a new FD account directly

**Method:** POST  
**URL:** `http://localhost:8086/api/fd/account/create`  
**Auth:** Required (BANK_OFFICER or ADMIN)

**Request Body:**
```json
{
  "customerId": "CUST001",
  "productCode": "FD001",
  "principalAmount": 100000,
  "termMonths": 12,
  "branchCode": "BR001"
}
```

**Curl:**
```bash
curl -X POST http://localhost:8086/api/fd/account/create \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST001",
    "productCode": "FD001",
    "principalAmount": 100000,
    "termMonths": 12,
    "branchCode": "BR001"
  }'
```

**Response (200 OK):**
```json
{
  "fdAccountNo": "FD2024091100001",
  "customerId": "CUST001",
  "productCode": "FD001",
  "principalAmount": 100000,
  "interestRate": 8.0,
  "termMonths": 12,
  "maturityDate": "2025-09-11",
  "status": "ACTIVE",
  "createdBy": "bank_officer"
}
```

---

### 3. Apply for FD (Customer)

**Purpose:** Customer applies for a new FD account (requires approval)

**Method:** POST  
**URL:** `http://localhost:8086/api/fd/account/apply`  
**Auth:** Required (CUSTOMER)

**Request Body:**
```json
{
  "productCode": "FD001",
  "principalAmount": 100000,
  "termMonths": 12,
  "branchCode": "BR001",
  "applicantFullName": "John Doe",
  "applicantFirstName": "John",
  "applicantLastName": "Doe",
  "applicantAge": 30,
  "applicantGender": "MALE",
  "applicantEmail": "john@example.com",
  "applicantPhone": "1234567890",
  "applicantPan": "ABCDE1234F",
  "applicantAddress": "123 Main St",
  "applicantCity": "Mumbai",
  "applicantState": "MH",
  "applicantPincode": "400001",
  "customerCategory": "GENERAL",
  "accountHolderRoles": ["OWNER"],
  "coOwnerName": ""
}
```

**Curl:**
```bash
curl -X POST http://localhost:8086/api/fd/account/apply \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productCode": "FD001",
    "principalAmount": 100000,
    "termMonths": 12,
    "branchCode": "BR001",
    "applicantFullName": "John Doe",
    "applicantFirstName": "John",
    "applicantLastName": "Doe",
    "applicantAge": 30,
    "applicantGender": "MALE",
    "applicantEmail": "john@example.com",
    "applicantPhone": "1234567890",
    "applicantPan": "ABCDE1234F",
    "applicantAddress": "123 Main St",
    "applicantCity": "Mumbai",
    "applicantState": "MH",
    "applicantPincode": "400001"
  }'
```

**Response (200 OK):**
```json
{
  "fdAccountNo": "FD2024091100001",
  "customerId": "customer1",
  "productCode": "FD001",
  "principalAmount": "100000",
  "interestRate": "8.0",
  "tenureMonths": 12,
  "maturityDate": "2025-09-11",
  "status": "PENDING",
  "approvalStatus": "PENDING_APPROVAL"
}
```

---

### 4. Approve/Reject FD Application (Officer/Admin)

**Purpose:** Approve or reject pending FD applications

**Method:** POST  
**URL:** `http://localhost:8086/api/fd/account/approve`  
**Auth:** Required (BANK_OFFICER or ADMIN)

**Request Body:**
```json
{
  "fdAccountNo": "FD2024091100001",
  "approved": true,
  "rejectionReason": null
}
```

**Curl:**
```bash
curl -X POST http://localhost:8086/api/fd/account/approve \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fdAccountNo": "FD2024091100001",
    "approved": true,
    "rejectionReason": null
  }'
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "FD application processed successfully"
}
```

---

### 5. Get Pending Applications (Officer/Admin)

**Purpose:** Get all pending FD applications awaiting approval

**Method:** GET  
**URL:** `http://localhost:8086/api/fd/account/pending`  
**Auth:** Required (BANK_OFFICER or ADMIN)

**Curl:**
```bash
curl http://localhost:8086/api/fd/account/pending \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
[
  {
    "fdAccountNo": "FD2024091100001",
    "customerId": "customer1",
    "productCode": "FD001",
    "principalAmount": "100000",
    "interestRate": "8.0",
    "tenureMonths": 12,
    "maturityDate": "2025-09-11",
    "status": "PENDING",
    "approvalStatus": "PENDING_APPROVAL",
    "applicantFullName": "John Doe",
    "applicantEmail": "john@example.com"
  }
]
```

---

### 6. Get My Applications (Customer)

**Purpose:** Customer views their own FD applications

**Method:** GET  
**URL:** `http://localhost:8086/api/fd/account/my-applications`  
**Auth:** Required (CUSTOMER)

**Curl:**
```bash
curl http://localhost:8086/api/fd/account/my-applications \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
[
  {
    "fdAccountNo": "FD2024091100001",
    "customerId": "customer1",
    "productCode": "FD001",
    "principalAmount": "100000",
    "interestRate": "8.0",
    "tenureMonths": 12,
    "maturityDate": "2025-09-11",
    "status": "ACTIVE",
    "approvalStatus": "APPROVED"
  }
]
```

---

### 7. Get FD Account Details

**Purpose:** Retrieve FD account details

**Method:** GET  
**URL:** `http://localhost:8086/api/fd/account/{fdAccountNo}`  
**Auth:** Required (BANK_OFFICER, ADMIN, or CUSTOMER for own accounts)

**Curl:**
```bash
curl http://localhost:8086/api/fd/account/FD2024091100001 \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
{
  "fdAccountNo": "FD2024091100001",
  "customerId": "CUST001",
  "productCode": "FD001",
  "principalAmount": 100000,
  "currentBalance": 100000,
  "interestRate": 8.0,
  "termMonths": 12,
  "maturityDate": "2025-09-11",
  "status": "ACTIVE",
  "createdAt": "2024-09-11",
  "createdBy": "bank_officer"
}
```

---

### 8. Create FD with Transaction (Officer)

**Purpose:** Create FD account with initial deposit transaction

**Method:** POST  
**URL:** `http://localhost:8086/api/fd/account/create-with-txn`  
**Auth:** Required (BANK_OFFICER)

**Request Body:** Same as Create FD Account

**Curl:**
```bash
curl -X POST http://localhost:8086/api/fd/account/create-with-txn \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST001",
    "productCode": "FD001",
    "principalAmount": 100000,
    "termMonths": 12,
    "branchCode": "BR001"
  }'
```

**Response (200 OK):**
```json
{
  "fdAccountNo": "FD2024091100001",
  "transactionId": "TXN2024091100001",
  "customerId": "CUST001",
  "productCode": "FD001",
  "principalAmount": 100000,
  "interestRate": 8.0,
  "termMonths": 12,
  "maturityDate": "2025-09-11",
  "status": "ACTIVE"
}
```

---

### 9. Get Transaction History

**Purpose:** Retrieve transaction history for an FD account

**Method:** GET  
**URL:** `http://localhost:8086/api/fd/account/{fdAccountNo}/transactions`  
**Auth:** Required (BANK_OFFICER, ADMIN, or CUSTOMER for own accounts)

**Curl:**
```bash
curl http://localhost:8086/api/fd/account/FD2024091100001/transactions \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
[
  {
    "transactionId": "TXN2024091100001",
    "fdAccountNo": "FD2024091100001",
    "transactionType": "DEPOSIT",
    "amount": 100000,
    "transactionDate": "2024-09-11",
    "balanceAfter": 100000,
    "description": "Initial deposit"
  },
  {
    "transactionId": "TXN2024091100002",
    "fdAccountNo": "FD2024091100001",
    "transactionType": "INTEREST_CREDIT",
    "amount": 666.67,
    "transactionDate": "2024-10-11",
    "balanceAfter": 100666.67,
    "description": "Monthly interest credit"
  }
]
```

---

### 10. Interest Quote

**Purpose:** Get quick interest calculation quote

**Method:** POST  
**URL:** `http://localhost:8086/api/fd/interest/quote`  
**Auth:** Required (ADMIN, BANK_OFFICER, or CUSTOMER)

**Request Body:**
```json
{
  "principal": 100000,
  "annualRate": 8.0,
  "months": 12,
  "mode": "MONTHLY_COMPOUND"
}
```

**Curl:**
```bash
curl -X POST http://localhost:8086/api/fd/interest/quote \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "principal": 100000,
    "annualRate": 8.0,
    "months": 12,
    "mode": "MONTHLY_COMPOUND"
  }'
```

**Response (200 OK):**
```json
{
  "maturityAmount": 108328.71,
  "interest": 8328.71,
  "mode": "MONTHLY_COMPOUND",
  "basis": "Monthly quotation; actual daily accrual may differ"
}
```

---

### 11. Get Interest Accounts

**Purpose:** Get all FD accounts with interest settings

**Method:** GET  
**URL:** `http://localhost:8086/api/fd/interest/accounts`  
**Auth:** Required (ADMIN or BANK_OFFICER)

**Curl:**
```bash
curl http://localhost:8086/api/fd/interest/accounts \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
[
  {
    "fdAccountNo": "FD2024091100001",
    "interestMode": "MONTHLY_COMPOUND",
    "lastInterestCredit": "2024-10-11"
  }
]
```

---

### 12. Configure Interest Settings (Admin)

**Purpose:** Configure interest calculation mode for an account

**Method:** PUT  
**URL:** `http://localhost:8086/api/fd/interest/{account}/settings`  
**Auth:** Required (ADMIN)

**Request Body:**
```json
{
  "mode": "MONTHLY_COMPOUND"
}
```

**Curl:**
```bash
curl -X PUT http://localhost:8086/api/fd/interest/FD2024091100001/settings \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "MONTHLY_COMPOUND"
  }'
```

**Response (200 OK):**
```json
{
  "fdAccountNo": "FD2024091100001",
  "mode": "MONTHLY_COMPOUND"
}
```

---

### 13. Clock Status (All Roles - Testing)

**Purpose:** Get current clock status (for time travel testing)

**Method:** GET  
**URL:** `http://localhost:8086/api/fd/clock`  
**Auth:** Required (CUSTOMER, BANK_OFFICER or ADMIN)

**Curl:**
```bash
curl http://localhost:8086/api/fd/clock \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
{
  "timeTravelEnabled": false,
  "realDate": "2024-09-11",
  "businessDate": "2024-09-11",
  "offsetDays": 0
}
```

---

### 14. Advance Clock (All Roles - Testing)

**Purpose:** Advance the business clock by N days

**Method:** POST  
**URL:** `http://localhost:8086/api/fd/clock/advance`  
**Auth:** Required (CUSTOMER, BANK_OFFICER or ADMIN)

**Request Body:**
```json
{
  "days": 30
}
```

**Curl:**
```bash
curl -X POST http://localhost:8086/api/fd/clock/advance \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "days": 30
  }'
```

**Response (200 OK):**
```json
{
  "timeTravelEnabled": true,
  "realDate": "2024-09-11",
  "businessDate": "2024-10-11",
  "offsetDays": 30
}
```

---

### 15. Reset Clock (All Roles - Testing)

**Purpose:** Reset the business clock to real time

**Method:** POST  
**URL:** `http://localhost:8086/api/fd/clock/reset`  
**Auth:** Required (CUSTOMER, BANK_OFFICER or ADMIN)

**Curl:**
```bash
curl -X POST http://localhost:8086/api/fd/clock/reset \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
{
  "timeTravelEnabled": false,
  "realDate": "2024-09-11",
  "businessDate": "2024-09-11",
  "offsetDays": 0
}
```

---

### 16. Withdrawal Inquiry

**Purpose:** Get withdrawal inquiry details for early closure

**Method:** GET  
**URL:** `http://localhost:8086/api/fd/account/{fdAccountNo}/withdrawal-inquiry`  
**Auth:** Required (BANK_OFFICER, ADMIN, or CUSTOMER for own accounts)

**Curl:**
```bash
curl http://localhost:8086/api/fd/account/FD2024091100001/withdrawal-inquiry \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
{
  "accountNumber": "FD2024091100001",
  "originalPrincipal": 100000,
  "interestAccruedToDate": 5000,
  "penaltyAmount": 50,
  "finalPayoutAmount": 104950,
  "inquiryDate": "2024-10-15"
}
```

---

### 17. Perform Early Withdrawal

**Purpose:** Perform early withdrawal/closure of FD

**Method:** POST  
**URL:** `http://localhost:8086/api/fd/account/{fdAccountNo}/withdrawal`  
**Auth:** Required (BANK_OFFICER, ADMIN, or CUSTOMER for own accounts)

**Request Body:**
```json
{
  "reason": "Emergency funds needed"
}
```

**Curl:**
```bash
curl -X POST http://localhost:8086/api/fd/account/FD2024091100001/withdrawal \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Emergency funds needed"
  }'
```

**Response (200 OK):**
```json
{
  "accountNumber": "FD2024091100001",
  "originalPrincipal": 100000,
  "interestAccruedToDate": 5000,
  "penaltyAmount": 50,
  "finalPayoutAmount": 104950,
  "inquiryDate": "2024-10-15"
}
```

---

### 18. Run Maturity Processing (Admin)

**Purpose:** Manual maturity run (catch-up after downtime)

**Method:** POST  
**URL:** `http://localhost:8086/api/fd/maturity/run`  
**Auth:** Required (ADMIN)

**Request Body (optional):**
```json
{
  "businessDate": "2024-10-15"
}
```

**Curl:**
```bash
curl -X POST http://localhost:8086/api/fd/maturity/run \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "businessDate": "2024-10-15"
  }'
```

**Response (200 OK):**
```json
{
  "businessDate": "2024-10-15",
  "matured": 3,
  "skipped": 2,
  "failed": 0
}
```

---

## Report Endpoints (Port 8086)

### 1. FD Summary Report

**Purpose:** Get FD summary by status

**Method:** GET  
**URL:** `http://localhost:8086/api/report/fd-summary`  
**Auth:** Required (BANK_OFFICER or ADMIN)

**Query Params:**
- `status` (default: "ACTIVE") - ACTIVE, MATURED, or PREMATURELY_CLOSED
- `format` (default: "json") - json, csv, pdf, or xlsx

**Curl:**
```bash
curl "http://localhost:8086/api/report/fd-summary?status=ACTIVE&format=json" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
[
  {
    "fdAccountNo": "FD2024091100001",
    "customerId": "CUST001",
    "principalAmount": 100000,
    "currentBalance": 105000,
    "interestRate": 8.0,
    "maturityDate": "2025-09-11"
  }
]
```

---

### 2. Customer Portfolio Report

**Purpose:** Get customer portfolio report

**Method:** GET  
**URL:** `http://localhost:8086/api/report/customer-portfolio`  
**Auth:** Required (CUSTOMER, BANK_OFFICER, or ADMIN)

**Query Params:**
- `customerId` (required for staff, ignored for customers)
- `format` (default: "json") - json, csv, pdf, or xlsx

**Curl:**
```bash
curl "http://localhost:8086/api/report/customer-portfolio?customerId=CUST001&format=json" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
[
  {
    "fdAccountNo": "FD2024091100001",
    "productCode": "FD001",
    "principalAmount": 100000,
    "currentBalance": 105000,
    "maturityDate": "2025-09-11"
  }
]
```

---

### 3. Maturity Summary Report

**Purpose:** Get maturity summary for upcoming days

**Method:** GET  
**URL:** `http://localhost:8086/api/report/maturity-summary`  
**Auth:** Required (BANK_OFFICER or ADMIN)

**Query Params:**
- `days` (default: 30) - Number of days to look ahead
- `format` (default: "json") - json, csv, pdf, or xlsx

**Curl:**
```bash
curl "http://localhost:8086/api/report/maturity-summary?days=30&format=json" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
[
  {
    "fdAccountNo": "FD2024091100001",
    "customerId": "CUST001",
    "maturityDate": "2025-09-11",
    "maturityAmount": 108328.71,
    "daysToMaturity": 30
  }
]
```

---

### 4. Interest History Report

**Purpose:** Get interest history for an FD account

**Method:** GET  
**URL:** `http://localhost:8086/api/report/interest-history/{fdAccountNo}`  
**Auth:** Required (CUSTOMER, BANK_OFFICER, or ADMIN)

**Query Params:**
- `format` (default: "json") - json, csv, pdf, or xlsx

**Curl:**
```bash
curl "http://localhost:8086/api/report/interest-history/FD2024091100001?format=json" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
[
  {
    "creditDate": "2024-10-11",
    "amount": 666.67,
    "balanceAfter": 100666.67
  }
]
```

---

### 5. Run Extract (Officer/Admin)

**Purpose:** Run data extract for a business date

**Method:** POST  
**URL:** `http://localhost:8086/api/report/extract/run`  
**Auth:** Required (BANK_OFFICER or ADMIN)

**Query Params:**
- `date` (optional) - Business date in yyyy-MM-dd format

**Curl:**
```bash
curl -X POST "http://localhost:8086/api/report/extract/run?date=2024-10-15" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
{
  "businessDate": "2024-10-15",
  "file": "/extracts/2024-10-15.json",
  "created": true,
  "accounts": 150
}
```

---

### 6. Generate Python Report (Officer/Admin)

**Purpose:** Generate Python-based report from extract

**Method:** POST  
**URL:** `http://localhost:8086/api/report/python`  
**Auth:** Required (BANK_OFFICER or ADMIN)

**Query Params:**
- `date` (optional) - Business date in yyyy-MM-dd format

**Curl:**
```bash
curl -X POST "http://localhost:8086/api/report/python?date=2024-10-15" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "reportFile": "/reports/2024-10-15-report.pdf",
  "charts": ["portfolio-summary.svg", "maturity-timeline.svg"]
}
```

---

## Chart Data Endpoints (Port 8086)

Chart responses wrap report rows in `title`, `columns`, `data` and `rowCount`. Actual column labels are snake_case from ReportService. Empty arrays below illustrate the envelope; use the returned columns/rows instead of assuming the sample labels.

### 1. Portfolio Summary Chart

**Purpose:** Get portfolio summary chart data

**Method:** GET  
**URL:** `http://localhost:8086/api/charts/portfolio-summary`  
**Auth:** Required (CUSTOMER, BANK_OFFICER, or ADMIN)

**Query Params:**
- `customerId` (required for staff, ignored for customers)

**Curl:**
```bash
curl "http://localhost:8086/api/charts/portfolio-summary?customerId=CUST001" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
{
  "title": "Portfolio Summary",
  "columns": ["fd_account_no", "product_code", "currency", "principal_amount", "interest_rate", "tenure_months", "maturity_date", "accrued_interest", "status", "created_at"],
  "data": [],
  "rowCount": 0
}
```

---

### 2. FD Summary Chart by Status

**Purpose:** Get FD summary chart data by status

**Method:** GET  
**URL:** `http://localhost:8086/api/charts/fd-summary/{status}`  
**Auth:** Required (BANK_OFFICER or ADMIN)

**Curl:**
```bash
curl http://localhost:8086/api/charts/fd-summary/ACTIVE \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
{
  "title": "Active FD Summary",
  "columns": ["product_code", "currency", "total_accounts", "total_principal", "total_interest_accrued", "total_interest_posted"],
  "data": [],
  "rowCount": 0
}
```

---

### 3. Maturity Timeline Chart

**Purpose:** Get maturity timeline chart data

**Method:** GET  
**URL:** `http://localhost:8086/api/charts/maturity-timeline`  
**Auth:** Required (BANK_OFFICER or ADMIN)

**Query Params:**
- `days` (default: 30) - Days to look ahead

**Curl:**
```bash
curl "http://localhost:8086/api/charts/maturity-timeline?days=30" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
{
  "title": "Maturity Timeline",
  "columns": ["fd_account_no", "customer_id", "product_code", "currency", "principal_amount", "interest_rate", "maturity_date", "days_to_maturity"],
  "data": [],
  "rowCount": 0
}
```

---

### 4. Interest History Chart

**Purpose:** Get interest history chart data for an FD

**Method:** GET  
**URL:** `http://localhost:8086/api/charts/interest-history/{fdAccountNo}`  
**Auth:** Required (CUSTOMER, BANK_OFFICER, or ADMIN)

**Curl:**
```bash
curl http://localhost:8086/api/charts/interest-history/FD2024091100001 \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
{
  "title": "Interest History",
  "columns": ["accrual_date", "interest_amount", "cumulative_interest", "capitalized", "settlement_status"],
  "data": [],
  "rowCount": 0
}
```

---

### 5. Portfolio Distribution Chart

**Purpose:** Get portfolio distribution by product and currency

**Method:** GET  
**URL:** `http://localhost:8086/api/charts/portfolio-distribution`  
**Auth:** Required (CUSTOMER, BANK_OFFICER, or ADMIN)

**Query Params:**
- `customerId` (required for staff, ignored for customers)

**Curl:**
```bash
curl "http://localhost:8086/api/charts/portfolio-distribution?customerId=CUST001" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
{
  "title": "Portfolio Distribution",
  "distribution": {
    "FD001": {
      "INR": 100000,
      "USD": 5000
    }
  },
  "totalAccounts": 5,
  "totalsByCurrency": {
    "INR": 100000,
    "USD": 5000
  }
}
```

---

## Integration Endpoints (via FD Account Service)

These endpoints proxy requests to other services through the FD Account Service.

### 1. Get Active Products (via Account Service)

**Purpose:** Get active products from Product Service

**Method:** GET  
**URL:** `http://localhost:8086/api/v1/integration/products/active`  
**Auth:** Required (BANK_OFFICER or ADMIN)

**Query Params:**
- `type` (optional)

**Curl:**
```bash
curl http://localhost:8086/api/v1/integration/products/active?type=FD \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):** Array of products from Product Service

---

### 2. Get Product by Code (via Account Service)

**Purpose:** Get product from Product Service

**Method:** GET  
**URL:** `http://localhost:8086/api/v1/integration/products/{productCode}`  
**Auth:** Required (BANK_OFFICER or ADMIN)

**Curl:**
```bash
curl http://localhost:8086/api/v1/integration/products/FD001 \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):** Product from Product Service

---

### 3. Validate Product (via Account Service)

**Purpose:** Validate product via Product Service

**Method:** GET  
**URL:** `http://localhost:8086/api/v1/integration/products/{productCode}/validate`  
**Auth:** Required (BANK_OFFICER or ADMIN)

**Query Params:**
- `termMonths` (optional)
- `amount` (optional)
- `age` (optional)

**Curl:**
```bash
curl "http://localhost:8086/api/v1/integration/products/FD001/validate?termMonths=12&amount=100000" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):** Validation result from Product Service

---

### 4. Calculate Maturity (via Account Service)

**Purpose:** Calculate via Calculator Service

**Method:** POST  
**URL:** `http://localhost:8086/api/v1/integration/calculator/calculate`  
**Auth:** Required (BANK_OFFICER, ADMIN, or CUSTOMER)

**Query Params:**
- `productCode`
- `principal`
- `termMonths`
- `interestType` (optional)

**Curl:**
```bash
curl -X POST "http://localhost:8086/api/v1/integration/calculator/calculate?productCode=FD001&principal=100000&termMonths=12&interestType=COMPOUND" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):** Calculation result from Calculator Service

---

### 5. Preview Product (via Account Service)

**Purpose:** Preview product via Calculator Service

**Method:** GET  
**URL:** `http://localhost:8086/api/v1/integration/calculator/products/{productCode}/preview`  
**Auth:** Required (BANK_OFFICER, ADMIN, or CUSTOMER)

**Curl:**
```bash
curl http://localhost:8086/api/v1/integration/calculator/products/FD001/preview \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):** Product preview from Calculator Service

---

## Frontend Application (Port 4200)

The Angular frontend provides a web interface for all user roles. Access at: `http://localhost:4200`

### Available Routes

- `/` - Landing page
- `/login` - Customer login
- `/signup` - Customer signup
- `/admin-login` - Admin login
- `/admin-signup` - Admin signup
- `/officer-login` - Bank Officer login
- `/officer-signup` - Bank Officer signup
- `/dashboard` - Customer dashboard
- `/admin` - Admin panel
- `/officer` - Bank Officer panel
- `/apply-fd` - Apply for FD (customer)
- `/terms` - Terms of service
- `/privacy` - Privacy policy

---

## Summary of Services

| Service | Port | Purpose |
|---------|------|---------|
| Auth Service | 8090 | JWT authentication |
| Product & Pricing | 8080 | Product catalog management |
| FD Calculator | 8084 | FD maturity calculations |
| FD Account Service | 8086 | FD account lifecycle |
| Frontend | 4200 | Angular web application |
| MySQL (Auth) | 3309 | Auth database |
| MySQL (Product) | 3308 | Product database |
| MySQL (Calculator) | 3307 | Calculator database |
| MySQL (FD Account) | 3310 | FD Account database |
| Kafka | 9092 | Event streaming |
| Zookeeper | 2181 | Kafka coordination |

---

## Notes

- All endpoints except auth login/signup require JWT authentication
- Customers can only access their own data (enforced by AccountAccess)
- Staff (BANK_OFFICER, ADMIN) can access all data
- Clock endpoints are for testing/time-travel scenarios only
- Report endpoints support JSON, CSV, PDF, and XLSX formats
- Chart endpoints provide JSON data for frontend visualization


## Common Error Responses

### 401 Unauthorized
```json
{
  "timestamp": "2024-09-11T10:30:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required",
  "path": "/api/v1/products/active"
}
```

### 403 Forbidden
```json
{
  "timestamp": "2024-09-11T10:30:00Z",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied",
  "path": "/api/v1/products"
}
```

### 404 Not Found
```json
{
  "timestamp": "2024-09-11T10:30:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Resource not found",
  "path": "/api/v1/products/INVALID"
}
```

### 500 Internal Server Error
```json
{
  "timestamp": "2024-09-11T10:30:00Z",
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "path": "/api/v1/products/active"
}
```

---

## Testing Workflow

### 1. Setup
```bash
# Start all services
./init_all_services.sh

# Verify services are running
curl http://localhost:8090/health
curl http://localhost:8080/actuator/health
curl http://localhost:8084/actuator/health
curl http://localhost:8086/health
```

### 2. Authentication
```bash
# Create user
curl -X POST http://localhost:8090/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123","email":"test@example.com"}'

# Login and get token
TOKEN=$(curl -s -X POST http://localhost:8090/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}' \
  | jq -r '.accessToken')
```

### 3. Test Endpoints
```bash
# Get products
curl http://localhost:8080/api/v1/products/active \
  -H "Authorization: Bearer $TOKEN"

# Calculate FD
curl -X POST http://localhost:8084/api/v1/fd/calculations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productCode":"FD001","principal":100000,"term":{"value":12,"unit":"MONTHS"}}'

# Create FD account (requires BANK_OFFICER role)
curl -X POST http://localhost:8086/api/fd/account/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customerId":"CUST001","productCode":"FD001","principalAmount":100000,"termMonths":12,"branchCode":"BR001"}'
```

---

## Notes

- All monetary values are in the currency configured for your region
- Dates are in ISO 8601 format (yyyy-MM-dd)
- Interest rates are annual percentages
- Token expiration is 1 hour by default (3600 seconds)
- Use refresh tokens to get new access tokens without re-authenticating
- Some endpoints require specific roles (CUSTOMER, BANK_OFFICER, ADMIN)
- The system uses JWT tokens signed with HS256 algorithm
- For production, use HTTPS and proper secrets management
