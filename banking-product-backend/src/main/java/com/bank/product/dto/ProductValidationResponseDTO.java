package com.bank.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductValidationResponseDTO {
    private boolean valid;
    private String productCode;
    private String productName;
    private String status;
    private String message;
    private LocalDate effectiveDate;
    private Integer termMonths;
    private Double amount;
    private Integer age;
    private Integer minTerm;
    private Integer maxTerm;
    private Double minDeposit;
    private Double maxDeposit;
    private Integer minAge;
}
