package com.bank.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDefaultsResponseDTO {
    private String productCode;
    private String productName;
    private String productType;
    private String currency;
    private Integer defaultTermMonths;
    private Integer minTermMonths;
    private Integer maxTermMonths;
    private java.math.BigDecimal defaultAmount;
    private java.math.BigDecimal minDeposit;
    private java.math.BigDecimal maxDeposit;
    private java.math.BigDecimal defaultRate;
    private java.math.BigDecimal minRate;
    private java.math.BigDecimal maxRate;
    private String interestType;
    private ChargesDTO charges;
    private List<String> allowedRoles;
    private List<RateVariationDTO> rateVariations;
}
