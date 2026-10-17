package com.example.fdmodule.service;

import com.example.fdmodule.client.ProductServiceClient;
import com.example.fdmodule.entity.CustomerProfile;
import com.example.fdmodule.repository.CustomerProfileRepository;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class RateService {
    private final CustomerProfileRepository customerRepository;
    private final ProductValidationService productValidationService;
    private final ProductServiceClient productServiceClient;

    public RateService(CustomerProfileRepository customerRepository,
                       ProductValidationService productValidationService,
                       ProductServiceClient productServiceClient) {
        this.customerRepository = customerRepository;
        this.productValidationService = productValidationService;
        this.productServiceClient = productServiceClient;
    }

    public BigDecimal determineFinalRate(String productCode, String customerId, int termMonths,
                                         java.math.BigDecimal principal) {
        CustomerProfile customer = customerRepository.findById(customerId).orElse(null);
        String category = customer != null && customer.getCategory() != null ? customer.getCategory() : "GENERAL";
        if ("SENIOR".equalsIgnoreCase(category)) category = "SENIOR_CITIZEN";
        JsonNode response = productServiceClient.calculateRate(productCode, category, termMonths, principal.doubleValue());
        if (!response.hasNonNull("finalRate") || !response.get("finalRate").isNumber()) {
            throw new IllegalStateException("Product service returned no valid rate");
        }
        return response.get("finalRate").decimalValue().setScale(2, RoundingMode.HALF_UP);
    }
}
