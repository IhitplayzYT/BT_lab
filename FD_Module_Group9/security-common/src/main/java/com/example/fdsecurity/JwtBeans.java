package com.example.fdsecurity;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;

/**
 * {@code @Import(JwtBeans.class)} in a service's SecurityConfig. The decoder exists only when app.jwt.secret is set
 * (from the JWT_SECRET environment variable), so there is never a built-in default key that anyone could use to forge tokens.
 */
@Configuration
public class JwtBeans {
    @Bean
    @ConditionalOnExpression("!'${app.jwt.secret:}'.isBlank()") // blank or missing secret = JWT off (Basic only), never a weak default key
    JwtDecoder jwtDecoder(@Value("${app.jwt.secret}") String secret,
                          @Value("${app.jwt.issuer:fd-platform-auth}") String issuer) {
        return JwtSupport.decoder(secret, issuer);
    }

    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        return JwtSupport.authenticationConverter();
    }
}
