package com.example.fdnotify;

import com.example.fdshared.DomainEvent;
import com.example.fdshared.InvalidEventException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import com.fasterxml.jackson.databind.ObjectMapper;

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
        assertThatThrownBy(() -> service.handle(event("UnknownEvent", created()))).isInstanceOf(InvalidEventException.class);
    }

    @Test
    void lifecycleEventsUseTheirOwnRecipientsWithoutCreatedEvent() {
        for (String type : java.util.List.of("FdApplied", "FdStatusChanged", "InterestAccrued", "FdMatured")) {
            var data = created();
            data.put("email", "specific@example.org");
            data.put("status", "REJECTED");
            data.put("interestAccrued", "17.50");
            var e = event(type, data);
            service.handle(e);
            service.handle(e);
            assertThat(jdbc.queryForObject("SELECT recipient FROM notifications_log WHERE event_id=? AND channel='EMAIL'",
                    String.class, e.eventId())).isEqualTo("s***@example.org");
        }
        assertThat(count()).isEqualTo(4);
        assertThat(count("WHATSAPP")).isEqualTo(4);
    }

    @Test
    void eventContactOverridesAnotherAccountContactForSameCustomer() {
        service.handle(event("FdCreated", created()));
        var data = matured("CUST001");
        data.put("email", "other@example.org");
        data.put("phone", "9876543210");
        var e = event("FdMatured", data);
        service.handle(e);
        assertThat(jdbc.queryForObject("SELECT recipient FROM notifications_log WHERE event_id=? AND channel='EMAIL'",
                String.class, e.eventId())).isEqualTo("o***@example.org");
    }

    @Test
    void flushedAccrualsLeaveNoRowBatched() {
        service.handle(event("FdCreated", created()));
        var data = created();
        data.put("interestAccrued", "17.50");
        service.handle(event("InterestAccrued", data));
        service.handle(event("InterestAccrued", data));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM notifications_log WHERE status='BATCHED'", Integer.class)).isEqualTo(4);

        service.flushBatchedAccruals("CUST001");

        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM notifications_log WHERE status='BATCHED'", Integer.class)).isZero();
        assertThat(jdbc.queryForList("SELECT status FROM notifications_log WHERE event_type='InterestAccruedBatch' AND channel='EMAIL'", String.class))
                .containsExactly("MOCKED", "MOCKED"); // one digest, its result stamped on both accrual rows
        assertThat(jdbc.queryForList("SELECT status FROM notifications_log WHERE event_type='InterestAccrued' AND channel='WHATSAPP'", String.class))
                .containsExactly("SKIPPED", "SKIPPED");
    }

    @Test
    void accrualAddedDuringAFlushStaysPending() {
        var batch = new InterestAccrualBatch();
        var first = new InterestAccrualBatch.AccrualEntry("e1", "FD001", "-", "1", "1", "INR");
        var late = new InterestAccrualBatch.AccrualEntry("e2", "FD001", "-", "1", "2", "INR");
        batch.add("CUST001", first);
        var sending = batch.getAccruals("CUST001");
        batch.add("CUST001", late); // arrives while the digest is being sent
        batch.removeSent("CUST001", sending);
        assertThat(batch.getAccruals("CUST001")).containsExactly(late);
        batch.removeSent("CUST001", java.util.List.of(late));
        assertThat(batch.getCustomersWithPendingAccruals()).isEmpty();
    }

    @Test
    void notificationLogRequiresLogin() throws Exception {
        mvc.perform(get("/api/notifications")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/notifications").with(httpBasic("officer1", "officer123"))).andExpect(status().isOk());
    }
}
