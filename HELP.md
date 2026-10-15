# FD Microservices - Complete Help Guide

## Table of Contents
- [Project Overview](#project-overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Starting the Project](#starting-the-project)
- [Stopping the Project](#stopping-the-project)
- [Running Tests](#running-tests)
- [Testing Email Notifications](#testing-email-notifications)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)

---

## Project Overview

This project consists of 4 microservices for a Fixed Deposit (FD) banking system:

1. **Auth Service** (port 8090) - JWT token issuance and authentication
2. **Product & Pricing Service** (port 8080) - Product catalog and rate management
3. **FD Calculator Service** (port 8084) - FD maturity calculations
4. **FD Account Service** (port 8086) - FD account management with Kafka integration

### Infrastructure
- **MySQL Databases**: 3 separate databases (ports 3307, 3308, 3310)
- **Kafka**: Event streaming for interest processing (port 9092)
- **Zookeeper**: Kafka coordination (port 2181)

---

## Prerequisites

- Docker and Docker Compose installed
- Java 21 (for local development)
- Maven 3.8+ (for local development)
- Python 3 (for report generation and email testing)
- At least 4GB RAM available for Docker

---

## Quick Start

### 1. Start All Services

```bash
cd /home/ihitplayzyt/Downloads/BT_LAB
./init_all_services.sh
```

This script will:
- Build all Docker images
- Start all containers (services + databases + Kafka)
- Wait for services to be healthy
- Initialize databases with seed data
- Verify all services are running

### 2. Run Smoke Tests

```bash
python3 smoke_test.py
```

This tests all REST endpoints across all services.

### 3. Stop All Services

```bash
docker compose -f docker-compose.yml down
```

---

## Starting the Project

### Option 1: Using Initialization Script (Recommended)

```bash
cd /home/ihitplayzyt/Downloads/BT_LAB
./init_all_services.sh
```

### Option 2: Manual Start with Docker Compose

```bash
cd /home/ihitplayzyt/Downloads/BT_LAB

# Build and start all services
docker compose -f docker-compose.yml up -d --build

# Check status
docker compose -f docker-compose.yml ps

# View logs
docker compose -f docker-compose.yml logs -f
```

### Option 3: Start Individual Services

```bash
# Start only databases and Kafka
docker compose -f docker-compose.yml up -d fd-mysql product-mysql fd-group9-mysql kafka zookeeper

# Start backend services
docker compose -f docker-compose.yml up -d fd-auth-service product-service fd-calculator fd-account-service
```

### Service Health Checks

```bash
# Check all containers
docker compose -f docker-compose.yml ps

# Check specific service logs
docker compose -f docker-compose.yml logs fd-account-service
docker compose -f docker-compose.yml logs product-service
docker compose -f docker-compose.yml logs fd-calculator
docker compose -f docker-compose.yml logs fd-auth-service
```

---

## Stopping the Project

### Stop All Services

```bash
docker compose -f docker-compose.yml down
```

### Stop and Remove Volumes (Complete Reset)

```bash
docker compose -f docker-compose.yml down -v
```

### Stop Specific Services

```bash
# Stop only backend services
docker compose -f docker-compose.yml stop fd-account-service product-service fd-calculator fd-auth-service

# Stop only databases
docker compose -f docker-compose.yml stop fd-mysql product-mysql fd-group9-mysql
```

---

## Running Tests

### Smoke Tests

The smoke test script tests all REST endpoints:

```bash
cd /home/ihitplayzyt/Downloads/BT_LAB
python3 smoke_test.py
```

**Test Coverage:**
- Auth Service: Login endpoints
- Product Service: Product CRUD, validation, rate calculation
- Calculator Service: FD calculations, comparisons, cache management
- Account Service: Account management, interest, reports, integration endpoints

### Manual API Testing

#### Test Auth Service

```bash
# Login as admin
curl -X POST http://localhost:8090/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin1","password":"admin123"}'
```

#### Test FD Account Service (HTTP Basic Auth)

```bash
# Health check
curl -u admin1:admin123 http://localhost:8086/health

# Get interest quote
curl -u admin1:admin123 http://localhost:8086/api/fd/interest/quote \
  -H "Content-Type: application/json" \
  -d '{"principal":10000,"annualRate":7.5,"months":12,"mode":"COMPOUND"}'
```

#### Test Product Service (requires JWT)

```bash
# Get token first
TOKEN=$(curl -s -X POST http://localhost:8090/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin1","password":"admin123"}' | jq -r '.accessToken')

# Use token
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/products/active
```

---

## Testing Email Notifications

### Prerequisites

For actual email sending, configure SMTP in the notification service:

```bash
# Set environment variables or update docker-compose.yml
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USERNAME=ihitexe@gmail.com
export SMTP_PASSWORD=your-app-password
export NOTIFY_EMAIL_FROM=noreply@securebank.com
```

**Note:** For Gmail, use an App Password instead of your regular password:
1. Go to Google Account Settings
2. Enable 2-Factor Authentication
3. Generate an App Password for mail

### Test Email Sending with Python Script

```bash
cd /home/ihitplayzyt/Downloads/BT_LAB
python3 test_email_notification.py
```

This script will:
1. Create a test FD account
2. Trigger email notifications (FD created, interest paid, maturity)
3. Send emails to ihitexe@gmail.com
4. Verify email delivery

### Email Templates

The system sends HTML-formatted emails for:

1. **FD Created** - When a new FD account is opened
   - Gradient purple header
   - Account details (number, principal, rate, tenure, maturity date)
   - Professional formatting

2. **Interest Paid** - When interest is credited
   - Gradient green header
   - Transaction details (account, amount, date)
   - Professional formatting

3. **FD Matured** - When FD reaches maturity
   - Gradient pink header
   - Maturity details (interest earned, maturity amount)
   - Success notification banner

4. **Prematurely Closed** - When FD is closed early
   - Gradient red header
   - Closure details (interest, penalty, net amount)
   - Warning banner

### Mock Email Mode (Default)

By default, emails are in mock mode (no actual sending). Logs will show:

```
[MOCK EMAIL] to=***@gmail.com subject=Your Fixed Deposit FD001 has been opened
[MOCK EMAIL BODY START]
<!DOCTYPE html>...
[MOCK EMAIL BODY END]
```

To enable actual email sending, set `notify.email.mock-only=false` in the notification service configuration.

---

## API Endpoints

### Auth Service (http://localhost:8090)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/login | Login and get JWT token | None |

### Product Service (http://localhost:8080)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/products/active | Get active products | JWT |
| GET | /api/v1/products/active?type=FD | Get FD products | JWT |
| GET | /api/v1/products/search | Search products | JWT |
| GET | /api/v1/products/{code} | Get product by code | JWT |
| GET | /api/v1/products/{code}/validate | Validate product | JWT |
| POST | /api/v1/products/{code}/rate | Calculate rate | JWT |

### Calculator Service (http://localhost:8084)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /actuator/health | Health check | None |
| POST | /api/v1/fd/calculations | Calculate maturity | JWT |
| POST | /api/v1/fd/calculations/compare | Compare calculations | JWT |
| GET | /api/v1/fd/products/{code}/preview | Preview product | JWT |
| POST | /api/v1/fd/calculations/custom | Custom calculation | JWT |
| POST | /api/v1/fd/cache/rates/evict | Evict cache | JWT |

### Account Service (http://localhost:8086)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /health | Health check | Basic |
| POST | /api/fd/account/create | Create FD account | Basic |
| POST | /api/fd/account/create-with-txn | Create with initial deposit | Basic |
| GET | /api/fd/account/{id} | Get FD account | Basic |
| POST | /api/fd/interest/quote | Interest quote | Basic |
| GET | /api/fd/interest/accounts | Get interest accounts | Basic |
| GET | /api/fd/clock | Clock status | Basic |
| POST | /api/fd/clock/advance | Advance clock | Basic |
| GET | /api/report/fd-summary | FD summary report | Basic |
| GET | /api/report/customer-portfolio | Customer portfolio | Basic |
| GET | /api/report/maturity-summary | Maturity summary | Basic |

### Chart Endpoints (http://localhost:8086/api/charts)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/charts/portfolio-summary | Portfolio chart data | Basic |
| GET | /api/charts/fd-summary/{status} | FD summary by status | Basic |
| GET | /api/charts/maturity-timeline | Maturity timeline | Basic |
| GET | /api/charts/interest-history/{fdAccountNo} | Interest history | Basic |
| GET | /api/charts/portfolio-distribution | Portfolio distribution | Basic |

---

## Test Credentials

| Username | Password | Roles |
|----------|----------|-------|
| admin1 | admin123 | ADMIN |
| officer1 | officer123 | BANK_OFFICER |
| customer1 | customer123 | CUSTOMER |

---

## Troubleshooting

### Port Conflicts

If ports are already in use, modify the port mappings in `docker-compose.yml`:

```yaml
ports:
  - "8086:8086"  # Change to "8087:8086" if 8086 is in use
```

### Database Connection Issues

Check that MySQL containers are healthy:

```bash
docker compose -f docker-compose.yml ps
```

If databases are not healthy, restart them:

```bash
docker compose -f docker-compose.yml restart fd-mysql product-mysql fd-group9-mysql
```

### Kafka Issues

Kafka doesn't have a healthcheck but should start within 30 seconds. Check logs:

```bash
docker compose -f docker-compose.yml logs kafka
```

### JWT Authentication Failures

Ensure JWT_SECRET and JWT_ISSUER are consistent across all services in `docker-compose.yml`.

### Services Not Starting

Check logs for errors:

```bash
docker compose -f docker-compose.yml logs <service-name>
```

Common issues:
- Out of memory - increase Docker memory allocation
- Port conflicts - change port mappings
- Database not ready - check MySQL health status

### Rebuild Services

If you make code changes, rebuild the affected service:

```bash
docker compose -f docker-compose.yml up -d --build <service-name>
```

### View All Logs

```bash
# All services
docker compose -f docker-compose.yml logs -f

# Specific service
docker compose -f docker-compose.yml logs -f fd-account-service
```

---

## Project Structure

```
BT_LAB/
├── docker-compose.yml              # Docker orchestration
├── init_all_services.sh            # Initialization script
├── smoke_test.py                   # Smoke test script
├── test_email_notification.py     # Email testing script
├── fd_calc/                       # FD Calculator Service
├── product&pricing module/        # Product & Pricing Service
└── FD_Module_Group9/              # FD Account Service + Auth + Notification
    ├── auth-service/
    ├── fd-account-service/
    ├── notification-service/
    ├── interest-batch-service/
    └── reports/python/
```

---

## Additional Features

### Chart Data for Frontend

The `/api/charts/*` endpoints provide JSON data for frontend visualization:

- Portfolio summary with account counts and totals
- FD distribution by status and currency
- Maturity timeline
- Interest history charts
- Portfolio distribution (pie/donut chart friendly)

### Enhanced Reports

The Python report generator creates:
- JSON summary data
- SVG charts with:
  - Bar charts with account count badges
  - Donut/pie charts
  - Color-coded status indicators
  - Summary statistics header

### HTML Email Templates

All email notifications now use professional HTML templates with:
- Gradient headers with emojis
- Structured info boxes
- Color-coded sections
- Proper data injection
- Mobile-responsive design

---

## Support

For issues or questions:
1. Check the logs: `docker compose -f docker-compose.yml logs <service>`
2. Review this HELP.md
3. Check service health: `docker compose -f docker-compose.yml ps`
