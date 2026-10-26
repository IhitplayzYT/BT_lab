package com.example.fdmodule.test;

import com.example.fdsecurity.TokenIssuer;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/** Creates the same bearer tokens used by the service security tests. */
public final class JwtTestSupport {
    private static final TokenIssuer ISSUER = new TokenIssuer(
            "test-only-secret-test-only-secret-0001", "fd-platform-auth", Duration.ofMinutes(10));
    private static final Map<String, String> ROLES = Map.of(
            "customer1", "CUSTOMER",
            "customer2", "CUSTOMER",
            "officer1", "BANK_OFFICER",
            "admin1", "ADMIN");

    private JwtTestSupport() { }

    public static RequestPostProcessor jwtAuth(String username) {
        String role = ROLES.get(username);
        if (role == null) throw new IllegalArgumentException("No test role configured for " + username);
        String token = ISSUER.issue(username, List.of(role)).value();
        return request -> {
            request.addHeader("Authorization", "Bearer " + token);
            return request;
        };
    }
}
