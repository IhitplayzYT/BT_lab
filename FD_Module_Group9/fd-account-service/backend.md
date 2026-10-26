# FD Account Service

## Summary

The FD Account Service is a Spring Boot microservice responsible for managing Fixed Deposit accounts, applications, approvals, transactions, and customer operations within the UNO Bank platform. It serves as the core banking service for FD lifecycle management.

**Key Features:**
- FD account creation and management
- Customer FD applications with approval workflow
- Bundle FD applications for multiple products
- Transaction recording (deposits, interest accrual, maturity payouts)
- Ledger and journal operations for accounting
- Integration with Product & Pricing service for validation and rate calculation
- Integration with Calculator service for maturity estimates
- Event-driven architecture with Kafka for notifications
- Role-based access control (CUSTOMER, BANK_OFFICER, ADMIN)
- Account access security (customers can only access their own accounts)
- Time travel support for testing interest accrual and maturity

**Technology Stack:**
- Spring Boot 3.x
- Spring Security 6.x with JWT
- Spring Data JPA
- MySQL Database
- Kafka for event messaging
- RestTemplate for service-to-service communication
- Maven

---

## Usage

### Starting the Service

First follow the root usage guide to build/install shared dependencies and configure MySQL, JWT and service connections. Run each local process in a separate terminal from the project root.

```bash
cd FD_Module_Group9/fd-account-service
mvn spring-boot:run
```

Or using the provided scripts:
```bash
# From project root
./start_all.sh
```

### Environment Configuration

Example Spring properties (use environment variables only where mapped by application configuration):
```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3310/banking_technology_lab
spring.datasource.username=root
spring.datasource.password=<password>

# JWT Configuration
app.jwt.secret=<your-secret-key-min-32-chars>
app.jwt.issuer=fd-platform-auth
app.security.basic.enabled=false

# Service Integration
services.product.base-url=http://localhost:8080
services.product.connect-timeout-ms=3000
services.product.read-timeout-ms=5000

services.calculator.base-url=http://localhost:8084
services.calculator.connect-timeout-ms=3000
services.calculator.read-timeout-ms=5000

# Outbound Service Authentication
# OutboundServiceAuth reuses the caller JWT or signs a five-minute token with JWT_SECRET.
```

### Common Use Cases

**1. Customer Apply for FD:**
```bash
curl -X POST http://localhost:8086/api/fd/account/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <customer-token>" \
  -d '{
    "productCode": "FD001",
    "principalAmount": 100000.00,
    "termMonths": "12",
    "applicantFullName": "John Doe",
    "applicantEmail": "john@example.com",
    "applicantPhone": "9876543210",
    "applicantPan": "ABCDE1234F",
    "applicantAccountNumber": "1234567890",
    "applicantIfsc": "SBIN0001234"
  }'
```

**2. Bank Officer Approve FD Application:**
```bash
curl -X POST http://localhost:8086/api/fd/account/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <officer-token>" \
  -d '{
    "fdAccountNo": "FD20241021001",
    "action": "APPROVE"
  }'
```

**3. Customer View Their Applications:**
```bash
curl -X GET http://localhost:8086/api/fd/account/my-applications \
  -H "Authorization: Bearer <customer-token>"
```

**4. Bank Officer View Pending Applications:**
```bash
curl -X GET http://localhost:8086/api/fd/account/pending \
  -H "Authorization: Bearer <officer-token>"
```

**5. Create FD Bundle:**
```bash
curl -X POST http://localhost:8086/api/fd/account/bundle/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <customer-token>" \
  -d '{
    "bundleName": "Retirement Portfolio",
    "bundleDescription": "Mix of short and long term FDs",
    "totalAmount": 500000.00,
    "fdItems": [
      {
        "productCode": "FD001",
        "principalAmount": 200000.00,
        "tenureMonths": 12,
        "applicantFirstName": "John",
        "applicantLastName": "Doe",
        "applicantEmail": "john@example.com",
        "applicantPhone": "9876543210"
      },
      {
        "productCode": "FD002",
        "principalAmount": 300000.00,
        "tenureMonths": 24,
        "applicantFirstName": "John",
        "applicantLastName": "Doe",
        "applicantEmail": "john@example.com",
        "applicantPhone": "9876543210"
      }
    ]
  }'
```

---

## Structure

Implementation is under [src/main/java/com/example/fdmodule](src/main/java/com/example/fdmodule). Controllers expose HTTP routes; services implement business logic; DTOs define JSON fields; repositories/entities implement persistence. Configuration and SQL are under `src/main/resources` and the module's SQL files. Shared security comes from Auth_Sec; Group 9 also uses event-common.

## Classes

### Core Classes

#### `FdModuleApplication.java`
**Purpose:** Spring Boot application entry point

**Annotations:**
- `@SpringBootApplication`: Main Spring Boot application
- `@EnableScheduling`: Enables scheduled tasks for interest posting

---

#### `FDAccountService.java`
**Purpose:** Core business logic for FD account operations

**Key Methods:**
- `create(FDAccountRequest, String)`: Create FD account directly (Bank Officer)
- `applyForFD(FDApplicationRequest, String)`: Submit FD application (Customer)
- `approveOrRejectFD(FDApprovalRequest, String)`: Approve or reject application
- `getPendingApplications()`: Get pending applications for approval
- `getCustomerApplications(String)`: Get customer's applications
- `getAllApplications()`: Get all applications (Bank Officer)
- `getById(String)`: Get FD account by account number
- `applyForBundle(BundleApplicationRequest, String)`: Apply for FD bundle
- `approveOrRejectBundle(String, String, String, String)`: Approve/reject bundle
- `getPendingBundles()`: Get pending bundles
- `getCustomerBundles(String)`: Get customer's bundles
- `withdrawApplication(String, String)`: Withdraw pending application

**Dependencies:**
- FixedDepositAccountRepository
- CustomerProfileRepository
- ProductValidationService
- RateService
- AccountNumberGenerator
- FDTransactionService
- FdCreatedPublisher

---

#### `ProductValidationService.java`
**Purpose:** Validate product configuration before account creation

**Key Methods:**
- `validate(String, int, BigDecimal)`: Validate product code, term, and principal

**Validations:**
- Product status must be ACTIVE
- Product must be effective (effectiveDate <= today)
- Product must not be expired
- Product type must be FD
- Term must be within product limits
- Principal must be within deposit limits

---

#### `RateService.java`
**Purpose:** Calculate final interest rate with category adjustments

**Key Methods:**
- `determineFinalRate(String, String, int, BigDecimal)`: Calculate final rate

**Process:**
1. Fetch customer category from CustomerProfile
2. Call Product Service rate calculation endpoint
3. Apply category adjustments (SENIOR_CITIZEN, EMPLOYEE)
4. Return final rate clamped to product min/max

---

#### `AccountAccess.java`
**Purpose:** Enforce account access control

**Key Methods:**
- `isStaff(Authentication)`: Check if user is BANK_OFFICER or ADMIN
- `requireAccess(Authentication, String)`: Enforce access to FD account
- `owns(String, String)`: Check if customer owns the FD account

**Access Rules:**
- Staff (BANK_OFFICER, ADMIN): Can access any FD account
- Customers: Can only access their own FD accounts
- Same 403 error for non-existent and unauthorized accounts (prevents probing)

---

### Entity Classes

#### `FixedDepositAccount.java`
**Purpose:** FD account entity

**Key Fields:**
- `fdAccountNo`: String (primary key, account number)
- `customerId`: String (customer identifier)
- `bundleId`: String (optional, if part of bundle)
- `bundleName`: String (bundle name)
- `productCode`: String (FD product code)
- `currency`: String (currency code, default INR)
- `principalAmount`: BigDecimal (deposit amount)
- `interestRate`: BigDecimal (applied interest rate)
- `tenureMonths`: Integer (FD tenure in months)
- `compoundingFrequency`: String (compounding frequency)
- `status`: String (PENDING, ACTIVE, REJECTED, WITHDRAWN, MATURED, PREMATURELY_CLOSED)
- `approvalStatus`: String (PENDING_APPROVAL, APPROVED, REJECTED)
- `approvedBy`: String (approver username)
- `approvedAt`: LocalDateTime (approval timestamp)
- `rejectionReason`: String (rejection reason if rejected)
- `maturityDate`: LocalDate (maturity date)
- `accruedInterest`: BigDecimal (accrued interest)
- `createdAt`: LocalDateTime (creation timestamp)
- `createdBy`: String (creator username)
- `uuid`: String (persistent UUID)

**Applicant Fields:**
- applicantFullName, applicantFirstName, applicantMiddleName, applicantLastName
- applicantAge, applicantGender, applicantOccupation, applicantAnnualIncome
- applicantAddress, applicantCity, applicantState, applicantPincode
- applicantNationality, applicantMaritalStatus
- applicantEmail, applicantPhone, applicantPan
- applicantAccountNumber, applicantIfsc

**Nominee Fields:**
- nomineeName, nomineeRelation

**Lifecycle Callbacks:**
- `@PrePersist`: Set default values for createdAt, uuid, status, approvalStatus, accruedInterest

---

#### `FDTransaction.java`
**Purpose:** Transaction entity for FD account operations

**Key Fields:**
- `txnId`: Long (auto-generated primary key)
- `fdAccountNo`: String (FD account number)
- `txnType`: String (DEPOSIT, INTEREST_ACCRUAL, INTEREST, MATURITY_PAYOUT, PREMATURE_WITHDRAWAL, PENALTY_DEBIT)
- `txnAmount`: BigDecimal (transaction amount)
- `txnTimestamp`: LocalDateTime (transaction timestamp)
- `txnDescription`: String (transaction description)
- `balanceAfterTxn`: BigDecimal (balance after transaction)

**Transaction Types:**
- `TYPE_DEPOSIT`: Initial deposit
- `TYPE_INTEREST_ACCRUAL`: Interest expense accrued and payable
- `TYPE_INTEREST`: Interest capitalized or paid
- `TYPE_MATURITY_PAYOUT`: Maturity payout
- `TYPE_PREMATURE_WITHDRAWAL`: Premature withdrawal

---

#### `CustomerProfile.java`
**Purpose:** Customer profile entity

**Key Fields:**
- `customerId`: String (primary key, customer identifier)
- `userId`: Long (link to users table)
- `fullName`: String (customer full name)
- `phone`: String (phone number)
- `category`: String (GENERAL, SENIOR_CITIZEN, EMPLOYEE)
- `createdAt`: LocalDateTime (creation timestamp)

---

#### `Nominee.java`
**Purpose:** Nominee entity for FD accounts

**Key Fields:**
- `id`: Long (auto-generated primary key)
- `fdAccountNo`: String (FD account number)
- `nomineeName`: String (nominee name)
- `nomineeRelation`: String (relationship to account holder)

---

#### `BundleApplication.java`
**Purpose:** Bundle application entity for multiple FDs

**Key Fields:**
- `bundleId`: String (primary key, bundle identifier)
- `customerId`: String (customer identifier)
- `bundleName`: String (bundle name)
- `bundleDescription`: String (bundle description)
- `totalAmount`: BigDecimal (total amount across all FDs)
- `estimatedReturn`: BigDecimal (estimated return)
- `status`: String (PENDING, ACTIVE, REJECTED)
- `approvalStatus`: String (PENDING_APPROVAL, APPROVED, REJECTED)
- `approvedBy`: String (approver username)
- `approvedAt`: LocalDateTime (approval timestamp)
- `rejectionReason`: String (rejection reason)
- `createdAt`: LocalDateTime (creation timestamp)

---

#### `BundleItem.java`
**Purpose:** Individual FD items within a bundle

**Key Fields:**
- `id`: Long (auto-generated primary key)
- `bundleId`: String (bundle identifier)
- `fdAccountNo`: String (FD account number)
- `sequenceOrder`: Integer (order within bundle)

---

### Controller Classes

#### `FDAccountController.java`
**Purpose:** REST API for FD account operations

**Endpoints:**
- `POST /api/fd/account/create`: Create FD account (BANK_OFFICER, ADMIN)
- `POST /api/fd/account/apply`: Apply for FD (CUSTOMER)
- `POST /api/fd/account/approve`: Approve/reject application (BANK_OFFICER, ADMIN)
- `GET /api/fd/account/pending`: Get pending applications (BANK_OFFICER, ADMIN)
- `GET /api/fd/account/my-applications`: Get customer's applications (CUSTOMER)
- `GET /api/fd/account/all-applications`: Get all applications (BANK_OFFICER, ADMIN)
- `GET /api/fd/account/{fdAccountNo}`: Get FD account details
- `POST /api/fd/account/bundle/apply`: Apply for bundle (CUSTOMER)
- `POST /api/fd/account/bundle/{bundleId}/approve`: Approve/reject bundle (BANK_OFFICER, ADMIN)
- `GET /api/fd/account/bundle/pending`: Get pending bundles (BANK_OFFICER, ADMIN)
- `GET /api/fd/account/bundle/my-bundles`: Get customer's bundles (CUSTOMER)
- `POST /api/fd/account/{fdAccountNo}/withdraw`: Withdraw application (CUSTOMER)

---

#### `FDTransactionController.java`
**Purpose:** REST API for transaction operations

**Endpoints:**
- `POST /api/fd/account/create-with-txn`: Create FD with initial deposit (BANK_OFFICER)
- `GET /api/fd/account/{fdAccountNo}/transactions`: Get transaction history

---

#### `LedgerController.java`
**Purpose:** REST API for ledger search operations

**Endpoints:**
- `GET /api/fd/ledger/search-by-name`: Search by customer name (BANK_OFFICER, ADMIN)
- `GET /api/fd/ledger/search-by-id`: Search by customer ID (BANK_OFFICER, ADMIN)
- `GET /api/fd/ledger/all`: Get all accounts with pagination (BANK_OFFICER, ADMIN)
- `GET /api/fd/ledger/{fdAccountNo}`: Get account details
- `GET /api/fd/ledger/{fdAccountNo}/transactions`: Get account transactions

---

#### `JournalController.java`
**Purpose:** REST API for journal operations

**Endpoints:**
- `GET /api/fd/journal/all`: Get all transactions (BANK_OFFICER, ADMIN)
- `GET /api/fd/journal/by-type`: Get transactions by type (BANK_OFFICER, ADMIN)
- `GET /api/fd/journal/summary`: Get journal statistics (BANK_OFFICER, ADMIN)

---

#### `IntegrationController.java`
**Purpose:** Proxy endpoints for service integration

**Endpoints:**
- `GET /api/v1/integration/products/active`: Get active products from Product Service
- `GET /api/v1/integration/products/{productCode}`: Get product by code
- `GET /api/v1/integration/products/{productCode}/validate`: Validate product
- `POST /api/v1/integration/calculator/calculate`: Calculate maturity
- `GET /api/v1/integration/calculator/products/{productCode}/preview`: Preview product

---

### Client Classes

#### `ProductServiceClient.java`
**Purpose:** HTTP client for Product & Pricing service

**Key Methods:**
- `getActiveProducts(String)`: Get active products
- `getProductByCode(String)`: Get product by code
- `validateProduct(String, Integer, Double, Integer)`: Validate product
- `calculateRate(String, String, Integer, Double)`: Calculate final rate

**Configuration:**
- Base URL from `services.product.base-url`
- Connect timeout: 3000ms
- Read timeout: 5000ms
- Uses outbound service authentication

---

#### `OutboundServiceAuth.java`
**Purpose:** Authentication for service-to-service calls

**Key Methods:**
- `headers(Target)`: Generate HTTP headers with service credentials

**Targets:**
- PRODUCT: Product & Pricing service
- CALCULATOR: Calculator service

---

### Configuration Classes

#### `SecurityConfig.java`
**Purpose:** Spring Security configuration

**Key Features:**
- JWT-only authentication
- Resource server support
- CORS configuration for frontend
- Method-level security with `@PreAuthorize`
- Optional Basic Auth for testing

**Public Endpoints:**
- `/error`, `/health`

**All other endpoints:** Require valid JWT

---

#### `ServiceProperties.java`
**Purpose:** Configuration properties for external services

**Properties:**
- `services.product.base-url`: Product service URL
- `services.product.connect-timeout-ms`: Connect timeout
- `services.product.read-timeout-ms`: Read timeout
- `services.calculator.base-url`: Calculator service URL
- `services.calculator.connect-timeout-ms`: Connect timeout
- `services.calculator.read-timeout-ms`: Read timeout

---

## Examples

The annotated sequences below are explanatory pseudocode, not compilable Java. IDs, dates and amounts are illustrative; use returned IDs and current product configuration for API calls.

### Example 1: Complete FD Application Flow

```text
// Step 1: Customer applies for FD
POST /api/fd/account/apply
Authorization: Bearer <customer-token>
{
  "productCode": "FD001",
  "principalAmount": 100000.00,
  "termMonths": "12",
  "applicantFullName": "John Doe",
  "applicantFirstName": "John",
  "applicantLastName": "Doe",
  "applicantAge": 35,
  "applicantGender": "MALE",
  "applicantEmail": "john@example.com",
  "applicantPhone": "9876543210",
  "applicantPan": "ABCDE1234F",
  "applicantAccountNumber": "1234567890",
  "applicantIfsc": "SBIN0001234",
  "nominees": [
    {
      "name": "Jane Doe",
      "relation": "Spouse"
    }
  ]
}

Response: 200 OK
{
  "fdAccountNo": "FD20241021001",
  "customerId": "john_doe",
  "productCode": "FD001",
  "principalAmount": "100000.00",
  "interestRate": "7.50",
  "termMonths": 12,
  "maturityDate": "2025-10-21",
  "status": "PENDING",
  "approvalStatus": "PENDING_APPROVAL",
  "createdAt": "2024-10-21T10:30:00"
}

// Step 2: Bank Officer views pending applications
GET /api/fd/account/pending
Authorization: Bearer <officer-token>

Response: 200 OK
[
  {
    "fdAccountNo": "FD20241021001",
    "customerId": "john_doe",
    "productCode": "FD001",
    "principalAmount": "100000.00",
    "interestRate": "7.50",
    "termMonths": 12,
    "maturityDate": "2025-10-21",
    "status": "PENDING",
    "approvalStatus": "PENDING_APPROVAL",
    "applicantFullName": "John Doe",
    "applicantEmail": "john@example.com",
    "applicantPhone": "9876543210"
  }
]

// Step 3: Bank Officer approves application
POST /api/fd/account/approve
Authorization: Bearer <officer-token>
{
  "fdAccountNo": "FD20241021001",
  "action": "APPROVE"
}

Response: 200 OK
{
  "message": "FD application processed successfully"
}

// Step 4: Customer views their approved FD
GET /api/fd/account/FD20241021001
Authorization: Bearer <customer-token>

Response: 200 OK
{
  "fdAccountNo": "FD20241021001",
  "customerId": "john_doe",
  "productCode": "FD001",
  "principalAmount": 100000.00,
  "interestRate": 7.50,
  "tenureMonths": 12,
  "maturityDate": "2025-10-21",
  "status": "ACTIVE",
  "approvalStatus": "APPROVED",
  "approvedBy": "officer_smith",
  "approvedAt": "2024-10-21T10:35:00"
}
```

### Example 2: Bundle Application Flow

```text
// Step 1: Customer applies for FD bundle
POST /api/fd/account/bundle/apply
Authorization: Bearer <customer-token>
{
  "bundleName": "Retirement Portfolio",
  "bundleDescription": "Mix of short and long term FDs",
  "totalAmount": 500000.00,
  "estimatedReturn": 550000.00,
  "fdItems": [
    {
      "productCode": "FD001",
      "principalAmount": 200000.00,
      "tenureMonths": 12,
      "applicantFirstName": "John",
      "applicantLastName": "Doe",
      "applicantEmail": "john@example.com",
      "applicantPhone": "9876543210"
    },
    {
      "productCode": "FD002",
      "principalAmount": 300000.00,
      "tenureMonths": 24,
      "applicantFirstName": "John",
      "applicantLastName": "Doe",
      "applicantEmail": "john@example.com",
      "applicantPhone": "9876543210"
    }
  ]
}

Response: 200 OK
{
  "bundleId": "BNDL1729500000000",
  "customerId": "john_doe",
  "bundleName": "Retirement Portfolio",
  "bundleDescription": "Mix of short and long term FDs",
  "totalAmount": 500000.00,
  "estimatedReturn": 550000.00,
  "status": "PENDING",
  "approvalStatus": "PENDING_APPROVAL",
  "fdItems": [
    {
      "fdAccountNo": "FD20241021002",
      "productCode": "FD001",
      "principalAmount": 200000.00,
      "tenureMonths": 12,
      "status": "PENDING",
      "approvalStatus": "PENDING_APPROVAL"
    },
    {
      "fdAccountNo": "FD20241021003",
      "productCode": "FD002",
      "principalAmount": 300000.00,
      "tenureMonths": 24,
      "status": "PENDING",
      "approvalStatus": "PENDING_APPROVAL"
    }
  ]
}

// Step 2: Bank Officer approves bundle
POST /api/fd/account/bundle/BNDL1729500000000/approve
Authorization: Bearer <officer-token>
{
  "action": "APPROVE"
}

Response: 200 OK
{
  "message": "Bundle processed successfully"
}
```

### Example 3: Transaction History

```text
// View transaction history for FD account
GET /api/fd/account/FD20241021001/transactions
Authorization: Bearer <customer-token>

Response: 200 OK
[
  {
    "txnId": 1,
    "fdAccountNo": "FD20241021001",
    "txnType": "DEPOSIT",
    "txnAmount": 100000.00,
    "txnTimestamp": "2024-10-21T10:35:00",
    "txnDescription": "Initial deposit",
    "balanceAfterTxn": 100000.00
  },
  {
    "txnId": 2,
    "fdAccountNo": "FD20241021001",
    "txnType": "INTEREST",
    "txnAmount": 625.00,
    "txnTimestamp": "2024-11-21T00:00:00",
    "txnDescription": "Monthly interest accrual",
    "balanceAfterTxn": 100625.00
  }
]
```

### Example 4: Ledger Search

```text
// Search accounts by customer name
GET /api/fd/ledger/search-by-name?name=John%20Doe&page=0&size=10
Authorization: Bearer <officer-token>

Response: 200 OK
[
  {
    "fdAccountNo": "FD20241021001",
    "customerId": "john_doe",
    "productCode": "FD001",
    "principalAmount": 100000.00,
    "interestRate": 7.50,
    "tenureMonths": 12,
    "maturityDate": "2025-10-21",
    "status": "ACTIVE",
    "applicantFullName": "John Doe",
    "applicantEmail": "john@example.com",
    "applicantPhone": "9876543210"
  }
]
```

---

## Working Flow

### FD Application Flow

```
1. Customer submits FD application
   ↓
2. FDAccountController.applyForFD() receives request
   ↓
3. Check/create customer profile
   ↓
4. ProductValidationService.validate() validates product
   - Check product is ACTIVE
   - Check product is effective
   - Check term within limits
   - Check principal within limits
   ↓
5. RateService.determineFinalRate() calculates rate
   - Fetch customer category
   - Call Product Service rate calculation
   - Apply category adjustments
   ↓
6. AccountNumberGenerator.generate() creates account number
   ↓
7. Create FixedDepositAccount entity with PENDING status
   ↓
8. Save nominees (if provided)
   ↓
9. Save FD account to database
   ↓
10. FdCreatedPublisher.publishStatus() publishes event to Kafka
   ↓
11. Return FDApplicationResponse to customer
```

### FD Approval Flow

```
1. Bank Officer submits approval request
   ↓
2. FDAccountController.approveOrRejectFD() receives request
   ↓
3. Fetch FD account from database
   ↓
4. Check account is in PENDING_APPROVAL status
   ↓
5. If REJECT action:
   - Require rejection reason
   - Set status to REJECTED
   - Set approvalStatus to REJECTED
   - Save rejection reason
   ↓
6. If APPROVE action:
   - Set status to ACTIVE
   - Set approvalStatus to APPROVED
   - Set approvedBy and approvedAt
   - Recalculate maturity date from approval date
   ↓
7. FDTransactionService.recordInitialDeposit() creates transaction
   - Create DEPOSIT transaction
   - Save to database
   ↓
8. FdCreatedPublisher.publish() publishes FdCreated event to Kafka
   - Triggers notifications
   - Triggers statement generation
   ↓
9. Save FD account to database
   ↓
10. Return success message
```

### Account Access Control Flow

```
1. Customer requests FD account details
   ↓
2. FDAccountController.getById() receives request
   ↓
3. AccountAccess.requireAccess() checks access
   ↓
4. Check if user is staff (BANK_OFFICER or ADMIN)
   ↓
5. If staff → Allow access
   ↓
6. If customer → Check ownership
   - Query database: users → customer_profile → fd_accounts
   - Verify customer_id matches
   ↓
7. If not owner → Throw AccessDeniedException (403)
   ↓
8. If owner → Allow access
   ↓
9. Return FD account details
```

### Product Validation Flow

```
1. FDAccountService calls ProductValidationService.validate()
   ↓
2. ProductServiceClient.getProductByCode() fetches product
   - Use outbound service authentication
   - Call Product Service endpoint
   ↓
3. Parse product JSON response
   ↓
4. Validate product status is ACTIVE
   ↓
5. Validate effectiveDate <= today (using BusinessClock if available)
   ↓
6. Validate endDate >= today
   ↓
7. Validate productType is FD
   ↓
8. Validate term within termLimit.min and termLimit.max
   ↓
9. Validate principal within minDeposit and maxDeposit
   ↓
10. Convert JsonNode to ProductDTO
   ↓
11. Return ProductDTO
```

### Rate Calculation Flow

```
1. FDAccountService calls RateService.determineFinalRate()
   ↓
2. Fetch CustomerProfile from database
   ↓
3. Get customer category (default: GENERAL)
   - Map "SENIOR" to "SENIOR_CITIZEN"
   ↓
4. ProductServiceClient.calculateRate() calls Product Service
   - Send productCode, category, termMonths, amount
   - Use outbound service authentication
   ↓
5. Product Service calculates final rate
   - Base rate for term
   - Category adjustments
   - Clamp to product min/max
   ↓
6. Parse response JSON
   ↓
7. Extract finalRate field
   ↓
8. Scale to 2 decimal places
   ↓
9. Return final rate
```

### Event Publishing Flow

`FdCreatedPublisher` writes `FdCreated` to `event.fd.created` and `FdApplied` / `FdStatusChanged` to `event.fd.status-changed` through the transactional outbox. Interest and closure services emit their own events. The relay publishes pending rows to Kafka; the notification service consumes lifecycle events, while statements consume only `InterestAccrued` and `InterestPaid`. See [event contracts](../docs/EVENT_CONTRACTS.md).

### Time Travel Flow (Testing)

```
1. Test harness calls ClockController.advance()
   ↓
2. BusinessClock.advance(days) updates business date
   ↓
3. Trigger InterestPostingService.processBatch()
   - Calculate interest for all active FDs
   - Write daily accrual rows and one balanced `INTEREST_ACCRUAL` GL entry per account and batch; capitalization and payout clear the accrued-interest liability
   - Update accruedInterest
   ↓
4. Trigger MaturityService.run()
   - Find matured FDs
   - Create MATURITY_PAYOUT transactions
   - Update status to MATURED
   ↓
5. Return new clock status
   ↓
6. Test can verify interest accrual and maturity
```

---

## Database Schema

Use the checked-in [SQL schema](sql/l12_l13_setup.sql) and the entity mappings as the source of truth; illustrative DDL must not be used as a migration.
Also apply the ledger, interest, clock/contact and migration scripts under [sql/](sql/) in the order used by the root Docker Compose configuration. Existing volumes need the relevant migrations; initialization scripts run only on an empty volume.

## Security Considerations

1. **JWT Authentication:**
   - All endpoints require valid JWT (except /health)
   - Tokens issued by Auth Service
   - Token validation via ResourceServerSupport

2. **Role-Based Access Control:**
   - `@PreAuthorize` annotations on controller methods
   - CUSTOMER: Can only access their own accounts
   - BANK_OFFICER: Can access any account, approve applications
   - ADMIN: Staff access; user management is in Auth_Sec. `/create-with-txn` still requires BANK_OFFICER.

3. **Account Access Control:**
   - AccountAccess.requireAccess() checks ownership
   - Same 403 for unauthorized and non-existent (prevents probing)
   - Staff bypass ownership check

4. **Service-to-Service Authentication:**
   - OutboundServiceAuth for external service calls
   - Reuses a suitable caller JWT; otherwise signs a five-minute token using the shared secret
   - There is no service username/password login configuration

5. **Input Validation:**
   - Jakarta validation on all DTOs
   - Principal amount minimum: 10000.00
   - Term validation against product limits
   - PAN, IFSC, phone number format validation

6. **Transaction Isolation:**
   - `@Transactional` on service methods
   - Proper rollback on failures
   - Flush before event publishing

---

## Integration Points

### Product & Pricing Service
- **Base URL:** `services.product.base-url`
- **Endpoints Used:**
  - GET `/api/product/active`: Get active products
  - GET `/api/product/{code}`: Get product by code
  - GET `/api/product/{code}/validate`: Validate product
  - POST `/api/product/{code}/rate`: Calculate rate

### Calculator Service
- **Base URL:** `services.calculator.base-url`
- **Endpoints Used:**
  - POST `/api/v1/fd/calculations`: Calculate maturity
  - GET `/api/v1/fd/products/{code}/preview`: Preview product

### Kafka

See [event contracts](../docs/EVENT_CONTRACTS.md) for the actual `command.interest.*`, `event.interest.*`, `event.batch.*`, and `event.fd.*` topics. There is no `fd-events` or `interest-accrual` topic in this service's contract.

## Testing

Run the checked-in tests under `src/test` (under `auth-service/src/test` for Auth_Sec). Build `Auth_Sec/security-common` first; Group 9 services also need `event-common`. See the root [usage guide](../../usage.md) for build order. Documentation examples are illustrative and are not test evidence.

## Troubleshooting

### Common Issues

**1. Product Service Unavailable:**
```
Error: Failed to parse product response
Solution: Check Product Service is running and accessible
```

**2. Rate Calculation Fails:**
```
Error: Product service returned no valid rate
Solution: Verify product has rate configuration and customer category is valid
```

**3. Account Access Denied:**
```
Error: This FD account does not belong to you
Solution: Verify customer_id mapping between users and customer_profile tables
```

**4. Bundle Approval Fails:**
```
Error: Bundle is not in pending approval status
Solution: Verify bundle status before approval attempt
```

**5. Transaction Not Created:**
```
Error: No initial deposit transaction
Solution: Check FDTransactionService is properly injected and functional
```

---

## Dependencies

Key Maven dependencies:
- `spring-boot-starter-web`
- `spring-boot-starter-security`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-validation`
- `mysql-connector-j`
- `spring-kafka`
- `com.fasterxml.jackson.core:jackson-databind`

---

## API Endpoints Summary

| Endpoint | Method | Auth Required | Role | Purpose |
|----------|--------|---------------|------|---------|
| `/health` | GET | No | - | Health check |
| `/api/fd/account/create` | POST | Yes | BANK_OFFICER, ADMIN | Create FD directly |
| `/api/fd/account/apply` | POST | Yes | CUSTOMER | Apply for FD |
| `/api/fd/account/approve` | POST | Yes | BANK_OFFICER, ADMIN | Approve/reject FD |
| `/api/fd/account/pending` | GET | Yes | BANK_OFFICER, ADMIN | Get pending applications |
| `/api/fd/account/my-applications` | GET | Yes | CUSTOMER | Get my applications |
| `/api/fd/account/all-applications` | GET | Yes | BANK_OFFICER, ADMIN | Get all applications |
| `/api/fd/account/{fdAccountNo}` | GET | Yes | All | Get FD details |
| `/api/fd/account/{fdAccountNo}/withdraw` | POST | Yes | CUSTOMER | Withdraw application |
| `/api/fd/account/create-with-txn` | POST | Yes | BANK_OFFICER | Create with deposit |
| `/api/fd/account/{fdAccountNo}/transactions` | GET | Yes | All | Get transactions |
| `/api/fd/account/bundle/apply` | POST | Yes | CUSTOMER | Apply for bundle |
| `/api/fd/account/bundle/{bundleId}/approve` | POST | Yes | BANK_OFFICER, ADMIN | Approve bundle |
| `/api/fd/account/bundle/pending` | GET | Yes | BANK_OFFICER, ADMIN | Get pending bundles |
| `/api/fd/account/bundle/my-bundles` | GET | Yes | CUSTOMER | Get my bundles |
| `/api/fd/ledger/search-by-name` | GET | Yes | BANK_OFFICER, ADMIN | Search by name |
| `/api/fd/ledger/search-by-id` | GET | Yes | BANK_OFFICER, ADMIN | Search by ID |
| `/api/fd/ledger/all` | GET | Yes | BANK_OFFICER, ADMIN | Get all accounts |
| `/api/fd/ledger/{fdAccountNo}` | GET | Yes | All | Get account details |
| `/api/fd/ledger/{fdAccountNo}/transactions` | GET | Yes | All | Get transactions |
| `/api/fd/journal/all` | GET | Yes | BANK_OFFICER, ADMIN | Get all transactions |
| `/api/fd/journal/by-type` | GET | Yes | BANK_OFFICER, ADMIN | Get by type |
| `/api/fd/journal/summary` | GET | Yes | BANK_OFFICER, ADMIN | Get summary |
| `/internal/customers/{username}/categories` | GET | Yes | BANK_OFFICER, ADMIN | Get categories |
| `/api/fd/clock` | GET | Yes | All | Clock status |
| `/api/fd/clock/advance` | POST | Yes | All | Advance clock |
| `/api/fd/clock/reset` | POST | Yes | All | Reset clock |
