package com.bank.calculator.config;

import com.bank.calculator.security.JwtAuthConverter;
import com.bank.calculator.security.JwtProperties;
import io.jsonwebtoken.security.Keys;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

/**
 * Security configuration for the FD Calculator resource server.
 *
 * <h2>JWT strategy</h2>
 * <p>Currently uses HMAC-256 with a configurable secret ({@code app.jwt.secret}).
 * To switch to an external JWT issuer / RSA validation in production:</p>
 * <ol>
 *   <li>Add {@code spring.security.oauth2.resourceserver.jwt.issuer-uri} to
 *       {@code application-prod.yml}.</li>
 *   <li>Remove the custom {@link #jwtDecoder(JwtProperties)} bean (or guard it
 *       with {@code @ConditionalOnMissingBean}).</li>
 *   <li>Spring Boot auto-configuration will switch to JWKS-backed RSA validation
 *       automatically — no code changes required here.</li>
 * </ol>
 *
 * <h2>Access rules</h2>
 * <ul>
 *   <li>Actuator {@code /actuator/health} — public.</li>
 *   <li>Swagger UI / OpenAPI spec — public.</li>
 *   <li>H2 console — dev-only, whitelisted here (disabled in prod profile).</li>
 *   <li>{@code /api/v1/**} — requires authenticated {@code CUSTOMER} role.</li>
 *   <li>{@code /internal/**} — authenticated (any valid JWT); intended only for
 *       service-to-service calls, never exposed through the public gateway.</li>
 * </ul>
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthConverter jwtAuthConverter;
    private final JwtProperties jwtProperties;

    public SecurityConfig(JwtAuthConverter jwtAuthConverter, JwtProperties jwtProperties) {
        this.jwtAuthConverter = jwtAuthConverter;
        this.jwtProperties = jwtProperties;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .headers(h -> h
                .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'"))
                .frameOptions(fo -> fo.sameOrigin()) // needed for H2 console iframe
                .xssProtection(xss -> xss.disable())
                .httpStrictTransportSecurity(hsts -> hsts
                    .includeSubDomains(true)
                    .maxAgeInSeconds(31536000))
                .contentTypeOptions(content -> content.disable())
            )
            .authorizeHttpRequests(auth -> auth
                // ── Public / infra ──────────────────────────────────────────
                .requestMatchers(HttpMethod.GET, "/actuator/health", "/actuator/info").permitAll()
                .requestMatchers(
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**",
                    "/v3/api-docs"
                ).permitAll()
                .requestMatchers("/h2-console/**").permitAll()   // disabled in prod profile
                // ── Public FD calculation APIs (JWT required, CUSTOMER role) ──
                .requestMatchers("/api/v1/**").hasRole("CUSTOMER")
                // ── Internal service-to-service (any valid JWT) ────────────
                .requestMatchers("/internal/**").authenticated()
                // ── Everything else — deny ─────────────────────────────────
                .anyRequest().denyAll()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthConverter))
            );

        return http.build();
    }

    /**
     * Custom {@link JwtDecoder} backed by the HMAC-256 secret from configuration.
     *
     * <p>For production migration to RSA / JWKS, remove this bean (or add
     * {@code @ConditionalOnProperty(name = "spring.security.oauth2.resourceserver.jwt.issuer-uri",
     * matchIfMissing = false)}) and Spring Boot will auto-configure a JWKS decoder.</p>
     */
    @Bean
    @org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean(JwtDecoder.class)
    public JwtDecoder jwtDecoder(JwtProperties props) {
        byte[] secretBytes = props.getSecret().getBytes(StandardCharsets.UTF_8);
        SecretKey key = Keys.hmacShaKeyFor(secretBytes);
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(key).build();

        if (props.getIssuer() != null && !props.getIssuer().isBlank()) {
            org.springframework.security.oauth2.core.OAuth2TokenValidator<Jwt> withIssuer =
                    org.springframework.security.oauth2.jwt.JwtValidators.createDefaultWithIssuer(props.getIssuer());

            if (props.getAudience() != null && !props.getAudience().isBlank()) {
                org.springframework.security.oauth2.core.OAuth2TokenValidator<Jwt> withAudience =
                        new org.springframework.security.oauth2.jwt.JwtClaimValidator<Object>(
                                "aud",
                                aud -> aud == null || (aud instanceof java.util.List<?> l ? l.contains(props.getAudience()) : props.getAudience().equals(aud.toString())));
                decoder.setJwtValidator(new org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator<>(withIssuer, withAudience));
            } else {
                decoder.setJwtValidator(withIssuer);
            }
        }
        return decoder;
    }
}
