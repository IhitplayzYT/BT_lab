package com.example.fdmodule.client;

import com.example.fdsecurity.TokenIssuer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * Builds Authorization headers for outbound REST calls to Product & Pricing and FD Calculator.
 * Reuses the caller's JWT when it has the required role; otherwise mints a short-lived service token.
 */
@Component
public class OutboundServiceAuth {

    public enum Target {
        PRODUCT(List.of("BANK_OFFICER", "ADMIN")),
        CALCULATOR(List.of("CUSTOMER")),
        AUTH(List.of("ADMIN"));

        private final List<String> roles;

        Target(List<String> roles) {
            this.roles = roles;
        }
    }

    private final Optional<TokenIssuer> tokenIssuer;

    public OutboundServiceAuth(@Value("${app.jwt.secret:}") String secret,
                               @Value("${app.jwt.issuer:fd-platform-auth}") String issuer) {
        this.tokenIssuer = secret.isBlank()
                ? Optional.empty()
                : Optional.of(new TokenIssuer(secret, issuer, Duration.ofMinutes(5)));
    }

    public HttpHeaders headers(Target target) {
        HttpHeaders headers = new HttpHeaders();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwtAuth && hasAnyRole(jwtAuth.getAuthorities(), target.roles)) {
            headers.setBearerAuth(jwtAuth.getToken().getTokenValue());
            return headers;
        }
        String subject = auth != null && auth.getName() != null ? auth.getName() : "fd-account-integration";
        tokenIssuer.ifPresent(issuer ->
                headers.setBearerAuth(issuer.issue(subject, target.roles).value()));
        return headers;
    }

    private static boolean hasAnyRole(Collection<? extends GrantedAuthority> authorities, List<String> roles) {
        for (String role : roles) {
            String prefixed = role.startsWith("ROLE_") ? role : "ROLE_" + role;
            if (authorities.stream().anyMatch(a -> prefixed.equals(a.getAuthority()))) {
                return true;
            }
        }
        return false;
    }
}
