package com.example.fdmodule.service;

import com.example.fdmodule.entity.Product;
import com.example.fdmodule.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class ProductValidationService {
    private final ProductRepository productRepository;

    public ProductValidationService(ProductRepository productRepository) {
        this.productRepository = productRepository;
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

    public Product validate(String productCode, int termMonths, BigDecimal principal) {
        Product product = productRepository.findById(productCode)
                .orElseThrow(() -> new IllegalArgumentException("Product does not exist: " + productCode));

        if (!"ACTIVE".equalsIgnoreCase(product.getStatus())) {
            throw new IllegalArgumentException("Product is not active: " + productCode);
        }
        if (product.getEffectiveDate() != null && product.getEffectiveDate().isAfter(today())) {
            throw new IllegalArgumentException("Product is not effective yet: " + productCode);
        }
        if (termMonths < product.getMinTermMonths() || termMonths > product.getMaxTermMonths()) {
            throw new IllegalArgumentException("Term must be between " + product.getMinTermMonths()
                    + " and " + product.getMaxTermMonths() + " months");
        }
        if (principal.compareTo(product.getMinDeposit()) < 0) {
            throw new IllegalArgumentException("Minimum deposit is " + product.getMinDeposit());
        }
        return product;
    }
}
