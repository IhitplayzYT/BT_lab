package com.example.fdnotify;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.ObjectProvider;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.Session;
import org.springframework.mail.javamail.JavaMailSender;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class EmailChannelTest {

    @SuppressWarnings("unchecked")
    private EmailChannel channel(JavaMailSender sender, boolean mockOnly) {
        ObjectProvider<JavaMailSender> provider = Mockito.mock(ObjectProvider.class);
        when(provider.getIfAvailable()).thenReturn(sender);
        if (sender != null) when(sender.createMimeMessage()).thenReturn(new MimeMessage((Session) null));
        return new EmailChannel(provider, "bank@example.com", mockOnly);
    }

    @Test
    void sendsThroughSmtpWhenConfigured() {
        JavaMailSender sender = Mockito.mock(JavaMailSender.class);
        var result = channel(sender, false).send("a@example.com", "Hi", "Body");
        assertThat(result.status()).isEqualTo("SENT");
        verify(sender).send(any(MimeMessage.class));
    }

    @Test
    void mockOnlyNeverSendsEvenWhenSmtpIsConfigured() {
        JavaMailSender sender = Mockito.mock(JavaMailSender.class);
        var result = channel(sender, true).send("a@example.com", "Hi", "Body");
        assertThat(result.status()).isEqualTo("MOCKED");
        verify(sender, never()).send(any(MimeMessage.class));
    }

    @Test
    void mocksWhenNoSmtpIsConfigured() {
        assertThat(channel(null, false).send("a@example.com", "Hi", "Body").status()).isEqualTo("MOCKED");
    }

    @Test
    void smtpFailureIsRecordedNotThrown() {
        JavaMailSender sender = Mockito.mock(JavaMailSender.class);
        Mockito.doThrow(new org.springframework.mail.MailSendException("535 bad credentials")).when(sender).send(any(MimeMessage.class));
        var result = channel(sender, false).send("a@example.com", "Hi", "Body");
        assertThat(result.status()).isEqualTo("FAILED");
        assertThat(result.error()).contains("535");
    }

    @Test
    void missingAddressFails() {
        assertThat(channel(null, false).send("  ", "Hi", "Body").status()).isEqualTo("FAILED");
    }
}
