## 1. Roles per lab manual L9

| Endpoint | Before | After |
| --- | --- | --- |
| `POST /api/product` (create) | ADMIN | **BANK_OFFICER, ADMIN** |
| `PUT /api/product/{code}` (update) | BANK_OFFICER, ADMIN | BANK_OFFICER, ADMIN (unchanged) |
| `DELETE /api/product/{code}` (retire) | ADMIN | **BANK_OFFICER, ADMIN (confirmed)** |
| All GET / validate / rate / defaults | BANK_OFFICER, ADMIN | unchanged |
| Anything under `/api/product/**` for CUSTOMER or no token | 403 / 401 | unchanged |

The rules live in one file: `security/ProductAuthorization.java` (`READ`, `WRITE`, `RETIRE`).
`RETIRE` is a single line (`= WRITE`). To make retire ADMIN-only again, change it to `"hasRole('ADMIN')"`.

**PUT can also set `status` to `RETIRED`**, so retire is not separately restricted: anyone allowed to update can
retire (and can move RETIRED back to ACTIVE). Tightening `RETIRE` alone would not close that route.

Note: a URL-level rule in `SecurityConfig` (`/api/product/**` needs BANK_OFFICER or ADMIN) was already
in place and is compatible; it is not the place to change retire.

## 2. JWT claim compatibility

| | Before | After |
| --- | --- | --- |
| Claim read | `roles` array only | `roles` (array or string) **and** `role` (string, as in the lab manual) |
| Normalisation | upper-case + `ROLE_` prefix in the filter | same, now in `JwtUtil` (`normalizeRole`), also accepts `bank_officer`, `ROLE_BANK_OFFICER`, `" Bank_Officer "`, and comma/space separated strings |
| Token with `{"role":"BANK_OFFICER"}` | no authorities, 403 | works |
| Signing secret | unchanged: same HMAC key, same `jwt.secret` property | unchanged |

Dev tokens still carry `roles` (array). `expiresIn` in the dev token response now equals the configured
`jwt.expiration-ms` (it was hard coded to 86400).

## 3. `/api/auth/token` is a development helper

`AuthController` is annotated `@Profile("dev")`.

| Profile | `POST /api/auth/token` |
| --- | --- |
| `dev` | works, no password check, issues any role |
| anything else | **404** (the controller bean does not exist) |

Run locally with `SPRING_PROFILES_ACTIVE=dev`. Tests activate `dev` in `src/test/resources/application.yml`;
`AuthTokenProfileTest` proves the 404 under another profile.

## 4. Error behaviour

| Case | Before | After |
| --- | --- | --- |
| Malformed JSON body | 500 `INTERNAL_SERVER_ERROR` | 400 `MALFORMED_REQUEST` (names the field for a wrong type, e.g. `minDeposit`) |
| Bad date/number query param (`startDate=zzz`, `page=abc`) | 500 | 400 `INVALID_PARAMETER` |
| Missing required query param | 500 | 400 `MISSING_PARAMETER` |
| Unknown URL | 500 | 404 `NOT_FOUND` |
| Wrong HTTP method | 500 | 405 `METHOD_NOT_ALLOWED` |
| Wrong content type | 500 | 415 `UNSUPPORTED_MEDIA_TYPE` |
| Validation errors | `Validation failed: <messages>` (no field) | `Validation failed: effectiveDate: Effective date is mandatory, ...` plus a new `fieldErrors` map `{ "effectiveDate": "..." }` |
| `effectiveDate` missing | 500 (DB NOT NULL) | 400, `@NotNull` |
| Status message | "Status must be ACTIVE or INACTIVE only" | "Status must be one of ACTIVE, INACTIVE, DRAFT, SUSPENDED, RETIRED" |
| 401 / 403 body `timestamp` | **array** `[2026,10,9,...]` (filter chain) vs ISO string (controllers) | ISO string everywhere (security config now uses Spring's `ObjectMapper`) |

`ErrorDetails` gained one optional field, `fieldErrors` (only on `VALIDATION_FAILED`). Existing fields are unchanged.

### Additional hardening found while verifying (please review)

These are small, tested, and exist so the form can mirror the backend exactly. Each one turned a 500 or a
silent mistake into a 400.

* Unknown `status` filter on search used to be **silently ignored** (returned everything). Now 400.
* Unknown `sortBy` used to be a 500 (`PropertyReferenceException`). Now 400; allowed fields are
  `productId, productCode, productName, productType, currency, effectiveDate, endDate, status, interestType,
  minAge, minDeposit, maxDeposit, minWithdrawal, maxWithdrawal, createdAt, updatedAt`. Sorting is ascending only.
* Request DTO: `productName` max 100, `productType` max 20, `interestType` max 10, `allowedTransactionTypes` and
  `balanceTypes` max 255; amounts and age `>= 0`, amounts `<= 9999999999999.99`; each allowed role non-blank, max 20;
  rate variation needs `customerCategory` (max 50) and `rateModifier` (+-999.99); `charges.interestCreditFrequency` max 30.
  These were DB column overflows (500) before.
* `termLimit` and `rateLimit` now require **both** `min` and `max` when the object is sent. Before, a partial
  `rateLimit` on update silently stored 0.0 for the missing bound, and a missing term bound most likely unboxed a null in the mapper (500).
  Rate values are capped at 999.99 (column is `DECIMAL(5,2)`).
* `PUT` now also checks term min <= max and > 0, rate >= 0, deposit and withdrawal pairs **against the stored
  value** when only one side is sent, and `endDate >= effectiveDate`. Before, updates skipped these checks.
* **Behaviour change to know about:** because `PUT` uses the same DTO, `effectiveDate` is now mandatory on `PUT` too
  (it is still ignored on update). The E2E test and Postman/smoke bodies were updated for this.

## 5. `charges.interestCreditFrequency` round trip

| | Before | After |
| --- | --- | --- |
| Write | value ignored, row stored with `feeType = PERIODIC` | value (upper-cased) stored in the `interestCredit` row's `feeType` (VARCHAR(30)); `chargeUnit` is only VARCHAR(10) so it cannot hold `ON_MATURITY` |
| Read | always `ON_MATURITY` | stored value; rows holding `PERIODIC` or null (older rows, the seed data) still read as `ON_MATURITY` |

No schema change. `taxDeduction` is still stored as a 10 % tax row, and `withdrawalFees` as a percentage (unchanged).
Loan-only charges (`processingFee`, `latePaymentPenalty`) still do not appear in responses (unchanged, out of scope).

## 6. MySQL readiness

| Item | Before | After |
| --- | --- | --- |
| `schema.sql` | `CREATE INDEX IF NOT EXISTS` (not valid on MySQL 8; also not on 5.7) | indexes declared inline in `CREATE TABLE products`; both copies of `schema.sql` identical |
| JWT secret | default value in `application.yml` **and** in the `@Value` fallback in `JwtUtil` | `${JWT_SECRET}` required, no default. App refuses to start without it |
| DB password | default value in `application.yml` | `${SPRING_DATASOURCE_PASSWORD}` required, no default |
| DB URL / username / driver / dialect | env with defaults (unchanged) | unchanged (username default `root`) |
| CORS origins | hard coded list in `SecurityConfig` **plus** `@CrossOrigin` on the controller | one list: `app.cors.allowed-origins` / env `APP_CORS_ALLOWED_ORIGINS` (default `http://localhost:4200,http://127.0.0.1:4200`); `@CrossOrigin` removed |
| Creating a product with roles, charges or business rules on MySQL | **500** `Field 'productId' doesn't have a default value` | works. `@JoinColumn(nullable = false)` on the three child collections of `Product` (found by running the smoke script on MySQL; H2 tests could not see it because Hibernate's own H2 schema left the column nullable) |
| Test config | contained the real signing key | test-only dummy key, overridable with `JWT_SECRET` |

Build fix (not a feature): `pom.xml` now pins `lombok.version` 1.18.38 and declares Lombok as an explicit
annotation processor path. Without it the project does not compile on JDK 23/24 (this machine has no JDK 21).
It still builds on JDK 21.

Required environment to run:

```bash
export JWT_SECRET="$(openssl rand -base64 48)"        # >= 32 bytes; share with the Login team in real use
export SPRING_DATASOURCE_PASSWORD='<your mysql password>'
export SPRING_PROFILES_ACTIVE=dev                      # only for local development: enables /api/auth/token
mvn spring-boot:run
```

## 7. Tests, Postman, smoke script

* Updated: officer-cannot-create tests became "officer can create, customer cannot"; status-message assertion; the E2E
  update step sends `effectiveDate`.
* Added `ProductApiHardeningTest` (12 tests) and `AuthTokenProfileTest` (1), plus 4 security tests.
* `postman_collection.json`: added "Generate Customer Token", "Create Product - Success (Bank Officer)",
  403 cases now use a CUSTOMER token; request bodies got `effectiveDate`.
  Variable `customerToken` added.
* `smoke_test_endpoints.sh`: step 3 uses a CUSTOMER token; new step 12b (officer create 201, officer retire 200).
* `openapi.json` is rewritten by `OpenApiExportTest` on every `mvn test`. It was regenerated and committed once at the end of Phase 1.

## 8. Things I noticed and did not change

* Status transitions are unrestricted, so a `PUT` can move RETIRED back to ACTIVE.
* `/active` ignores `effectiveDate`/`endDate`; `/validate` does not, so a listed product can still get 422.
* Search `startDate`/`endDate` both filter on `effectiveDate` (not on the product's `endDate`).
* `size` on search has no upper cap.
* Update silently ignores `productCode, productType, currency, effectiveDate, interestType, charges, allowedRoles,
  rateVariations, allowedTransactionTypes, balanceTypes`. `termLimit` is only applied when the product already has a
  business rule or when `rateLimit` is sent in the same request.
* `fd_calculations.product_code` is NOT NULL in `schema.sql` but can be null from the calculator (other teammate's package).
* `/actuator/health` shows DB details without authentication.
