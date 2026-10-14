package com.example.fdauth;

import com.example.fdsecurity.TokenIssuer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

import java.time.Duration;

@Configuration
public class SecurityConfig {
    @Bean
    PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    /** Fails fast at startup if JWT_SECRET is missing or shorter than 32 characters (the secret is never defaulted). */
    @Bean
    TokenIssuer tokenIssuer(@Value("${app.jwt.secret:}") String secret,
                            @Value("${app.jwt.issuer:fd-platform-auth}") String issuer,
                            @Value("${app.jwt.ttl-minutes:60}") long ttlMinutes) {
        if (secret.isBlank()) throw new IllegalStateException("JWT_SECRET is not set. Put it in scripts/local.env.ps1 (at least 32 characters).");
        return new TokenIssuer(secret, issuer, Duration.ofMinutes(ttlMinutes));
    }

    @Bean
    SecurityFilterChain chain(HttpSecurity http) throws Exception {
        return http
                .csrf(c -> c.disable()) // no cookies or sessions are used, so there is nothing for CSRF to attack
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(a -> a
                        .requestMatchers("/api/auth/login", "/error").permitAll()
                        .anyRequest().denyAll())
                .exceptionHandling(e -> e.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .build();
    }
}
