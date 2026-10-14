package com.example.fdmodule.service;

import com.example.fdmodule.clock.BusinessClock;
import com.example.fdmodule.entity.Product;
import com.example.fdmodule.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ProductValidationServiceTest {

    private ProductValidationService service(LocalDate effectiveFrom) {
        Product p = new Product();
        p.setProductCode("FDSTD");
        p.setStatus("ACTIVE");
        p.setEffectiveDate(effectiveFrom);
        p.setMinTermMonths(6);
        p.setMaxTermMonths(36);
        p.setMinDeposit(new BigDecimal("10000"));
        ProductRepository repo = Mockito.mock(ProductRepository.class);
        Mockito.when(repo.findById("FDSTD")).thenReturn(Optional.of(p));
        return new ProductValidationService(repo);
    }

    @Test
    void aProductThatIsNotEffectiveYetIsRejected() {
        var service = service(LocalDate.now().plusYears(2));
        assertThatThrownBy(() -> service.validate("FDSTD", 12, new BigDecimal("50000")))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("not effective yet");
    }

    @Test
    void effectiveDateFollowsTheBusinessClockWhenTimeTravelIsOn() {
        var service = service(LocalDate.now().plusYears(2));
        // The business date is three years ahead, so the product has become effective by then.
        service.setClock(new BusinessClock(null, true) {
            @Override public LocalDate today() { return LocalDate.now().plusYears(3); }
        });
        assertThat(service.validate("FDSTD", 12, new BigDecimal("50000")).getProductCode()).isEqualTo("FDSTD");
    }

    @Test
    void termAndMinimumDepositAreStillChecked() {
        var service = service(LocalDate.now().minusYears(1));
        assertThatThrownBy(() -> service.validate("FDSTD", 3, new BigDecimal("50000"))).hasMessageContaining("Term must be between");
        assertThatThrownBy(() -> service.validate("FDSTD", 12, new BigDecimal("5000"))).hasMessageContaining("Minimum deposit");
    }
}