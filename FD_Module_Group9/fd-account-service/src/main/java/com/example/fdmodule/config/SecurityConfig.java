package com.example.fdmodule.config;

import com.example.fdsecurity.JwtBeans;
import com.example.fdsecurity.ResourceServerSupport;
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

@Configuration
@EnableMethodSecurity
@Import(JwtBeans.class)
public class SecurityConfig {

    /**
     * JWT-only authentication. All callers must provide a valid JWT token from auth-service.
     * HTTP Basic auth is disabled for production security.
     */
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, ObjectProvider<JwtDecoder> jwtDecoder,
                                            JwtAuthenticationConverter jwtConverter,
                                            @Value("${app.security.basic.enabled:false}") boolean basicEnabled) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/error").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form.disable());
        ResourceServerSupport.apply(http, jwtDecoder, jwtConverter, basicEnabled);

        return http.build();
    }
}
