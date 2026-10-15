#!/bin/bash
# Email Configuration Setup Script for Gmail SMTP
# This script helps configure the notification service to send emails via Gmail

echo "=========================================="
echo "Gmail SMTP Configuration Setup"
echo "=========================================="
echo ""
echo "This script will configure the notification service to send emails via Gmail."
echo ""
echo "PREREQUISITES:"
echo "1. Go to Google Account Settings: https://myaccount.google.com"
echo "2. Enable 2-Factor Authentication"
echo "3. Generate an App Password at: https://myaccount.google.com/apppasswords"
echo "4. Select 'Mail' and 'Other (Custom name)'"
echo "5. Copy the 16-character App Password"
echo ""
echo "=========================================="

# Prompt for Gmail App Password
read -p "Enter your Gmail App Password (16 characters): " APP_PASSWORD

if [ -z "$APP_PASSWORD" ]; then
    echo "ERROR: App Password is required"
    exit 1
fi

if [ ${#APP_PASSWORD} -ne 16 ]; then
    echo "WARNING: App Password should be 16 characters. You entered ${#APP_PASSWORD} characters."
    read -p "Continue anyway? (y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        exit 1
    fi
fi

# Configuration
GMAIL_EMAIL="ihitexe@gmail.com"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
FROM_EMAIL="noreply@securebank.com"

echo ""
echo "Configuration:"
echo "  Gmail Address: $GMAIL_EMAIL"
echo "  SMTP Host: $SMTP_HOST"
echo "  SMTP Port: $SMTP_PORT"
echo "  From Email: $FROM_EMAIL"
echo ""

# Create .env file for notification service
cd /home/ihitplayzyt/Downloads/BT_LAB/FD_Module_Group9

cat > .env.smtp << EOF
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
EOF

echo "✓ Configuration saved to .env.smtp"
echo ""
echo "=========================================="
echo "Starting Notification Service..."
echo "=========================================="

# Load the environment variables and start the service
export $(cat .env.smtp | xargs)

# Start notification service in background
echo "Starting notification service on port 8083..."
java -jar notification-service/target/notification-service-1.0.0.jar > notification-service.log 2>&1 &
NOTIFICATION_PID=$!

echo "✓ Notification service started (PID: $NOTIFICATION_PID)"
echo "✓ Logs: notification-service.log"
echo ""
echo "Waiting for service to start..."
sleep 10

# Check if service is running
if ps -p $NOTIFICATION_PID > /dev/null; then
    echo "✓ Notification service is running"
    echo ""
    echo "To view logs:"
    echo "  tail -f notification-service.log"
    echo ""
    echo "To stop the service:"
    echo "  kill $NOTIFICATION_PID"
    echo ""
    echo "To test email sending, run:"
    echo "  python3 test_email_notification.py"
else
    echo "✗ Notification service failed to start"
    echo "Check logs: notification-service.log"
    exit 1
fi
