package com.bank.product.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RateVariationDTO {
    @NotBlank(message = "Customer category is mandatory")
    @Size(max = 50, message = "Customer category must be at most 50 characters")
    private String customerCategory;
    @NotNull(message = "Rate modifier is mandatory")
    @DecimalMin(value = "-999.99", message = "Rate modifier must be at least -999.99")
    @DecimalMax(value = "999.99", message = "Rate modifier must be at most 999.99")
    private java.math.BigDecimal rateModifier;
}
