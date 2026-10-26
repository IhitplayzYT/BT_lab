package com.example.fdnotify;

import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class MessageTemplatesTest {

    @Test
    void maturityMessageContainsAccountDateAndAmounts() {
        var m = MessageTemplates.forEvent("FdMatured", Map.of(
                "customerName", "Asha", "fdAccountNo", "BR0010000016", "currency", "INR",
                "maturityDate", "2027-10-13", "interestPaid", "6500", "totalPaid", "106500"));
        assertThat(m.subject()).isEqualTo("Your Fixed Deposit Has Matured Successfully");
        assertThat(m.body()).contains("<strong class=\"glow-text\">Asha</strong>", "BR0010000016", "2027-10-13", "INR 6500.00", "INR 106500.00");
    }

    @Test
    void prematureClosureMessageShowsPenalty() {
        var m = MessageTemplates.forEvent("FdPrematurelyClosed", Map.of(
                "fdAccountNo", "A1", "businessDate", "2027-01-01", "interest", "3000", "penalty", "30", "totalPaid", "102970"));
        assertThat(m.subject()).contains("closed before maturity");
        assertThat(m.body()).contains("<strong class=\"glow-text\">Customer</strong>", "INR 30.00", "INR 102970.00");
    }

    @Test
    void unknownEventTypeHasNoMessage() {
        assertThat(MessageTemplates.forEvent("UnknownEvent", Map.of())).isNull();
    }

    @Test
    void amountsAreRoundedHalfUpToTwoDecimals() {
        var m = MessageTemplates.forEvent("InterestPaid", Map.of("fdAccountNo", "A1", "interestPaid", "12.3456"));
        assertThat(m.body()).contains("INR 12.35");
    }

    @Test
    void contactsAreMaskedInTheAuditLog() {
        assertThat(NotificationService.mask("krishna@example.com")).isEqualTo("k***@example.com");
        assertThat(NotificationService.mask("9876543210")).isEqualTo("******3210");
        assertThat(NotificationService.mask(" ")).isNull();
    }

    @Test
    void finalInterestSnapshotsAreNotMailedTwice() {
        assertThat(NotificationService.shouldNotify("InterestPaid", Map.of("interestPaid", "10", "closingBalance", "0"))).isFalse();
        assertThat(NotificationService.shouldNotify("InterestPaid", Map.of("interestPaid", "10", "closingBalance", "100000"))).isTrue();
        assertThat(NotificationService.shouldNotify("FdMatured", Map.of())).isTrue();
    }
}
