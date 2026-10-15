# Authentication System Documentation

## Overview

The BT-LAB FD_Module_Group9 project implements a stateless JWT-based authentication system with brute-force protection. The system consists of several interconnected services that work together to provide secure authentication and authorization across the microservices architecture.

## Core Components

### 1. Auth Service (`auth-service`)
The central authentication service responsible for:
- User credential validation
- JWT token issuance
- Login attempt limiting (brute-force protection)

### 2. Security Common (`security-common`)
Shared security utilities including:
- JWT token validation and decoding
- Spring Security configurations
- Common security beans

### 3. Account Service (`fd-account-service`)
Consumes authenticated tokens to:
- Validate user permissions
- Enforce access control rules
- Provide role-based access to financial data

## Authentication Workflow

### Step 1: User Login (`/api/auth/login`)
1. Client sends POST request with username/password to `/api/auth/login`
2. `AuthController` receives the request and validates input
3. `LoginAttemptLimiter` checks if the username is locked due to failed attempts
4. `UserDirectory` authenticates credentials against stored BCrypt hashes
5. On success:
   - `LoginAttemptLimiter` clears failed attempts for username
   - `TokenIssuer` creates a signed JWT token
   - Controller returns token details in JSON response
6. On failure:
   - `LoginAttemptLimiter` increments failed counter
   - Returns appropriate error response

### Step 2: Token Validation (in protected services)
1. Client includes `Authorization: Bearer <token>` header in subsequent requests
2. Protected services (like `fd-account-service`) automatically validate tokens via:
   - Spring Security configuration importing `JwtBeans`
   - `JwtDecoder` verifies token signature and validity
   - `JwtAuthenticationConverter` maps token claims to Spring `Authentication` object
3. Service-specific security components (like `AccountAccess`) use the `Authentication` object to:
   - Check user roles (`isStaff()`)
   - Verify resource ownership (`owns()` method)
   - Enforce access decisions

### Step 3: Token Characteristics
- **Type**: Stateless JWT (JSON Web Token)
- **Issuer**: `fd-platform-auth` (configurable)
- **Expiry**: 60 minutes (configurable via `app.jwt.ttl-minutes`)
- **Claims**:
  - `sub`: Username
  - `iss`: Issuer
  - `iat`: Issued at timestamp
  - `exp`: Expiration timestamp
  - `jti`: Unique token ID (UUID)
  - `roles`: User's role list (e.g., `["ADMIN"]`)

## Security Features

### Brute-Force Protection (`LoginAttemptLimiter`)
- Tracks failed attempts per username (case-insensitive)
- After `maxFailures` (default: 5) consecutive failures, locks account for `lockSeconds` (default: 60s)
- Successful login resets failure count
- Uses thread-safe `ConcurrentHashMap` for storage
- Time-based lock expiration using `java.time.Instant`

### Password Security
- Passwords stored as BCrypt hashes (never in plaintext)
- `UserDirectory` uses timing-safe comparison to prevent username enumeration
- Dummy hash used for non-existent users to prevent timing attacks

### JWT Security
- Requires explicit JWT secret (minimum 32 characters) - no default/fallback keys
- Tokens signed with HMAC-SHA256 using application-specific secret
- Short expiration time limits token theft impact
- Issuer validation prevents token forgery from other systems
- Role claims embedded in tokens for authorization

### Transport Security
- Stateless design eliminates session storage risks
- CSRF protection disabled (appropriate for token-based auth)
- All endpoints except login require valid authentication
- HTTPS recommended for production deployment

## Service Integration

### Auth Service Dependencies
- `UserDirectory`: In-memory demo user store (to be replaced with DB lookup)
- `TokenIssuer`: JWT token creation utility
- `LoginAttemptLimiter`: Brute-force protection

### Protected Service Pattern
Services like `fd-account-service`:
1. Import `JwtBeans` configuration for automatic JWT validation
2. Use Spring Security's `@AuthenticationPrincipal` or inject `Authentication` to access user details
3. Implement domain-specific authorization logic (e.g., `AccountAccess.requiresAccess()`)
4. Return 403 Forbidden for unauthorized access attempts

### Current Demo Users
| Username | Password | Roles |
|----------|----------|-------|
| admin1 | admin123 | ADMIN |
| officer1 | officer123 | BANK_OFFICER |
| customer1 | customer123 | CUSTOMER |

## Configuration

### Application Properties
- `app.login.max-failures`: Max failed attempts before lock (default: 5)
- `app.login.lock-seconds`: Lock duration in seconds (default: 60)
- `app.jwt.secret`: JWT signing secret (required, min 32 chars)
- `app.jwt.issuer`: Token issuer identifier (default: `fd-platform-auth`)
- `app.jwt.ttl-minutes`: Token expiry in minutes (default: 60)

### Environment Variables
Secrets should be provided via environment variables:
- `APP_JWT_SECRET`: Maps to `app.jwt.secret`
- Other properties follow similar mapping pattern

## Current Status & Limitations

### Implemented Features
✅ Stateless JWT authentication  
✅ Brute-force protection with incremental lockout  
✅ Role-based access control (RBAC)  
✅ Secure password storage (BCrypt)  
✅ Timing attack prevention  
✅ Service-to-service token validation  
✅ Configurable token lifetime and issuer  

### Known Limitations
⚠️ `UserDirectory` uses hardcoded demo data (requires replacement with persistent user store)  
⚠️ Login attempts stored in memory (not surviving service restarts)  
⚠️ No token refresh mechanism (clients must re-authenticate on expiry)  
⚠️ Limited audit logging (authentication events not persisted)  
⚠️ No password policy enforcement (length, complexity, etc.)  

### Deployment Notes
1. Auth service must be deployed first as other services depend on its JWT validation
2. All services must share the same JWT secret for cross-service token validation
3. Secret must be at least 32 characters and kept secure
4. Consider implementing Redis-backed `LoginAttemptLimiter` for production resilience

## Global Authentication Considerations

### Single Sign-On Potential
Current design supports SSO patterns:
- Same JWT secret across services enables shared authentication context
- Standard JWT format allows integration with external identity providers
- Stateless nature facilitates API gateway deployment patterns

### Scalability Factors
- Stateless validation enables horizontal scaling of protected services
- Auth service bottleneck mitigated by short-lived tokens and caching opportunities
- Login attempts storage represents current scaling limit (consider distributed cache)

### Security Best Practices Implemented
- Defense in depth (multiple validation layers)
- Principle of least privilege (role-based endpoint protection)
- Fail-secure defaults (deny all by default)
- Secure defaults (BCrypt, HMAC-SHA256)
- No sensitive data in logs (tokens never logged)

### Recommended Enhancements
1. Implement persistent user store (database/LDAP) for `UserDirectory`
2. Add distributed login attempt tracking (Redis/Consul)
3. Implement token refresh mechanism for improved UX
4. Add authentication audit logging to external system
5. Consider implementing logout/token blacklisting for immediate revocation
6. Add password strength validation and expiration policies
7. Implement account lockout notifications (email/SMS)

## Conclusion

The authentication system provides a solid foundation for secure microservices communication with industry-standard JWT implementation, brute-force protection, and role-based access control. While currently using demo data and in-memory storage unsuitable for production, the architecture is designed for easy enhancement to meet enterprise security requirements. The clear separation of concerns between authentication service and resource services promotes maintainability and scalability.