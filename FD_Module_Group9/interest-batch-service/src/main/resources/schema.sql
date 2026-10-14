CREATE TABLE IF NOT EXISTS event_outbox(event_id VARCHAR(36) PRIMARY KEY,routing_key VARCHAR(100) NOT NULL,payload TEXT NOT NULL,created_at TIMESTAMP NOT NULL,published_at TIMESTAMP NULL,INDEX idx_outbox_pending(published_at,created_at));


CREATE TABLE IF NOT EXISTS batch_requests(request_id VARCHAR(36) PRIMARY KEY,request_type VARCHAR(20) NOT NULL,business_date DATE NOT NULL,fd_account_no VARCHAR(20) NULL,actor VARCHAR(50) NOT NULL,status VARCHAR(20) NOT NULL,result TEXT NULL,created_at TIMESTAMP NOT NULL);
CREATE TABLE IF NOT EXISTS consumed_events(event_id VARCHAR(36) PRIMARY KEY);
CREATE TABLE IF NOT EXISTS scheduler_guard(business_date DATE PRIMARY KEY,request_id VARCHAR(36) NOT NULL);
