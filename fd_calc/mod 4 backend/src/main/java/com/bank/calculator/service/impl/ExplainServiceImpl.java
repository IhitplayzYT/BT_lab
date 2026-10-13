package com.bank.calculator.service.impl;

import com.bank.calculator.dto.response.CalculationResponse;
import com.bank.calculator.dto.response.CategoryBenefitDto;
import com.bank.calculator.model.enums.InterestType;
import com.bank.calculator.model.enums.PayoutMode;
import com.bank.calculator.service.ExplainService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Template-based deterministic explanation generator.
 *
 * <p>All numbers referenced here are taken directly from the
 * pre-computed {@link CalculationResponse}.  This service cannot
 * alter rates, maturity values, or any financial output.
 */
@Service
public class ExplainServiceImpl implements ExplainService {

    @Override
    public String explain(CalculationResponse response) {
        StringBuilder sb = new StringBuilder();

        // Base rate sentence
        sb.append(String.format(
                "The product base rate is %.2f%%.",
                response.baseRate()));

        // Category benefits
        List<CategoryBenefitDto> benefits = response.categoryBenefits();
        boolean benefitApplied = false;
        if (benefits != null && !benefits.isEmpty()) {
            String benefitDesc = benefits.stream()
                    .filter(b -> b.appliedBonus().compareTo(BigDecimal.ZERO) > 0)
                    .map(b -> String.format("a %.2f%% %s benefit",
                            b.appliedBonus(), formatCategory(b.category())))
                    .collect(Collectors.joining(", "));
            if (!benefitDesc.isBlank()) {
                sb.append(String.format(" %s was applied, bringing the effective rate to %.2f%%.",
                        capitalise(benefitDesc), response.effectiveRate()));
                benefitApplied = true;
            }
        }
        if (!benefitApplied) {
            sb.append(String.format(
                    " No category benefits were applied; effective rate is %.2f%%.",
                    response.effectiveRate()));
        }

        // Rate cap notice
        if (response.rateCapped()) {
            sb.append(String.format(
                    " The effective rate was capped at the product maximum of %.2f%%.",
                    response.effectiveRate()));
        }

        // Interest method
        if (response.interestType() == InterestType.COMPOUND) {
            String freqName = response.compoundingFrequency() != null
                    ? response.compoundingFrequency().name() : "MONTHLY";
            sb.append(String.format(
                    " %s compounding was used for %d month(s).",
                    formatFrequency(freqName),
                    response.term().value() *
                        (response.term().unit().name().equals("YEARS") ? 12 : 1)));
        } else {
            sb.append(String.format(
                    " Simple interest was applied for %d %s.",
                    response.term().value(),
                    response.term().unit().name().toLowerCase()));
        }

        // Summary
        String symbol = getCurrencySymbol(response.currency());
        if (response.payoutMode() == PayoutMode.PERIODIC) {
            BigDecimal installment = response.periodicPayoutAmount() != null
                    ? response.periodicPayoutAmount() : BigDecimal.ZERO;
            sb.append(String.format(
                    " On a principal of %s%.2f, periodic interest installment is %s%.2f per period," +
                    " with total interest of %s%.2f and principal maturity of %s%.2f.",
                    symbol, response.principal(), symbol, installment,
                    symbol, response.interestEarned(), symbol, response.maturityAmount()));
        } else {
            sb.append(String.format(
                    " On a principal of %s%.2f, the estimated interest earned is %s%.2f," +
                    " giving a maturity amount of %s%.2f.",
                    symbol, response.principal(), symbol, response.interestEarned(), symbol, response.maturityAmount()));
        }

        return sb.toString();
    }

    private String getCurrencySymbol(String currency) {
        if (currency == null || "INR".equalsIgnoreCase(currency)) return "₹";
        if ("USD".equalsIgnoreCase(currency)) return "$";
        if ("EUR".equalsIgnoreCase(currency)) return "€";
        if ("GBP".equalsIgnoreCase(currency)) return "£";
        return currency + " ";
    }

    private String formatCategory(String category) {
        return category.replace("_", " ").toLowerCase();
    }

    private String formatFrequency(String freq) {
        return freq.charAt(0) + freq.substring(1).toLowerCase().replace("_", "-");
    }

    private String capitalise(String s) {
        if (s == null || s.isBlank()) return s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }
}
