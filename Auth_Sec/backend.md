# Authentication Service (Auth_Sec)

## Summary

The Authentication Service is a Spring Boot microservice responsible for user authentication, authorization, and JWT token management for the UNO Bank Fixed Deposit platform. It provides secure login, signup, OTP-based registration, token refresh, and user management capabilities.

**Key Features:**
- JWT-based authentication with HS256 signing
- BCrypt password hashing
- Login attempt limiting with account lockout
- Refresh token mechanism for session management
- OTP-based email verification for customer signup
- Role-based access control (CUSTOMER, BANK_OFFICER, ADMIN)
- User management (create, update, ban, delete) for administrators

**Technology Stack:**
- Spring Boot 3.x
- Spring Security 6.x
- Spring Data JPA
- MySQL Database
- JWT (JSON Web Tokens) with Nimbus JOSE + JWT
- JavaMail (for OTP emails)
- Maven

---

## Usage

### Starting the Service

First follow the root usage guide to build/install shared dependencies and configure MySQL, JWT and service connections. Run each local process in a separate terminal from the project root.

```bash
cd Auth_Sec/auth-service
mvn spring-boot:run
```

Or using the provided scripts:
```bash
# From project root
./start_all.sh
```

### Environment Configuration

For a locally run process, configure `JWT_SECRET`, `JWT_ISSUER` (default `fd-platform-auth`), `JWT_TTL_MINUTES` (60), `JWT_REFRESH_TTL_DAYS` (7), `DB_URL`, `DB_USER`, and `DB_PASSWORD`. The root stack exposes auth MySQL on port 3309; the schema is `auth_db`.

OTP mail uses `SMTP_RELAY_HOST`, `SMTP_RELAY_PORT`, `SMTP_RELAY_USERNAME`, `SMTP_RELAY_PASSWORD`, `SMTP_RELAY_AUTH`, `SMTP_RELAY_STARTTLS`, and `NOTIFY_EMAIL_FROM`. Login limits are Spring properties `app.login.max-failures=5` and `app.login.lock-seconds=60`.


### Common Use Cases

**1. Customer Login:**
```bash
curl -X POST http://localhost:8090/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"customer1","password":"customer123"}'
```

**2. Customer Signup with OTP:**
```bash
# Step 1: Initialize signup (sends OTP to email)
curl -X POST http://localhost:8090/api/auth/init-signup \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","password":"password123","email":"user@example.com"}'

# Step 2: Verify OTP and complete registration
curl -X POST http://localhost:8090/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"123456"}'
```

**3. Token Refresh:**
```bash
curl -X POST http://localhost:8090/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refresh-token>"}'
```

**4. Admin User Management:**
```bash
# Create user with specific role
curl -X POST http://localhost:8090/api/auth/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{"username":"new-officer","password":"password123","email":"officer@bank.com","roles":["BANK_OFFICER"]}'
```

---

## Structure

```
Auth_Sec/
├── auth-service/                    # Main authentication service
│   ├── src/main/java/com/example/fdauth/
│   │   ├── Application.java         # Spring Boot main class
│   │   ├── AuthController.java      # REST API endpoints
│   │   ├── SecurityConfig.java      # Spring Security configuration
│   │   ├── JwtAuthenticationFilter.java  # JWT filter for request validation
│   │   ├── UserDirectory.java       # User management service
│   │   ├── RefreshTokenService.java # Refresh token management
│   │   ├── LoginAttemptLimiter.java # Login attempt rate limiting
│   │   ├── entity/
│   │   │   ├── User.java           # User entity
│   │   │   └── RefreshToken.java   # Refresh token entity
│   │   └── repository/
│   │       ├── UserRepository.java  # User data access
│   │       └── RefreshTokenRepository.java  # Refresh token data access
│   └── src/main/resources/
│       ├── application.properties   # Service configuration
│       └── db/
│           └── init.sql            # Database initialization
└── security-common/                 # Shared JWT utilities
    └── src/main/java/com/example/fdsecurity/
        ├── JwtSupport.java          # JWT encoder/decoder utilities
        ├── JwtBeans.java            # JWT bean configuration
        ├── TokenIssuer.java         # JWT token issuance
        └── ResourceServerSupport.java  # Resource server configuration
```

---

## Classes

### Core Classes

#### `Application.java`
**Purpose:** Spring Boot application entry point

**Key Methods:**
- `main(String[] args)`: Starts the Spring Boot application

---

#### `AuthController.java`
**Purpose:** Source file containing health `AuthController` and package-private `AuthApiController` for authentication routes

**Key Methods:**
- `signup(SignupRequest)`: Direct customer registration
- `login(LoginRequest)`: User authentication and token issuance
- `refreshToken(RefreshTokenRequest)`: Refresh access token
- `logout(RefreshTokenRequest)`: Invalidate refresh token
- `initSignup(InitSignupRequest)`: Initialize OTP-based signup
- `verifyOtp(VerifyOtpRequest)`: Verify OTP and complete registration
- `resendOtp(ResendOtpRequest)`: Resend OTP for pending signup
- `getAllUsers()`: Get all users (admin only)
- `createUser(CreateUserRequest)`: Create user with specific role (admin only)
- `updateUserRoles(String, UpdateRolesRequest)`: Update user roles (admin only)
- `banUser(String)`: Ban user account (admin only)
- `unbanUser(String)`: Unban user account (admin only)
- `deleteUser(String)`: Delete user account (admin only)

**Request DTOs:**
- `LoginRequest`: username, password
- `SignupRequest`: username, password, email
- `RefreshTokenRequest`: refreshToken
- `InitSignupRequest`: username, password, email
- `VerifyOtpRequest`: email, otp
- `ResendOtpRequest`: email
- `CreateUserRequest`: username, password, email, roles
- `UpdateRolesRequest`: roles

---

#### `UserDirectory.java`
**Purpose:** User management service with database operations

**Key Methods:**
- `authenticate(String, String)`: Authenticate user with password
- `createUser(String, String, String, List<String>)`: Create new user
- `createUserWithRole(String, String, String, List<String>)`: Create user with specific role
- `findByUsername(String)`: Find user by username
- `getAllUsers()`: Get all users ordered by creation date
- `updateUserRoles(String, List<String>)`: Update user roles
- `setUserEnabled(String, boolean)`: Enable/disable user account
- `deleteUser(String)`: Delete user account

**Internal Record:**
- `Account`: username, passwordHash, roles

---

#### `SecurityConfig.java`
**Purpose:** Spring Security configuration

**Key Beans:**
- `passwordEncoder()`: BCryptPasswordEncoder instance
- `tokenIssuer()`: TokenIssuer with JWT secret configuration
- `corsConfigurationSource()`: CORS configuration for frontend
- `SecurityFilterChain`: Security filter chain with JWT filter

**Security Rules:**
- Public endpoints: `/api/auth/login`, `/api/auth/signup`, `/api/auth/refresh`, `/api/auth/logout`, `/api/auth/init-signup`, `/api/auth/verify-otp`, `/api/auth/resend-otp`, `/health`
- Admin endpoints: `/api/auth/admin/**` (requires ADMIN role)
- All other requests: Denied

---

#### `JwtAuthenticationFilter.java`
**Purpose:** JWT filter to validate tokens on incoming requests

**Key Methods:**
- `doFilterInternal()`: Extracts and validates JWT from Authorization header

---

#### `RefreshTokenService.java`
**Purpose:** Refresh token lifecycle management

**Key Methods:**
- `createRefreshToken(String)`: Create new refresh token for user
- `findByToken(String)`: Find refresh token by token string
- `verifyExpiration(RefreshToken)`: Verify token is not expired or revoked
- `deleteByToken(String)`: Delete refresh token
- `deleteByUsername(String)`: Delete all refresh tokens for user
- `deleteExpiredTokens()`: Clean up expired tokens

**Configuration:**
- `app.jwt.refresh-ttl-days`: Token lifetime (default: 7 days)

---

#### `LoginAttemptLimiter.java`
**Purpose:** Rate limiting for login attempts to prevent brute force attacks

**Key Methods:**
- `isLocked(String)`: Check if username is currently locked
- `failed(String)`: Record failed login attempt
- `succeeded(String)`: Clear failed attempts on successful login

**Configuration:**
- `app.login.max-failures`: Maximum failures before lockout (default: 5)
- `app.login.lock-seconds`: Lock duration in seconds (default: 60)

**Internal Record:**
- `State`: failures count, lockedUntil timestamp

---

### Entity Classes

#### `User.java`
**Purpose:** User entity representing system users

**Fields:**
- `id`: Long (auto-generated)
- `username`: String (unique, max 100 chars)
- `passwordHash`: String (BCrypt hash)
- `email`: String
- `roles`: String (comma-separated roles)
- `enabled`: Boolean (account status)
- `createdAt`: LocalDateTime
- `lastLoginAt`: LocalDateTime

**Constraints:**
- Username must be unique
- Persisted password stored as BCrypt hash
- Roles stored as comma-separated string

---

#### `RefreshToken.java`
**Purpose:** Refresh token entity for session management

**Fields:**
- `id`: Long (auto-generated)
- `token`: String (unique UUID)
- `username`: String
- `expiryDate`: LocalDateTime
- `createdAt`: LocalDateTime
- `revoked`: Boolean

**Methods:**
- `isExpired()`: Check if token is past expiry date

---

### Repository Classes

#### `UserRepository.java`
**Purpose:** JPA repository for User entity

**Key Methods:**
- `findByUsername(String)`: Find user by username
- `existsByUsername(String)`: Check if username exists
- `existsByEmail(String)`: Check if email exists
- `findAllByOrderByCreatedAtDesc()`: Get all users ordered by creation date
- `deleteByUsername(String)`: Delete user by username

---

#### `RefreshTokenRepository.java`
**Purpose:** JPA repository for RefreshToken entity

**Key Methods:**
- `findByToken(String)`: Find refresh token by token string
- `deleteByToken(String)`: Delete refresh token
- `deleteByUsername(String)`: Delete all tokens for username
- `deleteByExpiryDateBefore(LocalDateTime)`: Delete expired tokens

---

### Security Common Classes

#### `JwtSupport.java`
**Purpose:** JWT encoding/decoding utilities

**Key Methods:**
- `decoder(String, String)`: Create JWT decoder with secret and issuer
- `encoder(String)`: Create JWT encoder with secret
- `authenticationConverter()`: Create JWT authentication converter
- `authorities(Jwt)`: Extract roles from JWT claims

**Constants:**
- Minimum accepted secret length: 32 bytes (checked by JwtSupport.key)

---

#### `TokenIssuer.java`
**Purpose:** JWT token issuance service

**Key Methods:**
- `issue(String, List<String>)`: Issue JWT token for user
- Token validation is provided by `JwtSupport.decoder(...)`, not `TokenIssuer`.

**IssuedToken Record:**
- `value()`: JWT token string
- `expiresAt()`: Expiration timestamp

---

## Examples

The annotated sequences below are explanatory pseudocode, not compilable Java. IDs, dates and amounts are illustrative; use returned IDs and current product configuration for API calls.

### Example 1: Complete Customer Registration Flow

```text
// Step 1: Initialize Signup
POST /api/auth/init-signup
{
  "username": "john_doe",
  "password": "SecurePass123!",
  "email": "john@example.com"
}

Response:
{
  "status": "success",
  "message": "OTP sent to your email"
}

// Step 2: Verify OTP
POST /api/auth/verify-otp
{
  "email": "john@example.com",
  "otp": "123456"
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
  "username": "john_doe",
  "roles": ["CUSTOMER"]
}
```

### Example 2: Login with Failed Attempts

```text
// Attempt 1-4: Wrong password
POST /api/auth/login
{
  "username": "john_doe",
  "password": "wrongpass"
}

Response: 401 Unauthorized
{
  "status": "error",
  "message": "Invalid username or password"
}

// Attempt 5: Account locked
POST /api/auth/login
{
  "username": "john_doe",
  "password": "wrongpass"
}

Response: 429 Too Many Requests
{
  "status": "error",
  "message": "Too many failed attempts. Try again in a minute."
}

// After 60 seconds: Successful login
POST /api/auth/login
{
  "username": "john_doe",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
  "username": "john_doe",
  "roles": ["CUSTOMER"]
}
```

### Example 3: Token Refresh Flow

```text
// Access token expired
GET /api/protected-resource
Authorization: Bearer <expired-token>

Response: 401 Unauthorized

// Refresh the token
POST /api/auth/refresh
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}

Response: 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "refreshToken": "770e8400-e29b-41d4-a716-446655440001",
  "username": "john_doe",
  "roles": ["CUSTOMER"]
}

// Use new access token
GET /api/protected-resource
Authorization: Bearer <new-access-token>

Response: 200 OK
```

### Example 4: Admin User Management

```text
// Create BANK_OFFICER
POST /api/auth/admin/users
Authorization: Bearer <admin-token>
{
  "username": "officer_smith",
  "password": "OfficerPass123!",
  "email": "smith@bank.com",
  "roles": ["BANK_OFFICER"]
}

Response: 201 Created
{
  "username": "officer_smith",
  "roles": ["BANK_OFFICER"]
}

// Update user roles
PUT /api/auth/admin/users/officer_smith/roles
Authorization: Bearer <admin-token>
{
  "roles": ["ADMIN"]
}

Response: 200 OK
{
  "username": "officer_smith",
  "roles": ["ADMIN"]
}

// Ban user
PUT /api/auth/admin/users/john_doe/ban
Authorization: Bearer <admin-token>

Response: 200 OK
{
  "status": "success",
  "message": "User banned successfully"
}
```

---

## Working Flow

### Authentication Flow

```
1. Client sends login request
   ↓
2. AuthController.login() receives request
   ↓
3. LoginAttemptLimiter.isLocked() checks if account is locked
   ↓
4. If locked → Return 429 error
   ↓
5. If not locked → UserDirectory.authenticate() verifies credentials
   ↓
6. BCrypt password verification
   ↓
7. If invalid → LoginAttemptLimiter.failed() increments counter
   ↓
8. If valid → LoginAttemptLimiter.succeeded() clears counter
   ↓
9. Update user's lastLoginAt timestamp
   ↓
10. TokenIssuer.issue() creates JWT token
   ↓
11. RefreshTokenService.createRefreshToken() creates refresh token
   ↓
12. Return access token + refresh token to client
```

### OTP-Based Signup Flow

```
1. Client sends init-signup request with username, password, email
   ↓
2. AuthController.initSignup() checks if username/email already exists
   ↓
3. If exists → Return 409 conflict error
   ↓
4. If not exists → Generate 6-digit OTP
   ↓
5. Store OTP data in memory (username, password, email, OTP, expiry)
   ↓
6. Send OTP email via JavaMailSender
   ↓
7. Return success message
   ↓
8. Client sends verify-otp request with email and OTP
   ↓
9. AuthController.verifyOtp() retrieves OTP data from memory
   ↓
10. Check if OTP expired
   ↓
11. If expired → Remove from memory, return 410 error
   ↓
12. If not expired → Verify OTP matches
   ↓
13. If invalid → Return 400 error
   ↓
14. If valid → UserDirectory.createUser() creates user account
   ↓
15. TokenIssuer.issue() creates JWT token
   ↓
16. RefreshTokenService.createRefreshToken() creates refresh token
   ↓
17. Remove OTP data from memory
   ↓
18. Return access token + refresh token to client
```

### Token Validation Flow (Auth Service)

```
1. Client sends request with Authorization: Bearer <token>
   ↓
2. JwtAuthenticationFilter intercepts request
   ↓
3. Extract JWT token from Authorization header
   ↓
4. JwtSupport.decoder() validates token signature
   ↓
5. Verify issuer claim matches expected issuer
   ↓
6. Verify exp claim (token not expired)
   ↓
7. JwtSupport.authenticationConverter() extracts roles
   ↓
8. Convert roles to ROLE_* authorities
   ↓
9. Set SecurityContext authentication
   ↓
10. Request proceeds through URL authorization before the controller
   ↓
11. SecurityFilterChain checks the ADMIN role for /api/auth/admin/**
   ↓
12. If authorized → Execute controller method
   ↓
13. If not authorized → Return 403 error
```

### Refresh Token Flow

```
1. Client sends refresh request with refresh token
   ↓
2. AuthController.refreshToken() receives request
   ↓
3. RefreshTokenService.findByToken() looks up token in database
   ↓
4. If not found → Return 401 error
   ↓
5. RefreshTokenService.verifyExpiration() checks expiry and revocation
   ↓
6. If expired → Delete token; if revoked → Reject token; return 401
   ↓
7. If valid → UserDirectory.findByUsername() gets user
   ↓
8. If user not found → Delete all tokens, return 401 error
   ↓
9. If user found → TokenIssuer.issue() creates new access token
   ↓
10. RefreshTokenService.createRefreshToken() creates new refresh token
   ↓
11. Delete old refresh token (single session model)
   ↓
12. Return new access token + new refresh token
```

### Login Attempt Limiting Flow

```
1. Failed login attempt
   ↓
2. LoginAttemptLimiter.failed(username) called
   ↓
3. Check if currently locked
   ↓
4. If locked → Keep locked state
   ↓
5. If not locked → Increment failure counter
   ↓
6. If failures >= maxFailures → Set lockedUntil timestamp
   ↓
7. Next login attempt
   ↓
8. LoginAttemptLimiter.isLocked(username) called
   ↓
9. Check if lockedUntil > now
   ↓
10. If locked → Return 429 error
   ↓
11. If not locked → Proceed with authentication
   ↓
12. Successful login
   ↓
13. LoginAttemptLimiter.succeeded(username) called
   ↓
14. Remove user from state map (clear counter)
```

---

## Database Schema

Use the checked-in [SQL schema](auth-service/src/main/resources/db/init.sql) and the entity mappings as the source of truth; illustrative DDL must not be used as a migration.

## Security Considerations

1. **Password Security:**
   - Persisted passwords use BCrypt; pending OTP registrations temporarily hold the submitted password in memory
   - BCrypt includes salt automatically
   - BCrypt verifies stored hashes; unknown/disabled users skip the hash check, so equal login timing is not guaranteed.

2. **JWT Security:**
   - HS256 algorithm with shared secret
   - Secret must be at least 32 characters (256 bits)
   - Token expiration enforced (default: 60 minutes)
   - Issuer claim validated
   - Signature verified on every request

3. **Rate Limiting:**
   - 5 failed attempts trigger 60-second lockout
   - Prevents brute force attacks
   - Successful login clears counter

4. **Refresh Token Security:**
   - Single session model (one refresh token per user)
   - Tokens stored in database (not in memory)
   - Automatic expiration (default: 7 days)
   - Revocation support
   - Role changes invalidate all refresh tokens

5. **CORS Configuration:**
   - Allows requests from frontend (localhost:4200, 4201)
   - Credentials allowed
   - Proper preflight headers

6. **Input Validation:**
   - Jakarta validation annotations on all DTOs
   - Username length limits
   - Email is required and length-limited; the request DTOs do not use `@Email`.
   - Password minimum length (8 characters)

---

## Testing

Run the checked-in tests under `src/test` (under `auth-service/src/test` for Auth_Sec). Build `Auth_Sec/security-common` first; Group 9 services also need `event-common`. See the root [usage guide](../usage.md) for build order. Documentation examples are illustrative and are not test evidence.

## Troubleshooting

### Common Issues

**1. JWT_SECRET not set:**
```
Error: JWT_SECRET is not set
Solution: Set JWT_SECRET in the environment (minimum 32 characters)
```

**2. Email sending fails:**
```
Error: Failed to send OTP email
Solution: Check SMTP configuration, use app-specific password for Gmail
```

**3. Account locked:**
```
Error: Too many failed attempts
Solution: Wait for lockout period (default 60 seconds) ; admin unban changes the enabled flag and does not clear the in-memory attempt limiter
```

**4. Refresh token expired:**
```
Error: Refresh token expired or revoked
Solution: User must login again to get new tokens
```

---

## Dependencies

Key Maven dependencies:
- `spring-boot-starter-web`
- `spring-boot-starter-security`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-mail`
- `mysql-connector-j`
- `com.nimbusds:nimbus-jose-jwt`
- `io.jsonwebtoken:jjwt-api`
- `io.jsonwebtoken:jjwt-impl`
- `io.jsonwebtoken:jjwt-jackson`

---

## API Endpoints Summary

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/health` | GET | No | Health check |
| `/api/auth/signup` | POST | No | Direct signup |
| `/api/auth/login` | POST | No | User login |
| `/api/auth/refresh` | POST | No | Refresh token |
| `/api/auth/logout` | POST | No | Logout |
| `/api/auth/init-signup` | POST | No | Initialize OTP signup |
| `/api/auth/verify-otp` | POST | No | Verify OTP |
| `/api/auth/resend-otp` | POST | No | Resend OTP |
| `/api/auth/admin/users` | GET | ADMIN | Get all users |
| `/api/auth/admin/users` | POST | ADMIN | Create user |
| `/api/auth/admin/users/{username}/roles` | PUT | ADMIN | Update roles |
| `/api/auth/admin/users/{username}/ban` | PUT | ADMIN | Ban user |
| `/api/auth/admin/users/{username}/unban` | PUT | ADMIN | Unban user |
| `/api/auth/admin/users/{username}` | DELETE | ADMIN | Delete user |
