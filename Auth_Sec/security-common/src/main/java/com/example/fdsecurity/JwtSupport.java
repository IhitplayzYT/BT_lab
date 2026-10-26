package com.example.fdsecurity;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Locale;

/**
 * The one place that defines how FD-platform tokens look and how they are checked.
 * Format (the same one the Product and Calculator teams use): HS256 signed with a shared secret, claims
 * {@code sub} (username), {@code roles} (array or comma list of ADMIN / BANK_OFFICER / CUSTOMER), {@code iss}, {@code iat}, {@code exp}.
 */
public final class JwtSupport {
    /** HS256 needs a key of at least 256 bits. */
    public static final int MIN_SECRET_BYTES = 32;

    private JwtSupport() { }

    static SecretKey key(String secret) {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < MIN_SECRET_BYTES) {
            throw new IllegalArgumentException("JWT secret must be at least " + MIN_SECRET_BYTES + " characters (256 bits)");
        }
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /** Accepts only HS256 tokens with a valid signature, the expected issuer and an unexpired {@code exp}. */
    public static JwtDecoder decoder(String secret, String issuer) {
        SecretKey key = key(secret);
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(key).build();
        if (issuer != null && !issuer.isBlank()) {
            org.springframework.security.oauth2.core.OAuth2TokenValidator<Jwt> withIssuer =
                    org.springframework.security.oauth2.jwt.JwtValidators.createDefaultWithIssuer(issuer);
            decoder.setJwtValidator(withIssuer);
        }
        return decoder;
    }

    public static JwtAuthenticationConverter authenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(JwtSupport::authorities);
        return converter;
    }

    static Collection<GrantedAuthority> authorities(Jwt jwt) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        Object rolesClaim = jwt.getClaim("roles");
        Object roleClaim = jwt.getClaim("role");

        if (rolesClaim instanceof List<?> roleList) {
            roleList.forEach(r -> authorities.add(toAuthority(r.toString())));
        } else if (rolesClaim instanceof String rolesStr) {
            Arrays.stream(rolesStr.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isBlank())
                    .forEach(r -> authorities.add(toAuthority(r)));
        }

        if (roleClaim instanceof List<?> roleList) {
            roleList.forEach(r -> authorities.add(toAuthority(r.toString())));
        } else if (roleClaim instanceof String roleStr) {
            Arrays.stream(roleStr.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isBlank())
                    .forEach(r -> authorities.add(toAuthority(r)));
        }

        return authorities;
    }

    /** Creates HS256 tokens signed with the shared secret. */
    public static JwtEncoder encoder(String secret) {
        SecretKey key = key(secret);
        return new NimbusJwtEncoder(new ImmutableSecret(key));
    }

    private static GrantedAuthority toAuthority(String role) {
        String normalized = role.trim().toUpperCase(Locale.ROOT);
        String prefixed = normalized.startsWith("ROLE_") ? normalized : "ROLE_" + normalized;
        return new SimpleGrantedAuthority(prefixed);
    }
}
