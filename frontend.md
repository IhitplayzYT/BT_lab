# Frontend Development Guide - Banking Technology Lab

Our bank name is UNO bank and the services we offer should be derived from the backend modules 


# Styling
ROLE
You are a senior creative front-end engineer who builds award-level (Awwwards / FWA) marketing sites. Build a front-end-only, reactive Angular website for UNO Bank, a premium digital bank. The design and motion should feel like a $100K agency build: cinematic, fluid, and tactile, never templated.

SOURCE MATERIAL
I'm attaching a React/Next.js landing-page template (10 sections: Hero, Features, How It Works, Why Choose Us, Global Features, Testimonials, Security + App Banner, Pricing, FAQ, Footer). Treat it ONLY as a reference for section order, layout, and hierarchy. Do NOT copy its code. Ignore its instruction to "copy exactly / change nothing"; that rule does not apply here. Rebuild every section natively in Angular and push the design and motion far beyond the reference.

A separate context file describes the product. Take all product and domain context from that file. Do not invent backend logic, APIs, auth, or data models. Everything here is presentation layer only, with mock data held in local signals/constants.

BRAND
- Name: UNO Bank. Product focus: Fixed Deposits (FD).
- Replace ALL leftover placeholder branding and copy from the template (Velara, Spenny, Finflow, Fintech, mindfulness plans, ecommerce FAQ answers, etc.) with UNO Bank / FD-appropriate copy: trust, guaranteed returns, tenure choice, security, simplicity.
- Keep one confident tone: premium, calm, precise.

TECH STACK
- Latest stable Angular, standalone components, signals, the new control flow (@if/@for/@defer), OnPush everywhere, typed strictly, SCSS or Tailwind (your choice, be consistent).
- SSR-safe: guard every browser-only API with isPlatformBrowser / afterNextRender.
- Run all animation loops OUTSIDE NgZone (runOutsideAngular) and clean up with DestroyRef / ngOnDestroy (kill ScrollTriggers, cancel RAF, dispose WebGL).
- Lazy-load heavy sections and libraries with @defer (on viewport) and dynamic import().

ANIMATION LIBRARIES: ASSIGN EACH A CLEAR JOB (do not let them fight)
- GSAP + ScrollTrigger (+ SplitText or SplitType): master scroll choreography, pinned sections, scrubbed timelines, horizontal scroll, text reveals (char/word/line), parallax, number counters.
- Lenis: smooth scrolling, wired to ScrollTrigger via a single shared ticker so there is one RAF loop.
- Motion (motion.dev) or Anime.js: micro-interactions, hover/press springs, magnetic buttons, stagger entrances.
- Angular Animations (@angular/animations): route transitions and component enter/leave states (accordion, mobile menu, modals).
- Three.js or OGL: one hero WebGL scene (see below) plus an optional shader background. Pause when offscreen.
- Lottie (lottie-web / ngx-lottie) or Rive: animated icons and success/confirmation moments.
- Optional: tsParticles for ambient dust, Vanilla-Tilt for 3D card tilt.
Use each library only where it earns its place. No duplicated effects, and no library added just to say it's used.

MOTION SYSTEM (global)
- Smooth inertial scroll; custom cursor with a blend-mode follower that morphs on hover (links, buttons, cards, drag areas).
- Page-load intro: branded preloader with a counter/line draw, then a masked reveal into the hero.
- Route transitions: curtain/clip-path wipe between pages.
- Scroll progress indicator and a nav that hides on scroll down, reveals on scroll up, with a glass blur that intensifies.
- Magnetic CTAs, text-scramble or mask-slide link hovers, animated underlines.
- Scroll-linked background color/gradient shifts between sections.
- Consistent easing language (e.g. expo.out, power4.inOut) and shared duration tokens defined once.

SECTION-BY-SECTION DIRECTION
1. Hero: full-bleed WebGL/shader scene (flowing gradient mesh, floating glass FD "certificate" cards, or particle growth curve) reacting to mouse and scroll. Split-text headline reveal, stagger-in CTAs, the dashboard mockup rising with perspective tilt. Scroll pulls the camera or scene forward.
2. Features / Bento: cards reveal with staggered clip-path, 3D tilt on hover with a moving spotlight gradient, an animated encrypted-card stack that fans out on scroll, live-drawing SVG sparklines, count-up figures.
3. How It Works (3 steps): pinned section where scroll advances the steps. The mockups morph from one step to the next, with a progress line drawing alongside.
4. Why Choose Us: grid with border-light sweep animation, icons as Lottie that play on hover and loop subtly when idle.
5. Global/Transfers: animated globe or map (Three.js/OGL or SVG) with arcs drawing between points and pulsing nodes; glass cards floating with parallax depth.
6. FD Calculator moment (front-end only, local signals): a tenure slider and amount input with a live, smoothly animating growth curve and odometer-style number rolling. Make it a showpiece.
7. Testimonials: dual-column infinite marquee, opposite directions, pausing and slowing on hover, edge fades, subtle depth-of-field blur on off-center cards.
8. Security + App Banner: shield/lock animation that assembles on scroll, device mockup with parallax layers, store buttons with magnetic hover.
9. Pricing / Plans: card hover lift with glow follow-cursor, toggle with animated sliding pill, price digits that roll when switching.
10. FAQ: smooth height-animated accordion, plus/minus morph icon, staggered text reveal on open.
11. Footer: horizon/globe arc animation, giant "UNO BANK" wordmark that reveals on scroll with letter-by-letter motion and a light shimmer, link hover micro-animations.

VISUAL DIRECTION
- Dark, luxurious base with a refined accent system (derive a signature palette for UNO Bank; the template's purple on black is a starting point, not a requirement). Add depth with grain/noise overlay, soft volumetric glows, glassmorphism, and hairline borders.
- Typography: pair one expressive display face with one clean UI face (self-host, preload, avoid layout shift). Oversized headlines, tight tracking, strong hierarchy.
- Generous spacing, asymmetrical layouts, intentional use of negative space. Nothing should look like a stock template.

PERFORMANCE & QUALITY BARS
- Animate transform/opacity/clip-path/filter only; avoid layout-thrashing properties. Use will-change sparingly.
- Target 60fps on mid-range laptops; cap WebGL pixel ratio; pause offscreen animations with IntersectionObserver.
- Respect prefers-reduced-motion with a graceful, static-but-polished fallback.
- Fully responsive (mobile-first). Touch devices get tailored motion (no custom cursor, lighter WebGL).
- Lighthouse performance target 85+ despite the effects; lazy-load videos/images, use modern formats, provide poster fallbacks.
- Accessible: semantic HTML, focus states, keyboard-operable menu and accordion, sufficient contrast, ARIA where needed.
- Hosted images/videos from the template may be unavailable. Use local assets, generated gradients, or inline SVG/shaders instead.

DELIVERABLES
- Folder structure with one standalone component per section plus shared directives/services (cursor, smooth-scroll, scroll-reveal directive, magnetic directive, animation-tokens).
- A central animation service that initializes Lenis + GSAP once and exposes helpers.
- Install commands for all dependencies.
- Short README: architecture, how to tune motion tokens, how to add a new animated section.
- The project must compile and run with zero console errors.

Before coding, output a brief plan: component tree, library-to-feature mapping, and the global motion language. Then build.



## Overview

This document provides comprehensive information for building a frontend application for the Banking Technology Lab microservices system. It includes all API endpoints, data structures, authentication flow, and architectural context needed to quickly build a functional frontend.

## System Architecture

### Microservices

The system consists of 4 main microservices:

1. **Auth Service** (Port 8090) - Authentication and authorization
2. **Product & Pricing Service** (Port 8080) - Product catalog and rate management
3. **FD Calculator Service** (Port 8084) - FD maturity calculations
4. **FD Account Service** (Port 8086) - FD account lifecycle management

### Communication Flow

```
Frontend → Auth Service (get JWT token)
Frontend → Product Service (get products, with JWT)
Frontend → Calculator Service (calculate maturity, with JWT)
Frontend → Account Service (create/manage FDs, with JWT)
```

All services require JWT authentication (except Auth Service login/signup endpoints).

## Authentication Flow

### 1. User Signup

**Endpoint:** `POST http://localhost:8090/api/auth/signup`

**Request Body:**
```json
{
  "username": "string (max 100 chars)",
  "password": "string (8-200 chars)",
  "email": "string (max 255 chars)"
}
```

**Response (201 Created):**
```json
{
  "accessToken": "JWT token string",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "refreshToken": "refresh token string",
  "username": "username",
  "roles": ["CUSTOMER"]
}
```

### 2. User Login

**Endpoint:** `POST http://localhost:8090/api/auth/login`

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "JWT token string",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "refreshToken": "refresh token string",
  "username": "username",
  "roles": ["CUSTOMER"]
}
```

### 3. Token Refresh

**Endpoint:** `POST http://localhost:8090/api/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "refresh token string"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "new JWT token string",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "refreshToken": "new refresh token string",
  "username": "username",
  "roles": ["CUSTOMER"]
}
```

### 4. Logout

**Endpoint:** `POST http://localhost:8090/api/auth/logout`

**Request Body:**
```json
{
  "refreshToken": "refresh token string"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

### Using JWT Tokens

Include the access token in the Authorization header for all authenticated requests:

```
Authorization: Bearer <access_token>
```

## User Roles

- **CUSTOMER** - Can view own FDs, calculate maturity, view products
- **BANK_OFFICER** - Can create FDs, manage products, view all FDs
- **ADMIN** - Full access including system configuration

## API Endpoints

### Auth Service (Port 8090)

#### Health Check
- `GET http://localhost:8090/health`
- **Auth:** None
- **Response:** `{"status": "UP", "service": "auth-service"}`

#### Authentication
- `POST http://localhost:8090/api/auth/signup` - Create new user
- `POST http://localhost:8090/api/auth/login` - Login user
- `POST http://localhost:8090/api/auth/refresh` - Refresh access token
- `POST http://localhost:8090/api/auth/logout` - Logout user

---

### Product & Pricing Service (Port 8080)

#### Health Check
- `GET http://localhost:8080/actuator/health`
- **Auth:** None
- **Response:** Actuator health JSON

#### Get Active Products
- `GET http://localhost:8080/api/v1/products/active`
- **Auth:** Required (BANK_OFFICER or ADMIN)
- **Query Params:** `type` (optional, e.g., "FD")
- **Response:** Array of ProductResponseDTO

```json
[
  {
    "productCode": "FD001",
    "productName": "Fixed Deposit - Regular",
    "productType": "FD",
    "status": "ACTIVE",
    "effectiveDate": "2024-01-01",
    "expiryDate": "2025-12-31",
    "baseRate": 7.5,
    "termMinMonths": 6,
    "termMaxMonths": 120,
    "minDepositAmount": 10000,
    "maxDepositAmount": 10000000,
    "allowedRoles": ["CUSTOMER", "SENIOR_CITIZEN"],
    "charges": [...]
  }
]
```

#### Get Product by Code
- `GET http://localhost:8080/api/v1/products/{productCode}`
- **Auth:** Required (BANK_OFFICER or ADMIN)
- **Response:** ProductResponseDTO

#### Validate Product
- `GET http://localhost:8080/api/v1/products/{productCode}/validate`
- **Auth:** Required (BANK_OFFICER or ADMIN)
- **Query Params:**
  - `termMonths` (optional)
  - `amount` (optional)
  - `age` (optional)
- **Response:** ProductValidationResponseDTO

```json
{
  "valid": true,
  "productCode": "FD001",
  "messages": []
}
```

#### Calculate Rate
- `POST http://localhost:8080/api/v1/products/{productCode}/rate`
- **Auth:** Required (BANK_OFFICER or ADMIN)
- **Request Body:**
```json
{
  "termMonths": 12,
  "customerCategory": "REGULAR"
}
```
- **Response:** RateCalculationResponseDTO

```json
{
  "productCode": "FD001",
  "baseRate": 7.5,
  "categoryAdjustment": 0.5,
  "finalRate": 8.0
}
```

#### Get Product Defaults
- `GET http://localhost:8080/api/v1/products/{productCode}/defaults`
- **Auth:** Required (BANK_OFFICER or ADMIN)
- **Response:** ProductDefaultsResponseDTO

#### Search Products
- `GET http://localhost:8080/api/v1/products/search`
- **Auth:** Required (BANK_OFFICER or ADMIN)
- **Query Params:**
  - `productType` (optional)
  - `startDate` (optional, yyyy-MM-dd)
  - `endDate` (optional, yyyy-MM-dd)
  - `status` (optional)
  - `page` (default: 0)
  - `size` (default: 50)
  - `sortBy` (default: productId)
- **Response:** Array of ProductResponseDTO

#### Create Product (Admin Only)
- `POST http://localhost:8080/api/v1/products`
- **Auth:** Required (BANK_OFFICER or ADMIN)
- **Request Body:** ProductRequestDTO
- **Response:** ProductResponseDTO (201 Created)

#### Update Product (Admin Only)
- `PUT http://localhost:8080/api/v1/products/{productCode}`
- **Auth:** Required (BANK_OFFICER or ADMIN)
- **Request Body:** ProductRequestDTO
- **Response:** ProductResponseDTO

#### Retire Product (Admin Only)
- `DELETE http://localhost:8080/api/v1/products/{productCode}`
- **Auth:** Required (ADMIN)
- **Response:** ProductResponseDTO

#### Internal Endpoint (Service-to-Service)
- `GET http://localhost:8080/api/v1/products/internal/products/{productCode}/calculator-config`
- **Auth:** Required (JWT)
- **Response:** CalculatorConfigDTO

---

### FD Calculator Service (Port 8084)

#### Health Check
- `GET http://localhost:8084/actuator/health`
- **Auth:** None
- **Response:** Actuator health JSON

#### Calculate FD Maturity
- `POST http://localhost:8084/api/v1/fd/calculations`
- **Auth:** Required (CUSTOMER role)
- **Request Body:**
```json
{
  "productCode": "FD001",
  "principal": 100000,
  "termMonths": 12,
  "interestType": "COMPOUND"
}
```
- **Response:** CalculationResponseDTO

```json
{
  "calculationId": "CALC-20260911-0001",
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "productCode": "FD001",
  "principal": 100000,
  "termMonths": 12,
  "interestRate": 8.0,
  "interestType": "COMPOUND",
  "maturityAmount": 108328.71,
  "interestEarned": 8328.71,
  "maturityDate": "2025-09-11",
  "calculatedAt": "2024-09-11T10:30:00Z"
}
```

#### Compare Multiple FD Options
- `POST http://localhost:8084/api/v1/fd/calculations/compare`
- **Auth:** Required (CUSTOMER role)
- **Request Body:**
```json
{
  "principal": 100000,
  "options": [
    {
      "productCode": "FD001",
      "termMonths": 12
    },
    {
      "productCode": "FD002",
      "termMonths": 24
    }
  ]
}
```
- **Response:** ComparisonResponseDTO

#### Get Saved Calculation
- `GET http://localhost:8084/api/v1/fd/calculations/{calculationId}`
- **Auth:** Required (CUSTOMER role)
- **Response:** CalculationResponseDTO

#### Get Calculation by UUID
- `GET http://localhost:8084/api/v1/fd/calculations/uuid/{uuid}`
- **Auth:** Required (CUSTOMER role)
- **Response:** CalculationResponseDTO

#### Export Calculation as CSV
- `GET http://localhost:8084/api/v1/fd/calculations/{calculationId}/export`
- **Auth:** Required (CUSTOMER role)
- **Query Params:** `format` (default: "csv")
- **Response:** CSV file download

#### Explain Calculation
- `POST http://localhost:8084/api/v1/fd/calculations/{calculationId}/explain`
- **Auth:** Required (CUSTOMER role)
- **Response:** Plain text explanation

#### Preview Product Constraints
- `GET http://localhost:8084/api/v1/fd/products/{productCode}/preview`
- **Auth:** Required (CUSTOMER role)
- **Response:** ProductPreviewResponseDTO

```json
{
  "productCode": "FD001",
  "minPrincipal": 10000,
  "maxPrincipal": 10000000,
  "minTermMonths": 6,
  "maxTermMonths": 120,
  "baseRate": 7.5,
  "interestType": "COMPOUND"
}
```

#### Batch Calculations
- `POST http://localhost:8084/api/v1/fd/batch/calculations`
- **Auth:** Required (CUSTOMER role)
- **Request Body:** BatchCalculationRequest
- **Response:** BatchCalculationResponseDTO

#### Custom Calculation
- `POST http://localhost:8084/api/v1/fd/calculations/custom`
- **Auth:** Required (CUSTOMER role)
- **Request Body:**
```json
{
  "principal": 100000,
  "termMonths": 12,
  "interestRate": 8.5,
  "interestType": "COMPOUND",
  "compoundingFrequency": "MONTHLY"
}
```
- **Response:** CalculationResponseDTO

#### Evict Rate Cache
- `POST http://localhost:8084/api/v1/fd/cache/rates/evict`
- **Auth:** Required (CUSTOMER role)
- **Response:** 200 OK

---

### FD Account Service (Port 8086)

#### Health Check
- `GET http://localhost:8086/health`
- **Auth:** None
- **Response:** `{"status": "UP", "service": "FD Module is running"}`

#### Create FD Account
- `POST http://localhost:8086/api/fd/account/create`
- **Auth:** Required (BANK_OFFICER or ADMIN)
- **Request Body:**
```json
{
  "customerId": "CUST001",
  "productCode": "FD001",
  "principalAmount": 100000,
  "termMonths": 12,
  "branchCode": "BR001"
}
```
- **Response:** FDAccountResponseDTO

```json
{
  "fdAccountNo": "FD2024091100001",
  "customerId": "CUST001",
  "productCode": "FD001",
  "principalAmount": 100000,
  "interestRate": 8.0,
  "termMonths": 12,
  "maturityDate": "2025-09-11",
  "status": "ACTIVE",
  "createdBy": "bank_officer"
}
```

#### Get FD Account
- `GET http://localhost:8086/api/fd/account/{fdAccountNo}`
- **Auth:** Required (BANK_OFFICER, ADMIN, or CUSTOMER for own accounts)
- **Response:** FixedDepositAccount entity

#### Create FD with Transaction
- `POST http://localhost:8086/api/fd/account/create-with-txn`
- **Auth:** Required (BANK_OFFICER)
- **Request Body:** Same as create
- **Response:** FDAccountCreationResponseDTO

```json
{
  "fdAccountNo": "FD2024091100001",
  "transactionId": "TXN2024091100001",
  "customerId": "CUST001",
  "productCode": "FD001",
  "principalAmount": 100000,
  "interestRate": 8.0,
  "termMonths": 12,
  "maturityDate": "2025-09-11",
  "status": "ACTIVE"
}
```

#### Get Transaction History
- `GET http://localhost:8086/api/fd/account/{fdAccountNo}/transactions`
- **Auth:** Required (BANK_OFFICER, ADMIN, or CUSTOMER for own accounts)
- **Response:** Array of FDTransactionResponseDTO

```json
[
  {
    "transactionId": "TXN2024091100001",
    "fdAccountNo": "FD2024091100001",
    "transactionType": "DEPOSIT",
    "amount": 100000,
    "transactionDate": "2024-09-11",
    "balanceAfter": 100000
  }
]
```

#### Interest Quote
- `POST http://localhost:8086/api/fd/interest/quote`
- **Auth:** Required (ADMIN, BANK_OFFICER, or CUSTOMER)
- **Request Body:**
```json
{
  "principal": 100000,
  "annualRate": 8.0,
  "months": 12,
  "mode": "COMPOUND"
}
```
- **Response:**
```json
{
  "maturityAmount": 108328.71,
  "interest": 8328.71,
  "mode": "COMPOUND",
  "basis": "Monthly quotation; actual daily accrual may differ"
}
```

#### Get Interest Accounts
- `GET http://localhost:8086/api/fd/interest/accounts`
- **Auth:** Required (ADMIN or BANK_OFFICER)
- **Response:** List of FD accounts with interest settings

#### Configure Interest Settings
- `PUT http://localhost:8086/api/fd/interest/{account}/settings`
- **Auth:** Required (ADMIN)
- **Request Body:**
```json
{
  "mode": "COMPOUND"
}
```
- **Response:**
```json
{
  "fdAccountNo": "FD2024091100001",
  "mode": "COMPOUND"
}
```

#### Clock Control (Admin Only - Testing)
- `GET http://localhost:8086/api/fd/clock`
- **Auth:** Required (ADMIN)
- **Response:**
```json
{
  "timeTravelEnabled": false,
  "realDate": "2024-09-11",
  "businessDate": "2024-09-11",
  "offsetDays": 0
}
```

- `POST http://localhost:8086/api/fd/clock/advance`
- **Auth:** Required (ADMIN)
- **Request Body:**
```json
{
  "days": 30
}
```

- `POST http://localhost:8086/api/fd/clock/reset`
- **Auth:** Required (ADMIN)
- **Response:** Clock status

#### Integration Endpoints (Proxy to Other Services)

##### Get Active Products (via Account Service)
- `GET http://localhost:8086/api/v1/integration/products/active`
- **Auth:** Required (BANK_OFFICER or ADMIN)
- **Query Params:** `type` (optional)
- **Response:** Array of products from Product Service

##### Get Product by Code (via Account Service)
- `GET http://localhost:8086/api/v1/integration/products/{productCode}`
- **Auth:** Required (BANK_OFFICER or ADMIN)
- **Response:** Product from Product Service

##### Validate Product (via Account Service)
- `GET http://localhost:8086/api/v1/integration/products/{productCode}/validate`
- **Auth:** Required (BANK_OFFICER or ADMIN)
- **Query Params:** `termMonths`, `amount`, `age`
- **Response:** Validation result from Product Service

##### Calculate Maturity (via Account Service)
- `POST http://localhost:8086/api/v1/integration/calculator/calculate`
- **Auth:** Required (BANK_OFFICER, ADMIN, or CUSTOMER)
- **Query Params:** `productCode`, `principal`, `termMonths`, `interestType`
- **Response:** Calculation result from Calculator Service

##### Preview Product (via Account Service)
- `GET http://localhost:8086/api/v1/integration/calculator/products/{productCode}/preview`
- **Auth:** Required (BANK_OFFICER, ADMIN, or CUSTOMER)
- **Response:** Product preview from Calculator Service

---

## Data Models

### ProductResponseDTO

```typescript
interface ProductResponseDTO {
  productCode: string;
  productName: string;
  productType: string; // FD, SAVINGS, LOAN
  status: string; // ACTIVE, INACTIVE, DRAFT, SUSPENDED, RETIRED
  effectiveDate: string; // ISO date
  expiryDate: string; // ISO date
  baseRate: number;
  termMinMonths: number;
  termMaxMonths: number;
  minDepositAmount: number;
  maxDepositAmount: number;
  allowedRoles: string[];
  charges?: ChargesDTO[];
  rateVariations?: RateVariationDTO[];
  termLimits?: TermLimitDTO[];
}
```

### CalculationRequest

```typescript
interface CalculationRequest {
  productCode: string;
  principal: number;
  termMonths: number;
  interestType?: string; // CREDIT, SIMPLE, COMPOUND
}
```

### CalculationResponse

```typescript
interface CalculationResponse {
  calculationId: string;
  uuid: string;
  productCode: string;
  principal: number;
  termMonths: number;
  interestRate: number;
  interestType: string;
  maturityAmount: number;
  interestEarned: number;
  maturityDate: string; // ISO date
  calculatedAt: string; // ISO datetime
}
```

### FDAccountRequest

```typescript
interface FDAccountRequest {
  customerId: string;
  productCode: string;
  principalAmount: number;
  termMonths: number;
  branchCode: string;
}
```

### FDAccountResponse

```typescript
interface FDAccountResponse {
  fdAccountNo: string;
  customerId: string;
  productCode: string;
  principalAmount: number;
  interestRate: number;
  termMonths: number;
  maturityDate: string; // ISO date
  status: string; // ACTIVE, MATURED, CLOSED
  createdBy: string;
}
```

### FDTransactionResponse

```typescript
interface FDTransactionResponse {
  transactionId: string;
  fdAccountNo: string;
  transactionType: string; // DEPOSIT, WITHDRAWAL, INTEREST_CREDIT
  amount: number;
  transactionDate: string; // ISO date
  balanceAfter: number;
}
```

## File Structure

### Project Root

```
BT_LAB/
├── Auth_Sec/                          # Auth Service
│   ├── auth-service/
│   │   ├── src/main/java/com/example/fdauth/
│   │   │   ├── Application.java
│   │   │   ├── AuthController.java
│   │   │   ├── UserDirectory.java
│   │   │   ├── RefreshTokenService.java
│   │   │   └── entity/
│   │   └── pom.xml
│   ├── security-common/
│   └── Dockerfile
│
├── FD_Module_Group9/                  # FD Account Service
│   ├── fd-account-service/
│   │   ├── src/main/java/com/example/fdmodule/
│   │   │   ├── controller/
│   │   │   │   ├── FDAccountController.java
│   │   │   │   ├── FDTransactionController.java
│   │   │   │   ├── HealthController.java
│   │   │   │   ├── IntegrationController.java
│   │   │   │   ├── InterestController.java
│   │   │   │   └── ClockController.java
│   │   │   ├── dto/
│   │   │   │   ├── FDAccountRequest.java
│   │   │   │   ├── FDAccountResponse.java
│   │   │   │   └── FDTransactionResponse.java
│   │   │   ├── entity/
│   │   │   │   ├── FixedDepositAccount.java
│   │   │   │   ├── FDTransaction.java
│   │   │   │   └── CustomerProfile.java
│   │   │   └── service/
│   │   └── pom.xml
│   ├── event-common/
│   ├── security-common/
│   ├── scripts/                       # SQL init scripts
│   └── Dockerfile
│
├── fd_calc/
│   └── mod 4 backend/                # FD Calculator Service
│       ├── src/main/java/com/bank/calculator/
│       │   ├── controller/
│       │   │   └── FdCalculationController.java
│       │   ├── dto/
│       │   │   ├── request/
│       │   │   └── response/
│       │   ├── service/
│       │   └── client/
│       └── pom.xml
│
├── product&pricing module/
│   └── product&pricing module/
│       └── banking-product-backend/   # Product Service
│           ├── src/main/java/com/bank/product/
│           │   ├── controller/
│           │   │   └── ProductController.java
│           │   ├── dto/
│           │   │   ├── ProductRequestDTO.java
│           │   │   ├── ProductResponseDTO.java
│           │   │   └── ...
│           │   ├── entity/
│           │   └── service/
│           └── pom.xml
│
├── FD_Module_Group9/
│   ├── interest-dashboard/           # Existing Angular dashboard for interest operations
│   │   ├── src/
│   │   │   ├── main.ts              # Standalone component with interest calculator
│   │   │   ├── index.html
│   │   │   └── styles.css
│   │   ├── package.json              # Angular 20.3.0 dependencies
│   │   ├── angular.json
│   │   └── proxy.conf.json          # API proxy configuration
│   └── ...
├── docker-compose.yml                 # Docker orchestration
├── init_all_services.sh              # Startup script
├── usage.md                          # Usage guide
└── frontend.md                       # This file
```

## Frontend Recommendations

### Tech Stack

- **Framework:** React, Vue, or Angular
- **State Management:** Redux, Vuex, or NgRx
- **HTTP Client:** Axios or Fetch API
- **Routing:** React Router, Vue Router, or Angular Router
- **UI Components:** Material UI, Ant Design, or Tailwind CSS
- **Form Handling:** React Hook Form, VeeValidate, or Angular Reactive Forms

### Key Features to Implement

1. **Authentication Flow**
   - Login/Signup forms
   - Token storage (localStorage or sessionStorage)
   - Token refresh logic
   - Protected routes
   - Logout functionality

2. **Dashboard**
   - User profile display
   - Quick actions (Create FD, Calculate)
   - Summary statistics

3. **FD Calculator**
   - Product selection dropdown
   - Principal input
   - Term selection
   - Real-time calculation
   - Comparison feature
   - Results display with charts

4. **Product Catalog**
   - List of active products
   - Product details view
   - Filter by type
   - Search functionality

5. **FD Account Management**
   - Create new FD form
   - List of user's FDs
   - FD details view
   - Transaction history
   - Maturity information

6. **Admin Features** (if applicable)
   - Product management
   - User management
   - System configuration
   - Clock control (testing)

### API Client Pattern

Create a centralized API client:

```typescript
// api-client.ts
const API_BASE_URL = 'http://localhost';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(username: string, password: string) {
    return this.request(':8090/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async signup(username: string, password: string, email: string) {
    return this.request(':8090/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, password, email }),
    });
  }

  // Product endpoints
  async getActiveProducts(type?: string) {
    const params = type ? `?type=${type}` : '';
    return this.request(`:8080/api/v1/products/active${params}`);
  }

  // Calculator endpoints
  async calculateMaturity(data: CalculationRequest) {
    return this.request(':8084/api/v1/fd/calculations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Account endpoints
  async createAccount(data: FDAccountRequest) {
    return this.request(':8086/api/fd/account/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAccount(fdAccountNo: string) {
    return this.request(`:8086/api/fd/account/${fdAccountNo}`);
  }
}

export const apiClient = new ApiClient();
```

### Error Handling

Implement global error handling for:
- 401 Unauthorized → Redirect to login
- 403 Forbidden → Show access denied message
- 404 Not Found → Show not found message
- 500 Server Error → Show error message
- Network errors → Show offline message

### Loading States

Show loading indicators for:
- API calls in progress
- Page transitions
- Form submissions

### Responsive Design

Ensure the UI works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## Testing

### Test Users

The system has pre-configured test users (check database init scripts):
- Customer user
- Bank officer user
- Admin user

### Test Scenarios

1. **Authentication**
   - Signup new user
   - Login with valid credentials
   - Login with invalid credentials
   - Token refresh
   - Logout

2. **Product Catalog**
   - View active products
   - Filter by type
   - View product details
   - Validate product

3. **Calculator**
   - Calculate maturity for single FD
   - Compare multiple FD options
   - Export calculation as CSV
   - View calculation history

4. **Account Management**
   - Create new FD account
   - View account details
   - View transaction history
   - Check maturity status

## Swagger Documentation

Interactive API documentation is available:

- **Product Service:** http://localhost:8080/swagger-ui.html
- **Calculator Service:** http://localhost:8084/swagger-ui.html
- **Account Service:** http://localhost:8086/swagger-ui.html

Use these to test endpoints directly during development.

## Common Pitfalls

1. **Token Expiration** - Handle 401 errors and refresh tokens automatically
2. **CORS Issues** - Services may need CORS configuration for frontend
3. **Role-Based Access** - Different endpoints require different roles
4. **Date Formats** - Use ISO 8601 format for all dates
5. **Decimal Precision** - Use appropriate number handling for financial calculations
6. **Async Operations** - Some operations (like FD creation) may take time

## Security Considerations

- Never store tokens in plain text (use secure storage)
- Implement CSRF protection
- Validate all user inputs
- Use HTTPS in production
- Implement rate limiting
- Sanitize displayed data to prevent XSS

## Support

For detailed architecture information, see:
- `PROJECT_CONTEXT.md` - Overall system architecture
- `usage.md` - Deployment and configuration guide
- Service-specific documentation in each module's `docs/` folder
