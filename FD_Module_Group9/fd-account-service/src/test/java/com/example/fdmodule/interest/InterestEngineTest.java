package com.example.fdmodule.interest;
import org.junit.jupiter.api.Test;import java.math.BigDecimal;import static org.assertj.core.api.Assertions.*;
class InterestEngineTest {
 @Test void simpleAnnual(){assertThat(InterestEngine.quote(new BigDecimal("100000"),new BigDecimal("12"),12,"SIMPLE")).isEqualByComparingTo("112000.00");}
 @Test void monthlyAnnual(){assertThat(InterestEngine.quote(new BigDecimal("100000"),new BigDecimal("12"),12,"MONTHLY_COMPOUND")).isEqualByComparingTo("112682.50");}
 @Test void actual365Daily(){assertThat(InterestEngine.daily(new BigDecimal("100000"),new BigDecimal("5"))).isEqualByComparingTo("13.698630");}
 @Test void invalidInputs(){assertThatThrownBy(()->InterestEngine.quote(BigDecimal.ZERO,BigDecimal.ONE,12,"SIMPLE")).isInstanceOf(IllegalArgumentException.class);assertThatThrownBy(()->InterestEngine.quote(BigDecimal.TEN,BigDecimal.ONE,1,"WEEKLY")).isInstanceOf(IllegalArgumentException.class);}
 @Test void zeroRate(){assertThat(InterestEngine.quote(new BigDecimal("10000"),BigDecimal.ZERO,18,"MONTHLY_COMPOUND")).isEqualByComparingTo("10000");}
}
