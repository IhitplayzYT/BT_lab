package com.example.fdnotify;

import com.example.fdshared.DomainEvent;
import com.example.fdshared.InvalidEventException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class NotificationServiceIntegrationTest {
    @Autowired NotificationService service;
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper mapper;
    @Autowired MockMvc mvc;

    @BeforeEach
    void reset() {
        jdbc.update("DELETE FROM notifications_log");
        jdbc.update("DELETE FROM consumed_events");
        jdbc.update("DELETE FROM notification_contacts");
    }

    DomainEvent event(String type, Map<String, Object> data) {
        return new DomainEvent(1, UUID.randomUUID().toString(), type, Instant.now(), "FD001", mapper.valueToTree(data));
    }

    Map<String, Object> created() {
        var d = new LinkedHashMap<String, Object>();
        d.put("fdAccountNo", "FD001");
        d.put("customerId", "CUST001");
        d.put("customerName", "Asha");
        d.put("email", "asha@example.com");
        d.put("phone", "9999999999");
        d.put("principal", new BigDecimal("100000.00"));
        d.put("currency", "INR");
        d.put("annualRate", new BigDecimal("6.50"));
        d.put("termMonths", 12);
        d.put("maturityDate", "2027-10-13");
        return d;
    }

    Map<String, Object> matured(String customer) {
        var d = new LinkedHashMap<String, Object>();
        d.put("fdAccountNo", "FD001");
        d.put("customerId", customer);
        d.put("currency", "INR");
        d.put("maturityDate", "2027-10-13");
        d.put("businessDate", "2027-10-13");
        d.put("interestPaid", new BigDecimal("6500.00"));
        d.put("totalPaid", new BigDecimal("106500.00"));
        return d;
    }

    /** Rows for one channel. Every event is logged once per channel (EMAIL and WHATSAPP). */
    int count(String channel) { return jdbc.queryForObject("SELECT COUNT(*) FROM notifications_log WHERE channel=?", Integer.class, channel); }

    int count() { return count("EMAIL"); }

    @Test
    void createdEventStoresContactAndLogsMaskedEmail() {
        service.handle(event("FdCreated", created()));
        assertThat(count()).isEqualTo(1);
        assertThat(count("WHATSAPP")).isEqualTo(1);
        var row = jdbc.queryForMap("SELECT status, recipient, channel FROM notifications_log WHERE channel='EMAIL'");
        assertThat(row.get("status")).isEqualTo("MOCKED"); // no SMTP configured in tests
        assertThat(row.get("recipient")).isEqualTo("a***@example.com");
        assertThat(row.get("channel")).isEqualTo("EMAIL");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM notification_contacts", Integer.class)).isEqualTo(1);
    }

    @Test
    void whatsAppIsLoggedMaskedAndMockedBesideTheEmail() {
        service.handle(event("FdCreated", created()));
        var row = jdbc.queryForMap("SELECT status, recipient FROM notifications_log WHERE channel='WHATSAPP'");
        assertThat(row.get("status")).isEqualTo("MOCKED"); // no Twilio credentials in tests
        assertThat(row.get("recipient")).isEqualTo("******9999");
    }

    @Test
    void customerWithoutAPhoneGetsTheEmailAndAFailedWhatsAppRow() {
        var d = created();
        d.put("phone", null);
        service.handle(event("FdCreated", d));
        assertThat(jdbc.queryForObject("SELECT status FROM notifications_log WHERE channel='EMAIL'", String.class)).isEqualTo("MOCKED");
        var whatsApp = jdbc.queryForMap("SELECT status, error FROM notifications_log WHERE channel='WHATSAPP'");
        assertThat(whatsApp.get("status")).isEqualTo("FAILED");
        assertThat(whatsApp.get("error")).isEqualTo("No phone number on file");
    }

    @Test
    void duplicateEventIsIgnored() {
        var e = event("FdCreated", created());
        service.handle(e);
        service.handle(e);
        assertThat(count()).isEqualTo(1);
        assertThat(count("WHATSAPP")).isEqualTo(1);
    }

    @Test
    void maturedEventUsesTheStoredContact() {
        service.handle(event("FdCreated", created()));
        service.handle(event("FdMatured", matured("CUST001")));
        assertThat(count()).isEqualTo(2);
        assertThat(jdbc.queryForObject("SELECT subject FROM notifications_log WHERE event_type='FdMatured' AND channel='EMAIL'", String.class))
                .isEqualTo("Your Fixed Deposit Has Matured Successfully");
    }

    @Test
    void finalInterestSnapshotIsConsumedButNotMailed() {
        service.handle(event("FdCreated", created()));
        var d = new LinkedHashMap<String, Object>();
        d.put("fdAccountNo", "FD001");
        d.put("customerId", "CUST001");
        d.put("interestPaid", new BigDecimal("6500.00"));
        d.put("closingBalance", BigDecimal.ZERO);
        var e = event("InterestPaid", d);
        service.handle(e);
        assertThat(count()).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM consumed_events WHERE event_id=?", Integer.class, e.eventId())).isEqualTo(1);
    }

    @Test
    void unknownCustomerIsRecordedAsFailedNotLost() {
        service.handle(event("FdMatured", matured("CUST999")));
        var row = jdbc.queryForMap("SELECT status, error FROM notifications_log WHERE channel='EMAIL'");
        assertThat(row.get("status")).isEqualTo("FAILED");
        assertThat(row.get("error").toString()).contains("No e-mail");
    }

    @Test
    void unsupportedEventTypeIsRejected() {
        assertThatThrownBy(() -> service.handle(event("InterestAccrued", created()))).isInstanceOf(InvalidEventException.class);
    }

    @Test
    void notificationLogRequiresLogin() throws Exception {
        mvc.perform(get("/api/notifications")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/notifications").with(httpBasic("officer1", "officer123"))).andExpect(status().isOk());
    }
}
