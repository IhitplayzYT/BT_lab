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

    private final OutboundServiceAuth outboundAuth;
    private final RestTemplate restTemplate;
    private final ServiceProperties serviceProperties;
    private final ObjectMapper objectMapper;

    public CalculatorServiceClient(ServiceProperties serviceProperties, OutboundServiceAuth outboundAuth) {
        this.outboundAuth = outboundAuth;
        this.serviceProperties = serviceProperties;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Calculate FD maturity using the Calculator service.
     */
    public JsonNode calculateMaturity(String productCode, Double principal, Integer termMonths, String interestType) {
        String url = serviceProperties.getCalculator().getBaseUrl() + "/api/fd/calculate";

        HttpHeaders headers = outboundAuth.headers(OutboundServiceAuth.Target.CALCULATOR);
        headers.set("Content-Type", "application/json");
        headers.set("Accept", "application/json");

        var request = objectMapper.createObjectNode();
        request.put("productCode", productCode);
        request.put("principal", principal);
        request.putObject("term").put("value", termMonths).put("unit", "MONTHS");
        request.put("interestType", interestType);
        String requestBody = request.toString();

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
     * Note: This endpoint may not exist in the current calculator service implementation.
     * Consider using the product service directly for product details.
     */
    public JsonNode previewProduct(String productCode) {
        String url = serviceProperties.getCalculator().getBaseUrl() + "/api/fd/products/" + productCode + "/preview";

        HttpHeaders headers = outboundAuth.headers(OutboundServiceAuth.Target.CALCULATOR);
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
