USE banking_technology_lab;

CREATE TABLE IF NOT EXISTS admin_operation_logs (
    log_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    actor VARCHAR(100) NOT NULL,
    operation_type VARCHAR(64) NOT NULL,
    target_type VARCHAR(64) NOT NULL,
    target_id VARCHAR(255) NULL,
    summary VARCHAR(512) NOT NULL,
    occurred_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_admin_log_time (occurred_at, log_id),
    KEY idx_admin_log_operation_time (operation_type, occurred_at),
    KEY idx_admin_log_actor_time (actor, occurred_at)
);
