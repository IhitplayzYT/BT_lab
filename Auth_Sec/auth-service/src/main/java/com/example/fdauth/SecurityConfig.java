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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.Duration;
import java.util.Arrays;

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
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200", "http://localhost:4201", "http://127.0.0.1:4200"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    SecurityFilterChain chain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
        return http
                .csrf(c -> c.disable()) // no cookies or sessions are used,
                .cors(c -> c.configurationSource(corsConfigurationSource()))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthenticationFilter, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(a -> a
                        .requestMatchers("/api/auth/login", "/api/auth/signup", "/api/auth/refresh", "/api/auth/logout", "/api/auth/init-signup", "/api/auth/verify-otp", "/api/auth/resend-otp", "/health", "/actuator/health", "/error").permitAll()
                        .requestMatchers("/api/auth/me").authenticated()
                        .requestMatchers("/api/auth/staff/**").hasAnyRole("BANK_OFFICER", "ADMIN")
                        .requestMatchers("/api/auth/admin/**").hasRole("ADMIN")
                        .anyRequest().denyAll())
                .exceptionHandling(e -> e.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .build();
    }
}
