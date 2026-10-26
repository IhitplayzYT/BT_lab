# Authentication and Shared JWT Library

This Maven reactor contains `auth-service` and `security-common`. The auth service is Java 21 / Spring Boot and runs on **8090**. It persists user accounts and refresh tokens in MySQL, supports signup verification/OTP, login, refresh/logout, profile lookup, and staff/admin user management. The shared library validates signed JWTs and maps role claims for other backend services.

## Main endpoints

Base URL: `http://localhost:8090`.

| Method/path | Purpose |
|---|---|
| `GET /health`, `GET /api/auth/health` | Health checks |
| `POST /api/auth/signup` | Direct signup where enabled |
| `POST /api/auth/init-signup` | Start OTP signup flow |
| `POST /api/auth/verify-otp`, `POST /api/auth/resend-otp` | Verify/resend signup OTP |
| `POST /api/auth/login` | Authenticate and issue tokens |
| `POST /api/auth/refresh` | Rotate/refresh access token |
| `POST /api/auth/logout` | Revoke refresh session |
| `GET /api/auth/me` | Current authenticated user details |
| `GET /api/auth/staff/users` | Staff user list |
| `/api/auth/admin/users/**` | Admin user lookup, create, role, ban/unban, delete |

Staff/admin routes are restricted by role. User identifiers returned by the auth service can be displayed read-only by the frontends; user ID is not a user-editable profile field.

## Configuration and local run

Set `DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `JWT_ISSUER`, and email/OTP relay settings as needed. The JWT secret and issuer must match all services that validate its tokens. Root Compose provides the Auth MySQL container and service network. Do not commit real DB credentials, JWT secrets, SMTP passwords, or tokens.

```bash
mvn -f pom.xml test
mvn -f auth-service/pom.xml spring-boot:run
```

Build the shared `security-common` artifact before packaging dependent backend reactors; see root [usage.md](../usage.md#building-jars). Verification on 26 October 2026: `mvn -B test` passed 15 tests total (9 shared JWT tests and 6 Auth API/integration tests). Auth integration tests use the H2 test profile; this does not validate a separately configured MySQL deployment.
