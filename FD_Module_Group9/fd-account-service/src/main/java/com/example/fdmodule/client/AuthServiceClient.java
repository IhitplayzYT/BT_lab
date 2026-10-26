package com.example.fdmodule.client;

import com.example.fdmodule.config.ServiceProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class AuthServiceClient {

    private final RestTemplate restTemplate;
    private final ServiceProperties serviceProperties;
    private final ObjectMapper objectMapper;
    private final OutboundServiceAuth outboundAuth;

    public AuthServiceClient(ServiceProperties serviceProperties, OutboundServiceAuth outboundAuth) {
        this.serviceProperties = serviceProperties;
        this.outboundAuth = outboundAuth;
        var factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000);
        factory.setReadTimeout(5000);
        this.restTemplate = new RestTemplate(factory);
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Get user ID from auth service by username
     */
    public Long getUserIdByUsername(String username) {
        try {
            String url = serviceProperties.getAuth().getBaseUrl() + "/api/auth/admin/users/" + username;
            
            ResponseEntity<String> response = restTemplate.exchange(
                url,
                org.springframework.http.HttpMethod.GET,
                ServiceClientSupport.getEntity(outboundAuth.headers(OutboundServiceAuth.Target.AUTH)),
                String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode json = objectMapper.readTree(response.getBody());
                if (json.has("id")) {
                    return json.get("id").asLong();
                }
            }
        } catch (Exception e) {
            // Log error but don't fail - user might not exist in auth service yet
            System.err.println("Failed to fetch user ID from auth service: " + e.getMessage());
        }
        return null;
    }

    public String getUsernameByUserId(Long userId) {
        try {
            String url = serviceProperties.getAuth().getBaseUrl() + "/api/auth/admin/users/by-id/" + userId;
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    org.springframework.http.HttpMethod.GET,
                    ServiceClientSupport.getEntity(outboundAuth.headers(OutboundServiceAuth.Target.AUTH)),
                    String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode json = objectMapper.readTree(response.getBody());
                if (json.path("enabled").asBoolean(false) && json.hasNonNull("username")) {
                    return json.get("username").asText();
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to validate user ID with auth service: " + e.getMessage());
        }
        return null;
    }
}
