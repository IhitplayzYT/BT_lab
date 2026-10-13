package com.bank.calculator.dto.request;

import com.bank.calculator.model.enums.PayoutMode;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request body for {@code POST /api/v1/fd/calculations}.
 *
 * <p><strong>Note:</strong> clients must NOT supply a rate, category, or bonus.
 * Those values are fetched from authoritative internal services.  Any such
 * fields in the request body are ignored.
 */
@Schema(description = "FD maturity calculation request")
public record CalculationRequest(

    @Schema(description = "Principal amount in INR (must be > 0)", example = "100000.00")
    @NotNull(message = "Principal is required")
    @DecimalMin(value = "0.01", message = "Principal must be greater than zero")
    @Digits(integer = 10, fraction = 2, message = "Principal must have at most 2 decimal places")
    BigDecimal principal,

    @Schema(description = "FD term (value + unit)")
    @NotNull(message = "Term is required")
    @Valid
    TermDto term,

    @Schema(description = "Product code identifying the FD product", example = "FD001")
    @NotBlank(message = "Product code is required")
    String productCode,

    @Schema(description = "Payout mode: CUMULATIVE (default) or PERIODIC", example = "CUMULATIVE",
            defaultValue = "CUMULATIVE")
    PayoutMode payoutMode,

    @Schema(description = "FD start date (defaults to current date if omitted)", example = "2026-10-08")
    LocalDate startDate

) {
    /** Backward-compatible constructor for existing callers omitting startDate. */
    public CalculationRequest(BigDecimal principal, TermDto term, String productCode, PayoutMode payoutMode) {
        this(principal, term, productCode, payoutMode, null);
    }

    /** Returns CUMULATIVE if payoutMode is null. */
    public PayoutMode resolvedPayoutMode() {
        return payoutMode != null ? payoutMode : PayoutMode.CUMULATIVE;
    }

    /** Returns provided startDate or defaults to today's date. */
    public LocalDate resolvedStartDate() {
        return startDate != null ? startDate : LocalDate.now();
    }
}
