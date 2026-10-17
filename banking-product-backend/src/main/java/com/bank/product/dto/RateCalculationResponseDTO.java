package com.bank.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RateCalculationResponseDTO {
    private String productCode;
    private String productName;
    private Integer termMonths;
    private String customerCategory;
    private Double baseRate;
    private Double rateModifier;
    private Double finalRate;
    private Double minRateLimit;
    private Double maxRateLimit;
}
