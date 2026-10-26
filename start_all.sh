#!/bin/bash
#
# Complete Startup Script
# This script will:
# 1. Initialize and start all backend microservices
# 2. Start the Angular frontend development server
#

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# FRONTEND_TYPE: Choose which frontend to use
# Options: "full" for uno-frontend (1)/uno-frontend, "light" for uno-frontend-light
FRONTEND_TYPE="light"

if [ "$FRONTEND_TYPE" = "light" ]; then
    FRONTEND_DIR="$PROJECT_ROOT/uno-frontend-light"
else
    FRONTEND_DIR="$PROJECT_ROOT/uno-frontend (1)/uno-frontend"
fi

FRONTEND_PORT=4200

# Function to print colored messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Print banner
print_banner() {
    echo -e "${BLUE}"
    echo "================================================"
    echo "  UNO Bank - Complete Startup Script"
    echo "================================================"
    echo -e "${NC}"
    echo "This script will:"
    echo "  1. Initialize all backend microservices"
    echo "  2. Start the Angular frontend"
    echo ""
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if init_all_services.sh exists
    if [ ! -f "$PROJECT_ROOT/init_all_services.sh" ]; then
        log_error "init_all_services.sh not found in $PROJECT_ROOT"
        exit 1
    fi
    
    # Check if frontend directory exists
    if [ ! -d "$FRONTEND_DIR" ]; then
        log_error "Frontend directory not found at $FRONTEND_DIR"
        exit 1
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Start backend services
start_backend() {
    log_info "Starting backend microservices..."
    
    cd "$PROJECT_ROOT"
    
    # Make init script executable
    chmod +x init_all_services.sh
    
    # Run the init script
    if ./init_all_services.sh; then
        log_success "Backend services started successfully"
    else
        log_error "Failed to start backend services"
        exit 1
    fi
}

# Start the optional local Python AI API separately; failures never block banking startup.
start_optional_ai_assistant() {
    log_info "Attempting to start the optional local Python AI assistant..."
    if command -v python3 &> /dev/null; then
        if python3 "$PROJECT_ROOT/ai-assistant/start_local.py"; then
            log_success "Local AI assistant startup completed"
        else
            log_warning "AI assistant could not start; banking services and frontend will continue. Customer AI tabs will show Service unavailable."
        fi
    elif command -v python &> /dev/null; then
        if python "$PROJECT_ROOT/ai-assistant/start_local.py"; then
            log_success "Local AI assistant startup completed"
        else
            log_warning "AI assistant could not start; banking services and frontend will continue. Customer AI tabs will show Service unavailable."
        fi
    else
        log_warning "Python is unavailable; banking services and frontend will continue. Customer AI tabs will show Service unavailable."
    fi
}

# Check/build fd-python-base image
check_python_base_image() {
    log_info "Checking fd-python-base Docker image..."
    
    if docker images fd-python-base:latest --format '{{.Repository}}:{{.Tag}}' | grep -q 'fd-python-base:latest'; then
        log_success "fd-python-base image already exists, skipping build"
    else
        log_info "Building fd-python-base image (this may take a few minutes on first run)..."
        cd "$PROJECT_ROOT/FD_Module_Group9"
        if docker build --target java-python-base -t fd-python-base -f Dockerfile .; then
            log_success "fd-python-base image built successfully"
        else
            log_error "Failed to build fd-python-base image"
            exit 1
        fi
        cd "$PROJECT_ROOT"
    fi
}

# Check if frontend dependencies are installed
check_frontend_deps() {
    log_info "Checking frontend dependencies..."
    
    cd "$FRONTEND_DIR"
    
    if [ ! -d "node_modules" ]; then
        log_info "Installing frontend dependencies..."
        npm install
        log_success "Frontend dependencies installed"
    else
        log_success "Frontend dependencies already installed"
    fi
}

# Start frontend
start_frontend() {
    log_info "Starting Angular frontend..."
    
    cd "$FRONTEND_DIR"
    
    # Start the dev server in the background
    log_info "Starting development server on port $FRONTEND_PORT..."
    npm start &
    FRONTEND_PID=$!
    
    # Wait a bit for the server to start
    sleep 5
    
    # Check if the server is running
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        log_success "Frontend started successfully (PID: $FRONTEND_PID)"
    else
        log_error "Failed to start frontend"
        exit 1
    fi
    
    # Wait for the server to be ready
    log_info "Waiting for frontend to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "http://localhost:$FRONTEND_PORT" > /dev/null 2>&1; then
            log_success "Frontend is ready at http://localhost:$FRONTEND_PORT"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    log_warning "Frontend health check timed out, but it should be starting..."
}

# Print access URLs
print_urls() {
    echo ""
    log_success "All services are running!"
    echo ""
    echo -e "${BLUE}Access URLs:${NC}"
    echo -e "  ${GREEN}Frontend:${NC}           http://localhost:$FRONTEND_PORT"
    echo -e "  ${GREEN}Auth Service:${NC}       http://localhost:8090"
    echo -e "  ${GREEN}Product Service:${NC}    http://localhost:8080"
    echo -e "  ${GREEN}Calculator Service:${NC} http://localhost:8084"
    echo -e "  ${GREEN}Account Service:${NC}    http://localhost:8086"
    echo -e "  ${GREEN}AI Assistant (optional):${NC} http://localhost:8091"
    echo -e "  ${GREEN}Notification Service:${NC} http://localhost:8083"
    echo -e "  ${GREEN}Mailpit Web UI:${NC}     http://localhost:8025"
    echo ""
    log_info "To stop all services:"
    echo -e "  ${GREEN}cd $PROJECT_ROOT && docker compose -f docker-compose.yml down${NC}"
    echo -e "  ${GREEN}kill $FRONTEND_PID${NC}  (to stop frontend)"
    echo -e "  ${GREEN}AI assistant PID is printed at startup; stop it with kill <PID>${NC}"
    echo ""
    log_info "To view backend logs:"
    echo -e "  ${GREEN}docker compose -f $PROJECT_ROOT/docker-compose.yml logs -f${NC}"
    echo -e "  ${GREEN}tail -f /tmp/uno-ai-assistant.log${NC}"
    echo ""
}

# Main execution
main() {
    print_banner
    
    check_prerequisites
    
    log_info "Starting complete initialization..."
    echo ""
    
    # Check/build fd-python-base image
    check_python_base_image
    echo ""
    
    # Start backend services
    start_backend
    echo ""

    # Non-critical: failures here must not prevent the frontend or banking services from starting.
    start_optional_ai_assistant
    echo ""
    
    # Check and install frontend dependencies
    check_frontend_deps
    echo ""
    
    # Start frontend
    start_frontend
    echo ""
    
    # Print access URLs
    print_urls
    
    # Keep the script running to show frontend output
    log_info "Frontend is running. Press Ctrl+C to stop."
    log_info "Backend services will continue running in Docker."
    
    # Wait for the frontend process
    wait $FRONTEND_PID
}

# Trap Ctrl+C to cleanup
trap 'echo ""; log_warning "Shutting down..."; kill $FRONTEND_PID 2>/dev/null; exit 0' INT TERM

# Run main function
main
