# Authentication System

The central auth service is [Auth_Sec/auth-service](../Auth_Sec/auth-service), on port **8090**. Its [backend guide](../Auth_Sec/backend.md) covers routes, configuration and classes. Users and refresh tokens are persisted in MySQL `auth_db`; the account service's `users` and `customer_profile` tables provide local customer ownership mappings and are not the login credential store.

## Login and tokens

`POST /api/auth/login` accepts `username` and `password`. Successful authentication returns `accessToken`, `refreshToken`, `tokenType`, `expiresIn`, `username` and `roles`.

Access tokens are HS256 JWTs with `sub`, `roles`, `iss`, `iat`, `exp` and `jti`. Default issuer is `fd-platform-auth`, access lifetime is 60 minutes and refresh lifetime is seven days. Configure `JWT_SECRET`, `JWT_ISSUER`, `JWT_TTL_MINUTES`, and `JWT_REFRESH_TTL_DAYS`. The shared decoder validates signature, algorithm, issuer and timestamps; it does not enforce audience.

Protected services verify tokens locally; they do not call auth-service on every request. Share the signing secret and issuer across services. The standalone auth application requires an explicit secret of at least 32 bytes. The root Docker Compose file supplies a development fallback, so the integrated stack does not have a no-default-secret guarantee.

## Registration and refresh

Public `/signup` creates CUSTOMER accounts directly. The optional OTP flow uses `/init-signup`, `/verify-otp` and `/resend-otp`; OTPs expire after ten minutes and pending registrations live in memory. Direct signup does not require OTP. Passwords stored in the users table are BCrypt hashes; pending OTP registration temporarily retains the submitted password in memory.

`/refresh` validates the refresh token and enabled user, then creates fresh access/refresh tokens. Creating a refresh token deletes prior refresh tokens for that username. `/logout` deletes the supplied refresh token. Role changes and bans revoke refresh tokens, but already issued access JWTs remain usable in resource services until expiry. Immediate access-token revocation is not implemented.

## Roles and ownership

ADMIN manages users through `/api/auth/admin/**`. BANK_OFFICER and ADMIN perform staff account operations; CUSTOMER reads/manages their own accounts where allowed by controller rules. Roles are not a hierarchy: `/api/fd/account/create-with-txn` requires BANK_OFFICER even for an ADMIN-only token.

`AccountAccess.requireAccess` checks `users.username -> customer_profile.user_id -> fd_accounts.customer_id`. Staff bypass this ownership check; customers receive 403 for another customer's account or an unknown account on protected detail/history/withdrawal endpoints.

Clock endpoints currently permit all three roles. Report extraction and Python report generation permit BANK_OFFICER and ADMIN. See [API contracts](docs/API_CONTRACTS.md) for details.

## Login limiting and configuration

`LoginAttemptLimiter` keeps case-insensitive per-username counters in memory. Five failed attempts cause a 60-second lock; a successful login clears the counter. Properties are `app.login.max-failures` and `app.login.lock-seconds`. Restarting loses these counters. Admin unban affects the database enabled flag, not the limiter.

Unknown users and incorrect passwords return the same 401 message, but the current `UserDirectory` skips BCrypt verification for missing/disabled users, so constant login timing is not guaranteed. DTOs enforce password length of 8–200 for registration; there is no complexity policy or `@Email` format validation on auth signup DTOs.

The shared resource-server helper optionally enables HTTP Basic through `app.security.basic.enabled`; this requires suitable user details configuration. Root Compose explicitly disables it for account and batch services. Integrated examples use Bearer tokens. Public endpoints include login/registration/refresh/logout and health; Product's active-product feed is also public; its embedded legacy calculator requires authentication.
