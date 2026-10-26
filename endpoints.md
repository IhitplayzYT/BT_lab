# Backend API Endpoints Documentation

This document describes the backend HTTP APIs. JSON blocks containing type labels such as "number" are field-shape illustrations, not literal request bodies. Example values and seeded product availability depend on the database. Error bodies vary by service and security filter; the common error examples are illustrative, not a uniform contract. Statement-service runs separately from root Compose.

---

## Table of Contents

1. [Authentication Service](#authentication-service)
2. [FD Account Service](#fd-account-service)
3. [Product & Pricing Service](#product--pricing-service)
4. [FD Calculator Service (Legacy)](#fd-calculator-service-legacy)
5. [FD Calculator Service (Mod 4)](#fd-calculator-service-mod-4)
6. [Notification Service](#notification-service)
7. [Statement Service](#statement-service)
8. [Interest Batch Service](#interest-batch-service)

---

## Authentication Service

**Base Path:** `/api/auth`  
**Port:** 8090 (default)

### Health Check

#### `GET /health`

**Purpose:** Service health check endpoint

**Authentication:** None

**Request:** None

**Response:**
```json
{
  "status": "UP",
  "service": "auth-service"
}
```

---

### Customer Authentication

#### `POST /api/auth/signup`

**Purpose:** Direct customer registration without OTP verification

**Authentication:** None

**Request Body:**
```json
{
  "username": "string (max 100 chars, required)",
  "password": "string (min 8, max 200 chars, required)",
  "email": "string (max 255 chars, required; no @Email format constraint)"
}
```

**Response (201 Created):**
```json
{
  "accessToken": "string",
  "tokenType": "Bearer",
  "expiresIn": "number (seconds)",
  "refreshToken": "string",
  "username": "string",
  "roles": ["CUSTOMER"]
}
```

**Error Response (409 Conflict):**
```json
{
  "status": "error",
  "message": "Username or email already exists"
}
```

---

#### `POST /api/auth/login`

**Purpose:** Authenticate user and issue JWT tokens

**Authentication:** None

**Request Body:**
```json
{
  "username": "string (max 100 chars, required)",
  "password": "string (max 200 chars, required)"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "string",
  "tokenType": "Bearer",
  "expiresIn": "number (seconds)",
  "refreshToken": "string",
  "username": "string",
  "roles": ["string"]
}
```

**Error Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Invalid username or password"
}
```

**Error Response (429 Too Many Requests):**
```json
{
  "status": "error",
  "message": "Too many failed attempts. Try again in a minute."
}
```

---

#### `POST /api/auth/refresh`

**Purpose:** Refresh access token using refresh token

**Authentication:** None

**Request Body:**
```json
{
  "refreshToken": "string (required)"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "string",
  "tokenType": "Bearer",
  "expiresIn": "number (seconds)",
  "refreshToken": "string",
  "username": "string",
  "roles": ["string"]
}
```

---

#### `POST /api/auth/logout`

**Purpose:** Invalidate refresh token and logout user

**Authentication:** None

**Request Body:**
```json
{
  "refreshToken": "string (required)"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

---

### OTP-Based Signup Flow

#### `POST /api/auth/init-signup`

**Purpose:** Initialize signup process by sending OTP to email

**Authentication:** None

**Request Body:**
```json
{
  "username": "string (max 100 chars, required)",
  "password": "string (min 8, max 200 chars, required)",
  "email": "string (max 255 chars, required; no @Email format constraint)"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "OTP sent to your email"
}
```

**Error Response (409 Conflict):**
```json
{
  "status": "error",
  "message": "Username 'xxx' is already taken. Please choose a different username."
}
```

---

#### `POST /api/auth/verify-otp`

**Purpose:** Verify OTP and complete user registration

**Authentication:** None

**Request Body:**
```json
{
  "email": "string (max 255 chars, required)",
  "otp": "string (exactly 6 digits, required)"
}
```

**Response (201 Created):**
```json
{
  "accessToken": "string",
  "tokenType": "Bearer",
  "expiresIn": "number (seconds)",
  "refreshToken": "string",
  "username": "string",
  "roles": ["CUSTOMER"]
}
```

**Error Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Invalid OTP. Please try again."
}
```

**Error Response (410 Gone):**
```json
{
  "status": "error",
  "message": "OTP has expired. Please request a new one."
}
```

---

#### `POST /api/auth/resend-otp`

**Purpose:** Resend OTP for pending signup

**Authentication:** None

**Request Body:**
```json
{
  "email": "string (max 255 chars, required)"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "New OTP sent to your email"
}
```

---

### Admin User Management

#### `GET /api/auth/admin/users`

**Purpose:** Get list of all users (Admin only)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Request:** None

**Response (200 OK):**
```json
{
  "users": [
    {
      "id": "number",
      "username": "string",
      "email": "string",
      "roles": ["string"],
      "enabled": "boolean",
      "createdAt": "string (ISO-8601)",
      "lastLoginAt": "string (ISO-8601)"
    }
  ]
}
```

---

#### `POST /api/auth/admin/users`

**Purpose:** Create a new user with specific roles (Admin only)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Request Body:**
```json
{
  "username": "string (max 100 chars, required)",
  "password": "string (min 8, max 200 chars, required)",
  "email": "string (max 255 chars, required)",
  "roles": ["string"]
}
```

**Response (201 Created):**
```json
{
  "username": "string",
  "roles": ["string"]
}
```

---

#### `PUT /api/auth/admin/users/{username}/roles`

**Purpose:** Update user roles (Admin only)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Path Parameters:**
- `username`: Username to update

**Request Body:**
```json
{
  "roles": ["string"]
}
```

**Response (200 OK):**
```json
{
  "username": "string",
  "roles": ["string"]
}
```

**Note:** This invalidates all existing refresh tokens for the user.

---

#### `PUT /api/auth/admin/users/{username}/ban`

**Purpose:** Ban a user (Admin only)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Path Parameters:**
- `username`: Username to ban

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "User banned successfully"
}
```

---

#### `PUT /api/auth/admin/users/{username}/unban`

**Purpose:** Unban a user (Admin only)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Path Parameters:**
- `username`: Username to unban

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "User unbanned successfully"
}
```

---

#### `DELETE /api/auth/admin/users/{username}`

**Purpose:** Delete a user (Admin only)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Path Parameters:**
- `username`: Username to delete

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "User deleted successfully"
}
```

---

## FD Account Service

**Base Path:** `/api/fd`  
**Port:** 8086 (default)

### Health Check

#### `GET /health`

**Purpose:** Service health check

**Authentication:** None

**Response:**
```
FD Module is running
```

---

### FD Account Management

#### `POST /api/fd/account/create`

**Purpose:** Create a new FD account directly (see role requirements below)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Request Body:**
```json
{
  "customerId": "string (required)",
  "productCode": "string (required)",
  "principalAmount": "number (>= 0.01, required)",
  "termMonths": "number (>= 1, required)",
  "branchCode": "string (required)"
}
```

**Response (200 OK):**
```json
{
  "fdAccountNo": "string",
  "customerId": "string",
  "productCode": "string",
  "principalAmount": "number",
  "interestRate": "number",
  "termMonths": "number",
  "maturityDate": "string (ISO-8601)",
  "status": "string",
  "createdBy": "string"
}
```

---

#### `POST /api/fd/account/apply`

**Purpose:** Apply for a new FD account (Customer only)

**Authentication:** Required (CUSTOMER role)

**Request Body:**
```json
{
  "productCode": "string (required)",
  "principalAmount": "number (>= 10000.00, required)",
  "termMonths": "string (numeric, required)",
  "applicantFullName": "string (letters and spaces only, max 255 chars, required)",
  "applicantFirstName": "string (max 100 chars)",
  "applicantMiddleName": "string (max 100 chars)",
  "applicantLastName": "string (max 100 chars)",
  "applicantAge": "number (18-120)",
  "applicantGender": "string (max 20 chars)",
  "applicantOccupation": "string (max 100 chars)",
  "applicantAnnualIncome": "number",
  "applicantAddress": "string (max 500 chars)",
  "applicantCity": "string (max 100 chars)",
  "applicantState": "string (max 100 chars)",
  "applicantPincode": "string (6 digits, pattern: ^[1-9][0-9]{5}$)",
  "applicantNationality": "string (max 50 chars)",
  "applicantMaritalStatus": "string (max 20 chars)",
  "applicantEmail": "string (valid email, max 255 chars, required)",
  "applicantPhone": "string (10 digits, pattern: ^[0-9]{10}$, required)",
  "applicantPan": "string (pattern: ^[A-Z]{5}[0-9]{4}[A-Z]$, required)",
  "applicantAccountNumber": "string (9-18 digits, required)",
  "applicantIfsc": "string (pattern: ^[A-Z]{4}0[A-Z0-9]{6}$, required)",
  "customerCategory": "string (GENERAL, SENIOR_CITIZEN, EMPLOYEE, STUDENT, or CORPORATE)",
  "accountHolderRoles": ["OWNER", "CO-OWNER"],
  "coOwnerName": "string (required when CO-OWNER is selected)",
  "nominees": [
    {
      "name": "string (max 255 chars, required)",
      "relation": "string (max 50 chars, required)"
    }
  ],
  "nomineeName": "string (max 255 chars, deprecated)",
  "nomineeRelation": "string (max 50 chars, deprecated)"
}
```

**Response (200 OK):**
```json
{
  "fdAccountNo": "string",
  "customerId": "string",
  "productCode": "string",
  "principalAmount": "string",
  "interestRate": "string",
  "termMonths": "number",
  "maturityDate": "string",
  "status": "string",
  "approvalStatus": "string",
  "createdAt": "string",
  "applicantFullName": "string",
  "applicantFirstName": "string",
  "applicantMiddleName": "string",
  "applicantLastName": "string",
  "applicantAge": "number",
  "applicantGender": "string",
  "applicantOccupation": "string",
  "applicantAnnualIncome": "string",
  "applicantAddress": "string",
  "applicantCity": "string",
  "applicantState": "string",
  "applicantPincode": "string",
  "applicantNationality": "string",
  "applicantMaritalStatus": "string",
  "applicantEmail": "string",
  "applicantPhone": "string",
  "applicantPan": "string",
  "applicantAccountNumber": "string",
  "applicantIfsc": "string",
  "accruedInterest": "string",
  "maturityAmount": "string",
  "nomineeName": "string",
  "nomineeRelation": "string",
  "customerCategory": "string",
  "accountHolderRoles": "OWNER,CO-OWNER",
  "coOwnerName": "string"
}
```

#### `PUT /api/fd/account/profile/category`

**Purpose:** Save the signed-in customer's default FD pricing category.

**Authentication:** Required (CUSTOMER role)

**Request:** `{ "customerCategory": "SENIOR_CITIZEN" }`

The category is stored on the customer profile and used by product rate calculations.

---

#### `POST /api/fd/account/approve`

**Purpose:** Approve or reject FD application (see role requirements below)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Request Body:**
```json
{
  "fdAccountNo": "string (required)",
  "action": "string (APPROVE or REJECT, required)",
  "rejectionReason": "string (optional)"
}
```

**Response (200 OK):**
```json
{
  "message": "FD application processed successfully"
}
```

---

#### `GET /api/fd/account/pending`

**Purpose:** Get list of pending FD applications (see role requirements below)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Query Parameters:** None

**Response (200 OK):**
```json
[
  {
    "fdAccountNo": "string",
    "customerId": "string",
    "productCode": "string",
    "principalAmount": "string",
    "interestRate": "string",
    "termMonths": "number",
    "maturityDate": "string",
    "status": "string",
    "approvalStatus": "string",
    "createdAt": "string",
    "applicantFullName": "string",
    "applicantFirstName": "string",
    "applicantMiddleName": "string",
    "applicantLastName": "string",
    "applicantAge": "number",
    "applicantGender": "string",
    "applicantOccupation": "string",
    "applicantAnnualIncome": "string",
    "applicantAddress": "string",
    "applicantCity": "string",
    "applicantState": "string",
    "applicantPincode": "string",
    "applicantNationality": "string",
    "applicantMaritalStatus": "string",
    "applicantEmail": "string",
    "applicantPhone": "string",
    "applicantPan": "string",
    "applicantAccountNumber": "string",
    "applicantIfsc": "string",
    "accruedInterest": "string",
    "maturityAmount": "string"
  }
]
```

---

#### `GET /api/fd/account/my-applications`

**Purpose:** Get current customer's FD applications (Customer only)

**Authentication:** Required (CUSTOMER role)

**Response (200 OK):** Same format as `/pending` endpoint

---

#### `GET /api/fd/account/all-applications`

**Purpose:** Get all FD applications (see role requirements below)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Response (200 OK):** Same format as `/pending` endpoint

---

#### `GET /api/fd/account/{fdAccountNo}`

**Purpose:** Get FD account details by account number

**Authentication:** Required (BANK_OFFICER, ADMIN, or CUSTOMER role - customers can only access their own accounts)

**Path Parameters:**
- `fdAccountNo`: FD account number

**Response (200 OK):**
```json
{
  "fdAccountNo": "string",
  "customerId": "string",
  "productCode": "string",
  "principalAmount": "number",
  "interestRate": "number",
  "termMonths": "number",
  "maturityDate": "string (ISO-8601)",
  "status": "string",
  "approvalStatus": "string",
  "createdAt": "string (ISO-8601)",
  "applicantFullName": "string",
  "applicantFirstName": "string",
  "applicantMiddleName": "string",
  "applicantLastName": "string",
  "applicantAge": "number",
  "applicantGender": "string",
  "applicantOccupation": "string",
  "applicantAnnualIncome": "number",
  "applicantAddress": "string",
  "applicantCity": "string",
  "applicantState": "string",
  "applicantPincode": "string",
  "applicantNationality": "string",
  "applicantMaritalStatus": "string",
  "applicantEmail": "string",
  "applicantPhone": "string",
  "applicantPan": "string",
  "applicantAccountNumber": "string",
  "applicantIfsc": "string",
  "nomineeName": "string",
  "nomineeRelation": "string"
}
```

---

#### `POST /api/fd/account/{fdAccountNo}/withdraw`

**Purpose:** Withdraw FD application (Customer only)

**Authentication:** Required (CUSTOMER role)

**Path Parameters:**
- `fdAccountNo`: FD account number

**Response (200 OK):**
```json
{
  "message": "Application withdrawn successfully"
}
```

---

### FD Bundle Operations

#### `POST /api/fd/account/bundle/apply`

**Purpose:** Apply for a bundle of FD accounts (Customer only)

**Authentication:** Required (CUSTOMER role)

**Request Body:**
```json
{
  "bundleName": "string (max 255 chars, required)",
  "bundleDescription": "string",
  "totalAmount": "number (required)",
  "estimatedReturn": "number",
  "fdItems": [
    {
      "productCode": "string (required)",
      "principalAmount": "number (required)",
      "tenureMonths": "number (required)",
      "interestType": "string",
      "applicantFirstName": "string",
      "applicantMiddleName": "string",
      "applicantLastName": "string",
      "applicantAge": "number",
      "applicantGender": "string",
      "applicantOccupation": "string",
      "applicantAnnualIncome": "number",
      "applicantAddress": "string",
      "applicantCity": "string",
      "applicantState": "string",
      "applicantPincode": "string",
      "applicantNationality": "string",
      "applicantMaritalStatus": "string",
      "applicantEmail": "string",
      "applicantPhone": "string",
      "applicantPan": "string",
      "applicantAccountNumber": "string",
      "applicantIfsc": "string",
      "nomineeName": "string",
      "nomineeRelation": "string"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "bundleId": "string",
  "customerId": "string",
  "bundleName": "string",
  "bundleDescription": "string",
  "totalAmount": "number",
  "estimatedReturn": "number",
  "status": "string",
  "approvalStatus": "string",
  "approvedBy": "string",
  "approvedAt": "string (ISO-8601)",
  "rejectionReason": "string",
  "createdAt": "string (ISO-8601)",
  "fdItems": [
    {
      "fdAccountNo": "string",
      "productCode": "string",
      "principalAmount": "number",
      "tenureMonths": "number",
      "status": "string",
      "approvalStatus": "string"
    }
  ]
}
```

---

#### `POST /api/fd/account/bundle/{bundleId}/approve`

**Purpose:** Approve or reject bundle application (see role requirements below)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Path Parameters:**
- `bundleId`: Bundle ID

**Request Body:**
```json
{
  "action": "string (APPROVE or REJECT, required)",
  "rejectionReason": "string (optional)"
}
```

**Response (200 OK):**
```json
{
  "message": "Bundle processed successfully"
}
```

---

#### `GET /api/fd/account/bundle/pending`

**Purpose:** Get pending bundle applications (see role requirements below)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Response (200 OK):**
```json
[
  {
    "bundleId": "string",
    "customerId": "string",
    "bundleName": "string",
    "bundleDescription": "string",
    "totalAmount": "number",
    "estimatedReturn": "number",
    "status": "string",
    "approvalStatus": "string",
    "createdAt": "string (ISO-8601)",
    "customerDetails": {
      "fullName": "string",
      "firstName": "string",
      "lastName": "string",
      "age": "number",
      "gender": "string",
      "occupation": "string",
      "annualIncome": "number",
      "email": "string",
      "phone": "string",
      "maritalStatus": "string",
      "nationality": "string"
    }
  }
]
```

---

#### `GET /api/fd/account/bundle/my-bundles`

**Purpose:** Get current customer's bundle applications (Customer only)

**Authentication:** Required (CUSTOMER role)

**Response (200 OK):** Same format as `/bundle/pending` endpoint

---

### FD Transaction Operations

#### `POST /api/fd/account/create-with-txn`

**Purpose:** Create FD account with initial deposit transaction (see role requirements below)

**Authentication:** Required (BANK_OFFICER role)

**Request Body:** Same as `/api/fd/account/create`

**Response (200 OK):**
```json
{
  "fdAccountNo": "string",
  "customerId": "string",
  "productCode": "string",
  "principalAmount": "number",
  "interestRate": "number",
  "termMonths": "number",
  "maturityDate": "string (ISO-8601)",
  "status": "string",
  "createdBy": "string",
  "transactionId": "string"
}
```

---

#### `GET /api/fd/account/{fdAccountNo}/transactions`

**Purpose:** Get transaction history for FD account

**Authentication:** Required (BANK_OFFICER, ADMIN, or CUSTOMER role - customers can only access their own accounts)

**Path Parameters:**
- `fdAccountNo`: FD account number

**Response (200 OK):**
```json
[
  {
    "txnId": "string",
    "fdAccountNo": "string",
    "txnType": "string (DEPOSIT, INTEREST, MATURITY_PAYOUT, PREMATURE_WITHDRAWAL)",
    "txnAmount": "number",
    "txnTimestamp": "string (ISO-8601)",
    "txnDescription": "string",
    "balanceAfterTxn": "number"
  }
]
```

---

### Ledger Operations

#### `GET /api/fd/ledger/search-by-name`

**Purpose:** Search FD accounts by customer name (see role requirements below)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Query Parameters:**
- `name`: Customer name to search (partial match, case-insensitive)
- `page`: Page number (default: 0)
- `size`: Page size (default: 50)

**Response (200 OK):**
```json
[
  {
    "fdAccountNo": "string",
    "customerId": "string",
    "productCode": "string",
    "principalAmount": "number",
    "interestRate": "number",
    "termMonths": "number",
    "maturityDate": "string (ISO-8601)",
    "status": "string",
    "applicantFullName": "string",
    "applicantEmail": "string",
    "applicantPhone": "string"
  }
]
```

---

#### `GET /api/fd/ledger/search-by-id`

**Purpose:** Search FD accounts by customer ID (see role requirements below)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Query Parameters:**
- `customerId`: Customer ID to search (partial match, case-insensitive)
- `page`: Page number (default: 0)
- `size`: Page size (default: 50)

**Response (200 OK):** Same format as `/search-by-name`

---

#### `GET /api/fd/ledger/all`

**Purpose:** Get all FD accounts with pagination (see role requirements below)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Query Parameters:**
- `page`: Page number (default: 0)
- `size`: Page size (default: 50)

**Response (200 OK):** Same format as `/search-by-name`

---

#### `GET /api/fd/ledger/{fdAccountNo}`

**Purpose:** Get account details for specific FD account

**Authentication:** Required (BANK_OFFICER, ADMIN, or CUSTOMER role)

**Path Parameters:**
- `fdAccountNo`: FD account number

**Response (200 OK):** Same format as `/search-by-name`

---

#### `GET /api/fd/ledger/{fdAccountNo}/transactions`

**Purpose:** Get transaction history for specific FD account (ledger view)

**Authentication:** Required (BANK_OFFICER, ADMIN, or CUSTOMER role)

**Path Parameters:**
- `fdAccountNo`: FD account number

**Response (200 OK):** Same format as `/api/fd/account/{fdAccountNo}/transactions`

---

### Journal Operations

#### `GET /api/fd/journal/all`

**Purpose:** Get all transactions in general journal (see role requirements below)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Query Parameters:**
- `page`: Page number (default: 0)
- `size`: Page size (default: 100)

**Response (200 OK):**
```json
[
  {
    "txnId": "string",
    "fdAccountNo": "string",
    "txnType": "string",
    "txnAmount": "number",
    "txnTimestamp": "string (ISO-8601)",
    "txnDescription": "string",
    "balanceAfterTxn": "number"
  }
]
```

---

#### `GET /api/fd/journal/by-type`

**Purpose:** Get transactions filtered by type (see role requirements below)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Query Parameters:**
- `txnType`: Transaction type to filter (DEPOSIT, INTEREST, MATURITY_PAYOUT, PREMATURE_WITHDRAWAL)
- `page`: Page number (default: 0)
- `size`: Page size (default: 100)

**Response (200 OK):** Same format as `/journal/all`

---

#### `GET /api/fd/journal/summary`

**Purpose:** Get journal summary statistics (see role requirements below)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Response (200 OK):**
```json
{
  "totalTransactions": "number",
  "totalDeposits": "number",
  "totalInterest": "number",
  "totalMaturityPayouts": "number",
  "totalPrematureWithdrawals": "number"
}
```

---

### Customer Category

#### `GET /internal/customers/{username}/categories`

**Purpose:** Get customer categories for rate calculation (Internal endpoint)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Path Parameters:**
- `username`: Customer username

**Response (200 OK):**
```json
{
  "username": "string",
  "customerId": "string",
  "categories": ["GENERAL", "SENIOR_CITIZEN", "EMPLOYEE"]
}
```

---

### Service Integration

#### `GET /api/v1/integration/products/active`

**Purpose:** Get active products from Product & Pricing service (see role requirements below)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Query Parameters:**
- `type`: Filter by product type (e.g., FD)

**Response (200 OK):**
```json
[
  {
    "productCode": "string",
    "productName": "string",
    "productType": "string",
    "status": "string",
    "termLimit": {},
    "rateLimit": {},
    "charges": {}
  }
]
```

---

#### `GET /api/v1/integration/products/{productCode}`

**Purpose:** Get specific product from Product & Pricing service (see role requirements below)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Path Parameters:**
- `productCode`: Product code

**Response (200 OK):** Product details JSON

---

#### `GET /api/v1/integration/products/{productCode}/validate`

**Purpose:** Validate product for account creation (see role requirements below)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Path Parameters:**
- `productCode`: Product code

**Query Parameters:**
- `termMonths`: Term in months
- `amount`: Deposit amount
- `age`: Customer age

**Response (200 OK):** Validation result JSON

---

#### `POST /api/v1/integration/calculator/calculate`

**Purpose:** Calculate FD maturity using Calculator service

**Authentication:** Required (BANK_OFFICER, ADMIN, or CUSTOMER role)

**Query Parameters:**
- `productCode`: Product code (required)
- `principal`: Principal amount (required)
- `termMonths`: Term in months (required)
- `interestType`: Interest type - CREDIT, SIMPLE, or COMPOUND (optional)

**Response (200 OK):** Calculation result JSON

---

#### `GET /api/v1/integration/calculator/products/{productCode}/preview`

**Purpose:** Preview product constraints from Calculator service

**Authentication:** Required (BANK_OFFICER, ADMIN, or CUSTOMER role)

**Path Parameters:**
- `productCode`: Product code

**Response (200 OK):** Product preview JSON

---

### Clock/Time Travel (Testing)

#### `GET /api/fd/clock`

**Purpose:** Get current clock status (Testing endpoint)

**Authentication:** Required (BANK_OFFICER, ADMIN, or CUSTOMER role)

**Response (200 OK):**
```json
{
  "timeTravelEnabled": "boolean",
  "realDate": "string (ISO-8601)",
  "businessDate": "string (ISO-8601)",
  "offsetDays": "number"
}
```

---

#### `POST /api/fd/clock/advance`

**Purpose:** Advance business clock by specified days (Testing endpoint)

**Authentication:** Required (BANK_OFFICER, ADMIN, or CUSTOMER role)

**Request Body:**
```json
{
  "days": "number (required)"
}
```

**Response (200 OK):** Same format as `GET /api/fd/clock`

**Note:** This triggers interest accrual and maturity checks after time advance.

---

#### `POST /api/fd/clock/reset`

**Purpose:** Reset business clock to real date (Testing endpoint)

**Authentication:** Required (BANK_OFFICER, ADMIN, or CUSTOMER role)

**Response (200 OK):** Same format as `GET /api/fd/clock`

---

### Interest Operations

#### `POST /api/fd/interest/quote`

**Purpose:** Calculate interest quote for FD (All roles)

**Authentication:** Required (ADMIN, BANK_OFFICER, or CUSTOMER role)

**Request Body:**
```json
{
  "principal": "number (>= 0.01, required)",
  "annualRate": "number (>= 0, required)",
  "months": "number (1-1200, required)",
  "mode": "string (required)"
}
```

**Response (200 OK):**
```json
{
  "maturityAmount": "number",
  "interest": "number",
  "mode": "string",
  "basis": "string"
}
```

---

#### `GET /api/fd/interest/accounts`

**Purpose:** Get interest accounts overview (see role requirements below)

**Authentication:** Required (ADMIN or BANK_OFFICER role)

**Response (200 OK):** Interest accounts data

---

#### `PUT /api/fd/interest/{account}/settings`

**Purpose:** Configure interest settings for an account (Admin only)

**Authentication:** Required (ADMIN role)

**Path Parameters:**
- `account`: FD account number

**Request Body:**
```json
{
  "mode": "string (required)"
}
```

**Response (200 OK):**
```json
{
  "fdAccountNo": "string",
  "mode": "string"
}
```

---

### Maturity Operations

#### `POST /api/fd/maturity/run`

**Purpose:** Manual maturity run for catch-up after downtime (Admin only)

**Authentication:** Required (ADMIN role)

**Request Body:**
```json
{
  "businessDate": "string (ISO-8601, optional)"
}
```

**Response (200 OK):**
```json
{
  "businessDate": "string (yyyy-MM-dd)",
  "matured": "number",
  "skipped": "number",
  "failed": "number"
}
```

**Note:** Same work as the 04:00 scheduled job. If no businessDate is provided, uses current business date.

---

### Withdrawal Operations

#### `GET /api/fd/account/{fdAccountNo}/withdrawal-inquiry`

**Purpose:** Get withdrawal inquiry for early withdrawal (All roles)

**Authentication:** Required (BANK_OFFICER, ADMIN, or CUSTOMER role - customers can only access their own accounts)

**Path Parameters:**
- `fdAccountNo`: FD account number

**Response (200 OK):**
```json
{
  "accountNumber": "string",
  "originalPrincipal": "number",
  "interestAccruedToDate": "number",
  "penaltyAmount": "number",
  "finalPayoutAmount": "number",
  "inquiryDate": "yyyy-MM-dd"
}
```

---

#### `POST /api/fd/account/{fdAccountNo}/withdrawal`

**Purpose:** Perform early withdrawal from FD (All roles)

**Authentication:** Required (BANK_OFFICER, ADMIN, or CUSTOMER role - customers can only access their own accounts)

**Path Parameters:**
- `fdAccountNo`: FD account number

**Request Body:**
```json
{
  "reason": "string (optional)"
}
```

**Response (200 OK):**
```json
{
  "accountNumber": "string",
  "originalPrincipal": "number",
  "interestAccruedToDate": "number",
  "penaltyAmount": "number",
  "finalPayoutAmount": "number",
  "inquiryDate": "yyyy-MM-dd"
}
```

---

### Report Operations

#### `GET /api/report/fd-summary`

**Purpose:** Get FD summary report by status (see role requirements below)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Query Parameters:**
- `status`: FD status (ACTIVE, MATURED, PREMATURELY_CLOSED, REJECTED, default: ACTIVE)
- `format`: Output format (json, csv, pdf, xlsx, default: json)

**Response (200 OK):** Report data in specified format

---

#### `GET /api/report/customer-portfolio`

**Purpose:** Get customer portfolio report (All roles)

**Authentication:** Required (CUSTOMER, BANK_OFFICER, or ADMIN role)

**Query Parameters:**
- `customerId`: Customer ID (required for staff, ignored for customers)
- `format`: Output format (json, csv, pdf, xlsx, default: json)

**Response (200 OK):** Report data in specified format

**Note:** For PDF format with charts, customers get a professional PDF with visualizations.

---

#### `GET /api/report/maturity-summary`

**Purpose:** Get maturity summary report (see role requirements below)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Query Parameters:**
- `days`: Days to look ahead (default: 30)
- `format`: Output format (json, csv, pdf, xlsx, default: json)

**Response (200 OK):** Report data in specified format

---

#### `GET /api/report/interest-report`

**Purpose:** Get interest report (see role requirements below)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Query Parameters:**
- `format`: Output format (json, csv, pdf, xlsx, default: pdf)

**Response (200 OK):** Report data in specified format

---

#### `GET /api/report/transaction-report`

**Purpose:** Get transaction report (see role requirements below)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Query Parameters:**
- `format`: Output format (json, csv, pdf, xlsx, default: xlsx)

**Response (200 OK):** Report data in specified format

---

#### `GET /api/report/interest-history/{fdAccountNo}`

**Purpose:** Get interest history for specific FD (All roles)

**Authentication:** Required (CUSTOMER, BANK_OFFICER, or ADMIN role - customers can only access their own accounts)

**Path Parameters:**
- `fdAccountNo`: FD account number

**Query Parameters:**
- `format`: Output format (json, csv, pdf, xlsx, default: json)

**Response (200 OK):** Report data in specified format

---

#### `POST /api/report/extract/run`

**Purpose:** Run data extract for a business date (see role requirements below)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Query Parameters:**
- `date`: Business date (yyyy-MM-dd, optional, default: current business date)

**Response (200 OK):**
```json
{
  "businessDate": "string (ISO-8601)",
  "file": "string (file path)",
  "created": "boolean",
  "accounts": "number"
}
```

**Note:** Idempotent - an existing file is never overwritten.

---

#### `POST /api/report/python`

**Purpose:** Run Python report generator on extract (see role requirements below)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Query Parameters:**
- `date`: Business date (yyyy-MM-dd, optional, default: current business date)

**Response (200 OK):** Python report output

**Error Response (502 Bad Gateway):**
```json
{
  "status": "error",
  "message": "string"
}
```

---

### Chart Data Operations

#### `GET /api/charts/portfolio-summary`

**Purpose:** Get customer portfolio chart data (All roles)

**Authentication:** Required (CUSTOMER, BANK_OFFICER, or ADMIN role)

**Query Parameters:**
- `customerId`: Customer ID (required for staff, ignored for customers)

**Response (200 OK):**
```json
{
  "title": "string",
  "columns": ["string"],
  "data": [{}],
  "rowCount": "number"
}
```

---

#### `GET /api/charts/fd-summary/{status}`

**Purpose:** Get FD summary chart data by status (see role requirements below)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Path Parameters:**
- `status`: FD status (ACTIVE, MATURED, PREMATURELY_CLOSED)

**Response (200 OK):** Chart data JSON

---

#### `GET /api/charts/maturity-timeline`

**Purpose:** Get maturity timeline chart data (see role requirements below)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Query Parameters:**
- `days`: Days to look ahead (default: 30)

**Response (200 OK):** Chart data JSON

---

#### `GET /api/charts/interest-history/{fdAccountNo}`

**Purpose:** Get interest history chart data for an FD (All roles)

**Authentication:** Required (CUSTOMER, BANK_OFFICER, or ADMIN role - customers can only access their own accounts)

**Path Parameters:**
- `fdAccountNo`: FD account number

**Response (200 OK):** Chart data JSON

---

#### `GET /api/charts/portfolio-distribution`

**Purpose:** Get portfolio distribution by product and currency (All roles)

**Authentication:** Required (CUSTOMER, BANK_OFFICER, or ADMIN role)

**Query Parameters:**
- `customerId`: Customer ID (required for staff, ignored for customers)

**Response (200 OK):**
```json
{
  "title": "string",
  "distribution": {
    "productCode": {
      "currency": "number"
    }
  },
  "totalAccounts": "number",
  "totalsByCurrency": {
    "currency": "number"
  }
}
```

---

## Product & Pricing Service

**Base Path:** `/api/product` or `/api/v1/products`  
**Port:** 8080 (default)

### Product CRUD

#### `POST /api/product` or `POST /api/v1/products`

**Purpose:** Create a new banking product (see role requirements below)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Request Body:**
```json
{
  "productCode": "string (max 50 chars, required)",
  "productName": "string (required)",
  "productType": "string (required)",
  "currency": "string (max 10 chars, required)",
  "effectiveDate": "string (ISO-8601)",
  "endDate": "string (ISO-8601)",
  "termLimit": {
    "min": "number",
    "max": "number"
  },
  "rateLimit": {
    "min": "number",
    "max": "number"
  },
  "status": "string (ACTIVE|INACTIVE|DRAFT|SUSPENDED|RETIRED, required)",
  "interestType": "string",
  "minAge": "number",
  "minDeposit": "number",
  "maxDeposit": "number",
  "minWithdrawal": "number",
  "maxWithdrawal": "number",
  "allowedTransactionTypes": "string",
  "balanceTypes": "string",
  "charges": {
    "interestCreditFrequency": "MONTHLY",
    "taxDeduction": true,
    "withdrawalFees": 1.0
  },
  "allowedRoles": ["string"],
  "rateVariations": [
    {
      "customerCategory": "string",
      "rateModifier": "number"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "productId": "number",
  "productCode": "string",
  "productName": "string",
  "productType": "string",
  "currency": "string",
  "effectiveDate": "string (ISO-8601)",
  "endDate": "string (ISO-8601)",
  "termLimit": {},
  "rateLimit": {},
  "status": "string",
  "interestType": "string",
  "minAge": "number",
  "minDeposit": "number",
  "maxDeposit": "number",
  "minWithdrawal": "number",
  "maxWithdrawal": "number",
  "allowedTransactionTypes": "string",
  "balanceTypes": "string",
  "charges": {},
  "allowedRoles": ["string"],
  "rateVariations": [{}],
  "createdBy": "string",
  "updatedBy": "string",
  "createdAt": "string (ISO-8601)",
  "updatedAt": "string (ISO-8601)"
}
```

---

#### `PUT /api/product/{productCode}` or `PUT /api/v1/products/{productCode}`

**Purpose:** Update an existing banking product (see role requirements below)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Path Parameters:**
- `productCode`: Product code to update

**Request Body:** Same as POST endpoint

**Response (200 OK):** Same format as POST response

---

#### `DELETE /api/product/{productCode}` or `DELETE /api/v1/products/{productCode}`

**Purpose:** Soft-delete/retire a product (see role requirements below)

**Authentication:** Required (BANK_OFFICER or ADMIN role)

**Path Parameters:**
- `productCode`: Product code to retire

**Response (200 OK):** Product response with status set to RETIRED

---

#### `DELETE /api/product/{productCode}/permanent` or `DELETE /api/v1/products/{productCode}/permanent`

**Purpose:** Permanently delete a product (Admin only)

**Authentication:** Required (ADMIN role only)

**Path Parameters:**
- `productCode`: Product code to permanently delete

**Response (200 OK):** Empty body

---

### Product Search & Retrieval

#### `GET /api/product/search` or `GET /api/v1/products/search`

**Purpose:** Search products by filters (see role requirements below)

**Authentication:** Required (BANK_OFFICER, ADMIN, or CUSTOMER role)

**Query Parameters:**
- `productType`: Type of product (e.g., FD, SAVINGS, LOAN)
- `startDate`: Start effective date (yyyy-MM-dd)
- `endDate`: End effective date (yyyy-MM-dd)
- `status`: Product status (ACTIVE, INACTIVE, DRAFT, SUSPENDED, RETIRED)
- `page`: Page index (default: 0)
- `size`: Page size (default: 50)
- `sortBy`: Sort field (default: productId)

**Response (200 OK):** Array of ProductResponseDTO

---

#### `GET /api/product/active` or `GET /api/v1/products/active`

**Purpose:** List active products (Public endpoint - no authentication required)

**Authentication:** None

**Query Parameters:**
- `type`: Filter by product type (e.g., FD)

**Response (200 OK):** Array of ProductResponseDTO

---

#### `GET /api/product/{productCode}` or `GET /api/v1/products/{productCode}`

**Purpose:** Get product by code (see role requirements below)

**Authentication:** Required (BANK_OFFICER, ADMIN, or CUSTOMER role)

**Path Parameters:**
- `productCode`: Product code

**Response (200 OK):** ProductResponseDTO

---

### Product Validation & Rate Calculation

#### `GET /api/product/{productCode}/validate` or `GET /api/v1/products/{productCode}/validate`

**Purpose:** Validate product configuration for account creation

**Authentication:** Required (BANK_OFFICER, ADMIN, or CUSTOMER role)

**Path Parameters:**
- `productCode`: Product code

**Query Parameters:**
- `termMonths`: Requested FD term in months
- `amount`: Requested deposit amount
- `age`: Customer age in years

**Response (200 OK):**
```json
{
  "valid": true,
  "productCode": "FD001",
  "productName": "Example FD",
  "status": "ACTIVE",
  "message": "Product configuration and criteria validated successfully for account creation",
  "effectiveDate": "2025-01-01",
  "termMonths": 12,
  "amount": 100000,
  "age": 65,
  "minTerm": 3,
  "maxTerm": 36,
  "minDeposit": 5000,
  "maxDeposit": 10000000,
  "minAge": 18
}
```

---

#### `POST /api/product/{productCode}/rate` or `POST /api/v1/products/{productCode}/rate`

**Purpose:** Determine final interest rate with category adjustments

**Authentication:** Required (BANK_OFFICER, ADMIN, or CUSTOMER role)

**Path Parameters:**
- `productCode`: Product code

**Request Body:**
```json
{
  "termMonths": 12,
  "customerCategory": "SENIOR_CITIZEN",
  "age": 65,
  "amount": 100000
}
```

**Response (200 OK):**
```json
{
  "productCode": "FD001",
  "productName": "Example FD",
  "termMonths": 12,
  "customerCategory": "SENIOR_CITIZEN",
  "baseRate": 5.5,
  "rateModifier": 1.0,
  "finalRate": 6.5,
  "minRateLimit": 5.5,
  "maxRateLimit": 7.5
}
```

---

#### `GET /api/product/{productCode}/defaults` or `GET /api/v1/products/{productCode}/defaults`

**Purpose:** Get product defaults for account creation

**Authentication:** Required (BANK_OFFICER, ADMIN, or CUSTOMER role)

**Path Parameters:**
- `productCode`: Product code

**Response (200 OK):**
```json
{
  "productCode": "string",
  "defaultTermMonths": "number",
  "defaultAmount": "number",
  "charges": {},
  "allowedRoles": ["string"]
}
```

---

### Internal Endpoints

#### `GET /internal/products/{productCode}/calculator-config` or `GET /api/v1/products/internal/products/{productCode}/calculator-config`

**Purpose:** Internal endpoint for FD Calculator service to fetch product configuration

**Authentication:** Required (BANK_OFFICER, ADMIN, or CUSTOMER role)

**Path Parameters:**
- `productCode`: Product code

**Response (200 OK):**
```json
{
  "productCode": "string",
  "productName": "string",
  "baseRate": "number",
  "minRate": "number",
  "maxRate": "number",
  "interestType": "string",
  "compoundingFrequency": "string",
  "termLimit": {},
  "rateVariations": [{}],
  "charges": {}
}
```

---

## FD Calculator Service (Legacy)

**Base Path:** `/api/fd`  
**Port:** 8080 (default)

### FD Calculations

#### `POST /api/fd/calculate`

**Purpose:** Calculate FD maturity and interest details

**Authentication:** Required (authenticated caller; no additional controller role restriction)

**Request Body:**
```json
{
  "principal": "number (> 0, required)",
  "term": {
    "value": "number",
    "unit": "string (DAYS, MONTHS, YEARS)"
  },
  "baseRate": "number",
  "productCode": "string",
  "categories": ["string"],
  "interestType": "string (SIMPLE or COMPOUND, required)",
  "currency": "string",
  "compoundingFrequency": "number (1=annual, 4=quarterly, 12=monthly)"
}
```

**Response (200 OK):**
```json
{
  "maturityAmount": "number",
  "effectiveRate": "number",
  "interestEarned": "number",
  "currency": "string",
  "isConverted": "boolean",
  "conversionRate": "number"
}
```

---

#### `POST /api/fd/calculate/advanced`

**Purpose:** Calculate FD maturity with detailed charge breakdown

**Authentication:** Required (authenticated caller; no additional controller role restriction)

**Request Body:**
```json
{
  "principal": "number (> 0, required)",
  "term": {
    "value": "number",
    "unit": "string"
  },
  "baseRate": "number",
  "productCode": "string",
  "categories": ["string"],
  "interestType": "string (required)",
  "compoundingFrequency": "number"
}
```

**Response (200 OK):**
```json
{
  "maturityAmount": "number",
  "interestEarned": "number",
  "effectiveRate": "number",
  "chargeBreakdown": {
    "tax": "number",
    "serviceFee": "number",
    "documentationFee": "number",
    "penalty": "number",
    "gst": "number"
  },
  "currency": "string"
}
```

---

### Categories & History

#### `GET /api/fd/categories`

**Purpose:** Get available customer category rate modifiers

**Authentication:** Required (authenticated caller; no additional controller role restriction)

**Response (200 OK):**
```json
[
  {
    "category": "string",
    "title": "string",
    "rateModifier": "number"
  }
]
```

---

#### `GET /api/fd/history`

**Purpose:** Get FD calculations history log

**Authentication:** Required (authenticated caller; no additional controller role restriction)

**Response (200 OK):**
```json
[
  {
    "id": "number",
    "principal": "number",
    "term": {},
    "baseRate": "number",
    "categories": ["string"],
    "interestType": "string",
    "maturityAmount": "number",
    "interestEarned": "number",
    "calculatedAt": "string (ISO-8601)"
  }
]
```

---

## FD Calculator Service (Mod 4)

**Base Path:** `/api/v1/fd`  
**Port:** 8084 (default)

### FD Calculations

#### `POST /api/v1/fd/calculations`

**Purpose:** Calculate FD maturity estimate (CUSTOMER, BANK_OFFICER or ADMIN)

**Authentication:** Required (CUSTOMER, BANK_OFFICER or ADMIN role)

**Request Body:**
```json
{
  "principal": "number (> 0, required, max 2 decimal places)",
  "term": {
    "value": "number",
    "unit": "string (MONTHS, YEARS)"
  },
  "productCode": "string (required)",
  "payoutMode": "string (CUMULATIVE or PERIODIC, default: CUMULATIVE)",
  "startDate": "string (ISO-8601, default: current date)"
}
```

**Response (200 OK):**
```json
{
  "calculationId": "string (e.g., CALC-20260911-0001)",
  "uuid": "string (persistent UUID)",
  "productCode": "string",
  "productName": "string",
  "principal": "number",
  "term": {},
  "payoutMode": "string",
  "startDate": "string (ISO-8601)",
  "estimatedMaturityDate": "string (ISO-8601)",
  "interestType": "string",
  "compoundingFrequency": "string",
  "baseRate": "number",
  "categoryBenefits": [
    {
      "category": "string",
      "requestedBonus": "number",
      "appliedBonus": "number"
    }
  ],
  "requestedTotalBonus": "number",
  "appliedTotalBonus": "number",
  "bonusCap": "number",
  "effectiveRate": "number",
  "apy": "number",
  "rateCapped": "boolean",
  "interestEarned": "number",
  "maturityAmount": "number",
  "periodicPayoutAmount": "number",
  "currency": "string",
  "calculationExplanation": "string",
  "generatedAt": "string (ISO-8601)"
}
```

**Note:** Rates and customer categories are fetched from authoritative internal services. Any rate or category supplied in the request body is ignored.

---

#### `POST /api/v1/fd/calculations/compare`

**Purpose:** Compare FD maturity across multiple products/terms (CUSTOMER, BANK_OFFICER or ADMIN)

**Authentication:** Required (CUSTOMER, BANK_OFFICER or ADMIN role)

**Request Body:**
```json
{
  "principal": "number (> 0, required)",
  "options": [
    {
      "productCode": "string",
      "term": {
        "value": "number",
        "unit": "string"
      }
    }
  ]
}
```

**Response (200 OK):** `{"results": [...]}`, where each item is a full CalculationResponse ordered by maturity amount descending. No separate rank or top-level principal field.

---

#### `POST /api/v1/fd/calculations/custom`

**Purpose:** Calculate custom FD maturity with user-defined parameters (CUSTOMER, BANK_OFFICER or ADMIN)

**Authentication:** Required (CUSTOMER, BANK_OFFICER or ADMIN role)

**Request Body:**
```json
{
  "principal": "number (> 0, required)",
  "term": {
    "value": "number",
    "unit": "string"
  },
  "interestRate": "number (required)",
  "interestType": "string (required)",
  "compoundingFrequency": "string",
  "payoutMode": "string",
  "startDate": "string (ISO-8601)"
}
```

**Response (200 OK):** Same format as `/api/v1/fd/calculations`

**Note:** Bypasses Product Service validation. Accepts custom interest rate, interest type, and compounding frequency.

---

### Retrieve Calculations

#### `GET /api/v1/fd/calculations/{calculationId}`

**Purpose:** Retrieve a saved calculation by ID (CUSTOMER, BANK_OFFICER or ADMIN)

**Authentication:** Required (CUSTOMER, BANK_OFFICER or ADMIN role)

**Path Parameters:**
- `calculationId`: Calculation ID (e.g., CALC-20260911-0001)

**Response (200 OK):** Same format as `/api/v1/fd/calculations`

**Note:** Enforces ownership - a customer can only retrieve their own calculations.

---

#### `GET /api/v1/fd/calculations/uuid/{uuid}`

**Purpose:** Retrieve a saved calculation by persistent UUID (CUSTOMER, BANK_OFFICER or ADMIN)

**Authentication:** Required (CUSTOMER, BANK_OFFICER or ADMIN role)

**Path Parameters:**
- `uuid`: Persistent calculation UUID

**Response (200 OK):** Same format as `/api/v1/fd/calculations`

---

### Cache Management

#### `POST /api/v1/fd/cache/rates/evict`

**Purpose:** Evict cached product rates (CUSTOMER, BANK_OFFICER or ADMIN)

**Authentication:** Required (CUSTOMER, BANK_OFFICER or ADMIN role)

**Response (200 OK):** Empty body

**Use Case:** Called on customer logout or administrative refresh.

---

### Export & Explain

#### `GET /api/v1/fd/calculations/{calculationId}/export`

**Purpose:** Export a calculation as CSV (CUSTOMER, BANK_OFFICER or ADMIN)

**Authentication:** Required (CUSTOMER, BANK_OFFICER or ADMIN role)

**Path Parameters:**
- `calculationId`: Calculation ID

**Query Parameters:**
- `format`: Export format (currently only 'csv' is supported, default: csv)

**Response (200 OK):** CSV file with Content-Disposition header

---

#### `POST /api/v1/fd/calculations/{calculationId}/explain`

**Purpose:** Get plain-language explanation for a calculation (CUSTOMER, BANK_OFFICER or ADMIN)

**Authentication:** Required (CUSTOMER, BANK_OFFICER or ADMIN role)

**Path Parameters:**
- `calculationId`: Calculation ID

**Response (200 OK):**
```
Plain-language explanation string
```

**Note:** Returns a deterministic template-based plain-language explanation. No AI is used.

---

### Product Preview

#### `GET /api/v1/fd/products/{productCode}/preview`

**Purpose:** Preview product constraints for the calculator (CUSTOMER, BANK_OFFICER or ADMIN)

**Authentication:** Required (CUSTOMER, BANK_OFFICER or ADMIN role)

**Path Parameters:**
- `productCode`: FD product code

**Response (200 OK):**
```json
{
  "productCode": "string",
  "productName": "string",
  "currency": "string",
  "minPrincipal": "number",
  "maxPrincipal": "number",
  "minTermMonths": "integer",
  "maxTermMonths": "integer",
  "baseRate": "number",
  "maxRate": "number",
  "interestType": "string",
  "compoundingFrequency": "string",
  "supportsPeriodicPayout": "boolean"
}
```

---

### Batch Calculations

#### `POST /api/v1/fd/batch/calculations`

**Purpose:** Batch FD maturity calculations (CUSTOMER, BANK_OFFICER or ADMIN)

**Authentication:** Required (CUSTOMER, BANK_OFFICER or ADMIN role)

**Request Body:**
```json
{
  "calculations": [
    {
      "principal": "number",
      "term": {},
      "productCode": "string",
      "payoutMode": "string"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "correlationId": "string",
  "totalCalculations": "integer",
  "successfulCalculations": "integer",
  "failedCalculations": "integer",
  "results": [],
  "status": "string",
  "message": "string"
}
```

**Note:** Batch results are logged locally; Kafka publication is only a placeholder in the implementation.

---

## Notification Service

**Base Path:** `/api/notifications`  
**Port:** 8083 (default)

### Notification Logs

#### `GET /api/notifications`

**Purpose:** List notification logs (see role requirements below)

**Authentication:** Required (ADMIN or BANK_OFFICER role)

**Query Parameters:**
- `fdAccountNo`: Filter by FD account number (optional)
- `limit`: Maximum number of records to return (default: 50, max: 200)

**Response (200 OK):**
```json
[
  {
    "id": "number",
    "event_type": "string",
    "fd_account_no": "string",
    "customer_id": "string",
    "channel": "string (EMAIL, WHATSAPP)",
    "recipient": "string",
    "subject": "string",
    "status": "string (SENT, MOCKED, FAILED, BATCHED, SKIPPED)",
    "error": "string",
    "created_at": "string (ISO-8601)"
  }
]
```

---

## Statement Service

**Base Path:** `/api/statements`  
**Port:** 8082 (default)

### Statement Operations

#### `GET /api/statements/{account}`

**Purpose:** List statements for an account (see role requirements below)

**Authentication:** Required (ADMIN or BANK_OFFICER role)

**Path Parameters:**
- `account`: Account number

**Response (200 OK):** Statement records

---

#### `GET /api/statements/summary/all`

**Purpose:** Get summary of all statements (see role requirements below)

**Authentication:** Required (ADMIN or BANK_OFFICER role)

**Response (200 OK):** Summary statistics

---

## Interest Batch Service

**Base Path:** `/api/admin/interest-batches`  
**Port:** 8081 (default)

### Batch Operations

#### `POST /api/admin/interest-batches`

**Purpose:** Submit interest batch processing request (Admin only)

**Authentication:** Required (ADMIN role)

**Request Body:**
```json
{
  "requestId": "string (required)",
  "businessDate": "string (ISO-8601, required)",
  "type": "string (required)",
  "fdAccountNo": "string (optional)"
}
```

**Response (202 Accepted):** Batch submission response

---

#### `GET /api/admin/interest-batches`

**Purpose:** List all interest batches (Admin only)

**Authentication:** Required (ADMIN role)

**Response (200 OK):** Array of batch records

---

#### `GET /api/admin/interest-batches/{id}`

**Purpose:** Get specific interest batch by ID (Admin only)

**Authentication:** Required (ADMIN role)

**Path Parameters:**
- `id`: Batch ID

**Response (200 OK):** Batch details

---

## Common Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "Missing or invalid JWT"
}
```

### 403 Forbidden
```json
{
  "status": "error",
  "message": "Authenticated user lacks required role"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "status": "error",
  "message": "Resource already exists"
}
```

### 422 Unprocessable Entity
```json
{
  "status": "error",
  "message": "Validation failed"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Unexpected server error"
}
```

### 503 Service Unavailable
```json
{
  "status": "error",
  "message": "Dependency service unavailable"
}
```

---

## Authentication

All endpoints (except health checks and public endpoints) require JWT authentication in the Authorization header:

```
Authorization: Bearer <access_token>
```

Tokens are obtained from the Authentication Service's `/api/auth/login` or `/api/auth/signup` endpoints.

---

## Role-Based Access Control

The system uses the following roles:

- **CUSTOMER**: Regular bank customers
- **BANK_OFFICER**: Bank staff with operational permissions
- **ADMIN**: Administrative permissions as listed per endpoint; roles do not inherit one another.

Each endpoint specifies the required roles in its documentation.

---

## Rate Limiting

The Authentication Service implements login attempt limiting:
- After 5 failed login attempts, the account is locked for 1 minute
- Successful attempts reset the counter

---

## Pagination

Product search supports pagination with the following query parameters; other list endpoints may return a full list or use fixed limits:
- `page`: Page index (0-based, default: 0)
- `size`: Page size (default varies by endpoint, typically 50-100)

---

## Date Formats

All dates use ISO-8601 format:
- Dates: `yyyy-MM-dd`
- DateTimes: `yyyy-MM-ddTHH:mm:ssZ`

---

## Currency

All monetary amounts are in INR (Indian Rupees) unless otherwise specified.

---

## Notes

- Most APIs return JSON; export/report endpoints also return files and some operations return empty bodies.
- All POST/PUT request bodies must have `Content-Type: application/json`
- The system uses Spring Boot with Spring Security for authentication and authorization
- Microservices communicate via REST APIs and Kafka for event-driven messaging
- The FD Account Service integrates with Product & Pricing and Calculator services via proxy endpoints
