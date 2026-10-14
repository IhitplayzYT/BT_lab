> Parth L14/L17 handover: this module now belongs to the root Maven reactor. Follow the project root README for builds and service startup. The historical standalone instructions below describe the earlier module.

# Banking Technology Lab — FD Module L12 + L13

This is a standalone Spring Boot implementation of the Fixed Deposit Module setup and account-creation flow.

## Stack
- Java 25
- Spring Boot 4.1.1
- Spring Web
- Spring Data JPA / Hibernate
- MySQL
- Spring Security (HTTP Basic for standalone testing)

## Important
The lab manual uses JWT in the earlier authentication labs. This standalone project uses HTTP Basic only so that L12/L13 can be run independently in Postman. When you integrate it into your existing L1-L4/L9-L10 project, replace the standalone `SecurityConfig` with your existing JWT security configuration.

## Run
1. Create the MySQL database/tables using `sql/l12_l13_setup.sql`.
2. Open `src/main/resources/application.properties` and set your MySQL username/password.
3. From this folder run:
   `mvn spring-boot:run`
4. The application runs on port 8080.

## Postman
### Health
GET `http://localhost:8080/health`
No authentication.

### Create FD account
POST `http://localhost:8080/api/fd/account/create`
Authorization: Basic Auth
- Username: `officer1`
- Password: `officer123`

Body → raw → JSON:
```json
{
  "customerId": "CUST001",
  "productCode": "FDSTD",
  "principalAmount": 200000,
  "termMonths": 12,
  "branchCode": "BR001"
}
```

### Get created FD
GET `http://localhost:8080/api/fd/account/{fdAccountNo}`
Use Basic Auth with `officer1/officer123`.

### Test authorization
Try POST create with:
- `customer1 / customer123` → should return 403
- `officer1 / officer123` → should succeed
- `admin1 / admin123` → should succeed

## Account number
The generator follows the lab's idea of:
`branch + 6-digit sequence + 1-digit checksum`
Example: `BR0010000015`.

## L13 flow implemented
Angular/Postman → POST API → Spring Controller → role check → customer validation → product/term/deposit validation → rate determination → account number generation → `fd_accounts` insert → response.

---

## Lab 16 — Initial deposit transaction logging + GL (Anirudh Syam Menon)

Adds the `fd_transactions` ledger, atomic FD creation with an initial `DEPOSIT`, double-entry GL
codes, and a transaction-history endpoint. The L12/L13 code is unchanged. Full details:
[`docs/LAB16_HANDOVER.md`](docs/LAB16_HANDOVER.md).

### Database (run once)
1. Put your MySQL username/password in `src/main/resources/application.properties` (marked block).
2. In MySQL Workbench open and execute, in this order:
   - `sql/l12_l13_setup.sql`: base tables + test data (CUST001, FDSTD)
   - `sql/l16_fd_transactions.sql`: Lab 16 ledger table

Required because `ddl-auto=validate`: the app will not start without the tables.

### Create FD with initial deposit (Lab Manual L16)
POST `http://localhost:8080/api/fd/account/create-with-txn` — Basic Auth `officer1 / officer123`
(BANK_OFFICER only). Same body as `/create`. Response:
```json
{
  "fdAccountNo": "BR0010000015",
  "initialTransactionId": 1,
  "message": "Account and initial deposit created.",
  "transactionHistoryUrl": "/api/fd/account/BR0010000015/transactions"
}
```

### Transaction history
GET `http://localhost:8080/api/fd/account/{fdAccountNo}/transactions` (BANK_OFFICER, ADMIN, CUSTOMER).

### Tests
`mvn test` (uses in-memory H2; no MySQL needed).
