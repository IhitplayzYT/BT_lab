# Microservices Smoke Test & Initialization

## Overview

This project contains 3 decoupled microservices with their own databases, connected via a shared Docker network:

1. **FD Calculator Service** (port 8084) - FD maturity calculations
2. **Product & Pricing Service** (port 8080) - Product catalog and rate management
3. **FD Account Service** (port 8086) - FD account management with Kafka integration
4. **Auth Service** (port 8090) - JWT token issuance

## Quick Start

### Initialize All Services

```bash
./init_all_services.sh
```

This script will:
- Build all Docker images
- Start all containers (services + databases + Kafka)
- Wait for services to be healthy
- Initialize databases with seed data
- Verify all services are running

### Run Smoke Tests

```bash
python3 smoke_test.py
```

This tests all REST endpoints across all services.

## Service URLs

| Service | URL | Database Port |
|---------|-----|---------------|
| Auth Service | http://localhost:8090 | N/A |
| Product Service | http://localhost:8080 | 3308 |
| Calculator Service | http://localhost:8084 | 3307 |
| Account Service | http://localhost:8086 | 3310 |

## Test Credentials

The following demo accounts are configured:

| Username | Password | Roles |
|----------|----------|-------|
| admin1 | admin123 | ADMIN |
| officer1 | officer123 | BANK_OFFICER |
| customer1 | customer123 | CUSTOMER |

## Current Status

### Working
- ✅ All containers build and start successfully
- ✅ All databases initialize with seed data
- ✅ Auth service login works
- ✅ FD Account service health check works (with HTTP Basic auth)
- ✅ Kafka and Zookeeper running

### Known Issues

**JWT Authentication Configuration**

The Product and Calculator services require JWT tokens with specific issuer/secret configuration. Currently:

- Auth Service issues tokens with issuer: `fd-platform-auth` (default)
- Product/Calculator services expect issuer: `http://localhost:8081` (docker-compose default)

This mismatch causes 401 errors when using JWT tokens from auth-service with product/calculator services.

**Solution Options:**

1. **Set consistent environment variables:**
   ```bash
   export JWT_ISSUER=fd-platform-auth
   export JWT_SECRET=test-secret-key-minimum-32-characters-for-hmac256
   docker compose down
   docker compose up -d
   ```

2. **Update docker-compose.yml** to use consistent issuer across all services

3. **Use HTTP Basic Auth** (currently only supported by FD Account Service)

## Smoke Test Coverage

The smoke test covers the following endpoints:

### Auth Service (port 8090)
- POST /api/auth/login - Admin login ✅
- POST /api/auth/login - Invalid credentials ✅

### Product & Pricing Service (port 8080)
- GET /api/v1/products/active - Get active products
- GET /api/v1/products/active?type=FD - Get FD products
- GET /api/v1/products/search - Search products
- GET /api/v1/products/{code} - Get product by code
- GET /api/v1/products/{code}/validate - Validate product
- GET /api/v1/products/{code}/defaults - Get product defaults
- POST /api/v1/products/{code}/rate - Calculate rate

### FD Calculator Service (port 8084)
- GET /actuator/health - Health check ✅
- POST /api/v1/fd/calculations - Calculate maturity
- POST /api/v1/fd/calculations/compare - Compare calculations
- GET /api/v1/fd/products/{code}/preview - Preview product
- POST /api/v1/fd/calculations/custom - Custom calculation
- POST /api/v1/fd/cache/rates/evict - Evict cache

### FD Account Service (port 8086)
- GET /health - Health check ✅
- GET /api/fd/account/{id} - Get FD account
- POST /api/fd/interest/quote - Interest quote
- GET /api/fd/interest/accounts - Get interest accounts
- GET /api/fd/clock - Clock status
- GET /api/v1/integration/products/active - Integration endpoints
- GET /api/report/* - Various report endpoints

## Manual Testing

### Test Auth Service
```bash
curl -X POST http://localhost:8090/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin1","password":"admin123"}'
```

### Test FD Account Service (HTTP Basic)
```bash
curl -u admin1:admin123 http://localhost:8086/health
curl -u admin1:admin123 http://localhost:8086/api/fd/interest/quote \
  -H "Content-Type: application/json" \
  -d '{"principal":10000,"annualRate":7.5,"months":12,"mode":"COMPOUND"}'
```

### Test Product Service (requires JWT)
```bash
# First get token
TOKEN=$(curl -s -X POST http://localhost:8090/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin1","password":"admin123"}' | jq -r '.accessToken')

# Then use it
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/products/active
```

## Stopping Services

```bash
docker compose -f docker-compose.yml down
```

## Viewing Logs

```bash
# All services
docker compose -f docker-compose.yml logs -f

# Specific service
docker compose -f docker-compose.yml logs -f fd-account-service
docker compose -f docker-compose.yml logs -f product-service
docker compose -f docker-compose.yml logs -f fd-calculator
docker compose -f docker-compose.yml logs -f fd-auth-service
```

## Troubleshooting

### Port conflicts
If ports are already in use, modify the port mappings in docker-compose.yml

### Database connection issues
Check that MySQL containers are healthy:
```bash
docker compose ps
```

### Kafka issues
Kafka doesn't have a healthcheck configured but should start within 30 seconds. Check logs:
```bash
docker compose logs kafka
```

### JWT authentication failures
Ensure JWT_SECRET and JWT_ISSUER are consistent across all services in docker-compose.yml

## Architecture

```
┌─────────────────┐
│   Auth Service  │ (8090)
│  (JWT Issuer)   │
└────────┬────────┘
         │
         ├──────────────┐
         │              │
┌────────▼────────┐ ┌──▼──────────────┐
│ Product Service │ │ Calculator Svc  │
│    (8080)       │ │    (8084)       │
└────────┬────────┘ └──┬──────────────┘
         │              │
         └──────┬───────┘
                │
        ┌───────▼────────┐
        │ Account Service│
        │    (8086)       │
        └────────┬────────┘
                 │
         ┌───────▼──────┐
         │    Kafka     │
         │   (9092)     │
         └──────────────┘
```

Each service has its own MySQL database:
- fd-mysql (3307) - Calculator DB
- product-mysql (3308) - Product DB
- fd-group9-mysql (3310) - Account DB
