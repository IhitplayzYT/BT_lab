package com.example.fdmodule.service;

import com.example.fdmodule.clock.BusinessClock;
import com.example.fdmodule.entity.FixedDepositAccount;
import com.example.fdshared.Outbox;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Publishes event.fd.created (FdCreated) through the transactional outbox, so the event exists
 * if and only if the account and its initial DEPOSIT were committed.
 */
@Component
@ConditionalOnProperty(name = "events.enabled", havingValue = "true", matchIfMissing = true)
public class FdCreatedPublisher {
    static final String TOPIC = "event.fd.created";
    private static final Logger log = LoggerFactory.getLogger(FdCreatedPublisher.class);
    private final Outbox outbox;
    private final JdbcTemplate jdbc;
    private final BusinessClock clock;

    public FdCreatedPublisher(Outbox outbox, JdbcTemplate jdbc, BusinessClock clock) {
        this.outbox = outbox;
        this.jdbc = jdbc;
        this.clock = clock;
    }

    /** Must be called inside the account-creation transaction. */
    public void publish(FixedDepositAccount fd, String createdBy) {
        publish(fd, createdBy, "FdCreated", TOPIC);
    }

    public void publishStatus(FixedDepositAccount fd, String actor) {
        publish(fd, actor, "PENDING".equals(fd.getStatus()) ? "FdApplied" : "FdStatusChanged", "event.fd.status-changed");
    }

    private void publish(FixedDepositAccount fd, String createdBy, String type, String topic) {
        Map<String, Object> contact = Map.of();
        try {
            contact = jdbc.queryForList(
                    "SELECT c.full_name, c.phone, u.email FROM customer_profile c LEFT JOIN users u ON u.id=c.user_id WHERE c.customer_id=?",
                    fd.getCustomerId()).stream().findFirst().orElse(Map.of());
        } catch (DataAccessException e) {
            // Contact details are optional for the event; never block account creation because of them.
            log.warn("Could not read contact details for {}: {}", fd.getCustomerId(), e.getMessage());
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("fdAccountNo", fd.getFdAccountNo());
        data.put("customerId", fd.getCustomerId());
        data.put("customerName", contact.get("full_name"));
        data.put("email", contact.get("email"));
        data.put("phone", contact.get("phone"));
        data.put("principal", fd.getPrincipalAmount());
        data.put("currency", fd.getCurrency());
        data.put("annualRate", fd.getInterestRate());
        data.put("termMonths", fd.getTenureMonths());
        data.put("maturityDate", String.valueOf(fd.getMaturityDate()));
        data.put("businessDate", clock.today().toString());
        data.put("actor", createdBy);
        data.put("status", fd.getStatus());
        data.put("reason", fd.getRejectionReason());
        if (fd.getApplicantEmail() != null && !fd.getApplicantEmail().isBlank()) data.put("email", fd.getApplicantEmail());
        if (fd.getApplicantPhone() != null && !fd.getApplicantPhone().isBlank()) data.put("phone", fd.getApplicantPhone());
        if (fd.getApplicantFullName() != null && !fd.getApplicantFullName().isBlank()) data.put("customerName", fd.getApplicantFullName());
        outbox.emit(topic, type, fd.getFdAccountNo(), data);
    }
}
