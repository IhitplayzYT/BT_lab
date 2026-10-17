# Banking Technology Lab - Complete Help Guide

## Table of Contents
- [Project Overview](#project-overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Starting the Project](#starting-the-project)
- [Stopping the Project](#stopping-the-project)
- [Running Tests](#running-tests)
- [Testing Email Notifications](#testing-email-notifications)
- [API Endpoints](#api-endpoints)
- [Frontend Application](#frontend-application)
- [Troubleshooting](#troubleshooting)

---

## Project Overview

This project consists of 5 microservices for a Fixed Deposit (FD) banking system:

1. **Auth Service** (port 8090) - JWT token issuance and authentication
2. **Product & Pricing Service** (port 8080) - Product catalog and rate management
3. **FD Calculator Service** (port 8084) - FD maturity calculations
4. **FD Account Service** (port 8086) - FD account management with Kafka integration
5. **Frontend** (port 4200) - Angular web application for all user roles

### Infrastructure
- **MySQL Databases**: 4 separate databases (ports 3307, 3308, 3309, 3310)
- **Kafka**: Event streaming for interest processing (port 9092)
- **Zookeeper**: Kafka coordination (port 2181)

### User Roles
- **CUSTOMER** - Can apply for FDs, view own applications, view own portfolio
- **BANK_OFFICER** - Can create FDs, approve/reject applications, view all data
- **ADMIN** - Full access including system configuration, reports, and time-travel testing

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

For complete API documentation, see `postman.md`. Key endpoints include:

### Auth Service (http://localhost:8090)
- POST /api/auth/signup - Create new user (CUSTOMER role)
- POST /api/auth/login - Login and get JWT token
- POST /api/auth/refresh - Refresh access token
- POST /api/auth/logout - Logout and invalidate token

### Product Service (http://localhost:8080)
- GET /api/v1/products/active - Get active products
- GET /api/v1/products/{code} - Get product by code
- GET /api/v1/products/{code}/validate - Validate product
- POST /api/v1/products/{code}/rate - Calculate rate
- POST /api/v1/products - Create product (ADMIN)
- PUT /api/v1/products/{code} - Update product (BANK_OFFICER, ADMIN)
- DELETE /api/v1/products/{code} - Retire product (ADMIN)

### Calculator Service (http://localhost:8084)
- POST /api/v1/fd/calculations - Calculate FD maturity
- POST /api/v1/fd/calculations/compare - Compare multiple FDs
- GET /api/v1/fd/calculations/{id} - Get saved calculation
- POST /api/v1/fd/calculations/custom - Custom calculation
- GET /api/v1/fd/products/{code}/preview - Preview product constraints
- POST /api/v1/fd/batch/calculations - Batch calculations

### Account Service (http://localhost:8086)
- POST /api/fd/account/create - Create FD account (BANK_OFFICER, ADMIN)
- POST /api/fd/account/apply - Apply for FD (CUSTOMER)
- POST /api/fd/account/approve - Approve/reject application (BANK_OFFICER, ADMIN)
- GET /api/fd/account/pending - Get pending applications (BANK_OFFICER, ADMIN)
- GET /api/fd/account/my-applications - Get my applications (CUSTOMER)
- GET /api/fd/account/{id} - Get FD account details
- GET /api/fd/account/{id}/transactions - Get transaction history
- GET /api/fd/account/{id}/withdrawal-inquiry - Withdrawal inquiry
- POST /api/fd/account/{id}/withdrawal - Perform early withdrawal
- POST /api/fd/interest/quote - Interest quote
- POST /api/fd/maturity/run - Manual maturity run (ADMIN)

### Report Endpoints (http://localhost:8086/api/report)
- GET /fd-summary?status={status}&format={format} - FD summary by status
- GET /customer-portfolio?customerId={id}&format={format} - Customer portfolio
- GET /maturity-summary?days={days}&format={format} - Maturity timeline
- GET /interest-history/{fdAccountNo}?format={format} - Interest history
- POST /extract/run?businessDate={date} - Run data extract (ADMIN)
- POST /python?businessDate={date} - Generate Python report with charts (ADMIN)

**Supported Formats:** json, csv, pdf, xlsx

**Example Downloads:**
```bash
# Download FD summary as PDF
curl -u admin1:admin123 "http://localhost:8086/api/report/fd-summary?status=ACTIVE&format=pdf" -o fd-summary.pdf

# Download customer portfolio as Excel
curl -u admin1:admin123 "http://localhost:8086/api/report/customer-portfolio?customerId=CUST001&format=xlsx" -o portfolio.xlsx

# Download maturity summary as CSV
curl -u admin1:admin123 "http://localhost:8086/api/report/maturity-summary?days=30&format=csv" -o maturity.csv
```

### Chart Endpoints (http://localhost:8086/api/charts)
- GET /portfolio-summary - Portfolio chart data
- GET /fd-summary/{status} - FD summary by status
- GET /maturity-timeline - Maturity timeline
- GET /interest-history/{fdAccountNo} - Interest history chart
- GET /portfolio-distribution - Portfolio distribution

---

## Advanced Reports and Visualizations

### Enhanced Python Report Generator

The Python report generator (`reports/python/generate_fd_report.py`) creates comprehensive financial reports with:

**Visual Components:**
- **Gradient Header** - Professional branding with report title and timestamp
- **Summary Cards** - 4 KPI cards showing Total Accounts, Total Principal, Accrued Interest, and Currencies
- **Horizontal Bar Charts** - Principal distribution by status with percentage indicators
- **Interest Distribution Charts** - Visual breakdown of accrued interest
- **Donut Charts** - Account distribution with center text showing total
- **Detailed Tables** - Status breakdown with accounts, principal, interest, and average per account
- **Color-coded Status** - ACTIVE (blue), MATURED (green), PREMATURELY_CLOSED (red)

**Output Files:**
- `fd_report_<date>.json` - Structured data for programmatic access
- `fd_report_<date>.svg` - Enhanced visualization with multiple chart types

### PDF and Excel Export

All report endpoints support multiple output formats:

**PDF Features:**
- Landscape orientation for better table display
- Professional formatting with headers and footers
- Color-coded status indicators
- Proper number alignment for financial data

**Excel Features:**
- Bold headers for easy identification
- Numeric values preserved as numbers (not text)
- Fixed column widths for readability
- Multiple sheets can be generated

**Frontend Download Methods:**
```typescript
// Download reports from frontend
apiClient.downloadFdSummary('ACTIVE', 'pdf').subscribe(blob => {
  apiClient.downloadFile(blob, 'fd-summary.pdf');
});

apiClient.downloadCustomerPortfolio(null, 'xlsx').subscribe(blob => {
  apiClient.downloadFile(blob, 'portfolio.xlsx');
});
```

**Supported Formats:**
- `json` - Default, returns raw data
- `csv` - Comma-separated values for data import
- `pdf` - Professional PDF document with formatting
- `xlsx` - Excel spreadsheet with formulas support

---

## Test Credentials

Create users via signup endpoint. Staff accounts should be created via seed data or admin operations.

---

## Frontend Application

The Angular frontend provides a web interface for all user roles at `http://localhost:4200`

### Available Routes
- `/` - Landing page with product information
- `/login` - Customer login
- `/signup` - Customer signup
- `/admin-login` - Admin login
- `/admin-signup` - Admin signup
- `/officer-login` - Bank Officer login
- `/officer-signup` - Bank Officer signup
- `/dashboard` - Customer dashboard (view FDs, apply for new FDs)
- `/admin` - Admin panel (product management, reports)
- `/officer` - Bank Officer panel (approve applications, manage FDs)
- `/apply-fd` - Apply for FD (customer)
- `/terms` - Terms of service
- `/privacy` - Privacy policy

### Frontend Features
- Customer: Apply for FDs, view applications, view portfolio, FD calculator
- Bank Officer: Approve/reject applications, create FDs, view all accounts
- Admin: Product management, reports, system configuration

---

## Email Notification Service

The project includes a **Notification Service** that sends emails to customers for FD lifecycle events.

### Supported Events

The notification service listens to Kafka events and sends emails for:

1. **FdCreated** - When a customer's FD account is created
2. **InterestPaid** - When interest is credited to the FD account
3. **FdMatured** - When the FD reaches maturity
4. **FdPrematurelyClosed** - When the FD is closed before maturity

### Email Templates

Professional HTML email templates with:
- Gradient headers (purple for creation, green for interest, pink for maturity, red for early closure)
- Account details in styled info boxes
- Professional formatting and branding

### Current Status

**Important**: The notification service is NOT included in the main `docker-compose.yml`. It runs separately.

By default, the service runs in **mock mode** - it logs email content to the console but doesn't actually send emails.

### Activating Email Notifications

#### Option 1: Use the Setup Script (Recommended for Gmail)

```bash
cd /home/ihitplayzyt/Downloads/BT_LAB
chmod +x setup_email.sh
./setup_email.sh
```

The script will:
1. Prompt for your Gmail App Password
2. Configure SMTP settings
3. Start the notification service on port 8083

**Prerequisites for Gmail:**
- Enable 2-Factor Authentication on your Google Account
- Generate an App Password at https://myaccount.google.com/apppasswords
- Select "Mail" and "Other (Custom name)"

#### Option 2: Manual Configuration

1. **Build the notification service:**
```bash
cd /home/ihitplayzyt/Downloads/BT_LAB/FD_Module_Group9
./mvnw clean package -pl notification-service
```

2. **Set environment variables:**
```bash
export SPRING_MAIL_HOST=smtp.gmail.com
export SPRING_MAIL_PORT=587
export SPRING_MAIL_USERNAME=your-email@gmail.com
export SPRING_MAIL_PASSWORD=your-app-password
export SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH=true
export SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE=true
export NOTIFY_EMAIL_FROM=noreply@securebank.com
export NOTIFY_EMAIL_MOCK_ONLY=false
export DB_PASSWORD=12345
export SERVICE_DB_URL=jdbc:mysql://localhost:3310/banking_technology_lab?serverTimezone=Asia/Kolkata
export KAFKA_BOOTSTRAP_SERVERS=localhost:9092
```

3. **Start the service:**
```bash
cd /home/ihitplayzyt/Downloads/BT_LAB/FD_Module_Group9
java -jar notification-service/target/notification-service-1.0.0.jar
```

### Testing Email Notifications

Run the test script to verify email functionality:
```bash
python3 test_email_notification.py
```

This script:
- Tests authentication
- Creates a test FD account
- Triggers notification events
- Checks notification logs

### Viewing Notification Logs

The notification service logs all email attempts to the `notifications_log` table in the database. You can query it to see:
- Event type
- Recipient (masked for privacy)
- Subject and body
- Status (SENT, MOCKED, FAILED)
- Error messages (if any)

### Mock Mode (For Testing)

To run in mock mode without actual email sending:
```bash
export NOTIFY_EMAIL_MOCK_ONLY=true
```

In mock mode, emails are logged to the console with `[MOCK EMAIL]` prefix and stored as `MOCKED` status in the database.

### Kafka Topics Used

The notification service consumes from these Kafka topics:
- `event.fd.created` - FD creation events
- `event.interest.paid` - Interest payment events
- `event.fd.matured` - Maturity events
- `event.fd.prematurely-closed` - Early closure events

### Troubleshooting

**Emails not being sent:**
- Check if notification service is running on port 8083
- Verify SMTP credentials are correct
- Check if `NOTIFY_EMAIL_MOCK_ONLY` is set to `false`
- Review notification service logs

**Events not being received:**
- Ensure Kafka is running on port 9092
- Check if FD Account Service is publishing events
- Verify Kafka topics exist

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
├── Auth_Sec/                       # Auth Service
│   ├── auth-service/
│   └── security-common/
├── banking-product-backend/       # Product & Pricing Service
├── fd_calc/                        # FD Calculator Service
│   └── mod 4 backend/
├── FD_Module_Group9/              # FD Account Service + related services
│   ├── fd-account-service/
│   ├── notification-service/
│   ├── interest-batch-service/
│   ├── statement-service/
│   └── reports/python/
└── uno-frontend/                  # Angular Frontend
    └── src/app/
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
