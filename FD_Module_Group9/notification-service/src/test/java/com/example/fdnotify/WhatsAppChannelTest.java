package com.example.fdnotify;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;

class WhatsAppChannelTest {
    // Fake Twilio on a random local port: the test checks the exact request the channel would send to the real one.
    HttpServer server;
    final AtomicReference<String> path = new AtomicReference<>();
    final AtomicReference<String> auth = new AtomicReference<>();
    final AtomicReference<String> form = new AtomicReference<>();
    volatile int answer = 201;

    @BeforeEach
    void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/", exchange -> {
            path.set(exchange.getRequestURI().getPath());
            auth.set(exchange.getRequestHeaders().getFirst("Authorization"));
            form.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            byte[] body = "{\"sid\":\"SM123\"}".getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(answer, body.length);
            exchange.getResponseBody().write(body);
            exchange.close();
        });
        server.start();
    }

    @AfterEach
    void stop() { server.stop(0); }

    String url() { return "http://127.0.0.1:" + server.getAddress().getPort(); }

    WhatsAppChannel channel(String sid, String token, boolean mockOnly) {
        return new WhatsAppChannel(sid, token, "whatsapp:+14155238886", url(), mockOnly);
    }

    @Test
    void sendsTheRightRequestToTwilioAndReportsSent() {
        var result = channel("ACtest1234567890", "secret-token", false).send("98765 43210", "FD opened", "Principal 100000");
        assertThat(result.status()).isEqualTo("SENT");
        assertThat(path.get()).isEqualTo("/2010-04-01/Accounts/ACtest1234567890/Messages.json");
        assertThat(auth.get()).isEqualTo("Basic " + Base64.getEncoder().encodeToString("ACtest1234567890:secret-token".getBytes(StandardCharsets.UTF_8)));
        String decoded = URLDecoder.decode(form.get(), StandardCharsets.UTF_8);
        assertThat(decoded).contains("To=whatsapp:+919876543210").contains("From=whatsapp:+14155238886").contains("Body=FD opened\nPrincipal 100000");
    }

    @Test
    void htmlEmailIsConvertedToReadableWhatsAppText() {
        channel("ACtest1234567890", "token", false).send("9876543210", "FD opened",
                "<html><style>body {color:red}</style><body><p>Dear Customer</p><p>Account FD001</p></body></html>");
        String decoded = URLDecoder.decode(form.get(), StandardCharsets.UTF_8);
        assertThat(decoded).contains("Dear Customer").contains("Account FD001").doesNotContain("<html>").doesNotContain("color:red");
    }

    @Test
    void configuredTemplateIsUsedForScheduledNotifications() {
        var ch = channel("ACtest1234567890", "token", false);
        org.springframework.test.util.ReflectionTestUtils.setField(ch, "contentSid", "HXtemplate");
        ch.send("9876543210", "FD matured", "Account FD001");
        String decoded = URLDecoder.decode(form.get(), StandardCharsets.UTF_8);
        assertThat(decoded).contains("ContentSid=HXtemplate").contains("ContentVariables=").doesNotContain("&Body=");
    }

    @Test
    void aTwilioErrorIsRecordedAsFailedWithoutTheResponseBody() {
        answer = 400;
        var result = channel("ACtest1234567890", "secret-token", false).send("9876543210", "s", "b");
        assertThat(result.status()).isEqualTo("FAILED");
        assertThat(result.error()).isEqualTo("Twilio HTTP 400");
    }

    @Test
    void mockWhenNoCredentialsAndNothingIsSent() {
        assertThat(channel("", "", false).send("9876543210", "s", "b").status()).isEqualTo("MOCKED");
        assertThat(path.get()).isNull();
    }

    @Test
    void mockOnlyNeverSendsEvenWithCredentials() {
        assertThat(channel("ACtest1234567890", "secret-token", true).send("9876543210", "s", "b").status()).isEqualTo("MOCKED");
        assertThat(path.get()).isNull();
    }

    @Test
    void missingOrBadPhoneNumbersFailBeforeAnyRequest() {
        var channel = channel("ACtest1234567890", "secret-token", false);
        assertThat(channel.send(null, "s", "b").error()).isEqualTo("No phone number on file");
        assertThat(channel.send("   ", "s", "b").error()).isEqualTo("No phone number on file");
        assertThat(channel.send("abc&To=x", "s", "b").error()).isEqualTo("Phone number on file is not valid");
        assertThat(channel.send("123", "s", "b").status()).isEqualTo("FAILED");
        assertThat(path.get()).isNull();
    }

    @Test
    void aMalformedAccountSidIsRefusedInsteadOfBeingPutInTheUrl() {
        var result = channel("AC../../evil", "secret-token", false).send("9876543210", "s", "b");
        assertThat(result.status()).isEqualTo("FAILED");
        assertThat(path.get()).isNull();
    }

    @Test
    void phoneNumbersAreNormalised() {
        assertThat(WhatsAppChannel.normalise("9876543210")).isEqualTo("+919876543210");
        assertThat(WhatsAppChannel.normalise("+91 98765-43210")).isEqualTo("+919876543210");
        assertThat(WhatsAppChannel.normalise("919876543210")).isEqualTo("+919876543210");
        assertThat(WhatsAppChannel.normalise("0044 7911 123456")).isEqualTo("+447911123456");
        assertThat(WhatsAppChannel.normalise("12345")).isNull();
        assertThat(WhatsAppChannel.normalise("not a number")).isNull();
    }
}
