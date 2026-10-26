package com.example.fdmodule.service;

import com.example.fdmodule.client.ProductServiceClient;
import com.example.fdmodule.dto.ProductDTO;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProductValidationService {
    private final ProductServiceClient productServiceClient;

    public ProductValidationService(ProductServiceClient productServiceClient) {
        this.productServiceClient = productServiceClient;
    }

    private com.example.fdmodule.clock.BusinessClock clock;

    /** Optional so the class still works without the clock; with it, "is the product effective yet" follows the business date. */
    @org.springframework.beans.factory.annotation.Autowired(required = false)
    void setClock(com.example.fdmodule.clock.BusinessClock clock) {
        this.clock = clock;
    }

    private LocalDate today() {
        return clock != null ? clock.today() : LocalDate.now();
    }

    public ProductDTO validate(String productCode, int termMonths, BigDecimal principal) {
        // Use the Product & Pricing service integration
        JsonNode productJson = productServiceClient.getProductByCode(productCode);
        
        // Check if product is active
        String status = productJson.has("status") ? productJson.get("status").asText() : null;
        if (!"ACTIVE".equalsIgnoreCase(status)) {
            throw new IllegalArgumentException("Product is not active: " + productCode);
        }
        
        // Check effective date if present
        if (productJson.hasNonNull("effectiveDate")) {
            String effectiveDateStr = productJson.get("effectiveDate").asText();
            if (effectiveDateStr != null && !effectiveDateStr.isEmpty()) {
                LocalDate effectiveDate = LocalDate.parse(effectiveDateStr);
                if (effectiveDate.isAfter(today())) {
                    throw new IllegalArgumentException("Product is not effective yet: " + productCode);
                }
            }
        }
        
        if (!"FD".equalsIgnoreCase(productJson.path("productType").asText())) {
            throw new IllegalArgumentException("Product must be an FD product");
        }
        if (productJson.hasNonNull("endDate") && today().isAfter(LocalDate.parse(productJson.get("endDate").asText()))) {
            throw new IllegalArgumentException("Product has expired: " + productCode);
        }
        if (productJson.hasNonNull("maxDeposit") && principal.compareTo(productJson.get("maxDeposit").decimalValue()) > 0) {
            throw new IllegalArgumentException("Maximum deposit is " + productJson.get("maxDeposit"));
        }
        // Validate term limits
        int minTerm = productJson.path("termLimit").path("min").asInt();
        int maxTerm = productJson.path("termLimit").path("max").asInt();
        if (termMonths < minTerm || termMonths > maxTerm) {
            throw new IllegalArgumentException("Term must be between " + minTerm + " and " + maxTerm + " months");
        }
        
        // Validate deposit limits
        BigDecimal minDeposit = productJson.hasNonNull("minDeposit") ? 
            new BigDecimal(productJson.get("minDeposit").asText()) : BigDecimal.ZERO;
        if (principal.compareTo(minDeposit) < 0) {
            throw new IllegalArgumentException("Minimum deposit is " + minDeposit);
        }
        
        // Convert JsonNode to ProductDTO for return
        return convertJsonToProductDTO(productJson);
    }
    
    private ProductDTO convertJsonToProductDTO(JsonNode json) {
        ProductDTO product = new ProductDTO();
        product.setProductCode(json.has("productCode") ? json.get("productCode").asText() : null);
        product.setProductName(json.has("productName") ? json.get("productName").asText() : null);
        product.setProductType(json.has("productType") ? json.get("productType").asText() : null);
        product.setInterestType("COMPOUND");
        product.setCurrency(json.has("currency") ? json.get("currency").asText() : "INR");
        product.setMinTermMonths(json.path("termLimit").path("min").asInt());
        product.setMaxTermMonths(json.path("termLimit").path("max").asInt());
        product.setMinRate(json.path("rateLimit").path("min").decimalValue());
        product.setMaxRate(json.path("rateLimit").path("max").decimalValue());
        product.setMinDeposit(json.hasNonNull("minDeposit") ? new BigDecimal(json.get("minDeposit").asText()) : BigDecimal.ZERO);
        product.setMaxDeposit(json.hasNonNull("maxDeposit") ? new BigDecimal(json.get("maxDeposit").asText()) : null);
        product.setCompoundingFrequency(json.hasNonNull("compoundingFrequency") ? json.get("compoundingFrequency").asText() : null);
        product.setServiceFeeRate(decimalOrNull(json, "serviceFeeRate"));
        product.setServiceFeeFlat(decimalOrNull(json, "serviceFeeFlat"));
        product.setDocumentationFee(decimalOrNull(json, "documentationFee"));
        product.setGstRate(decimalOrNull(json, "gstRate"));
        product.setTaxRate(decimalOrNull(json, "taxRate"));
        product.setPrematurePenaltyRate(decimalOrNull(json, "prematurePenaltyRate"));
        product.setStatus(json.has("status") ? json.get("status").asText() : "ACTIVE");
        List<String> allowedRoles = new ArrayList<>();
        if (json.path("allowedRoles").isArray()) {
            json.path("allowedRoles").forEach(role -> allowedRoles.add(role.asText().toUpperCase()));
        }
        if (allowedRoles.isEmpty()) allowedRoles.add("OWNER");
        product.setAllowedRoles(allowedRoles);
        
        // Parse effective date if present
        if (json.has("effectiveDate") && !json.get("effectiveDate").isNull()) {
            product.setEffectiveDate(LocalDate.parse(json.get("effectiveDate").asText()));
        }
        
        return product;
    }

    private BigDecimal decimalOrNull(JsonNode json, String field) {
        return json.hasNonNull(field) && json.get(field).isNumber() ? json.get(field).decimalValue() : null;
    }
}
