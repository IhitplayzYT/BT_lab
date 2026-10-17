package com.bank.calculator.service;

import com.bank.calculator.dto.response.CategoryBenefitDto;
import com.bank.calculator.model.enums.CustomerCategory;

import java.math.BigDecimal;
import java.util.List;

/**
 * Applies configurable category bonuses to the product base rate.
 *
 * <p>Bonus rules (configurable via {@code calculator.category-bonus.*}):
 * <ol>
 *   <li>Normalise incoming category strings to {@link CustomerCategory} enum values.</li>
 *   <li>Sum eligible bonuses.</li>
 *   <li>Cap the combined bonus at {@code maxTotalBonus}.</li>
 *   <li>Compute effectiveRate = baseRate + appliedBonus.</li>
 *   <li>Cap effectiveRate at the product's configured maximum rate.</li>
 * </ol>
 */
public interface CategoryBonusService {

    /**
     * Computes the bonus result for a set of category strings.
     *
     * @param rawCategories   category strings from the Customer Service (untrusted labels, normalised here)
     * @param baseRate        product base interest rate
     * @param productMaxRate  product maximum allowed effective rate
     * @return computed bonus result
     */
    BonusResult computeBonus(List<String> rawCategories,
                             BigDecimal baseRate,
                             BigDecimal productMaxRate);

    default BonusResult computeProductBonus(List<String> categories, BigDecimal baseRate, BigDecimal maxRate,
                                             java.util.Map<String, BigDecimal> bonuses) {
        // The product rate endpoint accepts one category; select the greatest eligible modifier.
        String selected = "GENERAL";
        BigDecimal modifier = bonuses.getOrDefault(selected, BigDecimal.ZERO);
        for (String category : new java.util.HashSet<>(categories)) {
            if (category == null) continue;
            String normalized = category.trim().toUpperCase();
            BigDecimal candidate = bonuses.getOrDefault(normalized, BigDecimal.ZERO);
            if (candidate.compareTo(modifier) > 0) { selected = normalized; modifier = candidate; }
        }
        BigDecimal rate = baseRate.add(modifier).max(baseRate).min(maxRate).setScale(2, java.math.RoundingMode.HALF_UP);
        BigDecimal applied = rate.subtract(baseRate);
        return new BonusResult(List.of(new com.bank.calculator.dto.response.CategoryBenefitDto(selected, modifier, applied)),
                modifier, applied, maxRate.subtract(baseRate), rate, applied.compareTo(modifier) != 0);
    }

    /**
     * Value object carrying all bonus computation outputs.
     *
     * @param categoryBenefits     per-category breakdown for the response
     * @param requestedTotalBonus  sum of all eligible bonuses before the cap
     * @param appliedTotalBonus    bonus actually applied after the cap
     * @param bonusCap             configured maximum combined bonus
     * @param effectiveRate        final rate = baseRate + appliedTotalBonus, capped at productMaxRate
     * @param rateCapped           true if effectiveRate was capped at productMaxRate
     */
    record BonusResult(
        List<CategoryBenefitDto> categoryBenefits,
        BigDecimal requestedTotalBonus,
        BigDecimal appliedTotalBonus,
        BigDecimal bonusCap,
        BigDecimal effectiveRate,
        boolean rateCapped
    ) {}
}
