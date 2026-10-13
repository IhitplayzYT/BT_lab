# FD Calculator Microservice – Viva Notes

## 1. Separation of Product Service and Calculator responsibilities

The **Product/Pricing Service** owns:
- The FD product catalogue (names, codes, statuses)
- The rate matrix (base rate, min/max rates, compounding frequency)
- Product constraints (min/max principal, term limits)

The **FD Calculator Service** owns:
- Fetching the product config from the Product Service (read-only, via REST)
- Applying customer-category bonuses on top of the base rate
- Running the deterministic interest calculation
- Building the human-readable response

**Why the split?** If the Calculator also managed products, a change to the rate matrix would require a Calculator redeploy. Keeping them separate means each service can evolve, scale, and be deployed independently.

---

## 2. Simple interest vs Compound interest

| Property | Simple | Compound |
|---|---|---|
| Formula | I = P × r × t / 100 | M = P × (1 + r/(100n))^(nt) |
| Interest on | Principal only | Principal + accumulated interest |
| Use case | Short tenures | Long tenures, most FD products |
| Implementation | `CalculationEngineImpl.calculateSimple()` | `CalculationEngineImpl.calculateCompound()` |

`n` = compounding periods per year (MONTHLY=12, QUARTERLY=4, HALF_YEARLY=2, YEARLY=1).

---

## 3. Why DTOs (Data Transfer Objects)?

- **Isolation**: `ProductConfigDto` and `CustomerCategoriesDto` in the `client.dto` package mirror exactly what the external services return. If the Product Service adds or renames a field, *only* these classes change — no business logic is affected.
- **Security**: DTOs prevent accidental exposure of JPA entity internals (e.g. audit fields like `customerId`) in API responses.
- **Flexibility**: The public `CalculationResponse` DTO can evolve independently of the internal `CalculationAudit` entity.

---

## 4. Why `BigDecimal` for all financial values?

`double` is a floating-point type with binary representation — `0.1 + 0.2` in `double` is `0.30000000000000004`. For financial calculations, even tiny rounding errors compound over millions of transactions and can violate regulatory requirements.

`BigDecimal` provides:
- **Exact decimal arithmetic** (no binary rounding)
- **Configurable scale** (we use scale 12 intermediate, scale 2 for output)
- **Explicit rounding mode** (`HALF_UP` = 0.005 → 0.01, as expected in banking)

---

## 5. Category bonus caps

Rules:
1. Normalise category strings to the `CustomerCategory` enum (unknown = ignored).
2. Sum eligible bonuses from `application.yml` (configurable, not hardcoded).
3. Cap combined bonus at `calculator.category-bonus.max-total-bonus` (default 2.00%).
4. Compute `effectiveRate = baseRate + appliedBonus`.
5. Cap `effectiveRate` at the product's configured `maxRate`.

The response transparently reports `requestedTotalBonus`, `appliedTotalBonus`, `bonusCap`, `effectiveRate`, and `rateCapped` so the customer can see exactly what was applied.

**A caller can never inflate a bonus** — category strings come from the Customer Service (authoritative), and bonus amounts come from `application.yml`. No caller-supplied rate or category is accepted.

---

## 6. JWT boundaries

```
Angular UI ──► API Gateway ──► FD Calculator Service
                (validates +    (also validates JWT
                 forwards JWT)   independently)
```

- The API Gateway validates and forwards the JWT in the `Authorization: Bearer` header.
- The **FD Calculator also validates** the JWT as an OAuth2 Resource Server (signature, expiry, issuer, audience, role). It does not trust arbitrary identity headers.
- `customerId` / `username` is read from the **verified JWT `sub` claim**, never from the request body.
- Only the `CUSTOMER` role may call `/api/v1/**`. Missing JWT → 401. Valid JWT + wrong role → 403.

**Dev**: HMAC-256 symmetric secret (`app.jwt.secret`).
**Prod migration path**: Add `spring.security.oauth2.resourceserver.jwt.issuer-uri` to `application-prod.yml` and remove the custom `JwtDecoder` bean — Spring Boot auto-configures JWKS/RSA validation automatically.

---

## 7. Why AI must NOT calculate financial results

Financial outputs (rates, maturity amounts, eligibility decisions) must be:
- **Deterministic**: same inputs always produce the same output
- **Auditable**: every step is traceable in source code
- **Regulated**: banking systems are subject to RBI/regulatory scrutiny

LLMs are probabilistic — they may hallucinate rates, confabulate categories, or produce different outputs for identical inputs. Using AI for financial calculations would:
- Create non-deterministic, unauditable outputs
- Expose customers to incorrect maturity estimates
- Risk regulatory non-compliance

The `ExplainService` uses a **deterministic template** that only references the pre-computed numbers. AI never touches rates, bonuses, caps, or maturity values.

---

## 8. Audit non-blocking design

The `AuditService.saveAsync()` is annotated with `@Async`:
- The calculation response is returned to the client **immediately**.
- The audit DB write happens in a Spring-managed thread pool.
- **If the write fails**, a `WARN` log is emitted with the correlation ID — the failure is never silently swallowed.
- The calculation is still considered successful even if audit storage is unavailable.

This satisfies the requirement: "non-blocking for the calculation response, but do not silently discard failures".
