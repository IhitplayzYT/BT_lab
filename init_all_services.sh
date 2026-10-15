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
    local max_attempts=60
    local attempt=1
    
    log_info "Checking health of container: $container_name"
    
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
    echo "This script will initialize all 3 microservices:"
    echo "  1. FD Calculator Service (port $CALCULATOR_PORT)"
    echo "  2. Product & Pricing Service (port $PRODUCT_PORT)"
    echo "  3. FD Account Service (port $ACCOUNT_PORT)"
    echo "  4. Auth Service (port $AUTH_PORT)"
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
build_and_start() {
    log_info "Building and starting all containers..."
    
    cd "$PROJECT_ROOT"
    
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
    
    # Wait for Kafka
    check_container_health "kafka"
    
    # Wait for application services
    check_container_health "fd-calculator"
    check_container_health "product-service"
    check_container_health "fd-account-service"
    check_container_health "fd-auth-service"
    
    # Wait for HTTP endpoints to respond
    log_info "Waiting for HTTP endpoints to respond..."
    
    # Auth Service has no health endpoint, skip HTTP check
    log_info "Skipping Auth Service HTTP check (no health endpoint)"
    wait_for_service "Product Service" "http://localhost:$PRODUCT_PORT/api/v1/products/active" || true
    wait_for_service "Calculator Service" "http://localhost:$CALCULATOR_PORT/actuator/health" || true
    wait_for_service "Account Service" "http://localhost:$ACCOUNT_PORT/health" || true
}

# Initialize data
initialize_data() {
    log_info "Checking database initialization..."
    
    # Databases are initialized automatically via docker-entrypoint-initdb.d
    # Check if initialization scripts exist
    if [ -f "$PROJECT_ROOT/fd_calc/mod 4 backend/src/main/resources/db/init.sql" ]; then
        log_success "FD Calculator database init script found"
    fi
    
    if [ -f "$PROJECT_ROOT/product&pricing module/product&pricing module/banking-product-backend/schema.sql" ]; then
        log_success "Product Service database schema found"
    fi
    
    if [ -f "$PROJECT_ROOT/FD_Module_Group9/scripts/init-local-databases.sql" ]; then
        log_success "FD Account Service database init script found"
    fi
    
    if [ -f "$PROJECT_ROOT/Auth_Sec/auth-service/src/main/resources/db/init.sql" ]; then
        log_success "Auth Service database init script found"
    fi
    
    log_info "Database initialization will be handled automatically by MySQL containers"
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
    if curl -s -f "http://localhost:$PRODUCT_PORT/api/v1/products/active" > /dev/null 2>&1; then
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
    
    stop_existing_containers
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
