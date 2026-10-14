#!/bin/bash

# ══════════════════════════════════════════════════════════════════════════════
# Banking Technology Lab - Unified Backend Startup Script
# Starts FD Calculator and Product & Pricing backends with their databases
# ══════════════════════════════════════════════════════════════════════════════

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Directories
FD_BACKEND_DIR="/home/ihitplayzyt/Downloads/BT_LAB/fd_calc/mod 4 backend"
PRODUCT_BACKEND_DIR="/home/ihitplayzyt/Downloads/BT_LAB/product&pricing module/product&pricing module/banking-product-backend"

echo -e "${GREEN}==========================================================${NC}"
echo -e "${GREEN}   BANKING TECHNOLOGY LAB - BACKEND STARTUP SCRIPT${NC}"
echo -e "${GREEN}==========================================================${NC}"

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

# Build FD Calculator JAR
echo -e "\n${YELLOW}Building FD Calculator backend...${NC}"
cd "$FD_BACKEND_DIR"
if [ ! -f "target/fd-calculator-*.jar" ]; then
    mvn clean package -DskipTests
    echo -e "${GREEN}✓ FD Calculator JAR built${NC}"
else
    echo -e "${GREEN}✓ FD Calculator JAR already exists${NC}"
fi

# Build Product & Pricing JAR
echo -e "\n${YELLOW}Building Product & Pricing backend...${NC}"
cd "$PRODUCT_BACKEND_DIR"
if [ ! -f "target/product-*.jar" ]; then
    mvn clean package -DskipTests
    echo -e "${GREEN}✓ Product & Pricing JAR built${NC}"
else
    echo -e "${GREEN}✓ Product & Pricing JAR already exists${NC}"
fi

# Stop and remove existing containers
echo -e "\n${YELLOW}Stopping existing containers...${NC}"
cd "$FD_BACKEND_DIR"
docker-compose down 2>/dev/null || true
cd "$PRODUCT_BACKEND_DIR"
docker-compose down 2>/dev/null || true

# Start FD Calculator with MySQL
echo -e "\n${YELLOW}Starting FD Calculator backend and MySQL...${NC}"
cd "$FD_BACKEND_DIR"
docker-compose up -d

# Start Product & Pricing with MySQL
echo -e "\n${YELLOW}Starting Product & Pricing backend and MySQL...${NC}"
cd "$PRODUCT_BACKEND_DIR"
docker-compose up -d

echo -e "\n${GREEN}==========================================================${NC}"
echo -e "${GREEN}   BACKENDS STARTED SUCCESSFULLY${NC}"
echo -e "${GREEN}==========================================================${NC}"
echo -e "\nServices:"
echo -e "  - FD Calculator:     http://localhost:8084"
echo -e "  - Product Service:   http://localhost:8080"
echo -e "  - FD MySQL:          localhost:3307"
echo -e "  - Product MySQL:     localhost:3306"
echo -e "\nSwagger UI:"
echo -e "  - FD Calculator:     http://localhost:8084/swagger-ui/index.html"
echo -e "  - Product Service:   http://localhost:8080/swagger-ui/index.html"
echo -e "\nHealth Checks:"
echo -e "  - FD Calculator:     http://localhost:8084/actuator/health"
echo -e "  - Product Service:   http://localhost:8080/actuator/health"
echo -e "\n${YELLOW}Waiting for services to be healthy (this may take 1-2 minutes)...${NC}"

# Wait for services to be healthy
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    fd_health=$(curl -s http://localhost:8084/actuator/health 2>/dev/null || echo "unavailable")
    product_health=$(curl -s http://localhost:8080/actuator/health 2>/dev/null || echo "unavailable")
    
    if echo "$fd_health" | grep -q "UP" && echo "$product_health" | grep -q "UP"; then
        echo -e "${GREEN}✓ All services are healthy!${NC}"
        break
    fi
    
    attempt=$((attempt + 1))
    echo -n "."
    sleep 4
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "\n${RED}WARNING: Services did not become healthy within expected time${NC}"
    echo -e "${YELLOW}Check logs with:${NC}"
    echo -e "  docker logs fd-calculator"
    echo -e "  docker logs product-service"
fi

echo -e "\n${GREEN}==========================================================${NC}"
