package com.bank.product.service;

import com.bank.product.dto.*;

import java.time.LocalDate;
import java.util.List;

public interface ProductService {
    ProductResponseDTO createProduct(ProductRequestDTO dto);
    ProductResponseDTO updateProduct(String productCode, ProductRequestDTO dto);
    ProductResponseDTO retireProduct(String productCode);
    List<ProductResponseDTO> searchProducts(String productType, LocalDate startDate, LocalDate endDate);
    List<ProductResponseDTO> searchProducts(String productType, LocalDate startDate, LocalDate endDate, String status, int page, int size, String sortBy);
    ProductResponseDTO getProductByCode(String productCode);

    // FD Integration APIs (Lab L13)
    ProductValidationResponseDTO validateProduct(String productCode, Integer termMonths, java.math.BigDecimal amount, Integer age);
    RateCalculationResponseDTO calculateFinalRate(String productCode, RateCalculationRequestDTO request);
    List<ProductResponseDTO> getActiveProducts(String productType);
    ProductDefaultsResponseDTO getProductDefaults(String productCode);

    // Internal service-to-service endpoint for FD Calculator
    CalculatorConfigDTO getCalculatorConfig(String productCode);

    // Batch processing endpoint
    BatchProductResponse batchCreateProducts(BatchProductRequest batchRequest);
}
