# Product and Pricing Service

Java 21 / Spring Boot service on port **8080**. It owns the product catalog used by the FD account and calculator services. Product definitions, term/rate limits, category rate variations, charges, and customer/nominee roles are persisted in the product MySQL schema. The service also contains an older FD calculation endpoint for compatibility.

## Responsibilities

- Create, update, retire, search and retrieve products.
- Validate account applications against active dates, term, deposit amount and minimum age.
- Quote the current product rate with configured category modifiers and configured limits.
- Provide calculator configuration through internal service routes.
- Provide the older simple/advanced FD calculation and calculation history APIs.

Product/rate data are database-backed. If the product is missing required rate configuration, requests fail validation instead of silently supplying an arbitrary rate. Sample catalog entries are initialized for local development; the source of truth at runtime is the product database.

## Main endpoints

All paths below use `http://localhost:8080`. Product APIs accept the aliases `/api/product` and `/api/v1/products`.

| Method and path | Access | Function |
|---|---|---|
| `GET /actuator/health` | Public | Liveness/readiness health |
| `GET /api/product/active?type=FD` | Public | Active catalog for product dropdowns |
| `GET /api/product/search` | Authenticated; role check at controller | Filtered/paged catalog |
| `GET /api/product/{code}` | Bank officer, admin or customer | Product details |
| `POST /api/product` | Bank officer or admin | Create product |
| `PUT /api/product/{code}` | Bank officer or admin | Update product |
| `DELETE /api/product/{code}` | Bank officer or admin | Retire product |
| `DELETE /api/product/{code}/permanent` | Admin | Permanent deletion |
| `GET /api/product/{code}/validate` | Bank officer, admin or customer | Eligibility/configuration validation |
| `POST /api/product/{code}/rate` | Bank officer, admin or customer | Rate quote using persisted product configuration |
| `GET /api/product/{code}/defaults` | Bank officer, admin or customer | Defaults for account forms |
| `GET /internal/products/{code}/calculator-config` | Authenticated service caller | Internal calculator configuration |
| `POST /api/fd/calculate` | See security configuration | Legacy calculation |
| `POST /api/fd/calculate/advanced` | See security configuration | Legacy detailed calculation |
| `GET /api/fd/categories` | See security configuration | Legacy category information |
| `GET /api/fd/history` | Authenticated user | Legacy saved calculation history |

The exact DTOs, validation constraints, and role annotations are maintained in the Java controllers and OpenAPI endpoint reference at the project root.

## Local development

Prerequisites: Java 21, Maven, MySQL 8.0 and a configured JWT secret/issuer matching Auth. Root Compose provides MySQL on host port 3308 and the application on 8080. The schema and sample catalog are mounted into the database container during first initialization. For an existing database, apply the migration scripts in this directory before deploying schema changes.

```bash
mvn -f ../Auth_Sec/pom.xml -pl security-common -am install
mvn test
mvn spring-boot:run
```

The default standalone configuration expects environment variables for the DB connection and JWT validation. See `src/main/resources/application*.yml` and root [usage.md](../usage.md). Do not place production credentials in the repository.

## Tests and related files

`src/test` covers controller behavior, product business rules, security roles, persistence/integration flow, OpenAPI output, and legacy calculator behavior. Verification on 26 October 2026: `mvn -B test` passed 45 tests. The suite includes isolated and integration-style tests; this result does not certify a separately deployed MySQL instance.

`schema.sql`, `insert_dummy_data.sql` and `migration_product_charge_defaults.sql` describe database setup and migration. `postman_collection.json` is a manual request collection; verify its token variables and endpoints against the current API before use. The former 45-test count was a previous snapshot, not a guarantee of current test outcomes.
