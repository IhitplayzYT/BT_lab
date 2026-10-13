package com.bank.calculator.model.enums;

/**
 * How often interest is compounded per year.
 * The {@code periodsPerYear} value is used directly in the compound-interest formula:
 * <pre>
 *   maturityAmount = P × (1 + r / (100 × n)) ^ (n × t)
 * </pre>
 * where n = periodsPerYear.
 */
public enum CompoundingFrequency {

    MONTHLY(12),
    QUARTERLY(4),
    HALF_YEARLY(2),
    YEARLY(1);

    private final int periodsPerYear;

    CompoundingFrequency(int periodsPerYear) {
        this.periodsPerYear = periodsPerYear;
    }

    public int getPeriodsPerYear() {
        return periodsPerYear;
    }
}
