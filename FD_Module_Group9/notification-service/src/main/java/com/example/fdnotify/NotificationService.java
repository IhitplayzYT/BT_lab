package com.example.fdnotify;

import com.example.fdshared.DomainEvent;
import com.example.fdshared.InvalidEventException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.JsonNode;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class NotificationService {
    static final Set<String> SUPPORTED = Set.of("FdApplied", "FdStatusChanged", "InterestAccrued", "FdCreated", "InterestPaid", "FdMatured", "FdPrematurelyClosed");
    private static final String[] FIELDS = {
            "fdAccountNo", "customerId", "customerName", "email", "phone", "currency", "principal", "annualRate",
            "termMonths", "maturityDate", "businessDate", "interestPaid", "closingBalance", "totalPaid", "interest",
            "penalty", "reason", "status", "interestAccrued", "outstandingInterest"};

    private final JdbcTemplate jdbc;
    private final List<NotificationChannel> channels;
    private final InterestAccrualBatch accrualBatch;

    public NotificationService(JdbcTemplate jdbc, List<NotificationChannel> channels, InterestAccrualBatch accrualBatch) {
        this.jdbc = jdbc;
        this.channels = channels;
        this.accrualBatch = accrualBatch;
    }

    /** Idempotent: an eventId is never processed twice (Kafka delivery is at-least-once). */
    @Transactional
    public void handle(DomainEvent e) {
        if (e.schemaVersion() != 1 || !SUPPORTED.contains(e.eventType())) {
            throw new InvalidEventException("Unsupported notification event");
        }
        Integer seen = jdbc.queryForObject("SELECT COUNT(*) FROM consumed_events WHERE event_id=?", Integer.class, e.eventId());
        if (seen != null && seen > 0) return;

        Map<String, String> f = fields(e.data());
        String customerId = f.get("customerId");
        String account = f.get("fdAccountNo");
        if (customerId == null || account == null) throw new InvalidEventException("Missing customerId or fdAccountNo");

        // Local read model of contact details, learned from the FdCreated event.
        if ("FdCreated".equals(e.eventType())) {
            jdbc.update("DELETE FROM notification_contacts WHERE customer_id=?", customerId);
            jdbc.update("INSERT INTO notification_contacts(customer_id,full_name,email,phone) VALUES(?,?,?,?)",
                    customerId, blankToNull(f.get("customerName")), blankToNull(f.get("email")), blankToNull(f.get("phone")));
        }
        Map<String, Object> contact = jdbc.queryForList(
                "SELECT full_name,email,phone FROM notification_contacts WHERE customer_id=?", customerId)
                .stream().findFirst().orElse(Map.of());
        if (f.get("customerName") == null && contact.get("full_name") != null) {
            f.put("customerName", contact.get("full_name").toString());
        }

        if (shouldNotify(e.eventType(), f)) {
            // Batch InterestAccrued events instead of sending immediately
            if ("InterestAccrued".equals(e.eventType())) {
                // Only batch if the event is recent (within last 2 hours) to avoid sending past due accruals
                String businessDate = f.getOrDefault("businessDate", "-");
                if (!isRecentAccrual(businessDate)) {
                    // Skip old accruals - just log as SKIPPED
                    for (NotificationChannel ch : channels) {
                        Object to = f.containsKey(ch.contactField()) ? f.get(ch.contactField()) : contact.get(ch.contactField());
                        String recipient = to == null ? null : to.toString();
                        jdbc.update("INSERT INTO notifications_log(event_id,event_type,customer_id,fd_account_no,channel,recipient,subject,body,status,error) VALUES(?,?,?,?,?,?,?,?,?,?)",
                                e.eventId(), e.eventType(), customerId, account, ch.name(), mask(recipient), "Interest Accrued (Skipped - Old)", "Skipped due to old business date", "SKIPPED", null);
                    }
                } else {
                    accrualBatch.add(customerId, new InterestAccrualBatch.AccrualEntry(
                        e.eventId(),
                        account,
                        businessDate,
                        f.getOrDefault("interestAccrued", "0"),
                        f.getOrDefault("outstandingInterest", "0"),
                        f.getOrDefault("currency", "INR")
                    ));
                    // Log the batched event
                    for (NotificationChannel ch : channels) {
                        Object to = f.containsKey(ch.contactField()) ? f.get(ch.contactField()) : contact.get(ch.contactField());
                        String recipient = to == null ? null : to.toString();
                        jdbc.update("INSERT INTO notifications_log(event_id,event_type,customer_id,fd_account_no,channel,recipient,subject,body,status,error) VALUES(?,?,?,?,?,?,?,?,?,?)",
                                e.eventId(), e.eventType(), customerId, account, ch.name(), mask(recipient), "Interest Accrued (Batched)", "Batched for later sending", "BATCHED", null);
                    }
                }
            } else {
                // Send other events immediately
                MessageTemplates.Message msg = MessageTemplates.forEvent(e.eventType(), f);
                for (NotificationChannel ch : channels) {
                    Object to = f.containsKey(ch.contactField()) ? f.get(ch.contactField()) : contact.get(ch.contactField());
                    String recipient = to == null ? null : to.toString();
                    NotificationChannel.Result r = ch.send(recipient, msg.subject(), msg.body());
                    jdbc.update("INSERT INTO notifications_log(event_id,event_type,customer_id,fd_account_no,channel,recipient,subject,body,status,error) VALUES(?,?,?,?,?,?,?,?,?,?)",
                            e.eventId(), e.eventType(), customerId, account, ch.name(), mask(recipient), msg.subject(), msg.body(), r.status(), r.error());
                }
            }
        }
        jdbc.update("INSERT INTO consumed_events(event_id) VALUES(?)", e.eventId());
    }

    /**
     * Flush batched interest accruals for a customer and send a single consolidated email
     */
    @Transactional
    public void flushBatchedAccruals(String customerId) {
        List<InterestAccrualBatch.AccrualEntry> accruals = accrualBatch.getAccruals(customerId);
        if (accruals.isEmpty()) return;

        Map<String, Object> contact = jdbc.queryForList(
                "SELECT full_name,email,phone FROM notification_contacts WHERE customer_id=?", customerId)
                .stream().findFirst().orElse(Map.of());

        String customerName = contact.get("full_name") != null ? contact.get("full_name").toString() : "Customer";
        String email = contact.get("email") != null ? contact.get("email").toString() : null;

        if (email != null && !email.isBlank()) {
            // Generate batched email
            MessageTemplates.Message msg = MessageTemplates.forBatchedInterestAccrual(customerName, accruals);
            
            for (NotificationChannel ch : channels) {
                if ("email".equalsIgnoreCase(ch.contactField())) {
                    NotificationChannel.Result r = ch.send(email, msg.subject(), msg.body());
                    // Update the existing BATCHED entries instead of inserting new ones
                    for (InterestAccrualBatch.AccrualEntry entry : accruals) {
                        jdbc.update("UPDATE notifications_log SET event_type=?, subject=?, body=?, status=?, error=? WHERE event_id=? AND channel=?",
                                "InterestAccruedBatch", msg.subject(), msg.body(), r.status(), r.error(), entry.eventId(), ch.name());
                    }
                }
            }
        }

        // Accruals go out only as the e-mail digest: any row still BATCHED (WhatsApp, or e-mail without an address) is closed as SKIPPED
        for (InterestAccrualBatch.AccrualEntry entry : accruals) {
            jdbc.update("UPDATE notifications_log SET subject=?, body=?, status='SKIPPED' WHERE event_id=? AND status='BATCHED'",
                    "Interest Accrued (Skipped)", "Accruals are delivered only as one combined e-mail digest; nothing was sent on this channel.", entry.eventId());
        }

        accrualBatch.removeSent(customerId, accruals);
    }

    /**
     * Flush all pending batched accruals for all customers
     */
    @Transactional
    public void flushAllBatchedAccruals() {
        List<String> customers = accrualBatch.getCustomersWithPendingAccruals();
        for (String customerId : customers) {
            flushBatchedAccruals(customerId);
        }
    }

    /**
     * Maturity and early closure also emit a final InterestPaid snapshot (closingBalance 0). That information is
     * already inside the FdMatured / FdPrematurelyClosed message, so a second e-mail would be noise.
     */
    static boolean shouldNotify(String eventType, Map<String, String> f) {
        if (!"InterestPaid".equals(eventType)) return true;
        return !isZero(f.get("closingBalance")) && !isZero(f.get("interestPaid")) && f.get("interestPaid") != null;
    }

    private static boolean isZero(String s) {
        if (s == null) return false;
        try {
            return new BigDecimal(s).signum() == 0;
        } catch (NumberFormatException ex) {
            return false;
        }
    }

    static Map<String, String> fields(JsonNode d) {
        Map<String, String> f = new HashMap<>();
        if (d == null) return f;
        for (String k : FIELDS) {
            JsonNode n = d.path(k);
            if (n.isMissingNode() || n.isNull()) continue;
            f.put(k, n.isNumber() ? n.decimalValue().toPlainString() : n.asText());
        }
        return f;
    }

    private static String blankToNull(String s) { return s == null || s.isBlank() ? null : s; }

    /** Personal data is not stored in clear text in the audit log. */
    static String mask(String s) {
        if (s == null || s.isBlank()) return null;
        int at = s.indexOf('@');
        if (at > 1) return s.charAt(0) + "***" + s.substring(at);
        return s.length() <= 4 ? "****" : "******" + s.substring(s.length() - 4);
    }

    /**
     * Check if an accrual event is recent (within last 2 hours of current time)
     * This prevents sending emails for past due accruals when time is advanced multiple times
     */
    private boolean isRecentAccrual(String businessDate) {
        if (businessDate == null || businessDate.equals("-")) {
            return true; // If no date, assume it's recent
        }
        try {
            // Parse the business date (format: yyyy-MM-dd)
            LocalDate accrualDate = LocalDate.parse(businessDate, DateTimeFormatter.ISO_LOCAL_DATE);
            LocalDate today = LocalDate.now();
            
            // If the accrual date is today or yesterday, consider it recent
            // This handles the case where time is advanced multiple times in a day
            Duration diff = Duration.between(accrualDate.atStartOfDay(), today.atStartOfDay());
            return diff.toHours() < 48; // Within last 48 hours
        } catch (DateTimeParseException e) {
            // If parsing fails, assume it's recent to avoid missing notifications
            return true;
        }
    }
}
