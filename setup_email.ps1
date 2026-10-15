# Email Configuration Setup Script for Gmail SMTP (Windows PowerShell)
# This script helps configure the notification service to send emails via Gmail

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Gmail SMTP Configuration Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will configure the notification service to send emails via Gmail."
Write-Host ""
Write-Host "PREREQUISITES:"
Write-Host "1. Go to Google Account Settings: https://myaccount.google.com"
Write-Host "2. Enable 2-Factor Authentication"
Write-Host "3. Generate an App Password at: https://myaccount.google.com/apppasswords"
Write-Host "4. Select 'Mail' and 'Other (Custom name)'"
Write-Host "5. Copy the 16-character App Password"
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan

# Prompt for Gmail App Password
$APP_PASSWORD = Read-Host "Enter your Gmail App Password (16 characters)"

if ([string]::IsNullOrWhiteSpace($APP_PASSWORD)) {
    Write-Host "ERROR: App Password is required" -ForegroundColor Red
    exit 1
}

if ($APP_PASSWORD.Length -ne 16) {
    Write-Host "WARNING: App Password should be 16 characters. You entered $($APP_PASSWORD.Length) characters." -ForegroundColor Yellow
    $CONTINUE = Read-Host "Continue anyway? (y/n)"
    if ($CONTINUE -ne "y") {
        exit 1
    }
}

# Configuration
$GMAIL_EMAIL = "ihitexe@gmail.com"
$SMTP_HOST = "smtp.gmail.com"
$SMTP_PORT = "587"
$FROM_EMAIL = "noreply@securebank.com"

Write-Host ""
Write-Host "Configuration:"
Write-Host "  Gmail Address: $GMAIL_EMAIL"
Write-Host "  SMTP Host: $SMTP_HOST"
Write-Host "  SMTP Port: $SMTP_PORT"
Write-Host "  From Email: $FROM_EMAIL"
Write-Host ""

# Create .env file for notification service
$MODULE_DIR = Join-Path $PSScriptRoot "FD_Module_Group9"
Push-Location $MODULE_DIR

$envContent = @"
# Gmail SMTP Configuration
SPRING_MAIL_HOST=$SMTP_HOST
SPRING_MAIL_PORT=$SMTP_PORT
SPRING_MAIL_USERNAME=$GMAIL_EMAIL
SPRING_MAIL_PASSWORD=$APP_PASSWORD
SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH=true
SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE=true
NOTIFY_EMAIL_FROM=$FROM_EMAIL
NOTIFY_EMAIL_MOCK_ONLY=false
NOTIFY_WHATSAPP_MOCK_ONLY=true
JWT_SECRET=test-secret-key-minimum-32-characters-for-hmac256
DB_PASSWORD=12345
SERVICE_DB_URL=jdbc:mysql://localhost:3310/banking_technology_lab?serverTimezone=Asia/Kolkata
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
"@

$envContent | Out-File -FilePath ".env.smtp" -Encoding UTF8

Write-Host "✓ Configuration saved to .env.smtp" -ForegroundColor Green
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Starting Notification Service..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Load the environment variables and start the service
Get-Content .env.smtp | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
    }
}

# Start notification service in background
Write-Host "Starting notification service on port 8083..." -ForegroundColor Cyan
$jarPath = "notification-service\target\notification-service-1.0.0.jar"
$process = Start-Process -FilePath "java" -ArgumentList "-jar", $jarPath -RedirectStandardOutput "notification-service.log" -RedirectStandardError "notification-service.log" -PassThru

Write-Host "✓ Notification service started (PID: $($process.Id))" -ForegroundColor Green
Write-Host "✓ Logs: notification-service.log" -ForegroundColor Green
Write-Host ""
Write-Host "Waiting for service to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Check if service is running
if (Get-Process -Id $process.Id -ErrorAction SilentlyContinue) {
    Write-Host "✓ Notification service is running" -ForegroundColor Green
    Write-Host ""
    Write-Host "To view logs:"
    Write-Host "  Get-Content notification-service.log -Wait" -ForegroundColor Green
    Write-Host ""
    Write-Host "To stop the service:"
    Write-Host "  Stop-Process -Id $($process.Id)" -ForegroundColor Green
    Write-Host ""
    Write-Host "To test email sending, run:"
    Write-Host "  python test_email_notification.py" -ForegroundColor Green
} else {
    Write-Host "✗ Notification service failed to start" -ForegroundColor Red
    Write-Host "Check logs: notification-service.log" -ForegroundColor Red
    exit 1
}

Pop-Location
