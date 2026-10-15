# Postman Collection - Banking Technology Lab API

## Overview

This document contains all API endpoints for the Banking Technology Lab microservices system, organized by service. Each endpoint includes its purpose, HTTP method, URL, request body (if applicable), and example curl command.

## Authentication

All endpoints except Auth Service login/signup require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Test Users

After running the init script, you can create users via signup or use these test credentials:

- **Customer:** username: `testcustomer`, password: `password123`
- **Admin:** username: `admin`, password: `password123` (via signup)

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
**Auth:** Required (BANK_OFFICER or ADMIN)

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
**Auth:** Required (BANK_OFFICER or ADMIN)

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
  "messages": []
}
```

---

### 5. Calculate Rate

**Purpose:** Calculate interest rate for a product

**Method:** POST  
**URL:** `http://localhost:8080/api/v1/products/{productCode}/rate`  
**Auth:** Required (BANK_OFFICER or ADMIN)

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
  "categoryAdjustment": 0.5,
  "finalRate": 8.0
}
```

---

### 6. Get Product Defaults

**Purpose:** Get default configuration for a product

**Method:** GET  
**URL:** `http://localhost:8080/api/v1/products/{productCode}/defaults`  
**Auth:** Required (BANK_OFFICER or ADMIN)

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
**Auth:** Required (BANK_OFFICER or ADMIN)

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

### 8. Create Product (Admin Only)

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

### 10. Retire Product (Admin Only)

**Purpose:** Retire (deactivate) a product

**Method:** DELETE  
**URL:** `http://localhost:8080/api/v1/products/{productCode}`  
**Auth:** Required (ADMIN)

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

### 1. Health Check

**Purpose:** Check if Calculator Service is running

**Method:** GET  
**URL:** `http://localhost:8084/actuator/health`  
**Auth:** None

**Curl:**
```bash
curl http://localhost:8084/actuator/health
```

**Response:**
```json
{
  "status": "UP"
}
```

---

### 2. Calculate FD Maturity

**Purpose:** Calculate FD maturity amount

**Method:** POST  
**URL:** `http://localhost:8084/api/v1/fd/calculations`  
**Auth:** Required (CUSTOMER role)

**Request Body:**
```json
{
  "productCode": "FD001",
  "principal": 100000,
  "termMonths": 12,
  "interestType": "COMPOUND"
}
```

**Curl:**
```bash
curl -X POST http://localhost:8084/api/v1/fd/calculations \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productCode": "FD001",
    "principal": 100000,
    "termMonths": 12,
    "interestType": "COMPOUND"
  }'
```

**Response (200 OK):**
```json
{
  "calculationId": "CALC-20260911-0001",
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "productCode": "FD001",
  "principal": 100000,
  "termMonths": 12,
  "interestRate": 8.0,
  "interestType": "COMPOUND",
  "maturityAmount": 108328.71,
  "interestEarned": 8328.71,
  "maturityDate": "2025-09-11",
  "calculatedAt": "2024-09-11T10:30:00Z"
}
```

---

### 3. Compare Multiple FD Options

**Purpose:** Compare multiple FD products

**Method:** POST  
**URL:** `http://localhost:8084/api/v1/fd/calculations/compare`  
**Auth:** Required (CUSTOMER role)

**Request Body:**
```json
{
  "principal": 100000,
  "options": [
    {
      "productCode": "FD001",
      "termMonths": 12
    },
    {
      "productCode": "FD002",
      "termMonths": 24
    }
  ]
}
```

**Curl:**
```bash
curl -X POST http://localhost:8084/api/v1/fd/calculations/compare \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "principal": 100000,
    "options": [
      {
        "productCode": "FD001",
        "termMonths": 12
      },
      {
        "productCode": "FD002",
        "termMonths": 24
      }
    ]
  }'
```

**Response (200 OK):**
```json
{
  "principal": 100000,
  "comparisons": [
    {
      "productCode": "FD001",
      "termMonths": 12,
      "maturityAmount": 108328.71,
      "interestEarned": 8328.71
    },
    {
      "productCode": "FD002",
      "termMonths": 24,
      "maturityAmount": 117169.59,
      "interestEarned": 17169.59
    }
  ]
}
```

---

### 4. Get Saved Calculation

**Purpose:** Retrieve a saved calculation by ID

**Method:** GET  
**URL:** `http://localhost:8084/api/v1/fd/calculations/{calculationId}`  
**Auth:** Required (CUSTOMER role)

**Curl:**
```bash
curl http://localhost:8084/api/v1/fd/calculations/CALC-20260911-0001 \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
{
  "calculationId": "CALC-20260911-0001",
  "productCode": "FD001",
  "principal": 100000,
  "maturityAmount": 108328.71
}
```

---

### 5. Get Calculation by UUID

**Purpose:** Retrieve a saved calculation by UUID

**Method:** GET  
**URL:** `http://localhost:8084/api/v1/fd/calculations/uuid/{uuid}`  
**Auth:** Required (CUSTOMER role)

**Curl:**
```bash
curl http://localhost:8084/api/v1/fd/calculations/uuid/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
{
  "calculationId": "CALC-20260911-0001",
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "maturityAmount": 108328.71
}
```

---

### 6. Export Calculation as CSV

**Purpose:** Export calculation result as CSV file

**Method:** GET  
**URL:** `http://localhost:8084/api/v1/fd/calculations/{calculationId}/export`  
**Auth:** Required (CUSTOMER role)

**Query Params:**
- `format` (default: "csv")

**Curl:**
```bash
curl http://localhost:8084/api/v1/fd/calculations/CALC-20260911-0001/export?format=csv \
  -H "Authorization: Bearer <your-jwt-token>" \
  -o calculation.csv
```

**Response:** CSV file download

---

### 7. Explain Calculation

**Purpose:** Get plain text explanation of calculation

**Method:** POST  
**URL:** `http://localhost:8084/api/v1/fd/calculations/{calculationId}/explain`  
**Auth:** Required (CUSTOMER role)

**Curl:**
```bash
curl -X POST http://localhost:8084/api/v1/fd/calculations/CALC-20260911-0001/explain \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```text
For a principal of 100000 at 8.0% annual interest compounded monthly for 12 months:
- Monthly interest rate: 0.667%
- Total maturity amount: 108328.71
- Interest earned: 8328.71
```

---

### 8. Preview Product Constraints

**Purpose:** Get calculator-safe product constraints

**Method:** GET  
**URL:** `http://localhost:8084/api/v1/fd/products/{productCode}/preview`  
**Auth:** Required (CUSTOMER role)

**Curl:**
```bash
curl http://localhost:8084/api/v1/fd/products/FD001/preview \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
{
  "productCode": "FD001",
  "minPrincipal": 10000,
  "maxPrincipal": 10000000,
  "minTermMonths": 6,
  "maxTermMonths": 120,
  "baseRate": 7.5,
  "interestType": "COMPOUND"
}
```

---

### 9. Batch Calculations

**Purpose:** Calculate multiple FDs in one request

**Method:** POST  
**URL:** `http://localhost:8084/api/v1/fd/batch/calculations`  
**Auth:** Required (CUSTOMER role)

**Request Body:**
```json
{
  "calculations": [
    {
      "productCode": "FD001",
      "principal": 100000,
      "termMonths": 12,
      "interestType": "COMPOUND"
    },
    {
      "productCode": "FD002",
      "principal": 50000,
      "termMonths": 24,
      "interestType": "SIMPLE"
    }
  ]
}
```

**Curl:**
```bash
curl -X POST http://localhost:8084/api/v1/fd/batch/calculations \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "calculations": [
      {
        "productCode": "FD001",
        "principal": 100000,
        "termMonths": 12,
        "interestType": "COMPOUND"
      },
      {
        "productCode": "FD002",
        "principal": 50000,
        "termMonths": 24,
        "interestType": "SIMPLE"
      }
    ]
  }'
```

**Response (200 OK):**
```json
{
  "results": [
    {
      "calculationId": "CALC-20260911-0001",
      "maturityAmount": 108328.71
    },
    {
      "calculationId": "CALC-20260911-0002",
      "maturityAmount": 58000.00
    }
  ]
}
```

---

### 10. Custom Calculation

**Purpose:** Calculate with custom parameters (no product lookup)

**Method:** POST  
**URL:** `http://localhost:8084/api/v1/fd/calculations/custom`  
**Auth:** Required (CUSTOMER role)

**Request Body:**
```json
{
  "principal": 100000,
  "termMonths": 12,
  "interestRate": 8.5,
  "interestType": "COMPOUND",
  "compoundingFrequency": "MONTHLY"
}
```

**Curl:**
```bash
curl -X POST http://localhost:8084/api/v1/fd/calculations/custom \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "principal": 100000,
    "termMonths": 12,
    "interestRate": 8.5,
    "interestType": "COMPOUND",
    "compoundingFrequency": "MONTHLY"
  }'
```

**Response (200 OK):**
```json
{
  "calculationId": "CALC-20260911-0003",
  "principal": 100000,
  "termMonths": 12,
  "interestRate": 8.5,
  "maturityAmount": 108856.42,
  "interestEarned": 8856.42
}
```

---

### 11. Evict Rate Cache

**Purpose:** Clear the rate cache (force fresh rate lookup)

**Method:** POST  
**URL:** `http://localhost:8084/api/v1/fd/cache/rates/evict`  
**Auth:** Required (CUSTOMER role)

**Curl:**
```bash
curl -X POST http://localhost:8084/api/v1/fd/cache/rates/evict \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Rate cache evicted"
}
```

---

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

### 2. Create FD Account

**Purpose:** Create a new FD account

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

### 3. Get FD Account

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

### 4. Create FD with Transaction

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

### 5. Get Transaction History

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

### 6. Interest Quote

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
  "mode": "COMPOUND"
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
    "mode": "COMPOUND"
  }'
```

**Response (200 OK):**
```json
{
  "maturityAmount": 108328.71,
  "interest": 8328.71,
  "mode": "COMPOUND",
  "basis": "Monthly quotation; actual daily accrual may differ"
}
```

---

### 7. Get Interest Accounts

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
    "interestMode": "COMPOUND",
    "lastInterestCredit": "2024-10-11"
  }
]
```

---

### 8. Configure Interest Settings

**Purpose:** Configure interest calculation mode for an account

**Method:** PUT  
**URL:** `http://localhost:8086/api/fd/interest/{account}/settings`  
**Auth:** Required (ADMIN)

**Request Body:**
```json
{
  "mode": "COMPOUND"
}
```

**Curl:**
```bash
curl -X PUT http://localhost:8086/api/fd/interest/FD2024091100001/settings \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "COMPOUND"
  }'
```

**Response (200 OK):**
```json
{
  "fdAccountNo": "FD2024091100001",
  "mode": "COMPOUND"
}
```

---

### 9. Clock Status (Admin Only - Testing)

**Purpose:** Get current clock status (for time travel testing)

**Method:** GET  
**URL:** `http://localhost:8086/api/fd/clock`  
**Auth:** Required (ADMIN)

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

### 10. Advance Clock (Admin Only - Testing)

**Purpose:** Advance the business clock by N days

**Method:** POST  
**URL:** `http://localhost:8086/api/fd/clock/advance`  
**Auth:** Required (ADMIN)

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

### 11. Reset Clock (Admin Only - Testing)

**Purpose:** Reset the business clock to real time

**Method:** POST  
**URL:** `http://localhost:8086/api/fd/clock/reset`  
**Auth:** Required (ADMIN)

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
  -d '{"productCode":"FD001","principal":100000,"termMonths":12,"interestType":"COMPOUND"}'

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
