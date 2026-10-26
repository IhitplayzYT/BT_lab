# UNO Bank - Fixed Deposit Management System

A comprehensive microservices-based banking platform for Fixed Deposit (FD) account management, built with modern technologies and industry best practices.

> Startup scope: root `docker-compose.yml` starts six Java services; `statement-service` is separate. Group 9 and auth Docker images copy prebuilt JARs. Use the full Maven build in [usage.md](usage.md#building-jars), especially on a fresh checkout. `init_all_services.sh` rebuilds auth, product, calculator, account and notification modules but omits the batch JAR needed by Compose. Rebuilding an image alone does not compile changed Group 9/auth Java code.

## Table of Contents

- [Overview](#overview)
- [Product Features](#product-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Why This System](#why-this-system)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)

## Overview

UNO Bank is a complete Fixed Deposit management system that enables customers to apply for, manage, and track their FD investments. The system supports multiple user roles (Customers, Bank Officers, and Admins) with role-based access control, real-time calculations, automated interest processing, and comprehensive reporting.

### Key Capabilities

- **Multi-Role Access**: Customer, Bank Officer, and Admin interfaces
- **FD Lifecycle Management**: Application, approval, maturity, and premature closure
- **Real-time Calculations**: Interest calculations with customer category benefits
- **Automated Processing**: Scheduled interest accrual and maturity processing
- **Multi-Channel Notifications**: Email alerts for FD lifecycle events
- **Comprehensive Reporting**: PDF, Excel, CSV exports with visualizations
- **Event-Driven Architecture**: Kafka-based asynchronous communication
- **Time Travel Testing**: Business date manipulation for testing scenarios

## Product Features

### For Customers

- **FD Application**: Apply for new FD accounts with detailed applicant information
- **Portfolio Management**: View all FD investments, balances, and maturity dates
- **FD Calculator**: Compare different products and tenures before investing
- **Transaction History**: Track all transactions on FD accounts
- **Interest Tracking**: Monitor accrued and posted interest
- **Notifications**: Receive email and WhatsApp alerts for FD events

### For Bank Officers

- **Application Approval**: Review and approve/reject customer FD applications
- **Direct Account Creation**: Create FD accounts directly for customers
- **Account Management**: View all customer accounts and transactions
- **Interest Monitoring**: View interest accounts; changing calculation mode requires ADMIN
- **Reports Generation**: Generate FD summary, portfolio, and maturity reports
- **Withdrawal Processing**: Handle premature withdrawal requests

### For Administrators

- **Product Management**: Create, update, and retire FD products
- **Rate Configuration**: Set base rates, term limits, and category modifiers
- **Batch Processing**: Submit and monitor interest batch jobs
- **System Configuration**: Manage time travel, security settings
- **Advanced Reports**: Generate Python reports with visualizations
- **User Management**: Create and manage user accounts and roles

### System Features

- **OTP-Based Signup**: Secure customer registration with email verification
- **JWT Authentication**: Token-based authentication with role-based access
- **Event-Driven Notifications**: Kafka-powered email and WhatsApp alerts
- **Multi-Format Reports**: JSON, CSV, PDF, and Excel exports
- **Chart Data APIs**: JSON endpoints for frontend visualizations
- **Business Clock**: Time travel feature for testing and demonstrations
- **Idempotent Operations**: Safe retry mechanisms for batch processing

## Technology Stack

### Backend Services

| Service | Technology | Port |
|---------|-----------|------|
| Auth Service | Java 21, Spring Boot 3.x, Spring Security | 8090 |
| Product & Pricing Service | Java 21, Spring Boot 3.x | 8080 |
| FD Calculator Service | Java 21, Spring Boot 3.x | 8084 |
| FD Account Service | Java 21, Spring Boot 3.x | 8086 |
| Notification Service | Java 21, Spring Boot 3.x | 8083 |
| Interest Batch Service | Java 21, Spring Boot 3.x | 8081 |
| Statement Service | Java 21, Spring Boot 3.x | 8082 |

### Databases

- **MySQL 8.0** - Four server containers with separate service schemas for data isolation
  - FD Calculator DB (port 3307)
  - Product DB (port 3308)
  - Auth DB (port 3309)
  - FD Account DB (port 3310)

### Infrastructure

- **Docker & Docker Compose** - Container orchestration
- **Confluent Platform Kafka image 7.5.0** - Event streaming for async communication
- **Zookeeper** - Kafka coordination
- **Mailpit** - Email testing and SMTP relay
- **Python 3.8+** - Report generation scripts

### Frontend

- **Angular 22.2** - Single Page Application
- **TypeScript** - Type-safe development
- **RxJS** - Reactive programming
- **SCSS** - Shared theme tokens and component styles

### Build Tools

- **Maven 3.8+** - Java dependency management
- **npm 9+** - Node.js package management
- **Docker BuildKit** - Multi-stage Docker builds

## Architecture

### Microservices Design

The system follows a microservices architecture where each service owns its database and communicates via well-defined APIs and events:

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Angular)                       │
│                      Port 4200                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP (JWT)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway (Future)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Auth Service │ │Product Svc   │ │Calculator Svc│
│   :8090      │ │   :8080      │ │   :8084      │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       │                │                │
       ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Auth DB     │ │ Product DB   │ │Calculator DB │
│   :3309      │ │   :3308      │ │   :3307      │
└──────────────┘ └──────────────┘ └──────────────┘

┌─────────────────────────────────────────────────────────────┐
│              FD Account Service :8086                        │
│  - Account Management                                       │
│  - Interest Processing                                      │
│  - Maturity Handling                                        │
│  - Reports & Charts                                         │
└──────┬──────────────────────────────────────────────────────┘
       │
       │ Kafka Events
       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Kafka :9092                               │
│  Topics:                                                   │
│  - event.fd.created                                        │
│  - event.fd.matured                                        │
│  - event.interest.accrued                                  │
│  - event.interest.paid                                     │
│  - command.interest.accrual                                │
│  - command.interest.payout                                 │
└──────┬──────────────────────────────────────────────────────┘
       │
       ├──────────────────┬──────────────────┬──────────────────┐
       ▼                  ▼                  ▼                  ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│Notification  │ │Statement Svc │ │Interest Batch│ │  FD Account  │
│   :8083      │ │   :8082      │ │   :8081      │ │     DB       │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │                │
       │ SMTP/WhatsApp  │                │                │
       ▼                ▼                ▼                │
┌──────────────┐ ┌──────────────┐ ┌──────────────┐                │
│ Gmail/Twilio │ │Statement DB  │ │Batch DB      │                │
│              │ │   :3310      │ │   :3310      │                │
└──────────────┘ └──────────────┘ └──────────────┘                │
                                                                  │
                                                                  ▼
                                                          ┌──────────────┐
                                                          │ FD Account DB │
                                                          │   :3310      │
                                                          └──────────────┘
```

### Event-Driven Communication

Services communicate asynchronously via Kafka events using the **Outbox Pattern** for reliability:

1. **Transactional Outbox**: Events are written to an `event_outbox` table in the same transaction as the business data
2. **Relay Publisher**: A background process publishes pending outbox events to Kafka every 3 seconds
3. **Idempotent Consumers**: Each consumer records processed event IDs to handle duplicate delivery
4. **Dead Letter Topics**: Failed messages are retried and then moved to DLT topics for inspection

### Security Model

- **JWT Authentication**: HS256-signed tokens with shared secret
- **Role-Based Access Control**: CUSTOMER, BANK_OFFICER, ADMIN roles
- **Ownership Enforcement**: Customers can only access their own FDs
- **Rate Limiting**: 5 failed login attempts locks account for 60 seconds
- **Input Validation**: DTO constraints and service-specific business validation
- **SQL Injection Prevention**: Parameterized queries throughout

## Why This System

### Business Value

1. **Customer Experience**: Self-service FD application and portfolio management
2. **Operational Efficiency**: Automated interest processing and maturity handling
3. **Risk Management**: Proper ledger accounting with double-entry bookkeeping
4. **Compliance**: Audit trails, transaction logs, and statement generation
5. **Scalability**: Microservices can scale independently based on load
6. **Flexibility**: Product configuration without code changes

### Technical Benefits

1. **Resilience**: Separate services and an outbox reduce coupling; synchronous dependencies can still fail
2. **Maintainability**: Clear service boundaries and single responsibility
3. **Testability**: Independent testing of each service
4. **Observability**: Service logs plus health/metrics endpoints where configured
5. **Deployability**: Independent deployment and versioning
6. **Extensibility**: Easy to add new services or features

## How It Works

### FD Application Flow

1. **Customer applies for FD** via frontend with product selection, amount, and tenure
2. **Application stored** in FD Account Service database with PENDING status
3. **Bank Officer reviews** application and approves/rejects
4. **On approval**, FD account is created with initial deposit transaction
5. **Kafka event** `event.fd.created` is published
6. **Notification Service** consumes event and sends email/WhatsApp to customer

### Interest Processing Flow

1. **Daily at 03:00 IST**, Interest Batch Service submits accrual request to Kafka
2. **FD Account Service** consumes request, calculates interest for each FD
3. **Daily accrual recorded** in the interest sub-ledger and `event.interest.accrued` published; GL entries occur on capitalization/payout
4. **Statement Service** consumes event and updates customer statements
5. **Notification Service** batches recent accrual emails; payment events have separate notifications

### Maturity Processing Flow

1. **Daily at 04:00 IST**, FD Account Service checks for matured FDs
2. **Matured FDs** are marked and payout transaction created
3. **Event `event.fd.matured`** published
4. **Notification Service** sends maturity notification to customer
5. **Settlement represented** by GL entries; no external bank transfer is executed

### Withdrawal Flow

1. **Customer requests withdrawal** via frontend
2. **System calculates** penalty and net payout amount
3. **Customer confirms** withdrawal
4. **FD marked as PREMATURELY_CLOSED**
5. **Penalty deducted** and net payout settled
6. **Event `event.fd.prematurely-closed`** published
7. **Notification Service** sends closure notification

## Project Structure

```text
BT_LAB/
├── Auth_Sec/                    # auth-service and security-common
├── banking-product-backend/     # Product & Pricing, embedded legacy calculator
├── fd_calc/mod 4 backend/       # Dedicated FD calculator
├── FD_Module_Group9/            # Account, batch, notification, statement, event-common
├── uno-frontend (1)/uno-frontend/ # Active Angular app
├── docker-compose.yml          # Integrated backend stack
├── init_all_services.sh         # Backend startup
├── start_all.sh                 # Backend and frontend startup
├── smoke_test.py                # Integrated smoke checks
└── tests/                      # Additional validation scripts
```

## Getting Started

### Prerequisites

- Docker 20.10+ and Docker Compose 2.0+
- Java 21 (for startup scripts and local builds)
- Maven 3.8+ (for startup scripts and local builds)
- Node.js 22.22.3 (or another version matching `^22.22.3 || ^24.15.0 || >=26.0.0`) and npm 9+ (for frontend)
- Python 3.8+ (for report generation)
- At least 8GB RAM available
- Ports 4200, 8080-8086, 8090, 3307-3310, 9092, 19092, 2181 available

### Quick Start

#### Option 1: Start Everything (Recommended)

```bash
# Run from the project root
./start_all.sh
```

This starts the root Compose services and the frontend; statements require a separate process.

**Important:** If the script fails, run it again. The Kafka container can take significant time to start up, especially after a PC restart.

#### Option 2: Start Backend Only

```bash
# Run from the project root
./init_all_services.sh
```

Then start the frontend separately:

```bash
cd "uno-frontend (1)/uno-frontend"
npm install
npm start
```

### Verify Services

```bash
# Check all containers
docker compose -f docker-compose.yml ps

# Run smoke tests
python3 smoke_test.py
```

### Access URLs

- **Frontend**: http://localhost:4200
- **Auth Service**: http://localhost:8090
- **Product Service**: http://localhost:8080
- **Calculator Service**: http://localhost:8084
- **Account Service**: http://localhost:8086
- **Notification Service**: http://localhost:8083
- **Interest Batch Service**: http://localhost:8081
- **Mailpit Web UI**: http://localhost:8025

For detailed setup instructions, see [usage.md](usage.md).

## Documentation

### Core Documentation

- **[usage.md](usage.md)** - Complete usage guide, configuration, and troubleshooting
- **[endpoints.md](endpoints.md)** - Comprehensive API endpoint documentation
- **[postman.md](postman.md)** - Postman/curl request guide (not an importable collection)
- **[HELP.md](HELP.md)** - Detailed help guide with examples

### Architecture & Design

- **[FD_Module_Group9/docs/ARCHITECTURE_AND_DEPLOYMENT.md](FD_Module_Group9/docs/ARCHITECTURE_AND_DEPLOYMENT.md)** - System architecture, data model, test plan, and deployment strategy
- **[FD_Module_Group9/docs/API_CONTRACTS.md](FD_Module_Group9/docs/API_CONTRACTS.md)** - REST API contracts and specifications
- **[FD_Module_Group9/docs/EVENT_CONTRACTS.md](FD_Module_Group9/docs/EVENT_CONTRACTS.md)** - Kafka event contracts and schemas
- **[FD_Module_Group9/docs/HANDOVER.md](FD_Module_Group9/docs/HANDOVER.md)** - Project handover documentation

### API Documentation

Swagger/OpenAPI documentation is available for:
- **Product Service**: http://localhost:8080/swagger-ui.html
- **Calculator Service**: http://localhost:8084/swagger-ui/index.html
- **Account Service**: Springdoc is included, but `/swagger-ui.html` and `/v3/api-docs` require authentication under its security rules; use [endpoints.md](endpoints.md) for examples.

## Development

### Local Development (Without Docker)

Each service can be run locally for development:

```bash
# Auth Service
(cd Auth_Sec/auth-service && mvn spring-boot:run)

# Product Service
(cd banking-product-backend && mvn spring-boot:run)

# Calculator Service
(cd "fd_calc/mod 4 backend" && mvn spring-boot:run)

# Account Service
(cd FD_Module_Group9/fd-account-service && mvn spring-boot:run)

# Frontend
cd "uno-frontend (1)/uno-frontend"
npm install
npm start
```

### Building Services

There is no root `pom.xml`. Run the ordered Maven commands in [usage.md](usage.md#building-jars), installing `Auth_Sec/security-common` before building its consumers. Group 9 Docker images use the resulting `target` JARs.

### Code Structure

Each service follows standard Spring Boot structure:
- `controller/` - REST endpoints
- `service/` - Business logic
- `repository/` - Data access layer
- `model/` - Domain entities and DTOs
- `config/` - Spring configuration
- `exception/` - Custom exceptions

## Testing

### Unit and integration tests

From the project root, after building the shared dependencies:

```bash
mvn -f Auth_Sec/pom.xml test
mvn -f banking-product-backend/pom.xml test
mvn -f 'fd_calc/mod 4 backend/pom.xml' test
mvn -f FD_Module_Group9/pom.xml verify
```

These are commands to run, not a statement that the current worktree passes every suite.

### Smoke Tests

```bash
# Run API smoke tests
python3 smoke_test.py
```

### End-to-End Tests

`FD_Module_Group9/scripts/lifecycle-test.ps1` is a historical standalone harness. It assumes the older layout/auth service and requires adaptation for the root stack; its old pass count is not current evidence. Use the root smoke/API scripts for integrated checks.

## Deployment

### Docker Deployment

```bash
# Build and start all services
docker compose -f docker-compose.yml up -d --build

# Stop all services
docker compose -f docker-compose.yml down

# Stop and remove volumes (complete cleanup)
docker compose -f docker-compose.yml down -v
```

### Azure Deployment (Planned)

See [ARCHITECTURE_AND_DEPLOYMENT.md](FD_Module_Group9/docs/ARCHITECTURE_AND_DEPLOYMENT.md#7-deployment) for the Azure deployment plan including:
- Azure Container Registry for images
- Azure Container Apps for services
- Azure Database for MySQL
- Azure Event Hubs for Kafka
- Azure Key Vault for secrets

## Security Considerations

### Current Implementation

- JWT tokens with HS256 signing
- Role-based access control (RBAC)
- Rate limiting on login attempts
- DTO and service-level input validation
- SQL injection prevention via parameterized queries
- Password hashing with BCrypt

### Production Recommendations

- Use HTTPS for all communications
- Rotate JWT secrets regularly
- Use a proper secrets manager (e.g., Azure Key Vault)
- Enable audit logging
- Implement API rate limiting
- Use production-grade SMTP provider
- Configure proper Twilio credentials for WhatsApp
- Enable database encryption at rest
- Implement network policies between services

## Contributing

### Development Workflow

1. Create a feature branch from `main`
2. Make changes with appropriate tests
3. Run tests locally
4. Submit a pull request
5. Ensure CI/CD passes

### Code Style

- Java: Follow Google Java Style Guide
- Angular: Follow Angular Style Guide
- Python: Follow PEP 8
- Use meaningful commit messages

## Support

For issues or questions:

1. Check the [troubleshooting section in usage.md](usage.md#troubleshooting)
2. Review service logs: `docker compose -f docker-compose.yml logs <service>`
3. Check service health: `docker compose -f docker-compose.yml ps`
4. Review relevant documentation in the `docs/` folders

## License

This project is part of the Banking Technology Lab educational initiative.

## Acknowledgments

- Spring Boot team for the excellent framework
- Confluent for Kafka
- Angular team for the frontend framework
- All contributors to the open-source libraries used

---

**Last Updated**: October 2026  
**Version**: 1.0.0



DEFAULT USERS:
Username: admin1 | Password: password | Role: ADMIN
Username: officer1 | Password: password | Role: BANK_OFFICER
Username: customer1 | Password: password | Role: CUSTOMER
Username: admin | Password: password | Role: ADMIN
Username: officer | Password: password | Role: BANK_OFFICER
Username: customer | Password: password | Role: CUSTOMER
Database Credentials (docker-compose.yml defaults)


MySQL Root:
Username: root | Password: root_secret
FD Calculator Database:

Username: fd_user | Password: fd_secret
Product Database:

Username: product_user | Password: product_secret
Auth Database:

Username: auth_user | Password: auth_secret
FD Account Database:

Username: root | Password: 12345

JWT Configuration
JWT Secret: test-secret-key-minimum-32-characters-for-hmac256 (default)
JWT Issuer: fd-platform-auth
SMTP/Email Credentials (Hardcoded in docker-compose.yml)
SMTP Username: bankingtechmail@gmail.com
SMTP Password: siha jcpy fhut qoox (Gmail app password)

Mailpit (Email Testing)
Username: mailpit
Password: mailpit