#!/usr/bin/env python3
"""
Generate comprehensive DOCX report for UNO Bank Fixed Deposit Management System
"""

from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE
from datetime import datetime

def add_heading(doc, text, level):
    """Add a heading with formatting"""
    heading = doc.add_heading(text, level=level)
    heading.alignment = WD_ALIGN_PARAGRAPH.LEFT
    return heading

def add_paragraph(doc, text, bold=False):
    """Add a paragraph with optional bold text"""
    para = doc.add_paragraph(text)
    if bold:
        for run in para.runs:
            run.bold = True
    return para

def add_bullet(doc, text):
    """Add a bullet point"""
    para = doc.add_paragraph(text, style='List Bullet')
    return para

def add_subheading(doc, text):
    """Add a subheading with custom formatting"""
    para = doc.add_paragraph()
    run = para.add_run(text)
    run.bold = True
    run.font.size = Pt(14)
    run.font.color.rgb = RGBColor(0, 0, 139)
    para.alignment = WD_ALIGN_PARAGRAPH.LEFT
    return para

def generate_report():
    doc = Document()
    
    # Title
    title = doc.add_heading('UNO Bank - Fixed Deposit Management System', 0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Subtitle
    subtitle = doc.add_paragraph('Comprehensive Technical Documentation Report')
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    subtitle_run = subtitle.runs[0]
    subtitle_run.italic = True
    
    doc.add_paragraph(f'Generated on: {datetime.now().strftime("%B %d, %Y at %H:%M:%S")}')
    doc.add_paragraph('Banking Technology Lab Project')
    
    doc.add_page_break()
    
    # Table of Contents placeholder
    add_heading(doc, 'Table of Contents', 1)
    add_bullet(doc, '1. Project Overview')
    add_bullet(doc, '2. System Architecture')
    add_bullet(doc, '3. Technology Stack')
    add_bullet(doc, '4. Backend Services')
    add_bullet(doc, '5. Frontend Application')
    add_bullet(doc, '6. Database Architecture')
    add_bullet(doc, '7. API Endpoints')
    add_bullet(doc, '8. Security Implementation')
    add_bullet(doc, '9. Event-Driven Architecture')
    add_bullet(doc, '10. Deployment and Operations')
    add_bullet(doc, '11. Documentation References')
    
    doc.add_page_break()
    
    # Section 1: Project Overview
    add_heading(doc, '1. Project Overview', 1)
    add_paragraph(doc, 'UNO Bank is a comprehensive microservices-based banking platform for Fixed Deposit (FD) account management. The system enables customers to apply for, manage, and track their FD investments through multiple user roles with role-based access control, real-time calculations, automated interest processing, and comprehensive reporting.')
    
    add_subheading(doc, 'Key Capabilities')
    add_bullet(doc, 'Multi-Role Access: Customer, Bank Officer, and Admin interfaces')
    add_bullet(doc, 'FD Lifecycle Management: Application, approval, maturity, and premature closure')
    add_bullet(doc, 'Real-time Calculations: Interest calculations with customer category benefits')
    add_bullet(doc, 'Automated Processing: Scheduled interest accrual and maturity processing')
    add_bullet(doc, 'Multi-Channel Notifications: Email and WhatsApp alerts for FD lifecycle events')
    add_bullet(doc, 'Comprehensive Reporting: PDF, Excel, CSV exports with visualizations')
    add_bullet(doc, 'Event-Driven Architecture: Kafka-based asynchronous communication')
    add_bullet(doc, 'Time Travel Testing: Business date manipulation for testing scenarios')
    
    add_subheading(doc, 'Product Features')
    add_heading(doc, 'For Customers', 3)
    add_bullet(doc, 'FD Application: Apply for new FD accounts with detailed applicant information')
    add_bullet(doc, 'Portfolio Management: View all FD investments, balances, and maturity dates')
    add_bullet(doc, 'FD Calculator: Compare different products and tenures before investing')
    add_bullet(doc, 'Transaction History: Track all transactions on FD accounts')
    add_bullet(doc, 'Interest Tracking: Monitor accrued and posted interest')
    add_bullet(doc, 'Notifications: Receive email and WhatsApp alerts for FD events')
    
    add_heading(doc, 'For Bank Officers', 3)
    add_bullet(doc, 'Application Approval: Review and approve/reject customer FD applications')
    add_bullet(doc, 'Direct Account Creation: Create FD accounts directly for customers')
    add_bullet(doc, 'Account Management: View all customer accounts and transactions')
    add_bullet(doc, 'Interest Monitoring: View interest accounts; changing calculation mode requires ADMIN')
    add_bullet(doc, 'Reports Generation: Generate FD summary, portfolio, and maturity reports')
    add_bullet(doc, 'Withdrawal Processing: Handle premature withdrawal requests')
    
    add_heading(doc, 'For Administrators', 3)
    add_bullet(doc, 'Product Management: Create, update, and retire FD products')
    add_bullet(doc, 'Rate Configuration: Set base rates, term limits, and category modifiers')
    add_bullet(doc, 'Batch Processing: Submit and monitor interest batch jobs')
    add_bullet(doc, 'System Configuration: Manage time travel, security settings')
    add_bullet(doc, 'Advanced Reports: Generate Python reports with visualizations')
    add_bullet(doc, 'User Management: Create and manage user accounts and roles')
    
    doc.add_page_break()
    
    # Section 2: System Architecture
    add_heading(doc, '2. System Architecture', 1)
    add_paragraph(doc, 'The system follows a microservices architecture where each service owns its database and communicates via well-defined APIs and events. The browser calls services directly without an API gateway in the current deployment.')
    
    add_subheading(doc, 'Microservices Design')
    add_paragraph(doc, 'The platform consists of the following services:')
    add_bullet(doc, 'Auth Service (Port 8090): Authentication, authorization, and JWT token management')
    add_bullet(doc, 'Product & Pricing Service (Port 8080): Product catalog, pricing configuration, rate calculations')
    add_bullet(doc, 'FD Calculator Service (Port 8084): Dedicated FD maturity calculator with simulation capabilities')
    add_bullet(doc, 'FD Account Service (Port 8086): Account management, ledger, lifecycle, reports, and business clock')
    add_bullet(doc, 'Interest Batch Service (Port 8081): Daily 03:00 IST accrual command and admin requests')
    add_bullet(doc, 'Notification Service (Port 8083): Lifecycle email and WhatsApp notifications')
    add_bullet(doc, 'Statement Service (Port 8082): Interest-event statement projection (started separately)')
    add_bullet(doc, 'Frontend Application (Port 4200): Angular Single Page Application')
    
    add_subheading(doc, 'Event-Driven Communication')
    add_paragraph(doc, 'Services communicate asynchronously via Kafka events using the Outbox Pattern for reliability:')
    add_bullet(doc, 'Transactional Outbox: Events are written to an event_outbox table in the same transaction as business data')
    add_bullet(doc, 'Relay Publisher: A background process publishes pending outbox events to Kafka every 3 seconds')
    add_bullet(doc, 'Idempotent Consumers: Each consumer records processed event IDs to handle duplicate delivery')
    add_bullet(doc, 'Dead Letter Topics: Failed messages are retried and then moved to DLT topics for inspection')
    
    add_subheading(doc, 'Security Model')
    add_bullet(doc, 'JWT Authentication: HS256-signed tokens with shared secret')
    add_bullet(doc, 'Role-Based Access Control: CUSTOMER, BANK_OFFICER, ADMIN roles')
    add_bullet(doc, 'Ownership Enforcement: Customers can only access their own FDs')
    add_bullet(doc, 'Rate Limiting: 5 failed login attempts locks account for 60 seconds')
    add_bullet(doc, 'Input Validation: DTO constraints and service-specific business validation')
    add_bullet(doc, 'SQL Injection Prevention: Parameterized queries throughout')
    
    doc.add_page_break()
    
    # Section 3: Technology Stack
    add_heading(doc, '3. Technology Stack', 1)
    
    add_subheading(doc, 'Backend Services')
    table = doc.add_table(rows=1, cols=3)
    table.style = 'Table Grid'
    hdr_cells = table.rows[0].cells
    hdr_cells[0].text = 'Service'
    hdr_cells[1].text = 'Technology'
    hdr_cells[2].text = 'Port'
    
    services = [
        ('Auth Service', 'Java 21, Spring Boot 3.x, Spring Security', '8090'),
        ('Product & Pricing Service', 'Java 21, Spring Boot 3.x', '8080'),
        ('FD Calculator Service', 'Java 21, Spring Boot 3.x', '8084'),
        ('FD Account Service', 'Java 21, Spring Boot 3.x', '8086'),
        ('Notification Service', 'Java 21, Spring Boot 3.x', '8083'),
        ('Interest Batch Service', 'Java 21, Spring Boot 3.x', '8081'),
        ('Statement Service', 'Java 21, Spring Boot 3.x', '8082'),
    ]
    
    for service, tech, port in services:
        row_cells = table.add_row().cells
        row_cells[0].text = service
        row_cells[1].text = tech
        row_cells[2].text = port
    
    add_subheading(doc, 'Databases')
    add_paragraph(doc, 'MySQL 8.0 - Four server containers with separate service schemas for data isolation:')
    add_bullet(doc, 'FD Calculator DB (port 3307)')
    add_bullet(doc, 'Product DB (port 3308)')
    add_bullet(doc, 'Auth DB (port 3309)')
    add_bullet(doc, 'FD Account DB (port 3310)')
    
    add_subheading(doc, 'Infrastructure')
    add_bullet(doc, 'Docker & Docker Compose - Container orchestration')
    add_bullet(doc, 'Confluent Platform Kafka image 7.5.0 - Event streaming for async communication')
    add_bullet(doc, 'Zookeeper - Kafka coordination')
    add_bullet(doc, 'Mailpit - Email testing and SMTP relay')
    add_bullet(doc, 'Python 3.8+ - Report generation scripts')
    
    add_subheading(doc, 'Frontend')
    add_bullet(doc, 'Angular 22.2 - Single Page Application')
    add_bullet(doc, 'TypeScript - Type-safe development')
    add_bullet(doc, 'RxJS - Reactive programming')
    add_bullet(doc, 'SCSS - Shared theme tokens and component styles')
    
    add_subheading(doc, 'Build Tools')
    add_bullet(doc, 'Maven 3.8+ - Java dependency management')
    add_bullet(doc, 'npm 9+ - Node.js package management')
    add_bullet(doc, 'Docker BuildKit - Multi-stage Docker builds')
    
    doc.add_page_break()
    
    # Section 4: Backend Services
    add_heading(doc, '4. Backend Services', 1)
    
    # Auth Service
    add_heading(doc, '4.1 Authentication Service (Auth_Sec)', 2)
    add_paragraph(doc, 'The Authentication Service is a Spring Boot microservice responsible for user authentication, authorization, and JWT token management for the UNO Bank Fixed Deposit platform.')
    
    add_subheading(doc, 'Key Features')
    add_bullet(doc, 'JWT-based authentication with HS256 signing')
    add_bullet(doc, 'BCrypt password hashing')
    add_bullet(doc, 'Login attempt limiting with account lockout')
    add_bullet(doc, 'Refresh token mechanism for session management')
    add_bullet(doc, 'OTP-based email verification for customer signup')
    add_bullet(doc, 'Role-based access control (CUSTOMER, BANK_OFFICER, ADMIN)')
    add_bullet(doc, 'User management (create, update, ban, delete) for administrators')
    
    add_subheading(doc, 'Core Classes')
    add_bullet(doc, 'Application.java: Spring Boot application entry point')
    add_bullet(doc, 'AuthController.java: REST API endpoints for authentication operations')
    add_bullet(doc, 'SecurityConfig.java: Spring Security configuration with JWT filter')
    add_bullet(doc, 'JwtAuthenticationFilter.java: JWT filter for request validation')
    add_bullet(doc, 'UserDirectory.java: User management service with database operations')
    add_bullet(doc, 'RefreshTokenService.java: Refresh token lifecycle management')
    add_bullet(doc, 'LoginAttemptLimiter.java: Rate limiting for login attempts')
    
    add_subheading(doc, 'Entity Classes')
    add_bullet(doc, 'User.java: User entity with username, passwordHash, email, roles, enabled status')
    add_bullet(doc, 'RefreshToken.java: Refresh token entity with token, username, expiryDate, revoked status')
    
    add_subheading(doc, 'Security Common Library')
    add_paragraph(doc, 'Shared JWT utilities in security-common module:')
    add_bullet(doc, 'JwtSupport.java: JWT encoding/decoding utilities')
    add_bullet(doc, 'TokenIssuer.java: JWT token issuance service')
    add_bullet(doc, 'ResourceServerSupport.java: Resource server configuration')
    
    add_subheading(doc, 'API Endpoints')
    add_bullet(doc, 'POST /api/auth/signup: Direct customer registration')
    add_bullet(doc, 'POST /api/auth/login: User authentication and token issuance')
    add_bullet(doc, 'POST /api/auth/refresh: Refresh access token')
    add_bullet(doc, 'POST /api/auth/logout: Invalidate refresh token')
    add_bullet(doc, 'POST /api/auth/init-signup: Initialize OTP-based signup')
    add_bullet(doc, 'POST /api/auth/verify-otp: Verify OTP and complete registration')
    add_bullet(doc, 'POST /api/auth/resend-otp: Resend OTP for pending signup')
    add_bullet(doc, 'GET /api/auth/admin/users: Get all users (admin only)')
    add_bullet(doc, 'POST /api/auth/admin/users: Create user with specific role (admin only)')
    add_bullet(doc, 'PUT /api/auth/admin/users/{username}/roles: Update user roles (admin only)')
    add_bullet(doc, 'PUT /api/auth/admin/users/{username}/ban: Ban user account (admin only)')
    add_bullet(doc, 'PUT /api/auth/admin/users/{username}/unban: Unban user account (admin only)')
    add_bullet(doc, 'DELETE /api/auth/admin/users/{username}: Delete user account (admin only)')
    
    add_subheading(doc, 'Database Schema')
    add_paragraph(doc, 'Uses auth_db schema with tables: users, refresh_tokens. See Auth_Sec/auth-service/src/main/resources/db/init.sql for DDL.')
    
    doc.add_page_break()
    
    # Product & Pricing Service
    add_heading(doc, '4.2 Product & Pricing Service', 2)
    add_paragraph(doc, 'The Banking Product & Pricing Service is a Spring Boot microservice responsible for managing banking products (FD, CASA, Loans), their pricing configurations, rate calculations, and FD maturity calculations.')
    
    add_subheading(doc, 'Key Features')
    add_bullet(doc, 'Product CRUD operations (create, update, retire, delete)')
    add_bullet(doc, 'Product search and filtering')
    add_bullet(doc, 'Product validation for account creation')
    add_bullet(doc, 'Interest rate calculation with category adjustments')
    add_bullet(doc, 'FD maturity calculation (embedded legacy calculator)')
    add_bullet(doc, 'Charge management and calculation')
    add_bullet(doc, 'Rate variation support (SENIOR_CITIZEN, EMPLOYEE, etc.)')
    add_bullet(doc, 'Internal endpoints for service-to-service communication')
    add_bullet(doc, 'OpenAPI/Swagger documentation')
    add_bullet(doc, 'Caching support for performance')
    
    add_subheading(doc, 'Core Classes')
    add_bullet(doc, 'ProductApplication.java: Spring Boot application entry point')
    add_bullet(doc, 'ProductService.java: Product service interface defining business operations')
    add_bullet(doc, 'ProductServiceImpl.java: Product service implementation')
    add_bullet(doc, 'FdCalculatorService.java: FD Calculator service interface')
    add_bullet(doc, 'ProductController.java: REST API for product management')
    add_bullet(doc, 'InternalProductController.java: Internal endpoints for service-to-service communication')
    add_bullet(doc, 'FdCalculatorController.java: REST API for FD calculations')
    add_bullet(doc, 'SecurityConfig.java: Spring Security configuration')
    
    add_subheading(doc, 'Entity Classes')
    add_bullet(doc, 'Product: Main product entity with code, name, type, status, limits')
    add_bullet(doc, 'ProductBusinessRules: Term and rate limits, min/max deposit')
    add_bullet(doc, 'RateVariation: Customer category rate modifiers')
    add_bullet(doc, 'ProductCharges: Interest credit frequency, tax deduction, withdrawal fees')
    add_bullet(doc, 'ProductRole: Account holder roles (OWNER, NOMINEE)')
    add_bullet(doc, 'FdCalculation: Calculation history records')
    
    add_subheading(doc, 'API Endpoints')
    add_heading(doc, 'Product Management', 3)
    add_bullet(doc, 'POST /api/product or /api/v1/products: Create product (BANK_OFFICER, ADMIN)')
    add_bullet(doc, 'PUT /api/product/{code} or /api/v1/products/{code}: Update product (BANK_OFFICER, ADMIN)')
    add_bullet(doc, 'DELETE /api/product/{code} or /api/v1/products/{code}: Retire product (BANK_OFFICER, ADMIN)')
    add_bullet(doc, 'DELETE /api/product/{code}/permanent: Permanently delete (ADMIN)')
    add_bullet(doc, 'GET /api/product/search or /api/v1/products/search: Search products (authenticated)')
    add_bullet(doc, 'GET /api/product/active or /api/v1/products/active: Get active products (public)')
    add_bullet(doc, 'GET /api/product/{code} or /api/v1/products/{code}: Get product by code (authenticated)')
    add_bullet(doc, 'GET /api/product/{code}/validate or /api/v1/products/{code}/validate: Validate product (authenticated)')
    add_bullet(doc, 'POST /api/product/{code}/rate or /api/v1/products/{code}/rate: Calculate rate (authenticated)')
    add_bullet(doc, 'GET /api/product/{code}/defaults or /api/v1/products/{code}/defaults: Get defaults (authenticated)')
    
    add_heading(doc, 'Internal Endpoints', 3)
    add_bullet(doc, 'GET /internal/products/{code}/calculator-config: Get calculator config (authenticated)')
    
    add_heading(doc, 'FD Calculator (Legacy)', 3)
    add_bullet(doc, 'POST /api/fd/calculate: Calculate maturity (authenticated)')
    add_bullet(doc, 'POST /api/fd/calculate/advanced: Calculate with charges (authenticated)')
    add_bullet(doc, 'GET /api/fd/categories: Get categories (authenticated)')
    add_bullet(doc, 'GET /api/fd/history: Get history (authenticated)')
    
    add_subheading(doc, 'Database Schema')
    add_paragraph(doc, 'Uses banking_product_db schema. See banking-product-backend/schema.sql for DDL including products, product_business_rules, product_charges, product_roles, product_rate_variations, fd_calculations tables.')
    
    doc.add_page_break()
    
    # FD Calculator Service (Mod 4)
    add_heading(doc, '4.3 FD Calculator Service (Mod 4)', 2)
    add_paragraph(doc, 'Simulation-only Fixed Deposit maturity calculator service. This service calculates and explains estimated FD maturity values. It does not create accounts, move funds, or schedule financial events.')
    
    add_subheading(doc, 'Key Features')
    add_bullet(doc, 'Product constraints preview')
    add_bullet(doc, 'Maturity calculation with category bonuses')
    add_bullet(doc, 'Product comparison for multiple scenarios')
    add_bullet(doc, 'Calculation history with audit trail')
    add_bullet(doc, 'CSV export functionality')
    add_bullet(doc, 'Plain-language explanation of calculations')
    add_bullet(doc, 'Batch calculations')
    add_bullet(doc, 'Structured logging and metrics')
    add_bullet(doc, 'Rate cache management')
    
    add_subheading(doc, 'Core Classes')
    add_bullet(doc, 'FdCalculatorApplication.java: Spring Boot application entry point')
    add_bullet(doc, 'FdCalculationController.java: REST API for calculations')
    add_bullet(doc, 'FdCalculatorService.java: Calculator service interface')
    add_bullet(doc, 'CalculationEngine.java: Core calculation logic')
    add_bullet(doc, 'CategoryBonusService.java: Customer category bonus application')
    add_bullet(doc, 'ExplainService.java: Plain-language explanation generation')
    add_bullet(doc, 'ExportService.java: CSV export functionality')
    add_bullet(doc, 'AuditService.java: Calculation audit logging')
    add_bullet(doc, 'ProductCatalogService.java: Product configuration fetching')
    
    add_subheading(doc, 'API Endpoints')
    add_bullet(doc, 'GET /api/v1/fd/products/{code}/preview: Product constraints (CUSTOMER/BANK_OFFICER/ADMIN)')
    add_bullet(doc, 'POST /api/v1/fd/calculations: Calculate maturity (CUSTOMER/BANK_OFFICER/ADMIN)')
    add_bullet(doc, 'POST /api/v1/fd/calculations/compare: Compare products (CUSTOMER/BANK_OFFICER/ADMIN)')
    add_bullet(doc, 'GET /api/v1/fd/calculations/{id}: Retrieve calculation (CUSTOMER/BANK_OFFICER/ADMIN)')
    add_bullet(doc, 'GET /api/v1/fd/calculations/uuid/{uuid}: Retrieve by UUID (CUSTOMER/BANK_OFFICER/ADMIN)')
    add_bullet(doc, 'POST /api/v1/fd/cache/rates/evict: Evict cached rates (CUSTOMER/BANK_OFFICER/ADMIN)')
    add_bullet(doc, 'GET /api/v1/fd/calculations/{id}/export: Export as CSV (CUSTOMER/BANK_OFFICER/ADMIN)')
    add_bullet(doc, 'POST /api/v1/fd/calculations/{id}/explain: Plain-language explanation (CUSTOMER/BANK_OFFICER/ADMIN)')
    add_bullet(doc, 'POST /api/v1/fd/batch/calculations: Batch calculations (CUSTOMER/BANK_OFFICER/ADMIN)')
    
    add_subheading(doc, 'Database Schema')
    add_paragraph(doc, 'Uses fd_calculator schema with calculation_audit table. See fd_calc/mod 4 backend resources for schema.')
    
    doc.add_page_break()
    
    # FD Account Service
    add_heading(doc, '4.4 FD Account Service', 2)
    add_paragraph(doc, 'The FD Account Service is a Spring Boot microservice responsible for managing Fixed Deposit accounts, applications, approvals, transactions, and customer operations within the UNO Bank platform.')
    
    add_subheading(doc, 'Key Features')
    add_bullet(doc, 'FD account creation and management')
    add_bullet(doc, 'Customer FD applications with approval workflow')
    add_bullet(doc, 'Bundle FD applications for multiple products')
    add_bullet(doc, 'Transaction recording (deposits, interest accrual, maturity payouts)')
    add_bullet(doc, 'Ledger and journal operations for accounting')
    add_bullet(doc, 'Integration with Product & Pricing service for validation and rate calculation')
    add_bullet(doc, 'Integration with Calculator service for maturity estimates')
    add_bullet(doc, 'Event-driven architecture with Kafka for notifications')
    add_bullet(doc, 'Role-based access control (CUSTOMER, BANK_OFFICER, ADMIN)')
    add_bullet(doc, 'Account access security (customers can only access their own accounts)')
    add_bullet(doc, 'Time travel support for testing interest accrual and maturity')
    
    add_subheading(doc, 'Core Classes')
    add_bullet(doc, 'FdModuleApplication.java: Spring Boot application entry point')
    add_bullet(doc, 'FDAccountService.java: Core business logic for FD account operations')
    add_bullet(doc, 'ProductValidationService.java: Validate product configuration before account creation')
    add_bullet(doc, 'RateService.java: Calculate final interest rate with category adjustments')
    add_bullet(doc, 'AccountAccess.java: Enforce account access control')
    add_bullet(doc, 'FDAccountController.java: REST API for FD account operations')
    add_bullet(doc, 'FDTransactionController.java: REST API for transaction operations')
    add_bullet(doc, 'LedgerController.java: REST API for ledger search operations')
    add_bullet(doc, 'JournalController.java: REST API for journal operations')
    add_bullet(doc, 'IntegrationController.java: Proxy endpoints for service integration')
    add_bullet(doc, 'ProductServiceClient.java: HTTP client for Product & Pricing service')
    add_bullet(doc, 'OutboundServiceAuth.java: Authentication for service-to-service calls')
    
    add_subheading(doc, 'Entity Classes')
    add_bullet(doc, 'FixedDepositAccount: FD account entity with applicant details, status, maturity info')
    add_bullet(doc, 'FDTransaction: Transaction entity for FD account operations')
    add_bullet(doc, 'CustomerProfile: Customer profile entity with category mapping')
    add_bullet(doc, 'Nominee: Nominee entity for FD accounts')
    add_bullet(doc, 'BundleApplication: Bundle application entity for multiple FDs')
    add_bullet(doc, 'BundleItem: Individual FD items within a bundle')
    
    add_subheading(doc, 'API Endpoints')
    add_heading(doc, 'FD Account Management', 3)
    add_bullet(doc, 'POST /api/fd/account/create: Create FD account (BANK_OFFICER, ADMIN)')
    add_bullet(doc, 'POST /api/fd/account/apply: Apply for FD (CUSTOMER)')
    add_bullet(doc, 'POST /api/fd/account/approve: Approve/reject application (BANK_OFFICER, ADMIN)')
    add_bullet(doc, 'GET /api/fd/account/pending: Get pending applications (BANK_OFFICER, ADMIN)')
    add_bullet(doc, 'GET /api/fd/account/my-applications: Get customer\'s applications (CUSTOMER)')
    add_bullet(doc, 'GET /api/fd/account/all-applications: Get all applications (BANK_OFFICER, ADMIN)')
    add_bullet(doc, 'GET /api/fd/account/{fdAccountNo}: Get FD account details (All roles with ownership check)')
    add_bullet(doc, 'POST /api/fd/account/{fdAccountNo}/withdraw: Withdraw application (CUSTOMER)')
    
    add_heading(doc, 'Bundle Operations', 3)
    add_bullet(doc, 'POST /api/fd/account/bundle/apply: Apply for bundle (CUSTOMER)')
    add_bullet(doc, 'POST /api/fd/account/bundle/{bundleId}/approve: Approve/reject bundle (BANK_OFFICER, ADMIN)')
    add_bullet(doc, 'GET /api/fd/account/bundle/pending: Get pending bundles (BANK_OFFICER, ADMIN)')
    add_bullet(doc, 'GET /api/fd/account/bundle/my-bundles: Get customer\'s bundles (CUSTOMER)')
    
    add_heading(doc, 'Transaction Operations', 3)
    add_bullet(doc, 'POST /api/fd/account/create-with-txn: Create FD with initial deposit (BANK_OFFICER)')
    add_bullet(doc, 'GET /api/fd/account/{fdAccountNo}/transactions: Get transaction history')
    
    add_heading(doc, 'Ledger Operations', 3)
    add_bullet(doc, 'GET /api/fd/ledger/search-by-name: Search by customer name (BANK_OFFICER, ADMIN)')
    add_bullet(doc, 'GET /api/fd/ledger/search-by-id: Search by customer ID (BANK_OFFICER, ADMIN)')
    add_bullet(doc, 'GET /api/fd/ledger/all: Get all accounts with pagination (BANK_OFFICER, ADMIN)')
    add_bullet(doc, 'GET /api/fd/ledger/{fdAccountNo}: Get account details')
    add_bullet(doc, 'GET /api/fd/ledger/{fdAccountNo}/transactions: Get account transactions')
    
    add_heading(doc, 'Journal Operations', 3)
    add_bullet(doc, 'GET /api/fd/journal/all: Get all transactions (BANK_OFFICER, ADMIN)')
    add_bullet(doc, 'GET /api/fd/journal/by-type: Get transactions by type (BANK_OFFICER, ADMIN)')
    add_bullet(doc, 'GET /api/fd/journal/summary: Get journal statistics (BANK_OFFICER, ADMIN)')
    
    add_heading(doc, 'Service Integration', 3)
    add_bullet(doc, 'GET /api/v1/integration/products/active: Get active products from Product Service')
    add_bullet(doc, 'GET /api/v1/integration/products/{productCode}: Get product by code')
    add_bullet(doc, 'GET /api/v1/integration/products/{productCode}/validate: Validate product')
    add_bullet(doc, 'POST /api/v1/integration/calculator/calculate: Calculate maturity')
    add_bullet(doc, 'GET /api/v1/integration/calculator/products/{productCode}/preview: Preview product')
    
    add_heading(doc, 'Clock/Time Travel (Testing)', 3)
    add_bullet(doc, 'GET /api/fd/clock: Get current clock status')
    add_bullet(doc, 'POST /api/fd/clock/advance: Advance business clock by specified days')
    add_bullet(doc, 'POST /api/fd/clock/reset: Reset business clock to real date')
    
    add_heading(doc, 'Interest Operations', 3)
    add_bullet(doc, 'POST /api/fd/interest/quote: Calculate interest quote for FD')
    add_bullet(doc, 'GET /api/fd/interest/accounts: Get interest accounts overview')
    add_bullet(doc, 'PUT /api/fd/interest/{account}/settings: Configure interest settings (Admin only)')
    
    add_heading(doc, 'Maturity Operations', 3)
    add_bullet(doc, 'POST /api/fd/maturity/run: Manual maturity run for catch-up (Admin only)')
    
    add_subheading(doc, 'Database Schema')
    add_paragraph(doc, 'Uses banking_technology_lab schema. See FD_Module_Group9/fd-account-service/sql/ for DDL including fd_accounts, fd_transactions, customer_profile, nominees, bundle_applications, bundle_items, interest_state, interest_history, event_outbox, business_clock tables.')
    
    doc.add_page_break()
    
    # Interest Batch Service
    add_heading(doc, '4.5 Interest Batch Service', 2)
    add_paragraph(doc, 'Java 21 / Spring Boot 3.3.4 service on port 8081, using MySQL fd_batch. It accepts interest commands and tracks their results; the account service performs the actual accrual/payout.')
    
    add_subheading(doc, 'Key Features')
    add_bullet(doc, 'Accepts interest accrual and payout commands')
    add_bullet(doc, 'Tracks command status and results')
    add_bullet(doc, 'Daily scheduled accrual at 03:00 IST')
    add_bullet(doc, 'Idempotent command processing with UUID')
    add_bullet(doc, 'Kafka event publishing for commands')
    add_bullet(doc, 'Consumes completion/failure events')
    
    add_subheading(doc, 'Core Classes')
    add_bullet(doc, 'BatchController: Validates request DTO and requires ADMIN')
    add_bullet(doc, 'BatchService: Request validation, UUID checking, outbox publishing')
    add_bullet(doc, 'DailyInterestScheduler: Runs at 03:00 IST for yesterday\'s real date')
    add_bullet(doc, 'ResultListener: Consumes completion/failure events')
    
    add_subheading(doc, 'API Endpoints')
    add_bullet(doc, 'POST /api/admin/interest-batches: Validate and enqueue; HTTP 202 with durable request row')
    add_bullet(doc, 'GET /api/admin/interest-batches: Newest 100 requests, ordered by creation time descending')
    add_bullet(doc, 'GET /api/admin/interest-batches/{id}: Request row; unknown ID is a validation error')
    
    add_subheading(doc, 'Kafka Contracts')
    add_bullet(doc, 'Produce: command.interest.accrual (InterestBatchRequested)')
    add_bullet(doc, 'Produce: command.interest.payout (InterestPayoutRequested)')
    add_bullet(doc, 'Consume: event.batch.completed (InterestBatchCompleted/InterestPayoutCompleted)')
    add_bullet(doc, 'Consume: event.batch.failed (InterestRequestFailed)')
    
    add_subheading(doc, 'Database Schema')
    add_paragraph(doc, 'Uses fd_batch schema with tables: batch_requests, scheduler_guard, consumed_events, event_outbox.')
    
    doc.add_page_break()
    
    # Notification Service
    add_heading(doc, '4.6 Notification Service', 2)
    add_paragraph(doc, 'Consumes FD lifecycle and interest events and sends email/WhatsApp notifications. Runs on port 8083, using fd_notifications.')
    
    add_subheading(doc, 'Key Features')
    add_bullet(doc, 'Consumes FD lifecycle events from Kafka')
    add_bullet(doc, 'Email notifications via SMTP')
    add_bullet(doc, 'WhatsApp notifications via Twilio')
    add_bullet(doc, 'Accrual batch consolidation for email')
    add_bullet(doc, 'Contact record management')
    add_bullet(doc, 'Notification log with status tracking')
    add_bullet(doc, 'Mock mode for testing')
    
    add_subheading(doc, 'Core Classes')
    add_bullet(doc, 'Application: Spring Boot entry point and event infrastructure')
    add_bullet(doc, 'NotificationListener: Deserializes DomainEvent and calls NotificationService')
    add_bullet(doc, 'NotificationService: Validates events, resolves contacts, sends/logs or batches notifications')
    add_bullet(doc, 'NotificationController: Staff-only log query')
    add_bullet(doc, 'NotificationChannel: Channel interface and send result')
    add_bullet(doc, 'EmailChannel, WhatsAppChannel: SMTP and Twilio delivery/mock behavior')
    add_bullet(doc, 'MessageTemplates: Individual and consolidated message rendering')
    add_bullet(doc, 'InterestAccrualBatch: In-memory entries grouped by customer')
    add_bullet(doc, 'AccrualBatchScheduler: Periodic consolidated email flush')
    
    add_subheading(doc, 'Kafka Topics')
    add_bullet(doc, 'event.fd.created: FdCreated')
    add_bullet(doc, 'event.fd.status-changed: FdApplied and FdStatusChanged')
    add_bullet(doc, 'event.interest.accrued: InterestAccrued')
    add_bullet(doc, 'event.interest.paid: InterestPaid')
    add_bullet(doc, 'event.fd.matured: FdMatured')
    add_bullet(doc, 'event.fd.prematurely-closed: FdPrematurelyClosed')
    
    add_subheading(doc, 'API Endpoints')
    add_bullet(doc, 'GET /api/notifications: List notification log (ADMIN or BANK_OFFICER)')
    
    add_subheading(doc, 'Database Schema')
    add_paragraph(doc, 'Uses fd_notifications schema with tables: notification_contacts, notifications_log, consumed_events, event_outbox.')
    
    doc.add_page_break()
    
    # Statement Service
    add_heading(doc, '4.7 Statement Service', 2)
    add_paragraph(doc, 'Java 21 / Spring Boot 3.3.4 service on port 8082, using fd_statements. It builds a daily read model from interest events; it does not calculate interest or make financial postings. This service is not included in the root docker-compose.yml and must be started separately.')
    
    add_subheading(doc, 'Key Features')
    add_bullet(doc, 'Builds daily read model from interest events')
    add_bullet(doc, 'Projects InterestAccrued and InterestPaid events')
    add_bullet(doc, 'Account-level statement aggregation')
    add_bullet(doc, 'Currency-grouped summary totals')
    add_bullet(doc, 'Idempotent event processing')
    
    add_subheading(doc, 'Core Classes')
    add_bullet(doc, 'StatementListener: Subscribes to interest events')
    add_bullet(doc, 'StatementService: Projects events to statement rows')
    add_bullet(doc, 'StatementController: Exposes query endpoints')
    
    add_subheading(doc, 'Kafka Topics')
    add_bullet(doc, 'event.interest.accrued: InterestAccrued')
    add_bullet(doc, 'event.interest.paid: InterestPaid')
    
    add_subheading(doc, 'API Endpoints')
    add_bullet(doc, 'GET /api/statements/{account}: Rows for the account, newest statement date first (ADMIN or BANK_OFFICER)')
    add_bullet(doc, 'GET /api/statements/summary/all: Statements count and totalsByCurrency (ADMIN or BANK_OFFICER)')
    
    add_subheading(doc, 'Database Schema')
    add_paragraph(doc, 'Uses fd_statements schema with tables: fd_statements, consumed_events, event_outbox.')
    
    doc.add_page_break()
    
    # Section 5: Frontend Application
    add_heading(doc, '5. Frontend Application', 1)
    add_paragraph(doc, 'The frontend is an Angular 22.2 Single Page Application that provides user interfaces for Customers, Bank Officers, and Administrators to interact with the banking platform.')
    
    add_subheading(doc, 'Technology Stack')
    add_bullet(doc, 'Angular 22.2: Modern web framework')
    add_bullet(doc, 'TypeScript: Type-safe development')
    add_bullet(doc, 'RxJS: Reactive programming for async operations')
    add_bullet(doc, 'SCSS: Styling with shared theme tokens')
    add_bullet(doc, 'Component-based architecture')
    
    add_subheading(doc, 'Key Components')
    add_bullet(doc, 'Landing Component: Public landing page')
    add_bullet(doc, 'Auth Components: Login, Signup, OTP Verification, Officer Login/Signup')
    add_bullet(doc, 'Dashboard Component: User dashboard based on role')
    add_bullet(doc, 'Apply FD Component: FD application form')
    add_bullet(doc, 'FD Calculator Component: FD maturity calculator')
    add_bullet(doc, 'FD Compare Component: Product comparison tool')
    add_bullet(doc, 'Officer Panel Component: Bank officer interface')
    add_bullet(doc, 'Admin Panel Component: Administrator interface')
    add_bullet(doc, 'Product Management Component: Product CRUD for admins')
    add_bullet(doc, 'Advanced Charts Component: Data visualization')
    add_bullet(doc, 'Help Bot Component: AI-powered assistance')
    add_bullet(doc, 'Navbar, Footer, Hero Components: UI layout components')
    
    add_subheading(doc, 'Features')
    add_bullet(doc, 'JWT-based authentication integration')
    add_bullet(doc, 'Role-based UI rendering')
    add_bullet(doc, 'Responsive design')
    add_bullet(doc, 'Real-time data fetching from backend services')
    add_bullet(doc, 'Form validation and error handling')
    add_bullet(doc, 'Multi-language support (Language Selector)')
    
    add_subheading(doc, 'Project Structure')
    add_paragraph(doc, 'Located in uno-frontend (1)/uno-frontend/')
    add_bullet(doc, 'src/app/components: All Angular components')
    add_bullet(doc, 'src/app/services: HTTP services for backend communication')
    add_bullet(doc, 'src/app/models: TypeScript interfaces and models')
    add_bullet(doc, 'src/app/guards: Route guards for authentication')
    add_bullet(doc, 'src/app/interceptors: HTTP interceptors for JWT tokens')
    
    doc.add_page_break()
    
    # Section 6: Database Architecture
    add_heading(doc, '6. Database Architecture', 1)
    add_paragraph(doc, 'The system uses MySQL 8.0 with separate schemas for each service to ensure data isolation and independent scaling.')
    
    add_subheading(doc, 'Database Schemas')
    table = doc.add_table(rows=1, cols=3)
    table.style = 'Table Grid'
    hdr_cells = table.rows[0].cells
    hdr_cells[0].text = 'Schema Name'
    hdr_cells[1].text = 'Port'
    hdr_cells[2].text = 'Service'
    
    schemas = [
        ('auth_db', '3309', 'Auth Service'),
        ('banking_product_db', '3308', 'Product & Pricing Service'),
        ('fd_calculator', '3307', 'FD Calculator Service'),
        ('banking_technology_lab', '3310', 'FD Account Service'),
        ('fd_batch', '3310', 'Interest Batch Service'),
        ('fd_notifications', '3310', 'Notification Service'),
        ('fd_statements', '3310', 'Statement Service'),
    ]
    
    for schema, port, service in schemas:
        row_cells = table.add_row().cells
        row_cells[0].text = schema
        row_cells[1].text = port
        row_cells[2].text = service
    
    add_subheading(doc, 'Key Tables by Schema')
    add_heading(doc, 'auth_db', 3)
    add_bullet(doc, 'users: User credentials, roles, enabled status')
    add_bullet(doc, 'refresh_tokens: Refresh token management')
    
    add_heading(doc, 'banking_product_db', 3)
    add_bullet(doc, 'products: Product catalog')
    add_bullet(doc, 'product_business_rules: Term and rate limits')
    add_bullet(doc, 'product_charges: Charge configurations')
    add_bullet(doc, 'product_roles: Account holder roles')
    add_bullet(doc, 'product_rate_variations: Category rate modifiers')
    add_bullet(doc, 'fd_calculations: Calculation history')
    
    add_heading(doc, 'fd_calculator', 3)
    add_bullet(doc, 'calculation_audit: Calculation audit trail')
    
    add_heading(doc, 'banking_technology_lab', 3)
    add_bullet(doc, 'fd_accounts: FD account records')
    add_bullet(doc, 'fd_transactions: Transaction history')
    add_bullet(doc, 'customer_profile: Customer information and categories')
    add_bullet(doc, 'nominees: Nominee information')
    add_bullet(doc, 'bundle_applications: Bundle application records')
    add_bullet(doc, 'bundle_items: Bundle FD items')
    add_bullet(doc, 'interest_state: Interest accrual state')
    add_bullet(doc, 'interest_history: Interest posting history')
    add_bullet(doc, 'event_outbox: Event publishing queue')
    add_bullet(doc, 'business_clock: Time travel offset')
    
    add_heading(doc, 'fd_batch', 3)
    add_bullet(doc, 'batch_requests: Interest batch requests')
    add_bullet(doc, 'scheduler_guard: Scheduler coordination')
    add_bullet(doc, 'consumed_events: Event deduplication')
    add_bullet(doc, 'event_outbox: Event publishing queue')
    
    add_heading(doc, 'fd_notifications', 3)
    add_bullet(doc, 'notification_contacts: Contact information')
    add_bullet(doc, 'notifications_log: Notification history')
    add_bullet(doc, 'consumed_events: Event deduplication')
    add_bullet(doc, 'event_outbox: Event publishing queue')
    
    add_heading(doc, 'fd_statements', 3)
    add_bullet(doc, 'fd_statements: Daily statement projections')
    add_bullet(doc, 'consumed_events: Event deduplication')
    add_bullet(doc, 'event_outbox: Event publishing queue')
    
    doc.add_page_break()
    
    # Section 7: API Endpoints Summary
    add_heading(doc, '7. API Endpoints Summary', 1)
    add_paragraph(doc, 'For detailed API documentation with request/response examples, see endpoints.md in the project root.')
    
    add_subheading(doc, 'Service Ports')
    table = doc.add_table(rows=1, cols=2)
    table.style = 'Table Grid'
    hdr_cells = table.rows[0].cells
    hdr_cells[0].text = 'Service'
    hdr_cells[1].text = 'Port'
    
    ports = [
        ('Auth Service', '8090'),
        ('Product & Pricing Service', '8080'),
        ('FD Calculator Service', '8084'),
        ('FD Account Service', '8086'),
        ('Notification Service', '8083'),
        ('Interest Batch Service', '8081'),
        ('Statement Service', '8082'),
        ('Frontend (Angular)', '4200'),
        ('Mailpit (Email Testing)', '8025'),
    ]
    
    for service, port in ports:
        row_cells = table.add_row().cells
        row_cells[0].text = service
        row_cells[1].text = port
    
    add_subheading(doc, 'Authentication Flow')
    add_paragraph(doc, '1. Client obtains JWT token from POST /api/auth/login on Auth Service (port 8090)')
    add_paragraph(doc, '2. Client includes token in Authorization header: Bearer <token>')
    add_paragraph(doc, '3. Each service validates token signature, issuer, and expiration')
    add_paragraph(doc, '4. Role-based access control enforced at endpoint level')
    
    doc.add_page_break()
    
    # Section 8: Security Implementation
    add_heading(doc, '8. Security Implementation', 1)
    
    add_subheading(doc, 'Authentication')
    add_bullet(doc, 'JWT tokens with HS256 algorithm and shared secret')
    add_bullet(doc, 'Token expiration: 60 minutes for access tokens, 7 days for refresh tokens')
    add_bullet(doc, 'Issuer validation: fd-platform-auth')
    add_bullet(doc, 'BCrypt password hashing with automatic salt')
    add_bullet(doc, 'Refresh token mechanism for session management')
    
    add_subheading(doc, 'Authorization')
    add_bullet(doc, 'Role-Based Access Control (RBAC): CUSTOMER, BANK_OFFICER, ADMIN')
    add_bullet(doc, 'Method-level security with @PreAuthorize annotations')
    add_bullet(doc, 'Ownership enforcement: Customers can only access their own FDs')
    add_bullet(doc, 'Same 403 error for unauthorized and non-existent accounts (prevents probing)')
    
    add_subheading(doc, 'Rate Limiting')
    add_bullet(doc, '5 failed login attempts trigger 60-second lockout')
    add_bullet(doc, 'In-memory attempt tracking with LoginAttemptLimiter')
    add_bullet(doc, 'Successful login clears attempt counter')
    
    add_subheading(doc, 'Input Validation')
    add_bullet(doc, 'Jakarta validation annotations on all DTOs')
    add_bullet(doc, 'Username length limits (max 100 chars)')
    add_bullet(doc, 'Password minimum length (8 characters)')
    add_bullet(doc, 'Email validation (max 255 chars)')
    add_bullet(doc, 'Business rule validation in service layer')
    
    add_subheading(doc, 'SQL Injection Prevention')
    add_bullet(doc, 'Parameterized queries throughout')
    add_bullet(doc, 'JPA/Hibernate ORM with safe query generation')
    add_bullet(doc, 'No dynamic SQL concatenation')
    
    add_subheading(doc, 'CORS Configuration')
    add_bullet(doc, 'Allows requests from frontend (localhost:4200, 4201)')
    add_bullet(doc, 'Credentials allowed')
    add_bullet(doc, 'Proper preflight headers')
    
    add_subheading(doc, 'Data Protection')
    add_bullet(doc, 'Notification recipients masked in logs')
    add_bullet(doc, 'CSV output escapes potentially executable cell prefixes')
    add_bullet(doc, 'Contact details stored separately from notification logs')
    
    doc.add_page_break()
    
    # Section 9: Event-Driven Architecture
    add_heading(doc, '9. Event-Driven Architecture', 1)
    add_paragraph(doc, 'The system uses Apache Kafka for asynchronous event-driven communication between services. Events are published through a transactional outbox pattern to ensure reliability.')
    
    add_subheading(doc, 'Kafka Topics')
    add_heading(doc, 'Command Topics', 3)
    add_bullet(doc, 'command.interest.accrual: Interest accrual commands')
    add_bullet(doc, 'command.interest.payout: Interest payout commands')
    
    add_heading(doc, 'Event Topics', 3)
    add_bullet(doc, 'event.interest.accrued: Interest accrual completed')
    add_bullet(doc, 'event.interest.paid: Interest payout completed')
    add_bullet(doc, 'event.batch.completed: Batch job completed')
    add_bullet(doc, 'event.batch.failed: Batch job failed')
    add_bullet(doc, 'event.fd.created: FD account created')
    add_bullet(doc, 'event.fd.status-changed: FD status changed (applied, approved, rejected)')
    add_bullet(doc, 'event.fd.matured: FD matured')
    add_bullet(doc, 'event.fd.prematurely-closed: FD prematurely closed')
    
    add_subheading(doc, 'Event Envelope')
    add_paragraph(doc, 'All events follow a common envelope structure:')
    add_bullet(doc, 'schemaVersion: 1')
    add_bullet(doc, 'eventId: UUID')
    add_bullet(doc, 'eventType: Event type name')
    add_bullet(doc, 'occurredAt: UTC ISO instant')
    add_bullet(doc, 'aggregateId: Aggregate identifier (FD account number or request UUID)')
    add_bullet(doc, 'data: JSON object with event-specific fields')
    
    add_subheading(doc, 'Outbox Pattern')
    add_bullet(doc, 'Events written to event_outbox table in same transaction as business data')
    add_bullet(doc, 'Relay publisher publishes pending events every 3 seconds')
    add_bullet(doc, 'Published events marked with published_at timestamp')
    add_bullet(doc, 'Failed/timeout events remain pending for retry')
    
    add_subheading(doc, 'Consumer Behavior')
    add_bullet(doc, 'Consumers validate schema version and event type before processing')
    add_bullet(doc, 'Consumed event IDs recorded for deduplication')
    add_bullet(doc, 'Delivery is at least once (not exactly once)')
    add_bullet(doc, 'One initial attempt plus four retries with 1-second backoff')
    add_bullet(doc, 'InvalidEventException skips retry')
    add_bullet(doc, 'Failed messages moved to Dead Letter Topics (DLT)')
    
    add_subheading(doc, 'Consumer Groups')
    add_bullet(doc, 'fd-interest-posting-v1: Interest accrual/payout consumers')
    add_bullet(doc, 'fd-statements-v1: Statement projection consumers')
    add_bullet(doc, 'fd-notifications-v1: Notification consumers')
    add_bullet(doc, 'fd-batch-results-v1: Batch result consumers')
    
    doc.add_page_break()
    
    # Section 10: Deployment and Operations
    add_heading(doc, '10. Deployment and Operations', 1)
    
    add_subheading(doc, 'Docker Deployment')
    add_paragraph(doc, 'The system uses Docker Compose for container orchestration. The root docker-compose.yml defines:')
    add_bullet(doc, 'MySQL 8.0 containers for each database schema')
    add_bullet(doc, 'Confluent Platform Kafka image 7.5.0 with ZooKeeper')
    add_bullet(doc, 'Six Java backend service containers')
    add_bullet(doc, 'Mailpit for email testing')
    
    add_subheading(doc, 'Startup Scripts')
    add_bullet(doc, 'start_all.sh: Starts backend services and frontend')
    add_bullet(doc, 'init_all_services.sh: Starts backend services only')
    add_bullet(doc, 'Statement service must be started separately')
    
    add_subheading(doc, 'Build Process')
    add_paragraph(doc, 'Maven build order (from project root):')
    add_bullet(doc, '1. Install Auth_Sec/security-common: mvn -f Auth_Sec/pom.xml -pl security-common -am install')
    add_bullet(doc, '2. Build banking-product-backend: mvn -f banking-product-backend/pom.xml clean package')
    add_bullet(doc, '3. Build fd_calc: mvn -f "fd_calc/mod 4 backend/pom.xml" clean package')
    add_bullet(doc, '4. Build FD_Module_Group9 reactor: mvn -f FD_Module_Group9/pom.xml clean package')
    
    add_subheading(doc, 'Scheduled Jobs')
    add_bullet(doc, '03:00 IST: Daily interest accrual command (Interest Batch Service)')
    add_bullet(doc, '04:00 IST: Daily maturity processing (FD Account Service)')
    add_bullet(doc, '05:30 IST: Daily data extract generation (FD Account Service)')
    add_bullet(doc, 'Every 30 seconds: Accrual notification batch flush (Notification Service)')
    add_bullet(doc, 'Every 3 seconds: Outbox relay publisher (All services with events)')
    
    add_subheading(doc, 'Time Travel Feature')
    add_bullet(doc, 'POST /api/fd/clock/advance: Advance business clock for testing')
    add_bullet(doc, 'POST /api/fd/clock/reset: Reset to real date')
    add_bullet(doc, 'Triggers interest accrual and maturity checks')
    add_bullet(doc, 'Requires APP_TIME_TRAVEL_ENABLED=true')
    
    add_subheading(doc, 'Monitoring and Observability')
    add_bullet(doc, 'Health check endpoints on all services (/health or /actuator/health)')
    add_bullet(doc, 'Structured JSON logging with correlation IDs')
    add_bullet(doc, 'Actuator metrics on Product and Calculator services')
    add_bullet(doc, 'Mailpit web UI at http://localhost:8025 for email inspection')
    
    doc.add_page_break()
    
    # Section 11: Documentation References
    add_heading(doc, '11. Documentation References', 1)
    add_paragraph(doc, 'The project includes comprehensive documentation in Markdown format. Key documentation files:')
    
    add_subheading(doc, 'Root Documentation')
    add_bullet(doc, 'README.md: Project overview, features, architecture, getting started')
    add_bullet(doc, 'endpoints.md: Comprehensive API endpoint documentation')
    add_bullet(doc, 'usage.md: Complete usage guide, configuration, troubleshooting')
    add_bullet(doc, 'postman.md: Postman/curl request guide')
    add_bullet(doc, 'HELP.md: Detailed help guide with examples')
    
    add_subheading(doc, 'Auth_Sec Documentation')
    add_bullet(doc, 'Auth_Sec/backend.md: Authentication service detailed documentation')
    
    add_subheading(doc, 'FD_Module_Group9 Documentation')
    add_bullet(doc, 'FD_Module_Group9/README.md: FD module overview')
    add_bullet(doc, 'FD_Module_Group9/docs/API_CONTRACTS.md: REST API contracts')
    add_bullet(doc, 'FD_Module_Group9/docs/ARCHITECTURE_AND_DEPLOYMENT.md: Architecture and deployment')
    add_bullet(doc, 'FD_Module_Group9/docs/EVENT_CONTRACTS.md: Kafka event contracts')
    add_bullet(doc, 'FD_Module_Group9/docs/HANDOVER.md: Project handover documentation')
    add_bullet(doc, 'FD_Module_Group9/fd-account-service/backend.md: Account service documentation')
    add_bullet(doc, 'FD_Module_Group9/fd-account-service/README.md: Account service README')
    add_bullet(doc, 'FD_Module_Group9/interest-batch-service/backend.md: Batch service documentation')
    add_bullet(doc, 'FD_Module_Group9/notification-service/backend.md: Notification service documentation')
    add_bullet(doc, 'FD_Module_Group9/statement-service/backend.md: Statement service documentation')
    
    add_subheading(doc, 'Product & Pricing Documentation')
    add_bullet(doc, 'banking-product-backend/README.md: Product service quick-start guide')
    add_bullet(doc, 'banking-product-backend/backend.md: Product service detailed documentation')
    add_bullet(doc, 'banking-product-backend/PRODUCT_AND_PRICING_MODULE_EXPLANATION.md: Comprehensive guide')
    add_bullet(doc, 'banking-product-backend/SOLUTION_DOCUMENT.md: Architecture & API specification')
    
    add_subheading(doc, 'FD Calculator Documentation')
    add_bullet(doc, 'fd_calc/mod 4 backend/README.md: Calculator service documentation')
    add_bullet(doc, 'fd_calc/mod 4 backend/docs/viva_notes.md: Viva notes')
    
    add_subheading(doc, 'Frontend Documentation')
    add_bullet(doc, 'uno-frontend (1)/uno-frontend/STYLING-NOTES.md: Styling guidelines')
    
    add_subheading(doc, 'Swagger/OpenAPI Documentation')
    add_bullet(doc, 'Product Service: http://localhost:8080/swagger-ui.html')
    add_bullet(doc, 'Calculator Service: http://localhost:8084/swagger-ui/index.html')
    
    doc.add_page_break()
    
    # Conclusion
    add_heading(doc, 'Conclusion', 1)
    add_paragraph(doc, 'The UNO Bank Fixed Deposit Management System is a comprehensive microservices-based banking platform that demonstrates modern software architecture patterns including event-driven communication, containerization, role-based access control, and automated processing. The system provides a complete FD lifecycle management solution with multiple user interfaces, real-time calculations, automated interest processing, and comprehensive reporting capabilities.')
    
    add_paragraph(doc, 'The modular architecture allows for independent development, testing, and deployment of each service, while the event-driven communication ensures loose coupling and scalability. The system is designed with security best practices including JWT authentication, RBAC, input validation, and SQL injection prevention.')
    
    add_paragraph(doc, 'For detailed information on specific services, APIs, or implementation details, refer to the individual backend.md files and other documentation referenced in Section 11.')
    
    # Save the document
    output_file = '/home/ihitplayzyt/Downloads/BT_LAB/UNO_Bank_Comprehensive_Report.docx'
    doc.save(output_file)
    print(f"Report generated successfully: {output_file}")
    
    return output_file

if __name__ == '__main__':
    generate_report()
