# Banking Technology Lab - Usage Guide

## Overview

This is a microservices-based banking system for Fixed Deposit (FD) management. The system consists of 5 main services that communicate via a shared Docker network, each with its own database.

## Prerequisites

- Docker and Docker Compose installed
- Java 21 (for local development)
- Maven 3.x (for local development)
- Node.js 18+ (for frontend development)
- Python 3 (for report generation)
- Ports 4200, 8080, 8084, 8086, 8090, 3307-3310, 9092, 19092, 2181 available

## Architecture

### Services

1. **Auth Service** (Port 8090) - JWT authentication and user management
2. **Product & Pricing Service** (Port 8080) - Product catalog and rate management
3. **FD Calculator Service** (Port 8084) - FD maturity calculations
4. **FD Account Service** (Port 8086) - FD account lifecycle management
5. **Frontend** (Port 4200) - Angular web application

### Databases

- **FD Calculator DB** (Port 3307) - fd_calculator
- **Product DB** (Port 3308) - banking_product_db
- **Auth DB** (Port 3309) - auth_db
- **FD Account DB** (Port 3310) - banking_technology_lab

### Infrastructure

- **Kafka** (Ports 9092, 19092) - Event streaming for FD Account Service
- **Zookeeper** (Port 2181) - Required for Kafka

## Quick Start

### 1. Start All Services

Run the initialization script from the project root:

```bash
./init_all_services.sh
```

This script will:
- Build and start all Docker containers
- Wait for all services to become healthy
- Initialize databases with seed data
- Verify all services are running

### 2. Verify Services are Running

Check that all services are healthy:

```bash
docker compose -f docker-compose.yml ps
```

Expected output should show all services as "Up" or "healthy".

### 3. Test the Services

Run the smoke test:

```bash
python3 smoke_test.py
```

## Environment Variables

The following environment variables can be configured. All have sensible defaults for development:

### Database Configuration

```bash
# Default password for all databases (development only)
DB_PASSWORD=your_password_here

# MySQL root password
MYSQL_ROOT_PASSWORD=root_password_here
```

### JWT Configuration

```bash
# Secret key for JWT signing (minimum 32 characters)
JWT_SECRET=test-secret-key-minimum-32-characters-for-hmac256

# JWT issuer
JWT_ISSUER=http://localhost:8081

# JWT audience (service-specific)
JWT_AUDIENCE=service-name
```

### Service Configuration

```bash
# Time travel feature for FD Account Service (for testing)
APP_TIME_TRAVEL_ENABLED=false

# Basic auth for FD Account Service
APP_SECURITY_BASIC_ENABLED=false
```

### Service URLs (Internal)

These are configured in docker-compose.yml for service-to-service communication:

```bash
PRODUCT_SERVICE_URL=http://product-service:8080
CALCULATOR_SERVICE_URL=http://fd-calculator:8084
CUSTOMER_SERVICE_URL=http://localhost:8082
```

## Manual Startup (Without Script)

If you prefer to start services manually:

### 1. Start Docker Compose

```bash
docker compose -f docker-compose.yml up -d --build
```

### 2. Wait for Services to be Healthy

```bash
# Check container health
docker compose -f docker-compose.yml ps

# Or check specific endpoints
curl http://localhost:8090/health  # Auth Service
curl http://localhost:8080/api/v1/products/active  # Product Service
curl http://localhost:8084/actuator/health  # Calculator Service
curl http://localhost:8086/health  # Account Service
```

### 3. Check Logs

```bash
# All logs
docker compose -f docker-compose.yml logs -f

# Specific service logs
docker compose -f docker-compose.yml logs -f fd-auth-service
docker compose -f docker-compose.yml logs -f product-service
docker compose -f docker-compose.yml logs -f fd-calculator
docker compose -f docker-compose.yml logs -f fd-account-service
```

## Stopping Services

### Stop All Services

```bash
docker compose -f docker-compose.yml down
```

### Stop and Remove Volumes (Complete Cleanup)

```bash
docker compose -f docker-compose.yml down -v
```

This will remove all database data. Use with caution!

## Service Health Endpoints

All services now have health endpoints:

- **Auth Service**: `GET http://localhost:8090/health`
- **Product Service**: `GET http://localhost:8080/actuator/health`
- **Calculator Service**: `GET http://localhost:8084/actuator/health`
- **Account Service**: `GET http://localhost:8086/health`

## Authentication

### Getting a Token

1. **Signup** (create new user):

```bash
curl -X POST http://localhost:8090/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",
    "email": "test@example.com"
  }'
```

2. **Login** (existing user):

```bash
curl -X POST http://localhost:8090/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

Response includes:
- `accessToken`: JWT token for API calls
- `refreshToken`: For token refresh
- `expiresIn`: Token validity in seconds
- `username`: Username
- `roles`: User roles

### Using the Token

Include the token in the Authorization header:

```bash
curl http://localhost:8080/api/v1/products/active \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Troubleshooting

### Services Not Starting

1. Check port conflicts:
```bash
lsof -i :8080
lsof -i :8084
lsof -i :8086
lsof -i :8090
```

2. Check Docker logs:
```bash
docker compose -f docker-compose.yml logs
```

3. Restart specific service:
```bash
docker compose -f docker-compose.yml restart fd-auth-service
```

### Database Connection Issues

1. Verify databases are healthy:
```bash
docker compose -f docker-compose.yml ps fd-mysql
docker compose -f docker-compose.yml ps product-mysql
docker compose -f docker-compose.yml ps auth-mysql
docker compose -f docker-compose.yml ps fd-group9-mysql
```

2. Check database logs:
```bash
docker compose -f docker-compose.yml logs fd-mysql
```

### Health Check Failures

The init script waits up to 90 seconds per service. If services are slow to start:

1. Check startup logs:
```bash
cat startup.log
```

2. Manually verify health endpoints:
```bash
curl http://localhost:8090/health
curl http://localhost:8080/actuator/health
curl http://localhost:8084/actuator/health
curl http://localhost:8086/health
```

### Rebuild After Code Changes

After modifying code, rebuild and restart:

```bash
docker compose -f docker-compose.yml up -d --build
```

Or rebuild specific service:
```bash
docker compose -f docker-compose.yml up -d --build fd-auth-service
```

## Development

### Local Development (Without Docker)

Each service can be run locally:

1. **Auth Service**:
```bash
cd Auth_Sec/auth-service
mvn spring-boot:run
```

2. **Product Service**:
```bash
cd banking-product-backend
mvn spring-boot:run
```

3. **Calculator Service**:
```bash
cd "fd_calc/mod 4 backend"
mvn spring-boot:run
```

4. **Account Service**:
```bash
cd FD_Module_Group9/fd-account-service
mvn spring-boot:run
```

5. **Frontend**:
```bash
cd uno-frontend
npm install
ng serve
```

Note: You'll need to configure database connections in `application.properties` or `application.yml` for local development.

### Building JARs

```bash
# Auth Service
cd Auth_Sec/auth-service
mvn clean package

# Product Service
cd banking-product-backend
mvn clean package

# Calculator Service
cd "fd_calc/mod 4 backend"
mvn clean package

# Account Service
cd FD_Module_Group9/fd-account-service
mvn clean package
```

## API Documentation

For complete API documentation, see `postman.md`.

Swagger/OpenAPI documentation is available for services that include it:

- **Product Service**: http://localhost:8080/swagger-ui.html
- **Calculator Service**: http://localhost:8084/swagger-ui.html
- **Account Service**: http://localhost:8086/swagger-ui.html

## Frontend Access

The Angular frontend is available at: http://localhost:4200

### Frontend Routes
- `/` - Landing page
- `/login` - Customer login
- `/signup` - Customer signup
- `/admin-login` - Admin login
- `/admin-signup` - Admin signup
- `/officer-login` - Bank Officer login
- `/officer-signup` - Bank Officer signup
- `/dashboard` - Customer dashboard
- `/admin` - Admin panel
- `/officer` - Bank Officer panel
- `/apply-fd` - Apply for FD
- `/terms` - Terms of service
- `/privacy` - Privacy policy

## Security Notes

- This is a development environment with dummy credentials
- JWT secrets are set to test values - change for production
- Database passwords are set to simple defaults - change for production
- All services communicate over HTTP within the Docker network
- For production, use HTTPS and proper secrets management

## Support

For issues or questions:
1. Check the logs: `docker compose -f docker-compose.yml logs`
2. Review the startup log: `cat startup.log`
3. Check service health endpoints
4. Review the PROJECT_CONTEXT.md for detailed architecture information
