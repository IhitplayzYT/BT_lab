# Banking Technology Lab - Usage Guide

> Startup scope: root `docker-compose.yml` starts seven Java services, including statement projection. Group 9 and auth Docker images copy prebuilt JARs. Use the full Maven build below, especially on a fresh checkout. `init_all_services.sh` builds the Group 9 account, batch, notification and statement JARs before Compose starts. Rebuilding an image alone does not compile changed Group 9/auth Java code.

## Overview

This is a microservices-based banking system for Fixed Deposit (FD) management. The system consists of 6 backend services in the root Compose stack (plus a separately runnable statement service) that communicate via a shared Docker network, each with its own database.

## Prerequisites

### System Requirements

- **Docker** 20.10+ and **Docker Compose** 2.0+ (for running services)
- **Java** 21 (required by startup scripts and local builds)
- **Maven** 3.8+ (required by startup scripts and local builds)
- **Node.js** 22.22.3 (or another version matching `^22.22.3 || ^24.15.0 || >=26.0.0`) and **npm** 9+ (for frontend development)
- **Python** 3.8+ (for report generation scripts)
- At least 8GB RAM available
- At least 20GB free disk space

### Required Ports

Ensure the following ports are available on your system:

- **4200** - Angular Frontend
- **8080** - Product & Pricing Service
- **8081** - Interest Batch Service
- **8083** - Notification Service
- **8084** - FD Calculator Service
- **8086** - FD Account Service
- **8090** - Auth Service
- **8025** - Mailpit Web UI
- **1025** - Mailpit SMTP
- **3307** - FD Calculator MySQL
- **3308** - Product MySQL
- **3309** - Auth MySQL
- **3310** - FD Account MySQL
- **9092** - Kafka (internal)
- **19092** - Kafka (external)
- **2181** - Zookeeper

### Installing Dependencies

#### Docker & Docker Compose

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose-v2
sudo usermod -aG docker $USER
```

**macOS:**
```bash
brew install --cask docker
```

**Windows:**
Download Docker Desktop from https://www.docker.com/products/docker-desktop

#### Node.js & npm

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**macOS:**
```bash
brew install node
```

**Windows:**
Download from https://nodejs.org/

#### Maven

**Ubuntu/Debian:**
```bash
sudo apt-get install maven
```

**macOS:**
```bash
brew install maven
```

#### Python 3

**Ubuntu/Debian:**
```bash
sudo apt-get install python3 python3-pip
```

**macOS:**
```bash
brew install python3
```

## Architecture

### Services

1. **Auth Service** (Port 8090) - JWT authentication and user management with OTP-based signup
2. **Product & Pricing Service** (Port 8080) - Product catalog and rate management
3. **FD Calculator Service** (Port 8084) - FD maturity calculations with customer categories
4. **FD Account Service** (Port 8086) - FD account lifecycle management with transactions
5. **Notification Service** (Port 8083) - Email and WhatsApp notifications
6. **Interest Batch Service** (Port 8081) - Batch interest processing
7. **Statement Service** (Port 8082, started separately) - FD account statements; omitted from root Compose
8. **Frontend** (Port 4200) - Angular web application

### Databases

- **FD Calculator DB** (Port 3307) - fd_calculator
- **Product DB** (Port 3308) - banking_product_db
- **Auth DB** (Port 3309) - auth_db
- **FD Group 9 MySQL** (Port 3310) - banking_technology_lab, fd_batch, fd_notifications, fd_statements

### Infrastructure

- **Kafka** (Ports 9092, 19092) - Event streaming for FD Account Service
- **Zookeeper** (Port 2181) - Required for Kafka

## Quick Start

### Option 1: Start Backend and Frontend Together (Recommended)

Run the complete startup script from the project root:

```bash
./start_all.sh
```

This script will:
- Build and start all backend microservices (via init_all_services.sh)
- Check/build the fd-python-base Docker image
- Install frontend dependencies if needed
- Start the Angular frontend development server
- Wait for all services to be ready
- Display access URLs for all services

**Important Note:** If the startup script fails, it is recommended to run it again. The Kafka container can take significant time to start up, especially after a PC restart. The script includes increased timeouts for Kafka (80 attempts / 4 minutes), but running the script again ensures all services have sufficient time to initialize properly.

### Option 2: Start Backend Only

Run the backend initialization script from the project root:

```bash
./init_all_services.sh
```

This script will:
- Build and start all Docker containers
- Wait for all services to become healthy
- Initialize databases with seed data
- Verify all services are running

**Important Note:** If the init script fails, it is recommended to run it again. The Kafka container can take significant time to start up, especially after a PC restart. The script includes increased timeouts for Kafka (80 attempts / 4 minutes), but running the script again ensures all services have sufficient time to initialize properly.

### Option 3: Start Frontend Only (After Backend is Running)

If you have already started the backend services:

```bash
cd "uno-frontend (1)/uno-frontend"
npm install
npm start
```

The frontend will be available at http://localhost:4200

### Verify Services are Running

Check that all services are healthy:

```bash
docker compose -f docker-compose.yml ps
```

Expected output should show all services as "Up" or "healthy".

### Test the Services

Run the smoke test to verify all services are working correctly:

```bash
python3 smoke_test.py
```

## Service Access URLs

After starting services, you can access them at:

- **Frontend**: http://localhost:4200
- **Auth Service**: http://localhost:8090
- **Product Service**: http://localhost:8080
- **Calculator Service**: http://localhost:8084
- **Account Service**: http://localhost:8086
- **Notification Service**: http://localhost:8083
- **Interest Batch Service**: http://localhost:8081
- **Mailpit Web UI** (Email Testing): http://localhost:8025

## Configuration

### Environment Variables

The following environment variables can be configured. The root Compose file contains development defaults; standalone services can require explicit values. You can set these in a `.env` file in the project root or pass them directly to docker-compose.

#### Database Configuration

```bash
# Default password for all databases (development only)
DB_PASSWORD=your_password_here

# MySQL root password
MYSQL_ROOT_PASSWORD=root_password_here
```

#### JWT Configuration

```bash
# Secret key for JWT signing (minimum 32 characters)
JWT_SECRET=test-secret-key-minimum-32-characters-for-hmac256

# JWT issuer
JWT_ISSUER=fd-platform-auth

# Shared JWT validation currently checks signature, issuer and timestamps, not audience.
# Compose defines service-specific audience values, but they are not enforced by JwtSupport.
```

#### Service Configuration

```bash
# Time travel feature for FD Account Service (for testing)
APP_TIME_TRAVEL_ENABLED=true

# Root Compose hardcodes Basic auth off for account and batch services.
# For a locally run process: APP_SECURITY_BASIC_ENABLED=false
```

#### Email Configuration (Optional)

```bash
# SMTP relay for email notifications
SMTP_RELAY_HOST=smtp.gmail.com
SMTP_RELAY_PORT=587
SMTP_RELAY_STARTTLS=true
SMTP_RELAY_AUTH=plain
SMTP_RELAY_USERNAME=your-email@gmail.com
SMTP_RELAY_PASSWORD=your-app-password
NOTIFY_EMAIL_FROM=noreply@fd-bank.local
```

#### WhatsApp Configuration (Optional - Twilio)

```bash
TWILIO_SID=your_twilio_sid
TWILIO_TOKEN=your_twilio_token
TWILIO_WHATSAPP_CONTENT_SID=your_content_sid
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
NOTIFY_WHATSAPP_MOCK_ONLY=true
```

### Service URLs (Internal)

These are configured in docker-compose.yml for service-to-service communication:

```bash
PRODUCT_SERVICE_URL=http://product-service:8080
CALCULATOR_SERVICE_URL=http://fd-calculator:8084
CUSTOMER_SERVICE_URL=http://fd-account-service:8086
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

### Stop All Services (Backend Only)

```bash
docker compose -f docker-compose.yml down
```

### Stop All Services Including Frontend

If you used `start_all.sh`, you'll need to stop the frontend separately:

```bash
# Stop backend
docker compose -f docker-compose.yml down

# Stop frontend (find the PID and kill it)
# Or press Ctrl+C in the terminal where start_all.sh is running
```

### Stop and Remove Volumes (Complete Cleanup)

```bash
docker compose -f docker-compose.yml down -v
```

This will remove all database data. Use with caution!

## Service Health Endpoints

The following services expose health endpoints:

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
(cd Auth_Sec/auth-service && mvn spring-boot:run)
```

2. **Product Service**:
```bash
(cd banking-product-backend && mvn spring-boot:run)
```

3. **Calculator Service**:
```bash
(cd "fd_calc/mod 4 backend" && mvn spring-boot:run)
```

4. **Account Service**:
```bash
(cd FD_Module_Group9/fd-account-service && mvn spring-boot:run)
```

5. **Frontend**:
```bash
cd "uno-frontend (1)/uno-frontend"
npm install
npm start
```

Note: You'll need to configure database connections in `application.properties` or `application.yml` for local development.

### Building JARs

Run in this order from the project root (Java 21 and Maven required):

```bash
mvn -f Auth_Sec/pom.xml clean install
mvn -f banking-product-backend/pom.xml clean package
mvn -f 'fd_calc/mod 4 backend/pom.xml' clean package
mvn -f FD_Module_Group9/pom.xml clean package
```

The first command installs the shared `security-common` library. The Group 9 reactor builds `event-common` before its services. Fix test failures before relying on the artifacts. Root Compose's auth and Group 9 Dockerfiles copy prebuilt JARs; rebuild these JARs after source changes, then rebuild the images.

There is no root Maven reactor. Local `spring-boot:run` commands must be run from the relevant module directory, in separate terminals; first install shared libraries (`mvn -f FD_Module_Group9/pom.xml -pl event-common -am install` for Group 9 consumers). Configure DB credentials, JWT secret/issuer, dependent service URLs and Kafka first. Against the root Docker broker, a host process must use `localhost:19092`.

Statement projection starts with the root Compose stack on port 8082. For host-based development, use the [statement service instructions](FD_Module_Group9/statement-service/backend.md#starting-the-service).

## API Documentation

For complete API documentation, see `endpoints.md` or `postman.md`.

Swagger/OpenAPI documentation is available for services that include it:

- **Product Service**: http://localhost:8080/swagger-ui.html
- **Calculator Service**: http://localhost:8084/swagger-ui/index.html
- **Account Service**: Springdoc is included, but `/swagger-ui.html` and `/v3/api-docs` require authentication under its security rules; use [endpoints.md](endpoints.md) for examples.

## Frontend Access

The Angular frontend is available at: http://localhost:4200

To start the frontend:
```bash
cd "uno-frontend (1)/uno-frontend"
npm install
npm start
```

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
4. Review FD_Module_Group9/docs/ARCHITECTURE_AND_DEPLOYMENT.md for architecture information
