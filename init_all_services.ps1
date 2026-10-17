# Initialization Script for All 3 Microservices (Windows PowerShell)
# This script will:
# 1. Build and start all Docker containers
# 2. Wait for all services to be healthy
# 3. Initialize databases with seed data
# 4. Verify all services are running

$ErrorActionPreference = "Stop"

# Configuration
$COMPOSE_FILE = "docker-compose.yml"
$PROJECT_ROOT = $PSScriptRoot
$LOG_FILE = Join-Path $PROJECT_ROOT "startup.log"

# Service ports
$AUTH_PORT = 8090
$PRODUCT_PORT = 8080
$CALCULATOR_PORT = 8084
$ACCOUNT_PORT = 8086

# Function to print colored messages
function Log-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
    Add-Content -Path $LOG_FILE -Value "[INFO] $Message"
}

function Log-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
    Add-Content -Path $LOG_FILE -Value "[SUCCESS] $Message"
}

function Log-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
    Add-Content -Path $LOG_FILE -Value "[WARNING] $Message"
}

function Log-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
    Add-Content -Path $LOG_FILE -Value "[ERROR] $Message"
}

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# Function to wait for a service to be healthy
function Wait-ForService {
    param(
        [string]$ServiceName,
        [string]$Url,
        [int]$MaxAttempts = 30
    )
    
    Log-Info "Waiting for $ServiceName to be healthy..."
    
    $attempt = 1
    while ($attempt -le $MaxAttempts) {
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Log-Success "$ServiceName is healthy!"
                return $true
            }
        } catch {
            # Continue trying
        }
        
        Write-Host "." -NoNewline
        Add-Content -Path $LOG_FILE -Value "."
        Start-Sleep -Seconds 3
        $attempt++
    }
    
    Log-Error "$ServiceName failed to become healthy after $($MaxAttempts * 3) seconds"
    return $false
}

# Function to check container health
function Test-ContainerHealth {
    param(
        [string]$ContainerName,
        [int]$MaxAttempts = 60
    )
    
    Log-Info "Checking health of container: $ContainerName"
    
    $attempt = 1
    while ($attempt -le $MaxAttempts) {
        try {
            $container = docker inspect --format='{{.State.Health.Status}}' $ContainerName 2>$null
            
            if ($container -eq "healthy") {
                Log-Success "$ContainerName is healthy"
                return $true
            } elseif ($container -eq "unhealthy") {
                Log-Error "$ContainerName is unhealthy"
                return $false
            }
        } catch {
            # Container might not have healthcheck or still starting
        }
        
        Write-Host "." -NoNewline
        Add-Content -Path $LOG_FILE -Value "."
        Start-Sleep -Seconds 3
        $attempt++
    }
    
    Log-Warning "$ContainerName health check timed out (may still be starting)"
    return $true
}

# Print banner
function Print-Banner {
    Write-Host "================================================" -ForegroundColor Blue
    Write-Host "  Microservices Initialization Script" -ForegroundColor Blue
    Write-Host "================================================" -ForegroundColor Blue
    Write-Host ""
    Write-Host "This script will initialize all 3 microservices:"
    Write-Host "  1. FD Calculator Service (port $CALCULATOR_PORT)"
    Write-Host "  2. Product & Pricing Service (port $PRODUCT_PORT)"
    Write-Host "  3. FD Account Service (port $ACCOUNT_PORT)"
    Write-Host "  4. Auth Service (port $AUTH_PORT)"
    Write-Host ""
}

# Check prerequisites
function Test-Prerequisites {
    Log-Info "Checking prerequisites..."
    
    # Check if Docker is installed
    try {
        $null = docker --version
    } catch {
        Log-Error "Docker is not installed. Please install Docker Desktop for Windows first."
        exit 1
    }
    
    # Check if docker-compose.yml exists
    if (-not (Test-Path (Join-Path $PROJECT_ROOT $COMPOSE_FILE))) {
        Log-Error "docker-compose.yml not found in $PROJECT_ROOT"
        exit 1
    }
    
    Log-Success "Prerequisites check passed"
}

# Stop existing containers
function Stop-ExistingContainers {
    Log-Info "Stopping existing containers..."
    
    Push-Location $PROJECT_ROOT
    try {
        docker compose -f $COMPOSE_FILE down 2>&1 | Out-File -Append -FilePath $LOG_FILE
        Log-Success "Existing containers stopped"
    } catch {
        Log-Warning "No existing containers to stop or error stopping them"
    } finally {
        Pop-Location
    }
}

# Build and start containers
function Build-AndStart {
    Log-Info "Building and starting all containers..."
    
    Push-Location $PROJECT_ROOT
    try {
        mvn -B -f Auth_Sec/pom.xml install -DskipTests
        if ($LASTEXITCODE -ne 0) { throw "Auth build failed" }
        mvn -B -f FD_Module_Group9/pom.xml -pl fd-account-service -am package -DskipTests
        if ($LASTEXITCODE -ne 0) { throw "Account build failed" }
        mvn -B -f "fd_calc/mod 4 backend/pom.xml" package -DskipTests
        if ($LASTEXITCODE -ne 0) { throw "Calculator build failed" }
        docker compose -f $COMPOSE_FILE up -d --build 2>&1 | Out-File -Append -FilePath $LOG_FILE
        if ($LASTEXITCODE -ne 0) { throw "Docker startup failed" }
        Log-Success "Containers built and started"
        
        # Show running containers
        Log-Info "Running containers:"
        docker compose -f $COMPOSE_FILE ps | Tee-Object -FilePath $LOG_FILE -Append
    } catch {
        Log-Error "Failed to build and start containers"
        exit 1
    } finally {
        Pop-Location
    }
}

# Wait for all services to be ready
function Wait-ForServices {
    Log-Info "Waiting for all services to be ready..."
    
    # Wait for databases first
    Test-ContainerHealth "fd-mysql"
    Test-ContainerHealth "product-mysql"
    Test-ContainerHealth "fd-group9-mysql"
    Test-ContainerHealth "auth-mysql"
    
    # Wait for Kafka
    Test-ContainerHealth "kafka"
    
    # Wait for application services
    Test-ContainerHealth "fd-calculator"
    Test-ContainerHealth "product-service"
    Test-ContainerHealth "fd-account-service"
    Test-ContainerHealth "fd-auth-service"
    
    # Wait for HTTP endpoints to respond
    Log-Info "Waiting for HTTP endpoints to respond..."
    
    Wait-ForService "Auth Service" "http://localhost:$AUTH_PORT/health" | Out-Null
    Wait-ForService "Product Service" "http://localhost:$PRODUCT_PORT/actuator/health" | Out-Null
    Wait-ForService "Calculator Service" "http://localhost:$CALCULATOR_PORT/actuator/health" | Out-Null
    Wait-ForService "Account Service" "http://localhost:$ACCOUNT_PORT/health" | Out-Null
}

# Initialize data
function Initialize-Data {
    Log-Info "Checking database initialization..."
    
    Get-Content -Raw (Join-Path $PROJECT_ROOT "FD_Module_Group9/fd-account-service/sql/migration_remove_product_fk.sql") | docker exec -i fd-group9-mysql sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD"'
    if ($LASTEXITCODE -ne 0) { throw "Account migration failed" }
    Get-Content -Raw (Join-Path $PROJECT_ROOT "banking-product-backend/migration_legacy_id.sql") | docker exec -i product-mysql sh -c 'mysql -uproduct_user -p"$MYSQL_PASSWORD"'
    if ($LASTEXITCODE -ne 0) { throw "Product migration failed" }
    # Databases are initialized automatically via docker-entrypoint-initdb.d
    # Check if initialization scripts exist
    if (Test-Path (Join-Path $PROJECT_ROOT "fd_calc\mod 4 backend\src\main\resources\db\init.sql")) {
        Log-Success "FD Calculator database init script found"
    }
    
    if (Test-Path (Join-Path $PROJECT_ROOT "banking-product-backend\schema.sql")) {
        Log-Success "Product Service database schema found"
    }
    
    if (Test-Path (Join-Path $PROJECT_ROOT "FD_Module_Group9\scripts\init-local-databases.sql")) {
        Log-Success "FD Account Service database init script found"
    }
    
    if (Test-Path (Join-Path $PROJECT_ROOT "Auth_Sec\auth-service\src\main\resources\db\init.sql")) {
        Log-Success "Auth Service database init script found"
    }
    
    Log-Info "Database initialization will be handled automatically by MySQL containers"
}

# Verify services
function Test-Services {
    Log-Info "Verifying all services are running..."
    
    # Check Auth Service
    try {
        Invoke-WebRequest -Uri "http://localhost:$AUTH_PORT/api/auth/login" -Method POST -Body '{"username":"test","password":"test"}' -ContentType "application/json" -UseBasicParsing -TimeoutSec 5 | Out-Null
        Log-Success "Auth Service is responding on port $AUTH_PORT"
    } catch {
        Log-Warning "Auth Service may not be fully ready yet"
    }
    
    # Check Product Service
    try {
        Invoke-WebRequest -Uri "http://localhost:$PRODUCT_PORT/actuator/health" -UseBasicParsing -TimeoutSec 5 | Out-Null
        Log-Success "Product Service is responding on port $PRODUCT_PORT"
    } catch {
        Log-Warning "Product Service may not be fully ready yet"
    }
    
    # Check Calculator Service
    try {
        Invoke-WebRequest -Uri "http://localhost:$CALCULATOR_PORT/actuator/health" -UseBasicParsing -TimeoutSec 5 | Out-Null
        Log-Success "Calculator Service is responding on port $CALCULATOR_PORT"
    } catch {
        Log-Warning "Calculator Service may not be fully ready yet"
    }
    
    # Check Account Service
    try {
        Invoke-WebRequest -Uri "http://localhost:$ACCOUNT_PORT/health" -UseBasicParsing -TimeoutSec 5 | Out-Null
        Log-Success "Account Service is responding on port $ACCOUNT_PORT"
    } catch {
        Log-Warning "Account Service may not be fully ready yet"
    }
}

# Print service URLs
function Print-ServiceUrls {
    Write-Host ""
    Log-Info "Service URLs:"
    Write-Host "  Auth Service:       http://localhost:$AUTH_PORT" -ForegroundColor Green
    Write-Host "  Product Service:    http://localhost:$PRODUCT_PORT" -ForegroundColor Green
    Write-Host "  Calculator Service: http://localhost:$CALCULATOR_PORT" -ForegroundColor Green
    Write-Host "  Account Service:    http://localhost:$ACCOUNT_PORT" -ForegroundColor Green
    Write-Host ""
    Log-Info "Database Ports:"
    Write-Host "  FD Calculator DB:   localhost:3307" -ForegroundColor Green
    Write-Host "  Product DB:         localhost:3308" -ForegroundColor Green
    Write-Host "  Auth DB:            localhost:3309" -ForegroundColor Green
    Write-Host "  FD Account DB:      localhost:3310" -ForegroundColor Green
    Write-Host ""
}

# Main execution
function Main {
    # Clear log file
    if (Test-Path $LOG_FILE) {
        Clear-Content $LOG_FILE
    } else {
        New-Item -Path $LOG_FILE -ItemType File -Force | Out-Null
    }
    
    Print-Banner
    
    Test-Prerequisites
    
    Log-Info "Starting initialization process..."
    Write-Host "Full log available at: $LOG_FILE"
    Write-Host ""
    
    Stop-ExistingContainers
    Build-AndStart
    Wait-ForServices
    Initialize-Data
    Test-Services
    Print-ServiceUrls
    
    Log-Success "Initialization complete!"
    Write-Host ""
    Log-Info "You can now run the smoke test:"
    Write-Host "  python smoke_test.py" -ForegroundColor Green
    Write-Host ""
    Log-Info "To view logs:"
    Write-Host "  docker compose -f $COMPOSE_FILE logs -f" -ForegroundColor Green
    Write-Host ""
    Log-Info "To stop all services:"
    Write-Host "  docker compose -f $COMPOSE_FILE down" -ForegroundColor Green
    Write-Host ""
}

# Run main function
Main
