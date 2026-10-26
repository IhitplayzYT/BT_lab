$ErrorActionPreference='Stop'
$projectRoot=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$pythonDir=Join-Path $projectRoot 'reports/python'
$venvDir=Join-Path $pythonDir 'venv'
$requirementsFile=Join-Path $pythonDir 'requirements.txt'

Write-Output "Setting up Python environment for report generation..."

# Check if venv exists
if (!(Test-Path -LiteralPath $venvDir)) {
    Write-Output "Creating Python virtual environment at $venvDir..."
    python3 -m venv $venvDir
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create virtual environment. Make sure python3 is installed."
    }
    Write-Output "Virtual environment created successfully."
} else {
    Write-Output "Virtual environment already exists at $venvDir"
}

# Check if requirements file exists
if (!(Test-Path -LiteralPath $requirementsFile)) {
    throw "Requirements file not found at $requirementsFile"
}

# Install requirements
Write-Output "Installing Python packages from requirements.txt..."
$pythonExe = Join-Path $venvDir 'bin/python'
if ($IsWindows) {
    $pythonExe = Join-Path $venvDir 'Scripts/python.exe'
}

& $pythonExe -m pip install -r $requirementsFile --upgrade
if ($LASTEXITCODE -ne 0) {
    throw "Failed to install Python packages."
}

Write-Output "Python environment setup completed successfully."
Write-Output "Python executable: $pythonExe"
