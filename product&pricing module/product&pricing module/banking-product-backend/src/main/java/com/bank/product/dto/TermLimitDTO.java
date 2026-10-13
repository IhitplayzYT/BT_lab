package com.bank.product.dto;

import jakarta.validation.constraints.NotNull;

public record TermLimitDTO(
        @NotNull(message = "Term limit minimum is mandatory")
        Integer min,
        @NotNull(message = "Term limit maximum is mandatory")
        Integer max
) {
}
