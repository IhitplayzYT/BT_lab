package com.example.fdnotify;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

/** Pure text templates (no Spring), easy to unit test and to read. */
public final class MessageTemplates {
    public record Message(String subject, String body) { }

    private MessageTemplates() { }

    /** Returns null when the event type has no customer message. */
    public static Message forEvent(String eventType, Map<String, String> f) {
        String name = f.get("customerName");
        if (name == null || name.isBlank()) name = "Customer";
        String acc = f.getOrDefault("fdAccountNo", "");
        String cur = f.getOrDefault("currency", "INR");
        String date = f.getOrDefault("businessDate", "-");
        return switch (eventType == null ? "" : eventType) {
            case "FdCreated" -> new Message(
                    "Your Fixed Deposit " + acc + " has been opened",
                    "Dear " + name + ",\nYour Fixed Deposit " + acc + " for " + money(cur, f.get("principal"))
                            + " has been opened at " + f.getOrDefault("annualRate", "-") + "% p.a. for "
                            + f.getOrDefault("termMonths", "-") + " months.\nMaturity date: "
                            + f.getOrDefault("maturityDate", "-") + ".\nThank you for banking with us.");
            case "InterestPaid" -> new Message(
                    "Interest paid on your Fixed Deposit " + acc,
                    "Dear " + name + ",\nInterest of " + money(cur, f.get("interestPaid")) + " on your Fixed Deposit "
                            + acc + " was paid on " + date + ".\nThank you for banking with us.");
            case "FdMatured" -> new Message(
                    "Your Fixed Deposit Has Matured Successfully",
                    "Dear " + name + ",\nYour Fixed Deposit " + acc + " has matured on "
                            + f.getOrDefault("maturityDate", date) + ".\nInterest paid: " + money(cur, f.get("interestPaid"))
                            + ".\nMaturity Amount: " + money(cur, f.get("totalPaid")) + " has been processed.\nThank you for banking with us.");
            case "FdPrematurelyClosed" -> new Message(
                    "Your Fixed Deposit " + acc + " was closed before maturity",
                    "Dear " + name + ",\nYour Fixed Deposit " + acc + " was closed before maturity on " + date
                            + ".\nInterest: " + money(cur, f.get("interest")) + ". Penalty: " + money(cur, f.get("penalty"))
                            + ".\nAmount paid: " + money(cur, f.get("totalPaid")) + ".\nThank you for banking with us.");
            default -> null;
        };
    }

    static String money(String currency, String amount) {
        if (amount == null || amount.isBlank()) return currency + " -";
        try {
            return currency + " " + new BigDecimal(amount).setScale(2, RoundingMode.HALF_UP).toPlainString();
        } catch (NumberFormatException e) {
            return currency + " " + amount;
        }
    }
}
