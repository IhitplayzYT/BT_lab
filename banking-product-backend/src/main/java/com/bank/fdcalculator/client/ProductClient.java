package com.bank.fdcalculator.client;

import com.bank.product.dto.ProductResponseDTO;

public interface ProductClient {
    ProductResponseDTO getProduct(String productCode);
}
