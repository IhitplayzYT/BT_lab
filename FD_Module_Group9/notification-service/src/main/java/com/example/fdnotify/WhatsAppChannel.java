package com.example.fdnotify;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;

/**
 * WhatsApp alerts through the Twilio WhatsApp sandbox (free; the customer joins the sandbox once from their phone).
 * MOCK by default: nothing is sent unless TWILIO_SID and TWILIO_TOKEN are set, and never when mock-only is true.
 * The phone number is checked and normalised first, so only a well-formed number is ever put into a request.
 */
@Component
public class WhatsAppChannel implements NotificationChannel {
    private static final Logger log = LoggerFactory.getLogger(WhatsAppChannel.class);
    private static final int MAX_BODY = 1500; // WhatsApp via Twilio allows 1600 characters

    @Value("${notify.whatsapp.twilio.content-sid:}")
    private String contentSid = "";

    private final String sid;
    private final String token;
    private final String from;
    private final String baseUrl;
    private final boolean mockOnly;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

    public WhatsAppChannel(@Value("${notify.whatsapp.twilio.sid:}") String sid,
                           @Value("${notify.whatsapp.twilio.token:}") String token,
                           @Value("${notify.whatsapp.twilio.from:whatsapp:+14155238886}") String from,
                           @Value("${notify.whatsapp.twilio.base-url:https://api.twilio.com}") String baseUrl,
                           @Value("${notify.whatsapp.mock-only:false}") boolean mockOnly) {
        this.sid = sid;
        this.token = token;
        this.from = from;
        this.baseUrl = baseUrl;
        this.mockOnly = mockOnly;
    }

    @Override public String name() { return "WHATSAPP"; }
    @Override public String contactField() { return "phone"; }

    @Override
    public Result send(String to, String subject, String body) {
        if (to == null || to.isBlank()) return Result.failed("No phone number on file");
        String number = normalise(to);
        if (number == null) return Result.failed("Phone number on file is not valid");
        if (mockOnly || sid.isBlank() || token.isBlank()) {
            log.info("[MOCK WHATSAPP] to={} subject={}", NotificationService.mask(number), subject);
            return Result.mocked();
        }
        if (!sid.matches("[A-Za-z0-9]{10,64}")) return Result.failed("TWILIO_SID is not valid");
        try {
            String plain = body.replaceAll("(?is)<(style|script)[^>]*>.*?</\\1>", "")
                    .replaceAll("(?i)</(?:p|div|h[1-6])>|<br\\s*/?>", "\n")
                    .replaceAll("<[^>]+>", "").replace("&amp;", "&").replace("&nbsp;", " ")
                    .replaceAll("[ \t]+", " ").replaceAll("\n\\s*\n", "\n").trim();
            String text = subject + "\n" + plain;
            if (text.length() > MAX_BODY) text = text.substring(0, MAX_BODY);
            String form = "From=" + enc(from) + "&To=" + enc("whatsapp:" + number) + "&Body=" + enc(text);
            if (!contentSid.isBlank()) {
                String variables = new com.fasterxml.jackson.databind.ObjectMapper()
                        .writeValueAsString(java.util.Map.of("1", subject, "2", plain.replaceAll("\\s+", " ")));
                form = "From=" + enc(from) + "&To=" + enc("whatsapp:" + number)
                        + "&ContentSid=" + enc(contentSid) + "&ContentVariables=" + enc(variables);
            }
            String auth = Base64.getEncoder().encodeToString((sid + ":" + token).getBytes(StandardCharsets.UTF_8));
            HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl + "/2010-04-01/Accounts/" + sid + "/Messages.json"))
                    .timeout(Duration.ofSeconds(10))
                    .header("Authorization", "Basic " + auth)
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(form)).build();
            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            // Only the status code is recorded: the response body can repeat the phone number.
            return response.statusCode() / 100 == 2 ? Result.sent() : Result.failed("Twilio HTTP " + response.statusCode());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return Result.failed("Interrupted");
        } catch (Exception e) {
            return Result.failed(e.getClass().getSimpleName() + ": " + e.getMessage());
        }
    }

    /** +E.164 form, or null if it does not look like a phone number. A bare 10-digit number is taken as Indian (+91). */
    static String normalise(String raw) {
        String s = raw.replaceAll("[\\s\\-()]", "");
        if (s.startsWith("00")) s = "+" + s.substring(2);
        if (s.matches("\\d{10}")) s = "+91" + s;
        else if (s.matches("\\d{11,15}")) s = "+" + s;
        return s.matches("\\+\\d{8,15}") ? s : null;
    }

    private static String enc(String s) { return URLEncoder.encode(s, StandardCharsets.UTF_8); }
}
