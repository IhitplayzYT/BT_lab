CREATE TABLE IF NOT EXISTS event_outbox(event_id VARCHAR(36) PRIMARY KEY,routing_key VARCHAR(100) NOT NULL,payload TEXT NOT NULL,created_at TIMESTAMP NOT NULL,published_at TIMESTAMP NULL);
CREATE TABLE IF NOT EXISTS consumed_events(event_id VARCHAR(36) PRIMARY KEY);
CREATE TABLE IF NOT EXISTS notification_contacts(customer_id VARCHAR(20) PRIMARY KEY, full_name VARCHAR(255), email VARCHAR(100), phone VARCHAR(20), updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS notifications_log(
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  event_id VARCHAR(36) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  customer_id VARCHAR(20),
  fd_account_no VARCHAR(20),
  channel VARCHAR(20) NOT NULL,
  recipient VARCHAR(255),
  subject VARCHAR(255),
  body LONGTEXT,
  status VARCHAR(20) NOT NULL,
  error VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_notif_event_channel UNIQUE (event_id, channel)
);
