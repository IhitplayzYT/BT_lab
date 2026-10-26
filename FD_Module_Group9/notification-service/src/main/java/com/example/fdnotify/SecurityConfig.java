package com.example.fdnotify;

import com.example.fdsecurity.JwtBeans;
import com.example.fdsecurity.ResourceServerSupport;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

/** Callers log in with a JWT from auth-service (Bearer) or, in demo mode, HTTP Basic with the users below. */
@Configuration
@EnableMethodSecurity
@Import(JwtBeans.class)
public class SecurityConfig {
    @Bean PasswordEncoder encoder() { return new BCryptPasswordEncoder(); }

    @Bean InMemoryUserDetailsManager users(PasswordEncoder e) {
        return new InMemoryUserDetailsManager(
                User.withUsername("admin1").password(e.encode("admin123")).roles("ADMIN").build(),
                User.withUsername("officer1").password(e.encode("officer123")).roles("BANK_OFFICER").build());
    }

    @Bean CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:4200", "http://127.0.0.1:4200"));
        configuration.setAllowedMethods(List.of("GET", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean SecurityFilterChain chain(HttpSecurity h, ObjectProvider<JwtDecoder> jwt, JwtAuthenticationConverter converter,
                                    @Value("${app.security.basic.enabled:true}") boolean basic) throws Exception {
        h.csrf(c -> c.disable()).cors(org.springframework.security.config.Customizer.withDefaults())
                .authorizeHttpRequests(a -> a.anyRequest().authenticated());
        ResourceServerSupport.apply(h, jwt, converter, basic);
        return h.build();
    }
}
