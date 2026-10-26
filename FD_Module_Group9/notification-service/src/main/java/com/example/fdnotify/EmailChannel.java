package com.example.fdnotify;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import jakarta.mail.internet.MimeMessage;

@Component
@ConditionalOnProperty(name = "spring.mail.host")
public class EmailChannel implements NotificationChannel {
    private static final Logger log = LoggerFactory.getLogger(EmailChannel.class);
    private final ObjectProvider<JavaMailSender> mail;
    private final String from;
    private final boolean mockOnly;

    public EmailChannel(ObjectProvider<JavaMailSender> mail, @Value("${notify.email.from}") String from,
                        @Value("${notify.email.mock-only:false}") boolean mockOnly) {
        this.mail = mail;
        this.from = from;
        this.mockOnly = mockOnly;
    }

    @Override public String name() { return "EMAIL"; }
    @Override public String contactField() { return "email"; }

    @Override
    public Result send(String to, String subject, String body) {
        if (to == null || to.isBlank()) return Result.failed("No e-mail address on file");
        // mock-only lets tests and demos run the whole flow without mailing anyone, even when SMTP is configured.
        JavaMailSender sender = mockOnly ? null : mail.getIfAvailable();
        if (sender == null) {
            log.info("[MOCK EMAIL] to={} subject={}", NotificationService.mask(to), subject);
            log.info("[MOCK EMAIL BODY START]\n{}\n[MOCK EMAIL BODY END]", body);
            return Result.mocked();
        }
        try {
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            // Detect if body is HTML (contains <html> tag)
            boolean isHtml = body != null && body.toLowerCase().contains("<html");
            helper.setText(body, isHtml);
            sender.send(message);
            return Result.sent();
        } catch (Exception e) {
            return Result.failed(e.getClass().getSimpleName() + ": " + e.getMessage());
        }
    }
}
