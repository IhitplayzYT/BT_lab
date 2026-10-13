package com.bank.product.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request DTO for batch product operations.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatchProductRequest {

    @NotEmpty(message = "Products list cannot be empty")
    @Valid
    private List<ProductRequestDTO> products;

    /**
     * Optional correlation ID for tracking the batch job.
     */
    private String correlationId;
}
