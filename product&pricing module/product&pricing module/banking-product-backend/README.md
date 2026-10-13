# Banking Product & Pricing Backend Module

This folder contains the complete, self-contained Spring Boot backend for the **Banking Product and Pricing Module** (Labs L5, L9, and L13).

**Port:** 8080
**API Prefix:** `/api/v1/products`
**Technology Stack:** Spring Boot 3.3.2, Java 21, Maven, MySQL, Kafka, Spring Security OAuth2

---

## 📁 Folder Contents

```
banking-product-backend/
├── pom.xml                                 # Maven project configuration with all dependencies (Spring Security, JJWT, Actuator, etc.)
├── src/                                    # Complete Java source code and configuration
│   ├── main/java/com/bank/
│   │   ├── product/                        # Core Product module (Controllers, Security, Services, Repositories, DTOs, Entities)
│   │   └── fdcalculator/                   # Fixed Deposit Calculation & History engine
│   ├── main/resources/
│   │   ├── application.yml                 # Application configuration (MySQL datasource, JWT secrets, Actuator)
│   │   └── schema.sql                      # Database DDL with all 11 audit columns (Tables, Indexes, Foreign Keys)
│   └── test/                               # Comprehensive automated test suite (63 tests, 100% pass)
├── schema.sql                              # Database schema DDL script for MySQL
├── insert_dummy_data.sql                   # Seed data script for MySQL (FD, Savings, Loan products & variations)
├── postman_collection.json                 # Postman collection (20 requests with automatic JWT token management)
├── openapi.json                            # Exported OpenAPI 3.0 specification (ready for Angular client generation)
├── smoke_test_endpoints.sh                 # Bash script to smoke-test all endpoints via curl
├── SOLUTION_DOCUMENT.md                    # Architecture & API technical specification
├── PRODUCT_AND_PRICING_MODULE_EXPLANATION.md # Comprehensive guide in Markdown format
├── PRODUCT_AND_PRICING_MODULE_EXPLANATION.pdf # Comprehensive guide in PDF format
└── README.md                               # This quick-start guide
```

---

## 🗄️ Does the Database Need to Be Sent?

**No, you do NOT send any database server files!**  
Databases (like MySQL) run locally on the host machine. Everything needed to build the database is already included in this folder:
1. **`schema.sql`**: Automatically or manually creates the tables (`products`, `productBusinessRules`, `productCharges`, `productRoles`, `product_rate_variations`, `fd_calculations`).
2. **`insert_dummy_data.sql`**: Seeds the sample products (`FD001`, `SAV001`, `FD002`, `LN001`) and test rate variations.
3. **In-Memory Testing**: The automated test suite (`mvn test`) automatically uses an embedded H2 database and requires no database setup.

---

## 🚀 How to Run the Backend

### Prerequisites
- Java 21 (JDK 21)
- Maven 3.8+
- MySQL 8.0+ (optional for local dev; default uses `banking_product_db`)

### Step 0: Environment (required)
No secret is stored in the repo. Set these before starting:
```bash
export JWT_SECRET="$(openssl rand -base64 48)"           # HMAC signing key, >= 32 bytes
export DB_PASSWORD='<mysql password>'
export DB_USER='root'
export DB_URL='jdbc:mysql://localhost:3306/banking_product_db'
export SPRING_PROFILES_ACTIVE=dev                         # dev profile
# optional: KAFKA_BOOTSTRAP_SERVERS, JWT_ISSUER_URI, JWT_AUDIENCE, APP_CORS_ALLOWED_ORIGINS
```
`mvn test` needs none of these (it uses H2 and a test-only key).

### Step 1: (Optional) MySQL Setup
If using MySQL, log in and create the database or run the SQL scripts:
```bash
mysql -u root -p < schema.sql
mysql -u root -p banking_product_db < insert_dummy_data.sql
```
*(Alternatively, Spring Boot can automatically create tables using `schema.sql` on startup).*

### Step 2: Build and Test
```bash
mvn clean test
```
All 63 tests across security, business rules, controllers, error handling and E2E will execute and pass.

### Step 3: Start the Server
```bash
mvn spring-boot:run
```
The server will start at: `http://localhost:8080`.

---

## 🔍 How to Test the Endpoints

1. **Swagger / OpenAPI Interactive UI**:
   - URL: `http://localhost:8080/swagger-ui.html`
   - Use the **Authorize** button with a token generated from `POST /api/auth/token`.

2. **Postman**:
   - Import `postman_collection.json`.
   - Run the requests under `1. Authentication & Tokens` to automatically set the `adminToken` and `officerToken` variables.

3. **Smoke Test Script (Terminal)**:
   ```bash
   chmod +x smoke_test_endpoints.sh
   ./smoke_test_endpoints.sh
   ```

4. **Observability**:
   - Health check: `http://localhost:8080/actuator/health`
   - Metrics: `http://localhost:8080/actuator/metrics`
   - Prometheus metrics: `http://localhost:8080/actuator/prometheus`

---

## 🐳 Docker

```bash
# Build Docker image
docker build -t product-service .

# Run container
docker run -p 8080:8080 \
  -e DB_URL=jdbc:mysql://host.docker.internal:3306/banking_product_db \
  -e DB_USER=root \
  -e DB_PASSWORD=your_password \
  -e JWT_SECRET=your_jwt_secret \
  -e JWT_ISSUER_URI=http://localhost:8081 \
  product-service
```

The Dockerfile uses:
- Base image: `eclipse-temurin:21-jre-alpine`
- Non-root user: `appuser`
- Container support enabled
- MaxRAMPercentage: 75%

---

## 📊 Observability

### Structured Logging
- JSON structured logging via Logstash Encoder
- Correlation IDs in all logs
- Log files written to `./logs/product-service.log`
- 30-day log retention

### Metrics
- Actuator endpoints: `/actuator/health`, `/actuator/metrics`, `/actuator/prometheus`
- Custom business metrics:
  - `product.creation.total` - Total products created
  - `product.update.total` - Total products updated
  - `product.rate.calculations.total` - Total rate calculations
  - `product.rate.calculations.duration` - Rate calculation duration
  - `product.cache.hits` - Cache hits
  - `product.cache.misses` - Cache misses
  - `product.batch.operations.total` - Total batch operations

### Kafka Integration
- Topics:
  - `product-service-batch-products` - Batch product creation events
  - `product-service-audit-logs` - Audit log events
- Environment variable: `KAFKA_BOOTSTRAP_SERVERS` (default: localhost:9092)
