package com.bank.calculator.service;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;
class ProductBonusTest {
 @Test void productModifiersOverrideGlobalDefaultsAndRespectRateLimit() {
   CategoryBonusService service = new com.bank.calculator.service.impl.CategoryBonusServiceImpl(new com.bank.calculator.config.CategoryBonusProperties());
   var result = service.computeProductBonus(List.of("SENIOR_CITIZEN", "SENIOR_CITIZEN"), new BigDecimal("5.5"), new BigDecimal("6"), Map.of("SENIOR_CITIZEN", new BigDecimal("0.8")));
   assertEquals(new BigDecimal("6.00"), result.effectiveRate());
   assertEquals(new BigDecimal("0.8"), result.requestedTotalBonus());
   assertTrue(result.rateCapped());
 }
}
