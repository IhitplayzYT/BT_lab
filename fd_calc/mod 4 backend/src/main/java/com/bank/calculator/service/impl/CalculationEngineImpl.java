package com.bank.calculator.service.impl;

import com.bank.calculator.model.enums.CompoundingFrequency;
import com.bank.calculator.service.CalculationEngine;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;

/**
 * Deterministic BigDecimal implementation of the FD calculation engine.
 *
 * <h2>Precision rules</h2>
 * <ul>
 *   <li>Intermediate scale: 12 decimal places.</li>
 *   <li>Rounding mode: {@link RoundingMode#HALF_UP} throughout.</li>
 *   <li>Returned monetary amounts: scale 2; percentage values: scale 2.</li>
 *   <li>Compound exponentiation uses {@link #bigDecimalPow} — a pure BigDecimal
 *       implementation that avoids {@code double} / {@code Math.pow} entirely,
 *       satisfying the spec §2 / §8 "Never use double" rule.</li>
 * </ul>
 *
 * <h2>Formulas (spec §8)</h2>
 * <pre>
 * Simple:   interest = P × r × t / 100
 *           maturity = P + interest
 *
 * Compound: maturity = P × (1 + r / (100 × n))^(n × t)
 *           interest = maturity − P
 * </pre>
 */
@Service
public class CalculationEngineImpl implements CalculationEngine {

    private static final int INTERMEDIATE_SCALE = 12;
    private static final RoundingMode ROUNDING = RoundingMode.HALF_UP;
    private static final MathContext MC = new MathContext(20, ROUNDING);
    private static final BigDecimal HUNDRED = new BigDecimal("100");

    @Override
    public CalculationResult calculateSimple(BigDecimal principal,
                                             BigDecimal annualRate,
                                             BigDecimal termYears) {
        // interest = P × r × t / 100
        BigDecimal interest = principal
                .multiply(annualRate, MC)
                .multiply(termYears, MC)
                .divide(HUNDRED, INTERMEDIATE_SCALE, ROUNDING);

        BigDecimal maturity = principal.add(interest);

        return new CalculationResult(
                interest.setScale(2, ROUNDING),
                maturity.setScale(2, ROUNDING)
        );
    }

    @Override
    public CalculationResult calculateCompound(BigDecimal principal,
                                               BigDecimal annualRate,
                                               BigDecimal termYears,
                                               CompoundingFrequency frequency) {
        int n = frequency.getPeriodsPerYear();
        BigDecimal bigN = BigDecimal.valueOf(n);

        // ratePerPeriod = r / (100 × n)
        BigDecimal ratePerPeriod = annualRate
                .divide(HUNDRED.multiply(bigN, MC), INTERMEDIATE_SCALE, ROUNDING);

        // base = 1 + ratePerPeriod
        BigDecimal base = BigDecimal.ONE.add(ratePerPeriod);

        // exponent = n × t  (can be fractional for non-whole-year terms)
        BigDecimal exponent = bigN.multiply(termYears, MC);

        // maturity = P × base^exponent  — pure BigDecimal, no double or float
        BigDecimal powered = bigDecimalPow(base, exponent);
        BigDecimal maturity = principal.multiply(powered, MC)
                .setScale(INTERMEDIATE_SCALE, ROUNDING);
        BigDecimal interest = maturity.subtract(principal);

        return new CalculationResult(
                interest.setScale(2, ROUNDING),
                maturity.setScale(2, ROUNDING)
        );
    }

    @Override
    public CalculationResult calculatePeriodic(BigDecimal principal,
                                               BigDecimal annualRate,
                                               BigDecimal termYears,
                                               CompoundingFrequency frequency) {
        int n = frequency != null ? frequency.getPeriodsPerYear() : 12;
        BigDecimal bigN = BigDecimal.valueOf(n);

        // installment = P × r / (100 × n)
        BigDecimal installment = principal
                .multiply(annualRate, MC)
                .divide(HUNDRED.multiply(bigN, MC), INTERMEDIATE_SCALE, ROUNDING);

        // totalPayouts = n × t
        BigDecimal totalPayouts = bigN.multiply(termYears, MC);

        // totalInterest = installment × totalPayouts
        BigDecimal totalInterest = installment.multiply(totalPayouts, MC)
                .setScale(INTERMEDIATE_SCALE, ROUNDING);

        // In periodic payout mode, interest is disbursed each period; principal P is returned at maturity
        return new CalculationResult(
                totalInterest.setScale(2, ROUNDING),
                principal.setScale(2, ROUNDING),
                installment.setScale(2, ROUNDING)
        );
    }

    @Override
    public BigDecimal calculateApy(BigDecimal annualRate, CompoundingFrequency frequency) {
        if (annualRate == null || annualRate.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO.setScale(2, ROUNDING);
        }

        int n = frequency != null ? frequency.getPeriodsPerYear() : 1;
        if (n <= 1) {
            return annualRate.setScale(2, ROUNDING);
        }

        BigDecimal bigN = BigDecimal.valueOf(n);

        // ratePerPeriod = r / (100 × n)
        BigDecimal ratePerPeriod = annualRate
                .divide(HUNDRED.multiply(bigN, MC), INTERMEDIATE_SCALE, ROUNDING);

        // base = 1 + ratePerPeriod
        BigDecimal base = BigDecimal.ONE.add(ratePerPeriod);

        // powered = base ^ n
        BigDecimal powered = base.pow(n, MC);

        // apy = (powered - 1) × 100
        BigDecimal apy = powered.subtract(BigDecimal.ONE).multiply(HUNDRED, MC);

        return apy.setScale(2, ROUNDING);
    }

    // ── Pure BigDecimal exponentiation ──────────────────────────────────────

    /**
     * Computes {@code base^exponent} using only {@link BigDecimal} arithmetic.
     *
     * <p>For integer exponents {@link BigDecimal#pow(int, MathContext)} is used
     * (fast, exact). For fractional exponents the identity
     * {@code x^y = exp(y * ln(x))} is applied, with both {@code exp} and
     * {@code ln} computed via Taylor series converging to 20 significant digits.
     *
     * @param base     positive base (e.g. 1.0054 for MONTHLY at 6.5%)
     * @param exponent possibly fractional (e.g. 12.0 or 6.5)
     * @return {@code base^exponent} with intermediate precision
     */
    private BigDecimal bigDecimalPow(BigDecimal base, BigDecimal exponent) {
        // Fast path: integer exponent
        if (exponent.stripTrailingZeros().scale() <= 0) {
            return base.pow(exponent.intValueExact(), MC);
        }
        // Fractional path: exp(exponent * ln(base))
        BigDecimal lnBase   = bigDecimalLn(base);
        BigDecimal product  = exponent.multiply(lnBase, MC);
        return bigDecimalExp(product);
    }

    /**
     * Natural logarithm via the identity
     * {@code ln(x) = 2 * arctanh((x-1)/(x+1))} where
     * {@code arctanh(y) = y + y^3/3 + y^5/5 + ...}
     *
     * <p>Converges rapidly when {@code x} is close to 1, which is always true
     * for compound-interest bases (e.g. 1.0054).
     */
    private BigDecimal bigDecimalLn(BigDecimal x) {
        final int workScale = INTERMEDIATE_SCALE + 4;
        BigDecimal y = x.subtract(BigDecimal.ONE)
                .divide(x.add(BigDecimal.ONE), workScale, ROUNDING);

        BigDecimal y2     = y.multiply(y, MC);
        BigDecimal result = y;
        BigDecimal term   = y;

        for (int k = 3; k <= 199; k += 2) {
            term   = term.multiply(y2, MC);
            BigDecimal step = term.divide(BigDecimal.valueOf(k), workScale, ROUNDING);
            result = result.add(step);
            if (step.abs().compareTo(BigDecimal.ONE.scaleByPowerOfTen(-workScale)) < 0) {
                break;
            }
        }
        return result.multiply(BigDecimal.valueOf(2), MC).setScale(INTERMEDIATE_SCALE, ROUNDING);
    }

    /**
     * {@code e^x} via Taylor series: {@code 1 + x + x^2/2! + x^3/3! + ...}
     */
    private BigDecimal bigDecimalExp(BigDecimal x) {
        final int workScale = INTERMEDIATE_SCALE + 4;
        BigDecimal result = BigDecimal.ONE;
        BigDecimal term   = BigDecimal.ONE;

        for (int k = 1; k <= 200; k++) {
            term   = term.multiply(x, MC).divide(BigDecimal.valueOf(k), workScale, ROUNDING);
            result = result.add(term);
            if (term.abs().compareTo(BigDecimal.ONE.scaleByPowerOfTen(-workScale)) < 0) {
                break;
            }
        }
        return result.setScale(INTERMEDIATE_SCALE, ROUNDING);
    }
}
