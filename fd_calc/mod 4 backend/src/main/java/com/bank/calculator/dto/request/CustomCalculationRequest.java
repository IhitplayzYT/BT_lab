package com.bank.calculator.dto.request;

import com.bank.calculator.model.enums.CompoundingFrequency;
import com.bank.calculator.model.enums.InterestType;
import com.bank.calculator.model.enums.PayoutMode;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request body for {@code POST /api/v1/fd/calculations/custom}.
 *
 * <p>Allows fully customizable FD calculations with user-defined parameters,
 * bypassing the Product Service. All calculation parameters are provided directly
 * in the request.
 */
@Schema(description = "Custom FD maturity calculation request with user-defined parameters")
public record CustomCalculationRequest(

    @Schema(description = "Principal amount in INR (must be > 0)", example = "100000.00")
    @NotNull(message = "Principal is required")
    @DecimalMin(value = "0.01", message = "Principal must be greater than zero")
    @Digits(integer = 10, fraction = 2, message = "Principal must have at most 2 decimal places")
    BigDecimal principal,

    @Schema(description = "FD term (value + unit)")
    @NotNull(message = "Term is required")
    @Valid
    TermDto term,

    @Schema(description = "Custom interest rate (annual percentage)", example = "7.5")
    @NotNull(message = "Interest rate is required")
    @DecimalMin(value = "0.01", message = "Interest rate must be greater than zero")
    @Digits(integer = 5, fraction = 2, message = "Interest rate must have at most 2 decimal places")
    BigDecimal interestRate,

    @Schema(description = "Interest type: SIMPLE, COMPOUND, or CREDIT", example = "COMPOUND")
    @NotNull(message = "Interest type is required")
    InterestType interestType,

    @Schema(description = "Compounding frequency (for COMPOUND interest)", example = "QUARTERLY")
    CompoundingFrequency compoundingFrequency,

    @Schema(description = "Payout mode: CUMULATIVE (default) or PERIODIC", example = "CUMULATIVE",
            defaultValue = "CUMULATIVE")
    PayoutMode payoutMode,

    @Schema(description = "FD start date (defaults to current date if omitted)", example = "2026-10-14")
    LocalDate startDate

) {
    /** Backward-compatible constructor for existing callers omitting startDate. */
    public CustomCalculationRequest(BigDecimal principal, TermDto term, BigDecimal interestRate,
                                   InterestType interestType, CompoundingFrequency compoundingFrequency,
                                   PayoutMode payoutMode) {
        this(principal, term, interestRate, interestType, compoundingFrequency, payoutMode, null);
    }

    /** Returns CUMULATIVE if payoutMode is null. */
    public PayoutMode resolvedPayoutMode() {
        return payoutMode != null ? payoutMode : PayoutMode.CUMULATIVE;
    }

    /** Returns provided startDate or defaults to today's date. */
    public LocalDate resolvedStartDate() {
        return startDate != null ? startDate : LocalDate.now();
    }

    /** Returns MONTHLY if compoundingFrequency is null (for COMPOUND interest). */
    public CompoundingFrequency resolvedCompoundingFrequency() {
        return compoundingFrequency != null ? compoundingFrequency : CompoundingFrequency.MONTHLY;
    }
}
