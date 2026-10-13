package com.bank.calculator.security;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Strongly-typed binding for {@code app.jwt.*} in application.yml.
 *
 * <p>This class intentionally holds only the properties needed for HMAC-256
 * validation. To switch production to an external JWT issuer / RSA public-key,
 * the caller ({@link com.bank.calculator.config.SecurityConfig}) already checks for the presence of
 * {@code spring.security.oauth2.resourceserver.jwt.issuer-uri}; simply add
 * that property to {@code application-prod.yml} and the bean wiring changes
 * automatically—no code changes required.
 */
@Validated
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {

    /**
     * HMAC-256 secret (minimum 32 characters / 256 bits).
     * Must be provided via environment variable in non-dev environments.
     */
    @NotBlank
    @Size(min = 32, message = "JWT secret must be at least 32 characters (256 bits)")
    private String secret;

    /** Expected {@code iss} claim value. */
    @NotBlank
    private String issuer;

    /** Expected {@code aud} claim value. */
    @NotBlank
    private String audience;

    /** Name of the claim that carries the comma-separated roles list. */
    @NotBlank
    private String rolesClaim = "roles";

    public JwtProperties() {
    }

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public String getIssuer() {
        return issuer;
    }

    public void setIssuer(String issuer) {
        this.issuer = issuer;
    }

    public String getAudience() {
        return audience;
    }

    public void setAudience(String audience) {
        this.audience = audience;
    }

    public String getRolesClaim() {
        return rolesClaim;
    }

    public void setRolesClaim(String rolesClaim) {
        this.rolesClaim = rolesClaim;
    }
}
