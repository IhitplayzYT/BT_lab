package com.example.fdmodule.config;

import com.example.fdsecurity.JwtBeans;
import com.example.fdsecurity.ResourceServerSupport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableMethodSecurity
@Import(JwtBeans.class)
public class SecurityConfig {
    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

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

    /**
     * JWT-only authentication. All callers must provide a valid JWT token from auth-service.
     * HTTP Basic auth is disabled for production security.
     */
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, ObjectProvider<JwtDecoder> jwtDecoder,
                                            JwtAuthenticationConverter jwtConverter,
                                            @Value("${app.security.basic.enabled:false}") boolean basicEnabled,
                                            @Value("${app.jwt.secret:}") String jwtSecret,
                                            @Value("${app.jwt.issuer:fd-platform-auth}") String jwtIssuer) throws Exception {
        log.info("=== Security Configuration ===");
        log.info("JWT Secret present: {}", !jwtSecret.isBlank());
        log.info("JWT Secret length: {}", jwtSecret.length());
        log.info("JWT Issuer: {}", jwtIssuer);
        log.info("Basic Auth enabled: {}", basicEnabled);
        log.info("JwtDecoder available: {}", jwtDecoder.getIfAvailable() != null);

        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/error", "/health", "/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form.disable());
        ResourceServerSupport.apply(http, jwtDecoder, jwtConverter, basicEnabled);

        return http.build();
    }
}
