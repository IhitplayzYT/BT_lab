package com.example.fdnotify;

import com.example.fdshared.DomainEvent;
import com.example.fdshared.InvalidEventException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.JsonNode;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class NotificationService {
    static final Set<String> SUPPORTED = Set.of("FdCreated", "InterestPaid", "FdMatured", "FdPrematurelyClosed");
    private static final String[] FIELDS = {
            "fdAccountNo", "customerId", "customerName", "email", "phone", "currency", "principal", "annualRate",
            "termMonths", "maturityDate", "businessDate", "interestPaid", "closingBalance", "totalPaid", "interest",
            "penalty", "reason"};

    private final JdbcTemplate jdbc;
    private final List<NotificationChannel> channels;

    public NotificationService(JdbcTemplate jdbc, List<NotificationChannel> channels) {
        this.jdbc = jdbc;
        this.channels = channels;
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
            MessageTemplates.Message msg = MessageTemplates.forEvent(e.eventType(), f);
            for (NotificationChannel ch : channels) {
                Object to = contact.get(ch.contactField());
                String recipient = to == null ? null : to.toString();
                NotificationChannel.Result r = ch.send(recipient, msg.subject(), msg.body());
                jdbc.update("INSERT INTO notifications_log(event_id,event_type,customer_id,fd_account_no,channel,recipient,subject,body,status,error) VALUES(?,?,?,?,?,?,?,?,?,?)",
                        e.eventId(), e.eventType(), customerId, account, ch.name(), mask(recipient), msg.subject(), msg.body(), r.status(), r.error());
            }
        }
        jdbc.update("INSERT INTO consumed_events(event_id) VALUES(?)", e.eventId());
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
}
