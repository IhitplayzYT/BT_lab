# Lab 16 Handover — FD Transactions & GL Initialisation

> Historical L16 delivery snapshot. The current service uses Java 21 / Spring Boot 3.3.4 on port 8086 with JWT, customer ownership checks, HTTP product integration and deposits on direct creation. The old test counts, Basic-auth examples and “unchanged” claims below refer only to the original delivery. Use [current backend documentation](../backend.md) and [root usage](../../../usage.md) to run the integrated project.

**Owner:** Anirudh Syam Menon (Group 9 work distribution)
**Baseline:** Vritika Vinod's L12/L13 implementation (`fd-module-l12-l13`), extended in place. No L12/L13 class was modified.
**Status:** Backend code complete. `mvn clean test`: **21 tests, 0 failures, 0 errors** (run locally on JDK 17.0.19 / Maven 3.9.6). MySQL end-to-end check pending local DB credentials (see section 21).

---

## 1. Responsibilities (Group 9 sheet)

| # | Task | Lab | Delivered as |
|---|---|---|---|
| 1 | DB Schema `fd_transactions`: fields for deposit/withdrawal events | L16 | `sql/l16_fd_transactions.sql`, `FDTransaction` entity |
| 2 | Initial Deposit Logging: `@Transactional` insert on account creation | L16 | `FDTransactionService.createFDAccountWithTransaction` / `recordInitialDeposit` |
| 3 | Double Bookkeeping / GL Init: internal accounts for GL debit/credit | General | `GLAccounts` + debit/credit columns on every ledger row |
| 4 | Success view & Txn History Link: FD Account No, Txn ID, history link | L16 | `create-with-txn` response + `GET /{fdAccountNo}/transactions` (backend-only module, no UI) |

**Ownership caveat:** `Work_Distribution_TEAM_1.xlsx` contains two Group 9 assignments. The "Group 9" sheet (followed here) gives L16 to Anirudh. The "TEAM 1 Detailed Timeline" sheet gives L16 to Parth Gupta and L18/L19 to Anirudh. Confirm with the team lead before merging so L16 isn't implemented twice.

## 2. Existing FD creation architecture (unchanged)

```
POST /api/fd/account/create  (HTTP Basic, BANK_OFFICER or ADMIN)
 -> FDAccountController.create
 -> FDAccountService.create               @Transactional
     -> CustomerProfileRepository.existsById
     -> ProductValidationService.validate  (exists, ACTIVE, effective, term, min deposit)
     -> RateService.determineFinalRate
     -> FDAccountNumberGenerator.generate  (branch + 6-digit seq + checksum)
     -> FixedDepositAccountRepository.save (fd_accounts)
 <- FDAccountResponse
```

## 3. `fd_transactions` schema

File: `sql/l16_fd_transactions.sql`. Columns follow the **team ER diagram** (repo `ER_Diagram.pdf`):

| Column | Type | Notes |
|---|---|---|
| txn_id | BIGINT PK AUTO_INCREMENT | returned as `initialTransactionId` |
| fd_account_no | VARCHAR(20) NOT NULL | FK → `fd_accounts.fd_account_no` |
| txn_type | VARCHAR(20) NOT NULL | `DEPOSIT` for L16 |
| amount | DECIMAL(18,2) NOT NULL | CHECK `amount >= 0` |
| currency | VARCHAR(3) | copied from `fd_accounts.currency` |
| debit_gl_account | VARCHAR(50) NOT NULL | double entry, debit leg |
| credit_gl_account | VARCHAR(50) NOT NULL | double entry, credit leg |
| status | VARCHAR(20) NOT NULL | `POSTED` |
| txn_timestamp | TIMESTAMP NOT NULL | when the entry was executed |
| remarks | VARCHAR(500) | `Initial Deposit` |
| uuid | VARCHAR(255) NOT NULL UNIQUE | global unique reference |
| created_by / created_at / updated_by | audit | team-ER audit columns; `updated_by` never set |
| deposit_guard | generated, STORED | technical only (see section 10) |

Indexes: `uk_fd_txn_uuid`, `uk_fd_txn_one_deposit`, `idx_fd_txn_account_time (fd_account_no, txn_timestamp)`.

**Lab Manual vs ER (decision):** the Manual's L16 sample uses `txn_date`, `DOUBLE`, `INT`, `VARCHAR(255)`. The ER uses `txn_timestamp`, `DECIMAL(18,2)`, `BIGINT`, `VARCHAR(500)`. The ER was chosen, matching the precedent in L12/L13 (`fd_accounts` already uses ER names and `DECIMAL` instead of the Manual's `principal DOUBLE`). **Teammates copying the Manual's sample SQL must use `txn_timestamp`, not `txn_date`.**

## 4. Entity — `entity/FDTransaction.java`

Maps `fd_transactions`. Append-only: every column is `updatable = false`, no setters, one constructor. `@PrePersist` fills `txn_timestamp`, `created_at`, `uuid` and `status`. The account is referenced by its number (String), following the existing `customerId` / `productCode` style. Constants: `TYPE_DEPOSIT = "DEPOSIT"`, `STATUS_POSTED = "POSTED"`.

## 5. Repository — `repository/FDTransactionRepository.java`

Extends Spring Data's minimal `Repository` (not `JpaRepository`), so there are no update or delete methods. Methods: `save`, `findById`, `findByFdAccountNoOrderByTxnTimestampAscTxnIdAsc`, `findFirstByFdAccountNoAndTxnTypeOrderByTxnIdAsc`, `countByFdAccountNo`.

## 6. Service — `service/FDTransactionService.java`

| Method | Purpose |
|---|---|
| `createFDAccountWithTransaction(request, createdBy)` | Lab Manual L16 §5.2 name. Creates the FD via the existing L13 service, then the DEPOSIT, in one transaction |
| `recordInitialDeposit(fd, createdBy)` | Writes the DEPOSIT + GL legs. Idempotent. `Propagation.MANDATORY` |
| `getTransactions(fdAccountNo)` | History, oldest first. 400 if the account doesn't exist |

## 7. FD creation integration

The new service **calls** `FDAccountService.create(...)`; it doesn't copy or change it. All L13 validation, rate and account-number logic is reused exactly. Integration point with Vritika's code: one method call. Nothing in her files changed.

## 8. GL initialisation

`service/GLAccounts.java`:

| Leg | Account | Why |
|---|---|---|
| Debit | `ASSET_CUSTOMER_REMITTANCE` | Funds received from the customer (asset/clearing). The L13 request has no funding-source account, so one internal remittance account is used |
| Credit | `LIABILITY_FD_DEPOSITS` | The bank now owes the principal (the Lab Manual's "FD Liabilities GL") |

Amount on both legs is the FD principal. **Storage:** the team ER has no GL master table; GL accounts are codes on each ledger row, so one row is one balanced double entry (same amount, same transaction, same `txn_id` / `uuid`). Nothing extra links the GL entry to the transaction: it is the transaction row. **Team contract:** later postings must reuse these codes. Pratham's L19 "Debit FD Liabilities GL, Credit Savings" should debit `LIABILITY_FD_DEPOSITS`.

## 9. Atomicity / rollback

```
FDTransactionService.createFDAccountWithTransaction   @Transactional(REQUIRED)   <- boundary
  FDAccountService.create                             @Transactional(REQUIRED)   joins
  FixedDepositAccountRepository.flush()               fd_accounts INSERT executed (FK order)
  recordInitialDeposit                                @Transactional(MANDATORY)  joins
commit both rows, or roll back both on any RuntimeException
```
The L13 code throws `IllegalArgumentException` (a RuntimeException) for every business-rule failure, so failures roll back by default. `FDTransactionRollbackIntegrationTest` forces the ledger write to fail after the account row is already written, then checks that the account row is gone.

## 10. Idempotency (what is and isn't guaranteed)

- **Guaranteed: at most one initial DEPOSIT per FD account.** In the application, `recordInitialDeposit` returns the existing DEPOSIT if there is one. In the database, `deposit_guard` (= `fd_account_no` for DEPOSIT rows, NULL otherwise) has a unique key, so a second DEPOSIT for the same account is rejected even if a bug bypasses the service. Other transaction types are not restricted.
- **Not guaranteed: client-retry idempotency of the whole request.** If a client resubmits `create-with-txn` (e.g. after a timeout), the L13 generator issues a *new* account number, so a second FD with its own deposit is created. Fixing that needs a client idempotency key on `FDAccountRequest`, which is the L13 contract (Vritika's), so it's out of scope. "Exactly once" is **not** claimed.
- The `deposit_guard` constraint exists only in the MySQL script. Tests run on Hibernate-generated H2 tables and exercise the application-level check only.

## 11. API

| Endpoint | Roles | Notes |
|---|---|---|
| `POST /api/fd/account/create-with-txn` | **BANK_OFFICER only** (Lab Manual L16 §5.1/§7) | Body = existing `FDAccountRequest` |
| `GET /api/fd/account/{fdAccountNo}/transactions` | BANK_OFFICER, ADMIN, CUSTOMER | Same roles as the existing `GET /api/fd/account/{fdAccountNo}` |

Response `FDAccountCreationResponse`: `fdAccountNo`, `initialTransactionId`, `message` (exactly the Manual's §6.2) **plus** `transactionHistoryUrl` (additive). History item `FDTransactionResponse`: `txnId, fdAccountNo, txnType, amount, currency, debitGlAccount, creditGlAccount, status, txnTimestamp, remarks, uuid, createdBy`.

The existing `POST /api/fd/account/create` and its `FDAccountResponse` are unchanged. ADMIN may still use `/create`, but not `create-with-txn` (Manual rule).

## 12. Transaction history

`GET .../{fdAccountNo}/transactions` → `FDTransactionService.getTransactions` → `findByFdAccountNoOrderByTxnTimestampAscTxnIdAsc`. Teammates' future rows (WITHDRAWAL, INTEREST, MATURITY_PAYOUT, …) appear here automatically once they insert into `fd_transactions`.

## 13. "Success UI"

The module is backend-only (confirmed: no Angular). The success view is the `create-with-txn` response: FD account number, initial transaction ID, message and a ready-to-call `transactionHistoryUrl`.

## 14. Modified files

| File | Change | Why |
|---|---|---|
| `pom.xml` | + `h2` (test scope), + `spring-security-test` (test scope) | Run integration/rollback tests without MySQL; `httpBasic()` in MockMvc. Not packaged into the app |
| `README.md` | appended Lab 16 section | Run instructions |
| `src/main/resources/application.properties` | comment block marking where to put your MySQL username/password; values unchanged (`root` / `12345`) | Each developer's local MySQL login differs |

## 15. New files

```
sql/l12_l13_setup.sql            (recreated base schema, see section 16)
sql/l16_fd_transactions.sql
src/main/java/com/example/fdmodule/entity/FDTransaction.java
src/main/java/com/example/fdmodule/repository/FDTransactionRepository.java
src/main/java/com/example/fdmodule/service/GLAccounts.java
src/main/java/com/example/fdmodule/service/FDTransactionService.java
src/main/java/com/example/fdmodule/dto/FDAccountCreationResponse.java
src/main/java/com/example/fdmodule/dto/FDTransactionResponse.java
src/main/java/com/example/fdmodule/controller/FDTransactionController.java
src/test/resources/application-test.properties
src/test/java/com/example/fdmodule/service/FDTransactionServiceTest.java
src/test/java/com/example/fdmodule/integration/TestData.java
src/test/java/com/example/fdmodule/integration/FDTransactionApiIntegrationTest.java
src/test/java/com/example/fdmodule/integration/FDTransactionRollbackIntegrationTest.java
docs/LAB16_HANDOVER.md
```

## 16. Database migrations

There is no Flyway. Run, in order, in MySQL Workbench or the mysql client:
1. `sql/l12_l13_setup.sql`: creates the database and the base tables (`users`, `customer_profile`, `products`, `fd_accounts`) plus test data `CUST001` / `FDSTD`. **Vritika's README refers to this file, but it was not in the project received**, so it was recreated from the FD ER diagram to match her JPA entities exactly. Owner of the base schema remains L12/L13; replace it with her original if she has one.
2. `sql/l16_fd_transactions.sql`: the Lab 16 ledger table.

Both are safe to re-run (`IF NOT EXISTS`, `INSERT IGNORE`; nothing is dropped). Required before start-up because of `ddl-auto=validate`. Needs MySQL 8.0.16+ for the CHECK constraint (older versions parse it and ignore it).

## 17. Tests

| Test class | Kind | Count | Covers |
|---|---|---|---|
| `FDTransactionServiceTest` | Unit (Mockito) | 6 | GL legs and amount, idempotent re-call, L13 → flush → ledger order, no ledger write on L13 failure, history mapping, unknown account |
| `FDTransactionApiIntegrationTest` | Spring + MockMvc + H2 | 14 | One DEPOSIT per creation, txn ID returned and matching, amount = principal, GL debit/credit, response contract + history link, history content and scoping, rollback on business-rule failure, duplicate protection, MANDATORY propagation, roles (officer ok; customer/admin 403; anonymous 401), L13 `/create` unchanged |
| `FDTransactionRollbackIntegrationTest` | Spring + H2, ledger repo mocked | 1 | Ledger failure after the account row was written → account rolled back |

**Results (`mvn clean test`, JDK 17.0.19, Maven 3.9.6): PASS.**
```
FDTransactionApiIntegrationTest       Tests run: 14, Failures: 0, Errors: 0, Skipped: 0
FDTransactionRollbackIntegrationTest  Tests run: 1,  Failures: 0, Errors: 0, Skipped: 0
FDTransactionServiceTest              Tests run: 6,  Failures: 0, Errors: 0, Skipped: 0
Total                                 Tests run: 21, Failures: 0, Errors: 0, Skipped: 0  BUILD SUCCESS
```
There were no existing tests in the L12/L13 project, so no existing tests are affected. These tests use H2; the MySQL-only parts (`deposit_guard` unique key, FK, CHECK) are verified manually (section 21).

## 18. Configuration

`application.properties`: only comments added around `spring.datasource.username` / `password` to show where each developer sets their own MySQL login. Tests use profile `test` (`src/test/resources/application-test.properties`: H2 in MySQL mode, `create-drop`).

## 19. Known limitations

1. **No customer ownership check on history.** The Manual says customers see only their own records, but the standalone HTTP Basic users aren't linked to a `customer_id`. This mirrors the existing `GET /{fdAccountNo}`. Fix once the team JWT (with a `customerId` claim) replaces `SecurityConfig`.
2. **Client retries can create a second FD** (see section 10).
3. **`/create` (L13) does not log a DEPOSIT.** Only `create-with-txn` does, as in the Manual, which keeps both. If the team wants every FD to have a ledger entry, either route all clients to `create-with-txn` or (with Vritika's agreement) retire `/create`.
4. **No business/value date column.** None of the Manual, ER or code defines one. Assumption: business date = `DATE(txn_timestamp)`, which is exact for an opening deposit. Add a column by migration if time-travel / catch-up postings need it.
5. **`txn_type` is VARCHAR(20)** per the ER. Names longer than 20 characters (e.g. `INTEREST_CAPITALIZATION`, 23) won't fit. Use the Manual's names (`DEPOSIT`, `WITHDRAWAL`, `INTEREST`, `MATURITY_PAYOUT`) or widen the column.
6. **The error-response format is the existing L13 format** (`{status, message}`). Constraint violations raised at commit are not mapped by `ApiExceptionHandler` and return 500.

## 20. Integration points with teammates

| Teammate (Group 9 sheet) | Touches | Must agree on |
|---|---|---|
| Vritika (L12/L13) | `FDAccountService.create` is called, not modified | Keep its signature and `@Transactional`; decision on `/create` vs `create-with-txn` |
| Niranjan (L15 withdrawal) | Inserts WITHDRAWAL / penalty rows | Use `FDTransaction` constructor; GL codes; `txn_timestamp` column name |
| Parth (L14/L17 interest) | Inserts INTEREST rows | Same; type name ≤ 20 chars |
| Pratham (L18/L19 maturity) | Inserts MATURITY_PAYOUT; GL "Debit FD Liabilities" | Debit `GLAccounts.LIABILITY_FD_DEPOSITS`; add a `CUSTOMER_SAVINGS`-style constant to `GLAccounts` rather than a new class |
| Krishna (L18 alerts, L21 reports) | Reads `fd_transactions` | Column names; history endpoint |

## 21. Instructions for the next developer

1. Confirm L16 ownership with the team lead (section 1).
2. Put your MySQL username/password in `application.properties`, then run `sql/l12_l13_setup.sql` and `sql/l16_fd_transactions.sql`.
3. `mvn test` (already passing: 21/21).
4. `mvn spring-boot:run`, then POST `create-with-txn` as `officer1`, then follow `transactionHistoryUrl`.
5. To add a new transaction type: construct `new FDTransaction(...)` with an explicit type, amount and GL legs, save it through `FDTransactionRepository` inside your service's `@Transactional` method, and add any new GL codes to `GLAccounts`. Never update or delete ledger rows; post a reversing entry instead.
