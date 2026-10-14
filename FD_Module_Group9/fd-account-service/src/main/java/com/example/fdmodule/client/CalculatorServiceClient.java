package com.example.fdmodule.client;

import com.example.fdmodule.config.ServiceProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * Client for calling the FD Calculator service.
 * Used for interest calculation integration.
 */
@Component
public class CalculatorServiceClient {

    private final RestTemplate restTemplate;
    private final ServiceProperties serviceProperties;
    private final ObjectMapper objectMapper;

    public CalculatorServiceClient(ServiceProperties serviceProperties) {
        this.serviceProperties = serviceProperties;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Calculate FD maturity using the Calculator service.
     */
    public JsonNode calculateMaturity(String productCode, Double principal, Integer termMonths, String interestType) {
        String url = serviceProperties.getCalculator().getBaseUrl() + "/api/v1/fd/calculations/custom";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        headers.set("Accept", "application/json");

        // Build request body
        String requestBody = String.format(
                "{\"principal\": %s, \"termMonths\": %s, \"interestType\": \"%s\", \"productCode\": \"%s\"}",
                principal, termMonths, interestType != null ? interestType : "CREDIT", productCode
        );

        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                String.class
        );

        try {
            return objectMapper.readTree(response.getBody());
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse calculation response", e);
        }
    }

    /**
     * Get product preview from Calculator service.
     */
    public JsonNode previewProduct(String productCode) {
        String url = serviceProperties.getCalculator().getBaseUrl() + "/api/v1/fd/products/" + productCode + "/preview";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Accept", "application/json");

        HttpEntity<?> entity = new HttpEntity<>(headers);
        ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                String.class
        );

        try {
            return objectMapper.readTree(response.getBody());
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse product preview response", e);
        }
    }
}
