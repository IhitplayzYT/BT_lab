package com.bank.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO for batch product operations.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatchProductResponse {

    private String correlationId;
    private int totalProducts;
    private int successfulProducts;
    private int failedProducts;
    private List<ProductResponseDTO> results;
    private String status;
    private String message;
}
