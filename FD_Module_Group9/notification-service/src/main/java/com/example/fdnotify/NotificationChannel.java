package com.example.fdnotify;

/** One delivery channel. A new channel (SMS, WhatsApp) is just a new bean implementing this interface. */
public interface NotificationChannel {
    String name();

    /** Contact column this channel uses in notification_contacts: "email" or "phone". */
    String contactField();

    Result send(String to, String subject, String body);

    record Result(String status, String error) {
        public static Result sent() { return new Result("SENT", null); }
        public static Result mocked() { return new Result("MOCKED", null); }
        public static Result failed(String why) {
            String w = why == null ? "unknown" : why;
            return new Result("FAILED", w.length() > 450 ? w.substring(0, 450) : w);
        }
    }
}
