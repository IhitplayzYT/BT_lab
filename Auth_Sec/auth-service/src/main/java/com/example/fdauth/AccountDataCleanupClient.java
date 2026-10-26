package com.example.fdauth;

import com.example.fdsecurity.TokenIssuer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/** Removes the deleted login's identity link from the account service before auth removes the login. */
@Component
public class AccountDataCleanupClient {
    private final RestTemplate restTemplate;
    private final TokenIssuer tokens;
    private final String accountServiceUrl;

    public AccountDataCleanupClient(TokenIssuer tokens,
                                    @Value("${services.account.base-url:http://localhost:8086}") String accountServiceUrl) {
        this.tokens = tokens;
        this.accountServiceUrl = accountServiceUrl;
        var factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000);
        factory.setReadTimeout(10000);
        this.restTemplate = new RestTemplate(factory);
    }

    public void cleanup(String username) {
        String token = tokens.issue("auth-service", List.of("ADMIN")).value();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        restTemplate.exchange(accountServiceUrl + "/internal/users/{username}/portfolio",
                HttpMethod.DELETE, new HttpEntity<>(headers), Void.class, username);
    }

    public void syncCustomerProfile(String username, String email, Long userId) {
        String token = tokens.issue("auth-service", List.of("ADMIN")).value();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.set("Content-Type", "application/json");
        
        Map<String, Object> body = new java.util.HashMap<>();
        body.put("username", username);
        body.put("email", email);
        body.put("userId", userId);
        
        restTemplate.exchange(accountServiceUrl + "/internal/users/sync-profile",
                HttpMethod.POST, new HttpEntity<>(body, headers), Void.class);
    }
}
