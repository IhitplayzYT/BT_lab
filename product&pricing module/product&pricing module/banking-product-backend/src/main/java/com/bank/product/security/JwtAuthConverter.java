package com.bank.product.security;

import org.springframework.core.convert.converter.Converter;
import org.springframework.lang.NonNull;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;

/**
 * Converts a validated {@link Jwt} into Spring Security authorities.
 *
 * <p>The roles claim is expected to be either:
 * <ul>
 *   <li>a JSON array:  {@code ["CUSTOMER","ADMIN"]}</li>
 *   <li>a comma-separated string: {@code "CUSTOMER,ADMIN"}</li>
 * </ul>
 * Roles are prefixed with {@code ROLE_} so that {@code hasRole("CUSTOMER")}
 * works in Spring Security expressions.
 *
 * <p>The claim name is configurable via {@link JwtProperties#getRolesClaim()}.
 */
@Component
public class JwtAuthConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    private final JwtProperties jwtProperties;

    public JwtAuthConverter(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    @Override
    public Collection<GrantedAuthority> convert(@NonNull Jwt jwt) {
        return extractAuthorities(jwt);
    }

    private Collection<GrantedAuthority> extractAuthorities(Jwt jwt) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        Object rolesClaim = jwt.getClaim(jwtProperties.getRolesClaim());

        if (rolesClaim instanceof List<?> roleList) {
            roleList.forEach(r -> authorities.add(toAuthority(r.toString())));
        } else if (rolesClaim instanceof String rolesStr) {
            Arrays.stream(rolesStr.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isBlank())
                    .forEach(r -> authorities.add(toAuthority(r)));
        }

        return authorities;
    }

    private static GrantedAuthority toAuthority(String role) {
        String prefixed = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        return new SimpleGrantedAuthority(prefixed);
    }
}
