package com.example.fdsecurity;

import io.jsonwebtoken.Jwts;

import javax.crypto.SecretKey;
import java.time.Duration;
import java.time.Instant;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.UUID;

/** Signs access tokens. Used only by auth-service; every other service just validates with {@link JwtSupport#decoder}. */
public class TokenIssuer {
    public record IssuedToken(String value, Instant expiresAt) { }

    private final SecretKey key;
    private final String issuer;
    private final Duration lifetime;

    public TokenIssuer(String secret, String issuer, Duration lifetime) {
        if (lifetime.isZero() || lifetime.isNegative()) throw new IllegalArgumentException("Token lifetime must be positive");
        this.key = JwtSupport.key(secret);
        this.issuer = issuer;
        this.lifetime = lifetime;
    }

    public IssuedToken issue(String username, Collection<String> roles) {
        return issueAt(username, roles, Instant.now());
    }

    /** Package-visible so tests can create already-expired tokens. */
    IssuedToken issueAt(String username, Collection<String> roles, Instant issuedAt) {
        Instant expires = issuedAt.plus(lifetime);
        String value = Jwts.builder()
                .subject(username)
                .issuer(issuer)
                .issuedAt(Date.from(issuedAt))
                .expiration(Date.from(expires))
                .id(UUID.randomUUID().toString())
                .claim("roles", List.copyOf(roles))
                .signWith(key, io.jsonwebtoken.Jwts.SIG.HS256)
                .compact();
        return new IssuedToken(value, expires);
    }

    public Duration lifetime() { return lifetime; }
}
