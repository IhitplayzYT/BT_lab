package com.example.fdmodule.service;

import com.example.fdmodule.entity.CustomerProfile;
import com.example.fdmodule.entity.Product;
import com.example.fdmodule.repository.CustomerProfileRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class RateService {
    private final CustomerProfileRepository customerRepository;
    private final ProductValidationService productValidationService;

    public RateService(CustomerProfileRepository customerRepository,
                       ProductValidationService productValidationService) {
        this.customerRepository = customerRepository;
        this.productValidationService = productValidationService;
    }

    public BigDecimal determineFinalRate(String productCode, String customerId, int termMonths,
                                         java.math.BigDecimal principal) {
        Product product = productValidationService.validate(productCode, termMonths, principal);

        // L13 needs a final rate. For this standalone L12/L13 project we use the product's
        // minimum configured rate as the base rate. If the customer is SENIOR, an example
        // +1.00% add-on is applied but capped by rate_cap_addon and product max_rate.
        BigDecimal rate = product.getMinRate();
        CustomerProfile customer = customerRepository.findById(customerId).orElse(null);
        BigDecimal addon = BigDecimal.ZERO;
        if (customer != null && customer.getCategory() != null
                && customer.getCategory().toUpperCase().contains("SENIOR")) {
            addon = new BigDecimal("1.00");
        }

        if (product.getRateCapAddon() != null) {
            addon = addon.min(product.getRateCapAddon());
        }
        rate = rate.add(addon);
        if (product.getMaxRate() != null) {
            rate = rate.min(product.getMaxRate());
        }
        return rate.setScale(2, RoundingMode.HALF_UP);
    }
}
