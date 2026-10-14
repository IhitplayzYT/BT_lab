package com.example.fdmodule.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record FDAccountResponse(
        String fdAccountNo,
        String customerId,
        String productCode,
        BigDecimal principalAmount,
        BigDecimal interestRate,
        Integer termMonths,
        LocalDate maturityDate,
        String status,
        String createdBy
) {}
