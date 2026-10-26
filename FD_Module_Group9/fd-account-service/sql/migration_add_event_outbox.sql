USE banking_technology_lab;

-- Existing MySQL volumes do not rerun docker-entrypoint-initdb.d scripts.
-- Keep this migration safe to apply to both old and fresh databases.
CREATE TABLE IF NOT EXISTS event_outbox (
    event_id VARCHAR(36) PRIMARY KEY,
    routing_key VARCHAR(100) NOT NULL,
    payload TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    published_at TIMESTAMP NULL,
    INDEX idx_outbox_pending (published_at, created_at)
);
