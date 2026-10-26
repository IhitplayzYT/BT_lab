# FD Account Service

Java 21 / Spring Boot 3.3.4 service on **8086**, backed by `banking_technology_lab`. Implements L12–L21 account creation/application approval, initial deposits, ledger, interest, maturity, withdrawal, reports and time travel.

Use the [backend guide](backend.md) for classes and behavior, [API contracts](../docs/API_CONTRACTS.md) for roles, and the [root usage guide](../../usage.md#building-jars) for build/startup. Install Auth_Sec/security-common first, then build the Group 9 reactor. Root Compose supplies MySQL, Kafka, product/calculator URLs and JWT settings.

## Account creation example

Obtain a BANK_OFFICER token from Auth_Sec on port 8090. Use a product code from the Product service and an existing customer profile:

```bash
curl -X POST http://localhost:8086/api/fd/account/create-with-txn \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"customerId":"CUST001","productCode":"FD001","principalAmount":200000,"termMonths":12,"branchCode":"BR001"}'
```

The response includes `fdAccountNo`, `initialTransactionId`, `message`, and `transactionHistoryUrl`. Use the returned account number for `GET /api/fd/account/{fdAccountNo}/transactions`.

`/create-with-txn` requires BANK_OFFICER. `/create` allows BANK_OFFICER or ADMIN and now also records the initial deposit. Customers apply through `/apply`, then staff approve/reject through `/approve`. Customer detail/history access is ownership-checked.

## Database and accounting

Root Compose initializes base, transaction, interest, clock/contact and historical-backfill SQL on an empty database volume. Existing databases require applicable migrations in [sql/](sql/); `ddl-auto=validate` does not create missing account tables. Product data is retrieved over HTTP; do not rely on the legacy local `FDSTD` seed for integrated product validation.

A transaction row carries debit and credit GL codes for a balanced entry. The unique deposit guard prevents multiple initial deposits per FD; it does not make repeated account-creation requests idempotent. Account numbers use a branch prefix, sequence and checksum, generated in memory with collision checks.

## Historical handover

[Lab 16 handover](docs/LAB16_HANDOVER.md) preserves the original delivery snapshot. Its old Java versions, test counts, Basic-auth examples and statements that account creation lacked ledger/ownership support are historical, not current behavior.
