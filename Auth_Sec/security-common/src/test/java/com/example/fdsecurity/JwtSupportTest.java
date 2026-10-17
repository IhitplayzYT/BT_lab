package com.example.fdsecurity;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtSupportTest {
    // Test-only values, not used anywhere outside this class.
    static final String SECRET = "unit-test-secret-unit-test-secret-1234";
    static final String ISSUER = "fd-platform-auth";

    TokenIssuer issuer = new TokenIssuer(SECRET, ISSUER, Duration.ofMinutes(30));
    JwtDecoder decoder = JwtSupport.decoder(SECRET, ISSUER);

    @Test
    void issuedTokenIsAcceptedWithUsernameRolesAndExpiry() {
        var token = issuer.issue("officer1", List.of("BANK_OFFICER"));
        Jwt jwt = decoder.decode(token.value());
        assertThat(jwt.getSubject()).isEqualTo("officer1");
        assertThat(jwt.getClaimAsString("iss")).isEqualTo(ISSUER);
        assertThat(jwt.<List<String>>getClaim("roles")).containsExactly("BANK_OFFICER");
        assertThat(jwt.getExpiresAt()).isAfter(Instant.now().plus(Duration.ofMinutes(29)));
        assertThat(jwt.getId()).isNotBlank();
    }

    @Test
    void tokenSignedWithAnotherSecretIsRejected() {
        var forged = new TokenIssuer("another-secret-another-secret-123456", ISSUER, Duration.ofMinutes(5)).issue("admin1", List.of("ADMIN"));
        assertThatThrownBy(() -> decoder.decode(forged.value())).isInstanceOf(JwtException.class);
    }

    @Test
    void tokenFromAnotherIssuerIsRejected() {
        var other = new TokenIssuer(SECRET, "someone-else", Duration.ofMinutes(5)).issue("admin1", List.of("ADMIN"));
        assertThatThrownBy(() -> decoder.decode(other.value())).isInstanceOf(JwtException.class);
    }

    @Test
    void expiredTokenIsRejected() {
        var old = issuer.issueAt("admin1", List.of("ADMIN"), Instant.now().minus(Duration.ofHours(2)));
        assertThatThrownBy(() -> decoder.decode(old.value())).isInstanceOf(JwtException.class);
    }

    @Test
    void tamperedPayloadIsRejected() {
        String valid = issuer.issue("customer1", List.of("CUSTOMER")).value();
        String[] parts = valid.split("\\.");
        String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8).replace("CUSTOMER", "ADMIN");
        String tampered = parts[0] + "." + Base64.getUrlEncoder().withoutPadding().encodeToString(payload.getBytes(StandardCharsets.UTF_8)) + "." + parts[2];
        assertThatThrownBy(() -> decoder.decode(tampered)).isInstanceOf(JwtException.class);
    }

    @Test
    void unsignedAlgNoneTokenIsRejected() {
        Base64.Encoder b64 = Base64.getUrlEncoder().withoutPadding();
        String header = b64.encodeToString("{\"alg\":\"none\"}".getBytes(StandardCharsets.UTF_8));
        String body = b64.encodeToString(("{\"sub\":\"admin1\",\"iss\":\"" + ISSUER + "\",\"roles\":[\"ADMIN\"],\"exp\":" + (Instant.now().getEpochSecond() + 600) + "}").getBytes(StandardCharsets.UTF_8));
        assertThatThrownBy(() -> decoder.decode(header + "." + body + ".")).isInstanceOf(JwtException.class);
    }

    @Test
    void shortSecretIsRefused() {
        assertThatThrownBy(() -> JwtSupport.decoder("too-short", ISSUER)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new TokenIssuer("too-short", ISSUER, Duration.ofMinutes(5))).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> JwtSupport.decoder(null, ISSUER)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void lifetimeMustBePositive() {
        assertThatThrownBy(() -> new TokenIssuer(SECRET, ISSUER, Duration.ZERO)).isInstanceOf(IllegalArgumentException.class);
    }

    Jwt jwtWith(Map<String, Object> claims) {
        return Jwt.withTokenValue("x").header("alg", "HS256").claims(c -> c.putAll(claims)).build();
    }

    @Test
    void rolesComeFromArrayCommaListAndSingleRoleClaim() {
        assertThat(JwtSupport.authorities(jwtWith(Map.of("roles", List.of("ADMIN", "bank_officer")))))
                .extracting(Object::toString).containsExactly("ROLE_ADMIN", "ROLE_BANK_OFFICER");
        assertThat(JwtSupport.authorities(jwtWith(Map.of("roles", "CUSTOMER, ADMIN"))))
                .extracting(Object::toString).containsExactly("ROLE_CUSTOMER", "ROLE_ADMIN");
        assertThat(JwtSupport.authorities(jwtWith(Map.of("role", "ROLE_CUSTOMER"))))
                .extracting(Object::toString).containsExactly("ROLE_CUSTOMER");
        assertThat(JwtSupport.authorities(jwtWith(Map.of("sub", "nobody")))).isEmpty();
    }
}
