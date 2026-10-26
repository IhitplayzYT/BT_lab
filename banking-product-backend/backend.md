# Banking Product & Pricing Service

## Summary

The Banking Product & Pricing Service is a Spring Boot microservice responsible for managing banking products (FD, CASA, Loans), their pricing configurations, rate calculations, and FD maturity calculations. It serves as the central product catalog and pricing engine for the UNO Bank platform.

**Key Features:**
- Product CRUD operations (create, update, retire, delete)
- Product search and filtering
- Product validation for account creation
- Interest rate calculation with category adjustments
- FD maturity calculation
- Charge management and calculation
- Rate variation support (SENIOR_CITIZEN, EMPLOYEE, etc.)
- Internal endpoints for service-to-service communication
- OpenAPI/Swagger documentation
- Caching support for performance

**Technology Stack:**
- Spring Boot 3.x
- Spring Security 6.x with JWT
- Spring Data JPA
- MySQL Database
- Spring Cache
- OpenAPI 3 (Swagger)
- Lombok
- Maven

---

## Usage

### Starting the Service

First follow the root usage guide to build/install shared dependencies and configure MySQL, JWT and service connections. Run each local process in a separate terminal from the project root.

```bash
cd banking-product-backend
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
DB_URL=jdbc:mysql://localhost:3308/banking_product_db
DB_USER=product_user
DB_PASSWORD=<password>

# JWT Configuration
JWT_SECRET=<your-secret-key-min-32-chars>
JWT_ISSUER=fd-platform-auth

# Server Configuration
SERVER_PORT=8080

# Security
app.security.basic.enabled=false
```

### Common Use Cases

**1. Create New FD Product:**
```bash
curl -X POST http://localhost:8080/api/product \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <officer-token>" \
  -d '{
    "productCode": "FD001",
    "productName": "Fixed Deposit - Short Term",
    "productType": "FD",
    "currency": "INR",
    "effectiveDate": "2024-01-01",
    "status": "ACTIVE",
    "interestType": "CREDIT",
    "termLimit": {
      "min": 6,
      "max": 60
    },
    "rateLimit": {
      "min": 5.0,
      "max": 8.5
    },
    "minDeposit": 10000.0,
    "maxDeposit": 10000000.0,
    "rateVariations": [
      {
        "customerCategory": "SENIOR_CITIZEN",
        "rateModifier": 0.5
      },
      {
        "customerCategory": "EMPLOYEE",
        "rateModifier": 0.25
      }
    ],
    "charges": {
      "interestCreditFrequency": "MONTHLY",
      "taxDeduction": true,
      "withdrawalFees": 1.0
    },
    "allowedRoles": ["OWNER", "NOMINEE"]
  }'
```

**2. Get Active Products:**
```bash
curl -X GET "http://localhost:8080/api/product/active?type=FD"
```

**3. Calculate Final Rate:**
```bash
curl -X POST http://localhost:8080/api/product/FD001/rate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <officer-token>" \
  -d '{
    "termMonths": 12,
    "customerCategory": "SENIOR_CITIZEN",
    "amount": 100000
  }'
```

**4. Validate Product:**
```bash
curl -X GET "http://localhost:8080/api/product/FD001/validate?termMonths=12&amount=100000&age=65" \
  -H "Authorization: Bearer <officer-token>"
```

---

## Structure

Implementation is under [src/main/java/com/bank](src/main/java/com/bank). Controllers expose HTTP routes; services implement business logic; DTOs define JSON fields; repositories/entities implement persistence. Configuration and SQL are under `src/main/resources` and the module's SQL files. Shared security comes from Auth_Sec; Group 9 also uses event-common.

## Classes

### Core Classes

#### `ProductApplication.java`
**Purpose:** Spring Boot application entry point

**Annotations:**
- `@SpringBootApplication`: Main Spring Boot application
- `@EnableCaching`: Enables Spring Cache abstraction
- `@ComponentScan`: Scans com.bank.product package

---

#### `ProductService.java` (Interface)
**Purpose:** Product service interface defining business operations

**Key Methods:**
- `getCalculatorConfig(String)`: Get calculator config for FD Calculator service
- `createProduct(ProductRequestDTO)`: Create new product
- `updateProduct(String, ProductRequestDTO)`: Update existing product
- `retireProduct(String)`: Soft-delete/retire product
- `permanentlyDeleteProduct(String)`: Permanently delete product
- `searchProducts(...)`: Search products with filters
- `getProductByCode(String)`: Get product by code
- `validateProduct(...)`: Validate product for account creation
- `calculateFinalRate(...)`: Calculate final interest rate
- `getActiveProducts(String)`: Get active products by type
- `getProductDefaults(String)`: Get product defaults

---

#### `ProductServiceImpl.java`
**Purpose:** Product service implementation

**Key Features:**
- Product CRUD with validation
- Rate calculation with category adjustments
- Product validation logic
- Caching for performance
- Business rule enforcement

---

#### `FdCalculatorService.java` (Interface)
**Purpose:** FD Calculator service interface

**Key Methods:**
- `calculateMaturity(FdCalculationRequestDTO)`: Calculate FD maturity
- `calculateAdvancedMaturity(AdvancedCalculationRequestDTO)`: Calculate with charge breakdown
- `getAvailableCategories()`: Get available rate categories
- `getCalculationHistory()`: Get calculation history

---

### Entity Classes

See the [entity package](src/main/java/com/bank/product/entity) for the actual mappings. Product limits are represented by `ProductBusinessRules`; HTTP `termLimit` and `rateLimit` are DTOs. Rate variations use `customerCategory`. Product charges and holder roles have their own mappings. `allowedRoles` describes account-holder roles such as OWNER/NOMINEE, not API security permissions.

Product `interestType` uses CREDIT for deposits and DEBIT for loans. The embedded calculator's calculation type is a separate SIMPLE/COMPOUND concept.

### Controller Classes

#### `ProductController.java`
**Purpose:** REST API for product management

**Endpoints:**
- `POST /api/product` or `POST /api/v1/products`: Create product (BANK_OFFICER, ADMIN)
- `PUT /api/product/{code}` or `PUT /api/v1/products/{code}`: Update product (BANK_OFFICER, ADMIN)
- `DELETE /api/product/{code}` or `DELETE /api/v1/products/{code}`: Retire product (BANK_OFFICER, ADMIN)
- `DELETE /api/product/{code}/permanent` or `DELETE /api/v1/products/{code}/permanent`: Permanently delete (ADMIN)
- `GET /api/product/search` or `GET /api/v1/products/search`: Search products (authenticated)
- `GET /api/product/active` or `GET /api/v1/products/active`: Get active products (public)
- `GET /api/product/{code}` or `GET /api/v1/products/{code}`: Get product by code (authenticated)
- `GET /api/product/{code}/validate` or `GET /api/v1/products/{code}/validate`: Validate product (authenticated)
- `POST /api/product/{code}/rate` or `POST /api/v1/products/{code}/rate`: Calculate rate (authenticated)
- `GET /api/product/{code}/defaults` or `GET /api/v1/products/{code}/defaults`: Get defaults (authenticated)

**OpenAPI Annotations:**
- `@Tag`: API documentation grouping
- `@Operation`: Endpoint documentation
- `@ApiResponse`: Response documentation
- `@SecurityRequirement`: Security documentation

---

#### `InternalProductController.java`
**Purpose:** Internal endpoints for service-to-service communication

**Endpoints:**
- `GET /internal/products/{code}/calculator-config` or `GET /api/v1/products/internal/products/{code}/calculator-config`: Get calculator config (authenticated)

**Use Case:** FD Calculator service fetches product configuration

---

#### `FdCalculatorController.java`
**Purpose:** REST API for FD calculations

**Endpoints:**
- `POST /api/fd/calculate`: Calculate FD maturity (authenticated)
- `POST /api/fd/calculate/advanced`: Calculate with charge breakdown (authenticated)
- `GET /api/fd/categories`: Get available categories (authenticated)
- `GET /api/fd/history`: Get calculation history (authenticated)

---

### Configuration Classes

#### `SecurityConfig.java`
**Purpose:** Spring Security configuration

**Key Features:**
- JWT-only authentication
- Resource server support
- CORS configuration for frontend
- Method-level security with `@PreAuthorize`
- Public endpoints: `/api/product/active`, health checks, Swagger UI
- All other endpoints: Require authentication

---

## Examples

The annotated sequences below are explanatory pseudocode, not compilable Java. IDs, dates and amounts are illustrative; use returned IDs and current product configuration for API calls.

### Example 1: Create FD Product

```text
// Create FD product with senior citizen bonus
POST /api/product
Authorization: Bearer <officer-token>
{
  "productCode": "FD001",
  "productName": "Fixed Deposit - Short Term",
  "productType": "FD",
  "currency": "INR",
  "effectiveDate": "2024-01-01",
  "status": "ACTIVE",
  "interestType": "CREDIT",
  "minAge": 18,
  "minDeposit": 10000.0,
  "maxDeposit": 10000000.0,
  "termLimit": {
    "min": 6,
    "max": 60
  },
  "rateLimit": {
    "min": 5.0,
    "max": 8.5
  },
  "rateVariations": [
    {
      "customerCategory": "SENIOR_CITIZEN",
      "rateModifier": 0.5
    },
    {
      "customerCategory": "EMPLOYEE",
      "rateModifier": 0.25
    }
  ],
  "charges": {
    "interestCreditFrequency": "MONTHLY",
    "taxDeduction": true,
    "withdrawalFees": 1.0
  },
  "allowedRoles": ["OWNER", "NOMINEE"]
}

Response: 201 Created
{
  "productId": 1,
  "productCode": "FD001",
  "productName": "Fixed Deposit - Short Term",
  "productType": "FD",
  "currency": "INR",
  "effectiveDate": "2024-01-01",
  "status": "ACTIVE",
  "interestType": "CREDIT",
  "minAge": 18,
  "minDeposit": 10000.0,
  "maxDeposit": 10000000.0,
  "termLimit": {
    "min": 6,
    "max": 60
  },
  "rateLimit": {
    "min": 5.0,
    "max": 8.5
  },
  "rateVariations": [
    {
      "customerCategory": "SENIOR_CITIZEN",
      "rateModifier": 0.5
    }
  ],
  "charges": {
    "interestCreditFrequency": "MONTHLY",
    "taxDeduction": true,
    "withdrawalFees": 1.0
  },
  "allowedRoles": ["OWNER", "NOMINEE"],
  "createdBy": "officer_smith",
  "createdAt": "2024-10-21T10:00:00"
}
```

### Example 2: Calculate Final Rate with Category Adjustment

`POST /api/product/FD001/rate` accepts `termMonths` (required positive integer), `customerCategory`, `age`, and `amount`. Base rate comes from product configuration, not a request `baseRate` field. The response contains `productCode`, `productName`, `termMonths`, `customerCategory`, `baseRate`, `rateModifier`, `finalRate`, `minRateLimit`, and `maxRateLimit`.

### Example 3: Validate Product for Account Creation

`GET /api/product/FD001/validate?termMonths=12&amount=100000&age=65` requires a Bearer token. A successful response follows [ProductValidationResponseDTO](src/main/java/com/bank/product/dto/ProductValidationResponseDTO.java); failures use an HTTP error rather than `termValid`/`amountValid` flags.

### Example 4: FD Maturity Calculation

The authenticated legacy `/api/fd/calculate` and `/api/fd/calculate/advanced` endpoints run on this service's port 8080. Their request types are in [fdcalculator/dto](src/main/java/com/bank/fdcalculator/dto). They are separate from the JWT-protected Mod 4 calculator on port 8084; do not interchange their schemas or calculation assumptions.

## Working Flow

### Product Creation Flow

```
1. Bank Officer submits product creation request
   ↓
2. ProductController.createProduct() receives request
   ↓
3. Validate request DTO
   - Product code uniqueness
   - Required fields
   - Business rules
   ↓
4. ProductService.createProduct() processes
   ↓
5. Create Product entity
   ↓
6. Save RateVariation entities
   ↓
7. Save ProductCharges entity
   ↓
8. Save ProductRole entities
   ↓
9. Save Product entity
   ↓
10. Return ProductResponseDTO
```

### Rate Calculation Flow

```
1. Request final rate calculation
   ↓
2. ProductService.calculateFinalRate() called
   ↓
3. Fetch product by code
   ↓
4. Validate product is active
   ↓
5. Start with base rate
   ↓
6. Apply category adjustments
   - For each category in request
   - Find matching RateVariation
   - Add rateModifier
   ↓
7. Calculate total adjustment
   ↓
8. Apply to base rate
   ↓
9. Clamp to product rateLimit.min/max
   ↓
10. Check if rate was capped
   ↓
11. Return RateCalculationResponseDTO
```

### Product Validation Flow

```
1. Request product validation
   ↓
2. ProductService.validateProduct() called
   ↓
3. Fetch product by code
   ↓
4. Validate product status is ACTIVE
   ↓
5. Validate effectiveDate <= today
   ↓
6. Validate endDate >= today (if set)
   ↓
7. Validate term within termLimit
   ↓
8. Validate amount within minDeposit/maxDeposit
   ↓
9. Validate age >= minAge (if set)
   ↓
10. Build validation response
   ↓
11. Return ProductValidationResponseDTO
```

### FD Calculation Flow

```
1. Request FD maturity calculation
   ↓
2. FdCalculatorController.calculateFd() receives request
   ↓
3. FdCalculatorService.calculateMaturity() called
   ↓
4. Extract parameters
   - Principal, term, baseRate
   - Categories, interestType, compoundingFrequency
   ↓
5. Calculate effective rate
   - Apply category adjustments
   ↓
6. Calculate maturity amount
   - Based on interest type (SIMPLE/COMPOUND)
   - Apply compounding frequency
   ↓
7. Calculate interest earned
   ↓
8. Save calculation to history
   ↓
9. Return FdCalculationResponseDTO
```

---

## Database Schema

Use the checked-in [SQL schema](schema.sql) and the entity mappings as the source of truth; illustrative DDL must not be used as a migration.

## Security Considerations

1. **JWT Authentication:**
   - All endpoints require valid JWT (except public endpoints)
   - Role-based access (BANK_OFFICER, ADMIN, CUSTOMER)
   - Uses shared security library

2. **Role-Based Access Control:**
   - `@PreAuthorize` annotations on controller methods
   - BANK_OFFICER: Product CRUD operations
   - ADMIN: Full access including permanent delete
   - CUSTOMER: Read access to active products

3. **Public Endpoints:**
   - `/api/product/active`: Get active products (no auth required)
   - `/api/fd/**`: Legacy calculator endpoints require authentication; they have no additional controller role restriction.

4. **Input Validation:**
   - Jakarta validation on all DTOs
   - Business rule validation in service layer
   - Product code uniqueness enforced

5. **Caching:**
   - Product lookups cached for performance
   - Cache eviction on product updates

---

## Integration Points

### FD Account Service
- **Endpoints:** `/api/product/{code}`, `/api/product/{code}/rate`
- **Purpose:** Account validation and booked rate calculation
- **Authentication:** JWT required

### FD Calculator Service (Mod 4)
- **Internal Endpoint:** `/api/v1/products/internal/products/{code}/calculator-config`
- **Purpose:** Fetch calculator configuration for rate calculation
- **Authentication:** JWT required

---

## Testing

Run the checked-in tests under `src/test` (under `auth-service/src/test` for Auth_Sec). Build `Auth_Sec/security-common` first; Group 9 services also need `event-common`. See the root [usage guide](../usage.md) for build order. Documentation examples are illustrative and are not test evidence.

## Troubleshooting

### Common Issues

**1. Product Code Duplicate:**
```
Error: Duplicate product code
Solution: Use unique product code
```

**2. Rate Capped:**
```
Warning: Rate capped at product maximum
Solution: Adjust rateLimit or category modifiers
```

**3. Validation Failed:**
```
Error: Term must be between min and max
Solution: Check term limits in product configuration
```

**4. Cache Stale:**
```
Issue: Product not reflecting recent changes
Solution: Cache will be evicted on update, or restart service
```

---

## Dependencies

Key Maven dependencies:
- `spring-boot-starter-web`
- `spring-boot-starter-security`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-validation`
- `spring-boot-starter-cache`
- `mysql-connector-j`
- `org.springdoc:springdoc-openapi-starter-webmvc-ui`
- `org.projectlombok:lombok`
- `com.fasterxml.jackson.core:jackson-databind`

---

## API Endpoints Summary

### Product Management
| Endpoint | Method | Auth Required | Role | Purpose |
|----------|--------|---------------|------|---------|
| `/api/product` | POST | Yes | BANK_OFFICER, ADMIN | Create product |
| `/api/product/{code}` | PUT | Yes | BANK_OFFICER, ADMIN | Update product |
| `/api/product/{code}` | DELETE | Yes | BANK_OFFICER, ADMIN | Retire product |
| `/api/product/{code}/permanent` | DELETE | Yes | ADMIN | Permanently delete |
| `/api/product/search` | GET | Yes | All | Search products |
| `/api/product/active` | GET | No | - | Get active products |
| `/api/product/{code}` | GET | Yes | All | Get product by code |
| `/api/product/{code}/validate` | GET | Yes | All | Validate product |
| `/api/product/{code}/rate` | POST | Yes | All | Calculate rate |
| `/api/product/{code}/defaults` | GET | Yes | All | Get defaults |

### Internal Endpoints
| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/internal/products/{code}/calculator-config` | GET | Yes | Get calculator config |

### FD Calculator
| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/api/fd/calculate` | POST | Yes | Calculate maturity |
| `/api/fd/calculate/advanced` | POST | Yes | Calculate with charges |
| `/api/fd/categories` | GET | Yes | Get categories |
| `/api/fd/history` | GET | Yes | Get history |
