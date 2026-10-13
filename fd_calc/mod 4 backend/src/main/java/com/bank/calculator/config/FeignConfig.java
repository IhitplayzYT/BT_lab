package com.bank.calculator.config;

import feign.Logger;
import feign.Request;
import feign.RequestInterceptor;
import org.slf4j.MDC;
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

    @Value("${services.product.connect-timeout-ms:3000}")
    private int productConnectTimeout;

    @Value("${services.product.read-timeout-ms:5000}")
    private int productReadTimeout;

    @Bean
    public feign.Logger.Level feignLoggerLevel() {
        return Logger.Level.BASIC;
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
     * Propagates the inbound Bearer JWT token to downstream internal services.
     */
    @Bean
    public RequestInterceptor bearerTokenInterceptor() {
        return template -> {
            org.springframework.security.core.Authentication auth =
                    org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth instanceof org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken jwtAuth) {
                template.header(org.springframework.http.HttpHeaders.AUTHORIZATION, "Bearer " + jwtAuth.getToken().getTokenValue());
            }
        };
    }
}
