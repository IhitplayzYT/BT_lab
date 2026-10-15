package com.example.fdsecurity;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;

/**
 * Adds the two ways a caller can log in to a service's filter chain: {@code Authorization: Bearer <JWT>} (when a
 * JwtDecoder exists, i.e. JWT_SECRET is set) and HTTP Basic (a demo/test mode that can be switched off with
 * app.security.basic.enabled=false). Each service keeps its own rules for which URLs need which role.
 */
public final class ResourceServerSupport {
    private ResourceServerSupport() { }

    public static void apply(HttpSecurity http, ObjectProvider<JwtDecoder> decoder,
                             JwtAuthenticationConverter converter, boolean basicEnabled) throws Exception {
        JwtDecoder jwtDecoder = decoder.getIfAvailable();
        if (jwtDecoder != null) {
            http.oauth2ResourceServer(o -> o.jwt(j -> j.decoder(jwtDecoder).jwtAuthenticationConverter(converter)));
        }
        if (basicEnabled) {
            http.httpBasic(b -> { });
        }
        if (jwtDecoder == null && !basicEnabled) {
            throw new IllegalStateException("No way to log in: set JWT_SECRET or leave app.security.basic.enabled=true");
        }
    }
}
