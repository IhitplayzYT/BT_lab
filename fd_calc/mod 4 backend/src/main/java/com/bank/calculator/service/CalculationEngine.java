package com.bank.calculator.service;

import com.bank.calculator.model.enums.CompoundingFrequency;

import java.math.BigDecimal;

/**
 * Pure financial calculation engine.
 *
 * <p>This interface contains no I/O, no Spring context, no external calls.
 * Implementations must:
 * <ul>
 *   <li>Use {@link BigDecimal} for all arithmetic.</li>
 *   <li>Use scale ≥ 12 for intermediate values.</li>
 *   <li>Round using {@link java.math.RoundingMode#HALF_UP}.</li>
 *   <li>Return monetary amounts at scale 2.</li>
 * </ul>
 */
public interface CalculationEngine {

    /**
     * Simple interest calculation.
     *
     * <pre>
     *   interest       = P × r × t / 100
     *   maturityAmount = P + interest
     * </pre>
     *
     * @param principal  principal amount P (must be &gt; 0)
     * @param annualRate annual rate r as a percentage (e.g. 7.50 for 7.50%)
     * @param termYears  term t in years (e.g. 1.0 for 12 months)
     * @return result with interestEarned and maturityAmount at scale 2
     */
    CalculationResult calculateSimple(BigDecimal principal,
                                      BigDecimal annualRate,
                                      BigDecimal termYears);

    /**
     * Compound interest calculation.
     *
     * <pre>
     *   maturityAmount = P × (1 + r / (100 × n)) ^ (n × t)
     *   interestEarned = maturityAmount − P
     * </pre>
     *
     * @param principal   principal amount P (must be &gt; 0)
     * @param annualRate  annual rate r as a percentage
     * @param termYears   term t in years
     * @param frequency   compounding frequency (n = periodsPerYear)
     * @return result with interestEarned and maturityAmount at scale 2
     */
    CalculationResult calculateCompound(BigDecimal principal,
                                        BigDecimal annualRate,
                                        BigDecimal termYears,
                                        CompoundingFrequency frequency);

    /**
     * Periodic interest payout calculation.
     *
     * <pre>
     *   installment    = P × r / (100 × n)
     *   totalInterest  = installment × (n × t)
     *   maturityAmount = P
     * </pre>
     *
     * @param principal   principal amount P (must be &gt; 0)
     * @param annualRate  annual rate r as a percentage
     * @param termYears   term t in years
     * @param frequency   payout frequency (n = periodsPerYear)
     * @return result with interestEarned, maturityAmount (=P), and periodicPayoutAmount
     */
    CalculationResult calculatePeriodic(BigDecimal principal,
                                         BigDecimal annualRate,
                                         BigDecimal termYears,
                                         CompoundingFrequency frequency);

    /**
     * Annual Percentage Yield (APY) calculation.
     *
     * <pre>
     *   APY = ((1 + r / (100 × n)) ^ n − 1) × 100
     * </pre>
     *
     * @param annualRate annual effective rate r as a percentage
     * @param frequency  compounding frequency (n = periodsPerYear)
     * @return APY percentage at scale 2
     */
    BigDecimal calculateApy(BigDecimal annualRate, CompoundingFrequency frequency);

    /**
     * Immutable value object returned by calculation methods.
     */
    record CalculationResult(BigDecimal interestEarned, BigDecimal maturityAmount, BigDecimal periodicPayoutAmount) {
        public CalculationResult(BigDecimal interestEarned, BigDecimal maturityAmount) {
            this(interestEarned, maturityAmount, null);
        }
    }
}
