#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# Banking Technology Lab - Unified Backend Startup Script
# Starts all three backends: fd-calculator, product-service, and FD_Module_Group9
# Initializes data and verifies interaction
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}==========================================================${NC}"
echo -e "${GREEN}   BANKING TECHNOLOGY LAB - FULL SYSTEM STARTUP${NC}"
echo -e "${GREEN}==========================================================${NC}"

# Directories
FD_CALC_DIR="/home/ihitplayzyt/Downloads/BT_LAB/fd_calc/mod 4 backend"
PRODUCT_DIR="/home/ihitplayzyt/Downloads/BT_LAB/product&pricing module/product&pricing module/banking-product-backend"
FD_GROUP9_DIR="/home/ihitplayzyt/Downloads/BT_LAB/FD_Module_Group9"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"
if ! command_exists docker; then
    echo -e "${RED}ERROR: Docker is not installed${NC}"
    exit 1
fi
if ! command_exists docker-compose; then
    echo -e "${RED}ERROR: docker-compose is not installed${NC}"
    exit 1
fi
if ! command_exists mvn; then
    echo -e "${RED}ERROR: Maven is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Prerequisites check passed${NC}"

# Generate random JWT_SECRET if not set
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -hex 32)
    export JWT_SECRET
    echo -e "${YELLOW}Generated JWT_SECRET: ${JWT_SECRET}${NC}"
fi

# Set default DB_PASSWORD if not set
if [ -z "$DB_PASSWORD" ]; then
    export DB_PASSWORD="12345"
    echo -e "${YELLOW}Using default DB_PASSWORD: ${DB_PASSWORD}${NC}"
fi
# Set MYSQL_ROOT_PASSWORD to the same as DB_PASSWORD for fd-mysql service
export MYSQL_ROOT_PASSWORD=$DB_PASSWORD

# Stop and remove existing containers and volumes
echo -e "\n${YELLOW}Stopping existing containers and removing volumes...${NC}"
cd "$FD_CALC_DIR"
docker-compose down -v 2>/dev/null || true
cd "$PRODUCT_DIR"
docker-compose down -v 2>/dev/null || true
cd "/home/ihitplayzyt/Downloads/BT_LAB"
docker-compose down -v 2>/dev/null || true

# Build all backends
echo -e "\n${YELLOW}Building FD Calculator backend...${NC}"
cd "$FD_CALC_DIR"
if [ ! -f "target/fd-calculator-*.jar" ]; then
    mvn clean package -DskipTests
    echo -e "${GREEN}✓ FD Calculator JAR built${NC}"
else
    echo -e "${GREEN}✓ FD Calculator JAR already exists${NC}"
fi

echo -e "\n${YELLOW}Building Product & Pricing backend...${NC}"
cd "$PRODUCT_DIR"
if [ ! -f "target/product-*.jar" ]; then
    mvn clean package -DskipTests
    echo -e "${GREEN}✓ Product & Pricing JAR built${NC}"
else
    echo -e "${GREEN}✓ Product & Pricing JAR already exists${NC}"
fi

echo -e "\n${YELLOW}Building FD Module Group9 services...${NC}"
cd "$FD_GROUP9_DIR"
if [ ! -f "fd-account-service/target/fd-account-service-1.0.0.jar" ]; then
    ./mvnw clean package -Dmaven.test.skip=true
    echo -e "${GREEN}✓ FD Module Group9 JARs built${NC}"
else
    echo -e "${GREEN}✓ FD Module Group9 JARs already exist${NC}"
fi

# Start all services via docker-compose
echo -e "\n${YELLOW}Starting all services via docker-compose...${NC}"
cd "/home/ihitplayzyt/Downloads/BT_LAB"
docker-compose pull 2>/dev/null || true
docker-compose up -d --build

# Wait for services to be healthy
echo -e "\n${YELLOW}Waiting for services to be healthy (this may take 2-3 minutes)...${NC}"

# Define service health check URLs
declare -A SERVICES=(
    ["fd-calculator"]="http://localhost:8084/actuator/health"
    ["product-service"]="http://localhost:8080/actuator/health"
    ["auth-service"]="http://localhost:8090/actuator/health"
    ["fd-account-service"]="http://localhost:8086/actuator/health"
    ["interest-batch-service"]="http://localhost:8081/actuator/health"
    ["statement-service"]="http://localhost:8082/actuator/health"
    ["notification-service"]="http://localhost:8083/actuator/health"
)

MAX_ATTEMPTS=45
ATTEMPT=0
ALL_UP=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ] && [ $ALL_UP -eq 0 ]; do
    ALL_UP=1
    echo -n "."
    for SERVICE_NAME in "${!SERVICES[@]}"; do
        URL=${SERVICES[$SERVICE_NAME]}
        STATUS=$(curl -s "$URL" 2>/dev/null || echo '"DOWN"')
        if echo "$STATUS" | grep -q '"UP"'; then
            # Service is up
            :
        else
            ALL_UP=0
            break
        fi
    done
    if [ $ALL_UP -eq 0 ]; then
        ATTEMPT=$((ATTEMPT + 1))
        sleep 4
    fi
done

echo "" # New line after dots

if [ $ALL_UP -eq 1 ]; then
    echo -e "${GREEN}✓ All services are healthy!${NC}"
else
    echo -e "${RED}ERROR: Some services did not become healthy within expected time${NC}"
    echo -e "${YELLOW}Check logs with:${NC}"
    for SERVICE_NAME in "${!SERVICES[@]}"; do
        echo -e "  docker logs $(echo $SERVICE_NAME | tr '_' '-')"
    done
    docker-compose ps
    exit 1
fi

# Run a simple interaction test
echo -e "\n${YELLOW}Running basic interaction test...${NC}"

# Test 1: Verify auth-service is reachable
echo -e "\n${YELLOW}Testing auth-service endpoint...${NC}"
AUTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8090/actuator/health || echo "000")
if [ "$AUTH_RESPONSE" -eq 200 ]; then
    echo -e "${GREEN}✓ auth-service is responsive${NC}"
else
    echo -e "${RED}✗ auth-service returned HTTP $AUTH_RESPONSE${NC}"
fi

# Test 2: Verify fd-account-service is reachable
echo -e "\n${YELLOW}Testing fd-account-service endpoint...${NC}"
ACCOUNT_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8086/actuator/health || echo "000")
if [ "$ACCOUNT_RESPONSE" -eq 200 ]; then
    echo -e "${GREEN}✓ fd-account-service is responsive${NC}"
else
    echo -e "${RED}✗ fd-account-service returned HTTP $ACCOUNT_RESPONSE${NC}"
fi

# Test 3: Verify fd-calculator is reachable
echo -e "\n${YELLOW}Testing fd-calculator endpoint...${NC}"
CALC_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8084/actuator/health || echo "000")
if [ "$CALC_RESPONSE" -eq 200 ]; then
    echo -e "${GREEN}✓ fd-calculator is responsive${NC}"
else
    echo -e "${RED}✗ fd-calculator returned HTTP $CALC_RESPONSE${NC}"
fi

# Test 4: Verify product-service is reachable
echo -e "\n${YELLOW}Testing product-service endpoint...${NC}"
PRODUCT_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health || echo "000")
if [ "$PRODUCT_RESPONSE" -eq 200 ]; then
    echo -e "${GREEN}✓ product-service is responsive${NC}"
else
    echo -e "${RED}✗ product-service returned HTTP $PRODUCT_RESPONSE${NC}"
fi

# Test 5: Try to get a token from auth-service (if there's a public endpoint)
# We'll skip if not available, as we don't know credentials
echo -e "\n${YELLOW}Testing if auth-service has a public endpoint...${NC}"
PUBLIC_TEST=$(curl -s http://localhost:8090/ 2>&1 | head -c 100 || echo "Connection refused")
if echo "$PUBLIC_TEST" | grep -q "HTTP"; then
    echo -e "${GREEN}✓ auth-service accepts connections${NC}"
else
    echo -e "${YELLOW}auth-service may not have a public root endpoint (this is normal)${NC}"
fi

echo -e "\n${GREEN}==========================================================${NC}"
echo -e "${GREEN}   ALL BACKENDS STARTED SUCCESSFULLY${NC}"
echo -e "${GREEN}==========================================================${NC}"
echo -e "\nServices:"
echo -e "  - FD Calculator:     http://localhost:8084"
echo -e "  - Product Service:   http://localhost:8080"
echo -e "  - Auth Service:      http://localhost:8090"
echo -e "  - Account Service:   http://localhost:8086"
echo -e "  - Interest Batch:    http://localhost:8081"
echo -e "  - Statement Service: http://localhost:8082"
echo -e "  - Notification Service: http://localhost:8083"
echo -e "\nSwagger UI (if enabled):"
echo -e "  - FD Calculator:     http://localhost:8084/swagger-ui/index.html"
echo -e "  - Product Service:   http://localhost:8080/swagger-ui/index.html"
echo -e "  - Account Service:   http://localhost:8086/swagger-ui/index.html"
echo -e "\nHealth Checks:"
echo -e "  - FD Calculator:     http://localhost:8084/actuator/health"
echo -e "  - Product Service:   http://localhost:8080/actuator/health"
echo -e "  - Auth Service:      http://localhost:8090/actuator/health"
echo -e "  - Account Service:   http://localhost:8086/actuator/health"
echo -e "  - Interest Batch:    http://localhost:8081/actuator/health"
echo -e "  - Statement Service: http://localhost:8082/actuator/health"
echo -e "  - Notification:      http://localhost:8083/actuator/health"
echo -e "\nDatabases:"
echo -e "  - FD MySQL:          localhost:3307 (database: fd_calculator)"
echo -e "  - Product MySQL:     localhost:3308 (database: banking_product_db)"
echo -e "  - FD Group9 MySQL:   localhost:3310 (database: banking_technology_lab, fd_batch, fd_statements, fd_notifications)"
echo -e "\nKafka:                 localhost:9092"
echo -e "\n${YELLOW}To stop all services, run:${NC}"
echo -e "  docker-compose down"
echo -e "${YELLOW}To remove volumes (data), run:${NC}"
echo -e "  docker-compose down -v"
echo -e "\n${GREEN}Startup complete!${NC}"
