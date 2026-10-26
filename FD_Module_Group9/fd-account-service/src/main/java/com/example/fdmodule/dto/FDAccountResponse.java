package com.example.fdmodule.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record FDAccountResponse(
        String fdAccountNo,
        String customerId,
        String productCode,
        BigDecimal principalAmount,
        BigDecimal interestRate,
        Integer tenureMonths,
        LocalDate maturityDate,
        String status,
        String createdBy,
        String customerCategory,
        String accountHolderRoles,
        String coOwnerName
) {
    public FDAccountResponse(String fdAccountNo, String customerId, String productCode,
                             BigDecimal principalAmount, BigDecimal interestRate, Integer tenureMonths,
                             LocalDate maturityDate, String status, String createdBy) {
        this(fdAccountNo, customerId, productCode, principalAmount, interestRate, tenureMonths,
                maturityDate, status, createdBy, "GENERAL", "OWNER", null);
    }
}
