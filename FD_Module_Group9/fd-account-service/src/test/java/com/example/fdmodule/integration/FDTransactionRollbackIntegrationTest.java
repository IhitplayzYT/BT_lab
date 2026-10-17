package com.example.fdmodule.integration;

import com.example.fdmodule.repository.CustomerProfileRepository;
import com.example.fdmodule.repository.FDTransactionRepository;
import com.example.fdmodule.client.ProductServiceClient;
import com.example.fdmodule.service.FDTransactionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

/**
 * Lab 16 atomicity: if writing the DEPOSIT ledger row fails, the FD account that was already
 * written inside the same transaction must be rolled back. The ledger repository is replaced by a
 * mock that fails on save; everything else (L13 creation, JPA, H2) is real. Uses its own H2
 * database so it cannot interfere with the other integration test context.
 */
@SpringBootTest(properties =
        "spring.datasource.url=jdbc:h2:mem:fdrollback;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1")
@ActiveProfiles("test")
class FDTransactionRollbackIntegrationTest {

    @MockBean private FDTransactionRepository transactionRepository;

    @Autowired private FDTransactionService fdTransactionService;
    @Autowired private JdbcTemplate jdbc;
    @org.springframework.boot.test.mock.mockito.MockBean private ProductServiceClient productRepository;
    @Autowired private CustomerProfileRepository customerRepository;

    @BeforeEach
    void setUp() {
        TestData.reset(jdbc, productRepository, customerRepository);
    }

    @Test
    void ledgerWriteFailure_rollsBackTheFdAccount() {
        AtomicLong accountsVisibleInsideTransaction = new AtomicLong(-1);

        when(transactionRepository.findFirstByFdAccountNoAndTxnTypeOrderByTxnIdAsc(anyString(), anyString()))
                .thenReturn(Optional.empty());
        when(transactionRepository.save(any())).thenAnswer(invocation -> {
            // Same thread, same transaction: proves the fd_accounts row really was written...
            accountsVisibleInsideTransaction.set(
                    jdbc.queryForObject("SELECT COUNT(*) FROM fd_accounts", Long.class));
            throw new IllegalStateException("simulated fd_transactions failure");
        });

        assertThatThrownBy(() ->
                fdTransactionService.createFDAccountWithTransaction(TestData.validRequest(), "officer1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("simulated fd_transactions failure");

        assertThat(accountsVisibleInsideTransaction.get()).isEqualTo(1);
        // ...and is gone after rollback: no partially created financial state.
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM fd_accounts", Long.class)).isZero();
    }
}
