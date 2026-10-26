package com.example.fdmodule.service;

import com.example.fdmodule.clock.BusinessClock;
import com.example.fdmodule.client.ProductServiceClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.jdbc.core.JdbcTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;

class ProductValidationServiceTest {

    private ProductValidationService service(LocalDate effectiveFrom) {
        ProductServiceClient client = Mockito.mock(ProductServiceClient.class);
        ObjectMapper mapper = new ObjectMapper();
        
        ObjectNode productJson = mapper.createObjectNode();
        productJson.put("productCode", "FDSTD");
        productJson.put("status", "ACTIVE");
        productJson.put("effectiveDate", effectiveFrom.toString());
        productJson.put("productType", "FD");
        productJson.putObject("termLimit").put("min", 6).put("max", 36);
        productJson.put("minDeposit", "10000");
        
        Mockito.when(client.getProductByCode(anyString())).thenReturn(productJson);
        
        return new ProductValidationService(client);
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
        JdbcTemplate jdbc = Mockito.mock(JdbcTemplate.class);
        service.setClock(new BusinessClock(jdbc, true) {
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
