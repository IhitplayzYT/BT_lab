#!/bin/bash
#
# Initialization Script for All 3 Microservices
# This script will:
# 1. Build and start all Docker containers
# 2. Wait for all services to be healthy
# 3. Initialize databases with seed data
# 4. Verify all services are running
#

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.yml"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$PROJECT_ROOT/startup.log"

# Service ports
AUTH_PORT=8090
PRODUCT_PORT=8080
CALCULATOR_PORT=8084
ACCOUNT_PORT=8086
NOTIFICATION_PORT=8083
MAILPIT_WEB_PORT=8025

# Function to print colored messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to wait for a service to be healthy
wait_for_service() {
    local service_name=$1
    local url=$2
    local max_attempts=30
    local attempt=1
    
    log_info "Waiting for $service_name to be healthy..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            log_success "$service_name is healthy!"
            return 0
        fi
        echo -n "." | tee -a "$LOG_FILE"
        sleep 3
        attempt=$((attempt + 1))
    done
    
    log_error "$service_name failed to become healthy after $((max_attempts * 3)) seconds"
    return 1
}

# Function to check container health
check_container_health() {
    local container_name=$1
    local max_attempts=${2:-60}  # Default 60 attempts (3 minutes)
    local attempt=1

    log_info "Checking health of container: $container_name (max attempts: $max_attempts)"

    # Check if container has healthcheck
    has_healthcheck=$(docker inspect --format='{{.State.Health}}' "$container_name" 2>/dev/null)

    if [ "$has_healthcheck" = "<no value>" ] || [ "$has_healthcheck" = "<nil>" ] || [ -z "$has_healthcheck" ]; then
        log_warning "$container_name has no healthcheck defined, skipping health check"
        # Just verify container is running
        if docker ps --format '{{.Names}}' | grep -q "^${container_name}$"; then
            log_success "$container_name is running"
            return 0
        else
            log_error "$container_name is not running"
            return 1
        fi
    fi

    while [ $attempt -le $max_attempts ]; do
        health_status=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "starting")

        if [ "$health_status" = "healthy" ]; then
            log_success "$container_name is healthy"
            return 0
        elif [ "$health_status" = "unhealthy" ]; then
            log_error "$container_name is unhealthy"
            return 1
        fi

        echo -n "." | tee -a "$LOG_FILE"
        sleep 3
        attempt=$((attempt + 1))
    done

    log_warning "$container_name health check timed out (may still be starting)"
    return 0  # Don't fail, as some services may not have health checks
}

# Print banner
print_banner() {
    echo -e "${BLUE}"
    echo "================================================"
    echo "  Microservices Initialization Script"
    echo "================================================"
    echo -e "${NC}"
    echo "This script will initialize all microservices:"
    echo "  1. FD Calculator Service (port $CALCULATOR_PORT)"
    echo "  2. Product & Pricing Service (port $PRODUCT_PORT)"
    echo "  3. FD Account Service (port $ACCOUNT_PORT)"
    echo "  4. Auth Service (port $AUTH_PORT)"
    echo "  5. Notification Service (port $NOTIFICATION_PORT)"
    echo "  6. Mailpit Email Testing (port $MAILPIT_WEB_PORT)"
    echo ""
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if docker-compose.yml exists
    if [ ! -f "$PROJECT_ROOT/$COMPOSE_FILE" ]; then
        log_error "docker-compose.yml not found in $PROJECT_ROOT"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Stop existing containers
stop_existing_containers() {
    log_info "Stopping existing containers..."
    
    cd "$PROJECT_ROOT"
    
    if docker compose -f "$COMPOSE_FILE" down &>> "$LOG_FILE"; then
        log_success "Existing containers stopped"
    else
        log_warning "No existing containers to stop or error stopping them"
    fi
}

# Build and start containers
prepare_account_database() {
    log_info "Starting the account database before application services..."

    cd "$PROJECT_ROOT"
    if ! docker compose -f "$COMPOSE_FILE" up -d fd-group9-mysql >> "$LOG_FILE" 2>&1; then
        log_error "Failed to start fd-group9-mysql"
        return 1
    fi

    check_container_health "fd-group9-mysql"

    log_info "Applying the bundle schema migration before fd-account-service starts..."
    if ! docker exec -i fd-group9-mysql sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD"' \
        < "$PROJECT_ROOT/FD_Module_Group9/fd-account-service/sql/migration_add_bundle_support.sql" \
        >> "$LOG_FILE" 2>&1; then
        log_error "Failed to prepare the account database bundle schema"
        return 1
    fi
    log_success "Account database bundle schema is ready"

    # Existing MySQL volumes do not rerun docker-entrypoint-initdb.d. The
    # account service uses ddl-auto=validate, so create the transaction table
    # before Compose starts the service (initialize_data runs too late).
    log_info "Ensuring the FD transaction schema exists before account service startup..."
    if ! docker exec -i fd-group9-mysql sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD"' \
        < "$PROJECT_ROOT/FD_Module_Group9/fd-account-service/sql/l16_fd_transactions.sql" \
        >> "$LOG_FILE" 2>&1; then
        log_error "Failed to prepare the FD transaction schema"
        return 1
    fi
    log_success "FD transaction schema is ready"

    # These JDBC-managed tables also live in initdb scripts, which are skipped
    # for an existing volume. Use idempotent migrations before scheduled and
    # Kafka-driven account-service work can touch them.
    local migration
    for migration in \
        migration_add_event_outbox.sql \
        migration_add_interest_tables.sql \
        migration_add_admin_operation_logs.sql; do
        if ! docker exec -i fd-group9-mysql sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD"' \
            < "$PROJECT_ROOT/FD_Module_Group9/fd-account-service/sql/$migration" \
            >> "$LOG_FILE" 2>&1; then
            log_error "Failed to apply account database migration: $migration"
            return 1
        fi
    done
    log_success "Account service support schemas are ready"
}

build_and_start() {
    log_info "Building and starting all containers..."
    
    cd "$PROJECT_ROOT"
    
    # The other service images consume local JARs; rebuild them from current source.
    mvn -B -f Auth_Sec/pom.xml install -DskipTests >> "$LOG_FILE" 2>&1
    mvn -B -f banking-product-backend/pom.xml package -DskipTests >> "$LOG_FILE" 2>&1
    mvn -B -f FD_Module_Group9/pom.xml -pl fd-account-service,interest-batch-service,notification-service,statement-service -am package -DskipTests >> "$LOG_FILE" 2>&1
    mvn -B -f "fd_calc/mod 4 backend/pom.xml" package -DskipTests >> "$LOG_FILE" 2>&1

    # The account service validates its schema during startup. Prepare this
    # migration before Compose starts the service, or an older DB volume can
    # make the service exit before initialize_data gets a chance to migrate it.
    prepare_account_database

    # Build and start services
    if docker compose -f "$COMPOSE_FILE" up -d --build &>> "$LOG_FILE"; then
        log_success "Containers built and started"
    else
        log_error "Failed to build and start containers"
        exit 1
    fi
    
    # Show running containers
    log_info "Running containers:"
    docker compose -f "$COMPOSE_FILE" ps | tee -a "$LOG_FILE"
}

# Wait for all services to be ready
wait_for_services() {
    log_info "Waiting for all services to be ready..."
    
    # Wait for databases first
    check_container_health "fd-mysql"
    check_container_health "product-mysql"
    check_container_health "fd-group9-mysql"
    check_container_health "auth-mysql"
    
    # Wait for Kafka (increased timeout for slow startup after PC restart)
    check_container_health "kafka" 80

    # Wait for Mailpit
    check_container_health "mailpit"

    # Wait for application services
    check_container_health "fd-calculator"
    check_container_health "product-service"
    check_container_health "fd-account-service"
    check_container_health "fd-auth-service"
    if docker ps --format '{{.Names}}' | grep -q "^statement-service$"; then
        log_success "statement-service is running"
    else
        log_warning "statement-service may not be running"
    fi
    # notification-service has no healthcheck - just verify it's running
    if docker ps --format '{{.Names}}' | grep -q "^notification-service$"; then
        log_success "notification-service is running"
    else
        log_warning "notification-service may not be running"
    fi

    # Wait for HTTP endpoints to respond
    log_info "Waiting for HTTP endpoints to respond..."

    wait_for_service "Auth Service" "http://localhost:$AUTH_PORT/health"
    wait_for_service "Product Service" "http://localhost:$PRODUCT_PORT/actuator/health"
    wait_for_service "Calculator Service" "http://localhost:$CALCULATOR_PORT/actuator/health"
    wait_for_service "Account Service" "http://localhost:$ACCOUNT_PORT/health"
}

# Initialize data
initialize_data() {
    log_info "Checking database initialization..."
    
    docker exec -i fd-group9-mysql sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD"' < "$PROJECT_ROOT/FD_Module_Group9/fd-account-service/sql/migration_remove_product_fk.sql"
    docker exec -i product-mysql sh -c 'mysql -uproduct_user -p"$MYSQL_PASSWORD"' < "$PROJECT_ROOT/banking-product-backend/migration_legacy_id.sql"
    
    # Check if bundle_applications table exists, if not run the migration
    log_info "Checking for bundle_applications table..."
    if ! docker exec fd-group9-mysql mysql -uroot -p12345 -e "USE banking_technology_lab; DESCRIBE bundle_applications;" > /dev/null 2>&1; then
        log_info "bundle_applications table not found, running migration..."
        docker exec -i fd-group9-mysql mysql -uroot -p12345 < "$PROJECT_ROOT/FD_Module_Group9/fd-account-service/sql/migration_add_bundle_support.sql"
        log_success "Bundle support migration completed"
    else
        log_success "bundle_applications table already exists"
    fi
    
    # Check if applicant_address column exists, if not run the customer details migration
    log_info "Checking for applicant_address column..."
    if ! docker exec fd-group9-mysql mysql -uroot -p12345 -e "USE banking_technology_lab; DESCRIBE fd_accounts;" | grep -q "applicant_address"; then
        log_info "applicant_address column not found, running migration..."
        docker exec -i fd-group9-mysql mysql -uroot -p12345 < "$PROJECT_ROOT/FD_Module_Group9/fd-account-service/sql/migration_add_customer_details.sql"
        log_success "Customer details migration completed"
    else
        log_success "applicant_address column already exists"
    fi
    
    # Check if fd_transactions table exists, if not run the transactions migration
    log_info "Checking for fd_transactions table..."
    if ! docker exec fd-group9-mysql mysql -uroot -p12345 -e "USE banking_technology_lab; DESCRIBE fd_transactions;" > /dev/null 2>&1; then
        log_info "fd_transactions table not found, running migration..."
        docker exec -i fd-group9-mysql mysql -uroot -p12345 < "$PROJECT_ROOT/FD_Module_Group9/fd-account-service/sql/l16_fd_transactions.sql"
        log_success "FD transactions migration completed"
    else
        log_success "fd_transactions table already exists"
    fi
    
    # Databases are initialized automatically via docker-entrypoint-initdb.d
    # Check if initialization scripts exist
    if [ -f "$PROJECT_ROOT/fd_calc/mod 4 backend/src/main/resources/db/init.sql" ]; then
        log_success "FD Calculator database init script found"
    fi
    
    if [ -f "$PROJECT_ROOT/banking-product-backend/schema.sql" ]; then
        log_success "Product Service database schema found"
    fi
    
    if [ -f "$PROJECT_ROOT/FD_Module_Group9/scripts/init-local-databases.sql" ]; then
        log_success "FD Account Service database init script found"
    fi
    
    if [ -f "$PROJECT_ROOT/Auth_Sec/auth-service/src/main/resources/db/init.sql" ]; then
        log_success "Auth Service database init script found"
    fi
    
    log_info "Database initialization complete"
}

# Verify services
verify_services() {
    log_info "Verifying all services are running..."
    
    local all_healthy=true
    
    # Check Auth Service
    if curl -s -f "http://localhost:$AUTH_PORT/health" > /dev/null 2>&1 || \
       curl -s -f "http://localhost:$AUTH_PORT/api/auth/login" -X POST -H "Content-Type: application/json" -d '{"username":"test","password":"test"}' > /dev/null 2>&1; then
        log_success "Auth Service is responding on port $AUTH_PORT"
    else
        log_warning "Auth Service may not be fully ready yet"
    fi
    
    # Check Product Service
    if curl -s -f "http://localhost:$PRODUCT_PORT/actuator/health" > /dev/null 2>&1; then
        log_success "Product Service is responding on port $PRODUCT_PORT"
    else
        log_warning "Product Service may not be fully ready yet"
    fi
    
    # Check Calculator Service
    if curl -s -f "http://localhost:$CALCULATOR_PORT/actuator/health" > /dev/null 2>&1; then
        log_success "Calculator Service is responding on port $CALCULATOR_PORT"
    else
        log_warning "Calculator Service may not be fully ready yet"
    fi
    
    # Check Account Service
    if curl -s -f "http://localhost:$ACCOUNT_PORT/health" > /dev/null 2>&1; then
        log_success "Account Service is responding on port $ACCOUNT_PORT"
    else
        log_warning "Account Service may not be fully ready yet"
    fi
}

# Print service URLs
print_service_urls() {
    echo ""
    log_info "Service URLs:"
    echo -e "  ${GREEN}Auth Service:${NC}       http://localhost:$AUTH_PORT"
    echo -e "  ${GREEN}Product Service:${NC}    http://localhost:$PRODUCT_PORT"
    echo -e "  ${GREEN}Calculator Service:${NC} http://localhost:$CALCULATOR_PORT"
    echo -e "  ${GREEN}Account Service:${NC}    http://localhost:$ACCOUNT_PORT"
    echo -e "  ${GREEN}Notification Service:${NC} http://localhost:$NOTIFICATION_PORT"
    echo -e "  ${GREEN}Mailpit Web UI:${NC}     http://localhost:$MAILPIT_WEB_PORT"
    echo ""
    log_info "Database Ports:"
    echo -e "  ${GREEN}FD Calculator DB:${NC}   localhost:3307"
    echo -e "  ${GREEN}Product DB:${NC}         localhost:3308"
    echo -e "  ${GREEN}Auth DB:${NC}            localhost:3309"
    echo -e "  ${GREEN}FD Account DB:${NC}      localhost:3310"
    echo ""
}

# Main execution
main() {
    # Clear log file
    > "$LOG_FILE"
    
    print_banner
    
    check_prerequisites
    
    log_info "Starting initialization process..."
    echo "Full log available at: $LOG_FILE"
    echo ""
    
    build_and_start
    wait_for_services
    initialize_data
    verify_services
    print_service_urls
    
    log_success "Initialization complete!"
    echo ""
    log_info "You can now run the smoke test:"
    echo -e "  ${GREEN}python3 smoke_test.py${NC}"
    echo ""
    log_info "To view logs:"
    echo -e "  ${GREEN}docker compose -f $COMPOSE_FILE logs -f${NC}"
    echo ""
    log_info "To stop all services:"
    echo -e "  ${GREEN}docker compose -f $COMPOSE_FILE down${NC}"
    echo ""
}

# Run main function
main
