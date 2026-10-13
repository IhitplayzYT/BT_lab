package com.bank.calculator.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * Filter for input sanitization to prevent XSS and injection attacks.
 * Sanitizes request parameters and headers.
 */
@Component
public class InputSanitizationFilter extends OncePerRequestFilter {

    private static final List<String> XSS_PATTERNS = Arrays.asList(
            "<script.*?>.*?</script>",
            "javascript:",
            "on\\w+\\s*=",
            "<.*?on\\w+.*?>",
            "eval\\s*\\(",
            "expression\\s*\\("
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        SanitizedHttpServletRequest sanitizedRequest = new SanitizedHttpServletRequest(request);
        filterChain.doFilter(sanitizedRequest, response);
    }

    private static class SanitizedHttpServletRequest extends HttpServletRequestWrapper {
        
        public SanitizedHttpServletRequest(HttpServletRequest request) {
            super(request);
        }

        @Override
        public String getParameter(String name) {
            String value = super.getParameter(name);
            return sanitize(value);
        }

        @Override
        public String[] getParameterValues(String name) {
            String[] values = super.getParameterValues(name);
            if (values == null) {
                return null;
            }
            String[] sanitized = new String[values.length];
            for (int i = 0; i < values.length; i++) {
                sanitized[i] = sanitize(values[i]);
            }
            return sanitized;
        }

        @Override
        public String getHeader(String name) {
            String value = super.getHeader(name);
            return sanitize(value);
        }

        private String sanitize(String input) {
            if (input == null) {
                return null;
            }
            
            String sanitized = input;
            for (String pattern : XSS_PATTERNS) {
                sanitized = sanitized.replaceAll("(?i)" + pattern, "");
            }
            
            // Remove potentially dangerous characters
            sanitized = sanitized.replaceAll("[<>\"'&]", "");
            
            return sanitized.trim();
        }
    }
}
