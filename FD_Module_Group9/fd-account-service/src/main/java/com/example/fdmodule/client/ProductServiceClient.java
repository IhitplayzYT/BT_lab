package com.example.fdmodule.client;

import com.example.fdmodule.config.ServiceProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

/**
 * Client for calling the Product & Pricing service.
 * Used for product validation and rate calculation integration.
 */
@Component
public class ProductServiceClient {

    private final RestTemplate restTemplate;
    private final ServiceProperties serviceProperties;
    private final ObjectMapper objectMapper;
    private final OutboundServiceAuth outboundAuth;

    public ProductServiceClient(ServiceProperties serviceProperties, OutboundServiceAuth outboundAuth) {
        this.serviceProperties = serviceProperties;
        this.outboundAuth = outboundAuth;
        var factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000);
        factory.setReadTimeout(5000);
        this.restTemplate = new RestTemplate(factory);
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Get active products from Product & Pricing service.
     */
    public List<JsonNode> getActiveProducts(String productType) {
        String url = serviceProperties.getProduct().getBaseUrl() + "/api/product/active";
        if (productType != null && !productType.isEmpty()) {
            url += "?type=" + productType;
        }

        ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                ServiceClientSupport.getEntity(outboundAuth.headers(OutboundServiceAuth.Target.PRODUCT)),
                String.class
        );

        try {
            JsonNode root = objectMapper.readTree(response.getBody());
            List<JsonNode> products = new ArrayList<>();
            if (root.isArray()) {
                for (JsonNode node : root) {
                    products.add(node);
                }
            }
            return products;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse product response", e);
        }
    }

    /**
     * Get product by code from Product & Pricing service.
     */
    public JsonNode getProductByCode(String productCode) {
        String url = serviceProperties.getProduct().getBaseUrl() + "/api/product/" + productCode;

        ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                ServiceClientSupport.getEntity(outboundAuth.headers(OutboundServiceAuth.Target.PRODUCT)),
                String.class
        );

        try {
            return objectMapper.readTree(response.getBody());
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse product response", e);
        }
    }

    /**
     * Validate product for account creation.
     */
    public JsonNode validateProduct(String productCode, Integer termMonths, Double amount, Integer age) {
        String url = serviceProperties.getProduct().getBaseUrl() + "/api/product/" + productCode + "/validate";
        if (termMonths != null) {
            url += "?termMonths=" + termMonths;
        }
        if (amount != null) {
            url += (url.contains("?") ? "&" : "?") + "amount=" + amount;
        }
        if (age != null) {
            url += (url.contains("?") ? "&" : "?") + "age=" + age;
        }

        ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                ServiceClientSupport.getEntity(outboundAuth.headers(OutboundServiceAuth.Target.PRODUCT)),
                String.class
        );

        try {
            return objectMapper.readTree(response.getBody());
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse validation response", e);
        }
    }

    /**
     * Calculate final interest rate for a product.
     */
    public JsonNode calculateRate(String productCode, String customerCategory, Integer termMonths, Double amount) {
        String url = serviceProperties.getProduct().getBaseUrl() + "/api/product/" + productCode + "/rate";
        
        var jsonBody = objectMapper.createObjectNode();
        if (customerCategory != null) jsonBody.put("customerCategory", customerCategory);
        if (termMonths != null) jsonBody.put("termMonths", termMonths);
        if (amount != null) jsonBody.put("amount", amount);

        ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                ServiceClientSupport.jsonEntity(outboundAuth.headers(OutboundServiceAuth.Target.PRODUCT), jsonBody.toString()),
                String.class
        );

        try {
            return objectMapper.readTree(response.getBody());
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse rate calculation response", e);
        }
    }
}
