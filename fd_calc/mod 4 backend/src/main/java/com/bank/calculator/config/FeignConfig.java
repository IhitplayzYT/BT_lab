package com.bank.calculator.config;

import feign.Logger;
import feign.Request;
import feign.RequestInterceptor;
import org.slf4j.MDC;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

import static com.bank.calculator.util.CorrelationIdFilter.HEADER_NAME;
import static com.bank.calculator.util.CorrelationIdFilter.MDC_KEY;

/**
 * OpenFeign configuration: connection/read timeouts and correlation-ID forwarding.
 */
@Configuration
public class FeignConfig {

    private static final org.slf4j.Logger log = LoggerFactory.getLogger(FeignConfig.class);

    @Value("${services.product.connect-timeout-ms:3000}")
    private int productConnectTimeout;

    @Value("${services.product.read-timeout-ms:5000}")
    private int productReadTimeout;

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.issuer}")
    private String jwtIssuer;

    @Bean
    public feign.Logger.Level feignLoggerLevel() {
        return Logger.Level.FULL;
    }

    @Bean
    public Request.Options feignRequestOptions() {
        return new Request.Options(
                productConnectTimeout, TimeUnit.MILLISECONDS,
                productReadTimeout, TimeUnit.MILLISECONDS,
                true);
    }

    /**
     * Propagates the correlation ID from MDC into every outbound Feign request.
     */
    @Bean
    public RequestInterceptor correlationIdInterceptor() {
        return template -> {
            String correlationId = MDC.get(MDC_KEY);
            if (correlationId != null) {
                template.header(HEADER_NAME, correlationId);
            }
        };
    }

    /**
     * Generates a service-to-service JWT token for calling Product Service.
     * This token has BANK_OFFICER role and product-service audience.
     */
    private String generateServiceToken() {
        String token = io.jsonwebtoken.Jwts.builder()
                .subject("fd-calculator-service")
                .claim("roles", java.util.List.of("BANK_OFFICER"))
                .issuer(jwtIssuer)
                .audience().add("product-service").and()
                .issuedAt(java.util.Date.from(java.time.Instant.now()))
                .expiration(java.util.Date.from(java.time.Instant.now().plusSeconds(3600)))
                .signWith(io.jsonwebtoken.security.Keys.hmacShaKeyFor(jwtSecret.getBytes()), io.jsonwebtoken.SignatureAlgorithm.HS256)
                .compact();
        log.debug("Generated service token: {}", token.substring(0, Math.min(50, token.length())));
        return token;
    }

    /**
     * Uses a service-to-service token for Product Service calls instead of forwarding user token.
     */
    @Bean
    public RequestInterceptor bearerTokenInterceptor() {
        return template -> {
            String serviceToken = generateServiceToken();
            log.debug("Adding service token to request for: {}", template.url());
            template.header(org.springframework.http.HttpHeaders.AUTHORIZATION, "Bearer " + serviceToken);
        };
    }

}
