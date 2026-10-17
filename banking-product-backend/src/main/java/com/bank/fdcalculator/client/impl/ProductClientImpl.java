package com.bank.fdcalculator.client.impl;

import com.bank.fdcalculator.client.ProductClient;
import com.bank.product.dto.ProductResponseDTO;
import com.bank.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProductClientImpl implements ProductClient {

    private final ProductService productService;

    @Override
    public ProductResponseDTO getProduct(String productCode) {
        log.info("Fetching product configurations directly from ProductService for code: {}", productCode);
        
        // TODO: In a decoupled, multi-instance microservice environment, you would swap this implementation with:
        // return restTemplate.getForObject("http://localhost:8080/api/product/" + productCode, ProductResponseDTO.class);
        
        return productService.getProductByCode(productCode);
    }
}
