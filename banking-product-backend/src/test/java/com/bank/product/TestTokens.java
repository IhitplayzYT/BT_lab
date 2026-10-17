package com.bank.product;
public final class TestTokens {
    public static String token(String user, java.util.List<String> roles) {
        return new com.example.fdsecurity.TokenIssuer("test-secret-key-minimum-32-characters-for-hmac256", "fd-platform-auth", java.time.Duration.ofMinutes(5)).issue(user, roles).value();
    }
}
