package com.bank.calculator.service.impl;

import com.bank.calculator.config.CategoryBonusProperties;
import com.bank.calculator.dto.response.CategoryBenefitDto;
import com.bank.calculator.model.enums.CustomerCategory;
import com.bank.calculator.service.CategoryBonusService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * Applies configurable category bonuses to the base rate.
 *
 * <p>Key invariants:
 * <ul>
 *   <li>Caller-supplied categories are normalised; unknown values are ignored safely.</li>
 *   <li>Combined bonus is capped at {@link CategoryBonusProperties#getMaxTotalBonus()}.</li>
 *   <li>Effective rate is additionally capped at the product's maximum rate.</li>
 *   <li>All arithmetic uses {@link BigDecimal} with {@link RoundingMode#HALF_UP}.</li>
 * </ul>
 */
@Service
public class CategoryBonusServiceImpl implements CategoryBonusService {

    private static final Logger log = LoggerFactory.getLogger(CategoryBonusServiceImpl.class);
    private static final RoundingMode ROUNDING = RoundingMode.HALF_UP;

    private final CategoryBonusProperties properties;

    public CategoryBonusServiceImpl(CategoryBonusProperties properties) {
        this.properties = properties;
    }

    @Override
    public BonusResult computeBonus(List<String> rawCategories,
                                    BigDecimal baseRate,
                                    BigDecimal productMaxRate) {

        BigDecimal maxTotalBonus = properties.getMaxTotalBonus();
        BigDecimal requestedTotal = BigDecimal.ZERO;
        List<CategoryBenefitDto> benefits = new ArrayList<>();

        for (String raw : rawCategories) {
            CustomerCategory category = normalise(raw);
            if (category == null) {
                log.warn("Unknown customer category '{}' — no bonus applied", raw);
                continue;
            }

            BigDecimal configuredBonus = properties.getBonuses().get(category.name());
            if (configuredBonus == null || configuredBonus.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            requestedTotal = requestedTotal.add(configuredBonus);
            benefits.add(new CategoryBenefitDto(
                    category.name(),
                    configuredBonus.setScale(2, ROUNDING),
                    BigDecimal.ZERO // placeholder; adjusted below after cap
            ));
        }

        // Apply combined bonus cap
        BigDecimal appliedTotal = requestedTotal.min(maxTotalBonus).setScale(2, ROUNDING);

        // Distribute the applied total proportionally across categories
        benefits = redistributeApplied(benefits, requestedTotal, appliedTotal);

        // Compute effective rate
        BigDecimal uncappedRate = baseRate.add(appliedTotal).setScale(2, ROUNDING);
        boolean rateCapped = uncappedRate.compareTo(productMaxRate) > 0;
        BigDecimal effectiveRate = rateCapped ? productMaxRate.setScale(2, ROUNDING) : uncappedRate;

        return new BonusResult(
                benefits,
                requestedTotal.setScale(2, ROUNDING),
                appliedTotal,
                maxTotalBonus.setScale(2, ROUNDING),
                effectiveRate,
                rateCapped
        );
    }

    /**
     * After the cap is enforced, redistribute the applied total proportionally
     * across each category benefit so individual appliedBonus values sum to appliedTotal.
     */
    private List<CategoryBenefitDto> redistributeApplied(
            List<CategoryBenefitDto> benefits,
            BigDecimal requestedTotal,
            BigDecimal appliedTotal) {

        if (benefits.isEmpty() || requestedTotal.compareTo(BigDecimal.ZERO) == 0) {
            return benefits;
        }

        List<CategoryBenefitDto> result = new ArrayList<>();
        for (CategoryBenefitDto b : benefits) {
            BigDecimal proportion = b.requestedBonus().divide(requestedTotal, 12, ROUNDING);
            BigDecimal applied = proportion.multiply(appliedTotal).setScale(2, ROUNDING);
            result.add(new CategoryBenefitDto(b.category(), b.requestedBonus(), applied));
        }
        return result;
    }

    private CustomerCategory normalise(String raw) {
        if (raw == null) return null;
        try {
            return CustomerCategory.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
