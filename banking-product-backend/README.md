# Banking Product & Pricing Backend Module

This folder contains the complete, self-contained Spring Boot backend for the **Banking Product and Pricing Module** (Labs L5, L9, and L13).

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
│   └── test/                               # Comprehensive automated test suite (45 tests, 100% pass)
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
1. **`schema.sql`**: Automatically or manually creates the tables (`products`, `product_business_rules`, `product_charges`, `product_roles`, `product_rate_variations`, `fd_calculations`).
2. **`insert_dummy_data.sql`**: Seeds the sample products (`FD001`, `SAV001`, `FD002`, `LN001`) and test rate variations.
3. **In-Memory Testing**: The automated test suite (`mvn test`) automatically uses an embedded H2 database and requires no database setup.

---

## 🚀 How to Run the Backend

### Prerequisites
- Java 21 (JDK 21)
- Maven 3.8+
- MySQL 8.0+ (required by the default runtime configuration; tests use H2)

### Step 1: MySQL and JWT Setup
If using MySQL, log in and create the database or run the SQL scripts:
```bash
mysql -u root -p < schema.sql
mysql -u root -p banking_product_db < insert_dummy_data.sql
```
Set `DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET` and `JWT_ISSUER` before starting. `spring.sql.init.mode=never`, so Spring does not execute `schema.sql` automatically. Root Compose initializes schema and seed data on an empty MySQL volume.

### Step 2: Build and Test
```bash
mvn -f ../Auth_Sec/pom.xml -pl security-common -am install
mvn clean test
```
This runs the checked-in tests; historical test counts are not a guarantee for the current worktree.

### Step 3: Start the Server
```bash
mvn spring-boot:run
```
The server will start at: `http://localhost:8080`.

---

## 🔍 How to Test the Endpoints

1. **Swagger / OpenAPI Interactive UI**:
   - URL: `http://localhost:8080/swagger-ui.html`
   - Use the **Authorize** button with a token generated from `POST http://localhost:8090/api/auth/login`.

2. **Postman**:
   - Import `postman_collection.json`.
   - Authenticate with Auth_Sec on port 8090 and set the collection token variables. Older token-helper requests in exported collections may need updating.

3. **Smoke Test Script (Terminal)**:
   ```bash
   chmod +x smoke_test_endpoints.sh
   ./smoke_test_endpoints.sh
   ```

4. **Observability**:
   - Health check: `http://localhost:8080/actuator/health`
