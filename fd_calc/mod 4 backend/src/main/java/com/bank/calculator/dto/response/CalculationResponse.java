package com.bank.calculator.dto.response;

import com.bank.calculator.dto.request.TermDto;
import com.bank.calculator.model.enums.CompoundingFrequency;
import com.bank.calculator.model.enums.InterestType;
import com.bank.calculator.model.enums.PayoutMode;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * Full response for a maturity estimate calculation.
 * All monetary amounts are at scale 2 (INR); percentage values at scale 2.
 */
@Schema(description = "FD maturity estimate response")
public record CalculationResponse(

    @Schema(description = "Unique calculation identifier", example = "CALC-20260911-0001")
    String calculationId,

    @Schema(description = "Persistent unique audit record identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000")
    String uuid,

    @Schema(description = "FD product code", example = "FD001")
    String productCode,

    @Schema(description = "FD product display name", example = "Fixed Deposit - Short Term")
    String productName,

    @Schema(description = "Principal amount in INR", example = "100000.00")
    BigDecimal principal,

    @Schema(description = "Term as submitted in the request")
    TermDto term,

    @Schema(description = "Payout mode used", example = "CUMULATIVE")
    PayoutMode payoutMode,

    @Schema(description = "Start date used for calculation", example = "2026-09-11")
    LocalDate startDate,

    @Schema(description = "Estimated maturity date", example = "2027-09-11")
    LocalDate estimatedMaturityDate,

    @Schema(description = "Interest calculation method", example = "COMPOUND")
    InterestType interestType,

    @Schema(description = "Compounding frequency (applicable for COMPOUND)", example = "MONTHLY")
    CompoundingFrequency compoundingFrequency,

    @Schema(description = "Product base rate (%)", example = "6.50")
    BigDecimal baseRate,

    @Schema(description = "Category benefits applied")
    List<CategoryBenefitDto> categoryBenefits,

    @Schema(description = "Sum of all requested category bonuses (%)", example = "1.00")
    BigDecimal requestedTotalBonus,

    @Schema(description = "Total bonus actually applied after cap enforcement (%)", example = "1.00")
    BigDecimal appliedTotalBonus,

    @Schema(description = "Maximum combined bonus allowed (%)", example = "2.00")
    BigDecimal bonusCap,

    @Schema(description = "Effective rate used in calculation (%)", example = "7.50")
    BigDecimal effectiveRate,

    @Schema(description = "Annual Percentage Yield (%)", example = "7.76")
    BigDecimal apy,

    @Schema(description = "True if the effective rate was capped at product maximum", example = "false")
    boolean rateCapped,

    @Schema(description = "Estimated total interest earned (INR)", example = "7778.00")
    BigDecimal interestEarned,

    @Schema(description = "Estimated maturity amount (INR)", example = "107778.00")
    BigDecimal maturityAmount,

    @Schema(description = "Periodic payout installment amount (INR) if payoutMode is PERIODIC", example = "625.00")
    BigDecimal periodicPayoutAmount,

    @Schema(description = "Currency code", example = "INR")
    String currency,

    @Schema(description = "Human-readable explanation of the calculation")
    String calculationExplanation,

    @Schema(description = "Timestamp when this estimate was generated", example = "2026-09-11T12:00:00Z")
    Instant generatedAt

) {
    /** Backward-compatible constructor for existing callers and test suites. */
    public CalculationResponse(
            String calculationId, String productCode, String productName,
            BigDecimal principal, TermDto term, PayoutMode payoutMode,
            LocalDate estimatedMaturityDate, InterestType interestType,
            CompoundingFrequency compoundingFrequency, BigDecimal baseRate,
            List<CategoryBenefitDto> categoryBenefits, BigDecimal requestedTotalBonus,
            BigDecimal appliedTotalBonus, BigDecimal bonusCap, BigDecimal effectiveRate,
            boolean rateCapped, BigDecimal interestEarned, BigDecimal maturityAmount,
            String currency, String calculationExplanation, Instant generatedAt) {
        this(calculationId, null, productCode, productName, principal, term, payoutMode,
             null, estimatedMaturityDate, interestType, compoundingFrequency, baseRate,
             categoryBenefits, requestedTotalBonus, appliedTotalBonus, bonusCap, effectiveRate,
             null, rateCapped, interestEarned, maturityAmount, null, currency,
             calculationExplanation, generatedAt);
    }
}
