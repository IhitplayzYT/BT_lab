# Complete Startup Script (Windows PowerShell)
# This script will:
# 1. Initialize and start all backend microservices
# 2. Start the Angular frontend development server

$ErrorActionPreference = "Stop"

# Configuration
$PROJECT_ROOT = $PSScriptRoot

# FRONTEND_TYPE: Choose which frontend to use
# Options: "full" for uno-frontend (1)\uno-frontend, "light" for uno-frontend-light
$FRONTEND_TYPE = "full"

if ($FRONTEND_TYPE -eq "light") {
    $FRONTEND_DIR = Join-Path $PROJECT_ROOT "uno-frontend-light"
} else {
    $FRONTEND_DIR = Join-Path $PROJECT_ROOT "uno-frontend (1)\uno-frontend"
}

$FRONTEND_PORT = 4200

# Function to print colored messages
function Log-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Log-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Log-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Log-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Print banner
function Print-Banner {
    Write-Host "================================================" -ForegroundColor Blue
    Write-Host "  UNO Bank - Complete Startup Script" -ForegroundColor Blue
    Write-Host "================================================" -ForegroundColor Blue
    Write-Host ""
    Write-Host "This script will:"
    Write-Host "  1. Initialize all backend microservices"
    Write-Host "  2. Start the Angular frontend"
    Write-Host ""
}

# Check prerequisites
function Test-Prerequisites {
    Log-Info "Checking prerequisites..."
    
    # Check if init_all_services.ps1 exists
    if (-not (Test-Path (Join-Path $PROJECT_ROOT "init_all_services.ps1"))) {
        Log-Error "init_all_services.ps1 not found in $PROJECT_ROOT"
        exit 1
    }
    
    # Check if frontend directory exists
    if (-not (Test-Path $FRONTEND_DIR)) {
        Log-Error "Frontend directory not found at $FRONTEND_DIR"
        exit 1
    }
    
    # Check if Node.js is installed
    try {
        $null = node --version
    } catch {
        Log-Error "Node.js is not installed. Please install Node.js first."
        exit 1
    }
    
    # Check if npm is installed
    try {
        $null = npm --version
    } catch {
        Log-Error "npm is not installed. Please install npm first."
        exit 1
    }
    
    Log-Success "Prerequisites check passed"
}

# Start backend services
function Start-Backend {
    Log-Info "Starting backend microservices..."
    
    Push-Location $PROJECT_ROOT
    try {
        # Run the init script
        & .\init_all_services.ps1
        if ($LASTEXITCODE -eq 0) {
            Log-Success "Backend services started successfully"
        } else {
            Log-Error "Failed to start backend services"
            exit 1
        }
    } finally {
        Pop-Location
    }
}

# Optional local Python service: catch setup/start errors and continue normal application startup.
function Start-OptionalAiAssistant {
    Log-Info "Attempting to start the optional local Python AI assistant..."
    try {
        $assistantLauncher = Join-Path $PROJECT_ROOT "ai-assistant\start_local.py"
        if (Get-Command py -ErrorAction SilentlyContinue) {
            & py -3 $assistantLauncher
        } elseif (Get-Command python -ErrorAction SilentlyContinue) {
            & python $assistantLauncher
        } else {
            Log-Warning "Python is unavailable; banking services and frontend will continue. Customer AI tabs will show Service unavailable."
            return
        }
        if ($LASTEXITCODE -eq 0) {
            Log-Success "Local AI assistant startup completed"
        } else {
            Log-Warning "AI assistant could not start; banking services and frontend will continue. Customer AI tabs will show Service unavailable."
        }
    } catch {
        Log-Warning "AI assistant could not start; banking services and frontend will continue. Customer AI tabs will show Service unavailable."
    }
}

# Check/build fd-python-base image
function Test-PythonBaseImage {
    Log-Info "Checking fd-python-base Docker image..."
    
    $imageExists = docker images fd-python-base:latest --format '{{.Repository}}:{{.Tag}}' | Select-String -Pattern 'fd-python-base:latest'
    
    if ($imageExists) {
        Log-Success "fd-python-base image already exists, skipping build"
    } else {
        Log-Info "Building fd-python-base image (this may take a few minutes on first run)..."
        Push-Location $PROJECT_ROOT
        try {
            docker build --target python-base -t fd-python-base -f FD_Module_Group9/Dockerfile .
            if ($LASTEXITCODE -eq 0) {
                Log-Success "fd-python-base image built successfully"
            } else {
                Log-Error "Failed to build fd-python-base image"
                exit 1
            }
        } finally {
            Pop-Location
        }
    }
}

# Check if frontend dependencies are installed
function Test-FrontendDeps {
    Log-Info "Checking frontend dependencies..."
    
    Push-Location $FRONTEND_DIR
    try {
        if (-not (Test-Path "node_modules")) {
            Log-Info "Installing frontend dependencies..."
            npm install
            Log-Success "Frontend dependencies installed"
        } else {
            Log-Success "Frontend dependencies already installed"
        }
    } finally {
        Pop-Location
    }
}

# Start frontend
function Start-Frontend {
    Log-Info "Starting Angular frontend..."
    
    Push-Location $FRONTEND_DIR
    try {
        # Start the dev server in the background
        Log-Info "Starting development server on port $FRONTEND_PORT..."
        $process = Start-Process -FilePath "npm" -ArgumentList "start" -PassThru
        
        # Wait a bit for the server to start
        Start-Sleep -Seconds 5
        
        # Check if the server is running
        if (Get-Process -Id $process.Id -ErrorAction SilentlyContinue) {
            Log-Success "Frontend started successfully (PID: $($process.Id))"
            return $process
        } else {
            Log-Error "Failed to start frontend"
            exit 1
        }
    } finally {
        Pop-Location
    }
    
    # Wait for the server to be ready
    Log-Info "Waiting for frontend to be ready..."
    $maxAttempts = 30
    $attempt = 1
    
    while ($attempt -le $maxAttempts) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$FRONTEND_PORT" -UseBasicParsing -TimeoutSec 2
            if ($response.StatusCode -eq 200) {
                Log-Success "Frontend is ready at http://localhost:$FRONTEND_PORT"
                return $process
            }
        } catch {
            # Continue trying
        }
        
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
        $attempt++
    }
    
    Log-Warning "Frontend health check timed out, but it should be starting..."
    return $process
}

# Print access URLs
function Print-Urls {
    Write-Host ""
    Log-Success "All services are running!"
    Write-Host ""
    Write-Host "Access URLs:" -ForegroundColor Blue
    Write-Host "  Frontend:           http://localhost:$FRONTEND_PORT" -ForegroundColor Green
    Write-Host "  Auth Service:       http://localhost:8090" -ForegroundColor Green
    Write-Host "  Product Service:    http://localhost:8080" -ForegroundColor Green
    Write-Host "  Calculator Service: http://localhost:8084" -ForegroundColor Green
    Write-Host "  Account Service:    http://localhost:8086" -ForegroundColor Green
    Write-Host "  AI Assistant (optional): http://localhost:8091" -ForegroundColor Green
    Write-Host "  Notification Service: http://localhost:8083" -ForegroundColor Green
    Write-Host "  Mailpit Web UI:     http://localhost:8025" -ForegroundColor Green
    Write-Host ""
    Log-Info "To stop all services:"
    Write-Host "  docker compose -f $PROJECT_ROOT\docker-compose.yml down" -ForegroundColor Green
    Write-Host "  Stop-Process -Id $FRONTEND_PID  (to stop frontend)" -ForegroundColor Green
    Write-Host "  AI assistant PID is printed at startup; stop it with Stop-Process -Id <PID>" -ForegroundColor Green
    Write-Host ""
    Log-Info "To view backend logs:"
    Write-Host "  docker compose -f $PROJECT_ROOT\docker-compose.yml logs -f" -ForegroundColor Green
    Write-Host "  Get-Content $env:TEMP\uno-ai-assistant.log -Wait" -ForegroundColor Green
    Write-Host ""
}

# Main execution
function Main {
    Print-Banner
    
    Test-Prerequisites
    
    Log-Info "Starting complete initialization..."
    Write-Host ""
    
    # Check/build fd-python-base image
    Test-PythonBaseImage
    Write-Host ""
    
    # Start backend services
    Start-Backend
    Write-Host ""

    # Non-critical: this function handles its own errors and never exits startup.
    Start-OptionalAiAssistant
    Write-Host ""
    
    # Check and install frontend dependencies
    Test-FrontendDeps
    Write-Host ""
    
    # Start frontend
    $FRONTEND_PID = Start-Frontend
    Write-Host ""
    
    # Print access URLs
    Print-Urls
    
    # Keep the script running to show frontend output
    Log-Info "Frontend is running. Press Ctrl+C to stop."
    Log-Info "Backend services will continue running in Docker."
    
    # Wait for the frontend process
    Wait-Process -Id $FRONTEND_PID
}

# Trap Ctrl+C to cleanup
$null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action {
    Write-Host ""
    Log-Warning "Shutting down..."
    if ($FRONTEND_PID) {
        Stop-Process -Id $FRONTEND_PID -ErrorAction SilentlyContinue
    }
}

# Run main function
try {
    Main
} finally {
    # Cleanup on exit
    if ($FRONTEND_PID) {
        Stop-Process -Id $FRONTEND_PID -ErrorAction SilentlyContinue
    }
}
