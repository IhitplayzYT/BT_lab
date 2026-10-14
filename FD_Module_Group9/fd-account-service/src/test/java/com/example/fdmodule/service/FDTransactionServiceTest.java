package com.example.fdmodule.service;

import com.example.fdmodule.dto.FDAccountCreationResponse;
import com.example.fdmodule.dto.FDAccountRequest;
import com.example.fdmodule.dto.FDAccountResponse;
import com.example.fdmodule.dto.FDTransactionResponse;
import com.example.fdmodule.entity.FDTransaction;
import com.example.fdmodule.entity.FixedDepositAccount;
import com.example.fdmodule.repository.FDTransactionRepository;
import com.example.fdmodule.repository.FixedDepositAccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** Lab 16 unit tests for FDTransactionService (no Spring context, no database). */
@ExtendWith(MockitoExtension.class)
class FDTransactionServiceTest {

    private static final String ACCOUNT_NO = "BR0010000015";

    @Mock private FDAccountService fdAccountService;
    @Mock private FixedDepositAccountRepository fdRepository;
    @Mock private FDTransactionRepository transactionRepository;

    private FDTransactionService service;
    private FixedDepositAccount fd;

    @BeforeEach
    void setUp() {
        service = new FDTransactionService(fdAccountService, fdRepository, transactionRepository);
        fd = new FixedDepositAccount();
        fd.setFdAccountNo(ACCOUNT_NO);
        fd.setCustomerId("CUST001");
        fd.setProductCode("FDSTD");
        fd.setCurrency("INR");
        fd.setPrincipalAmount(new BigDecimal("200000.00"));
    }

    @Test
    void recordInitialDeposit_writesDepositWithBothGlLegsForThePrincipal() {
        when(transactionRepository.findFirstByFdAccountNoAndTxnTypeOrderByTxnIdAsc(ACCOUNT_NO, "DEPOSIT"))
                .thenReturn(Optional.empty());
        when(transactionRepository.save(any(FDTransaction.class))).thenAnswer(i -> i.getArgument(0));

        service.recordInitialDeposit(fd, "officer1");

        ArgumentCaptor<FDTransaction> saved = ArgumentCaptor.forClass(FDTransaction.class);
        verify(transactionRepository).save(saved.capture());
        FDTransaction t = saved.getValue();
        assertThat(t.getFdAccountNo()).isEqualTo(ACCOUNT_NO);
        assertThat(t.getTxnType()).isEqualTo(FDTransaction.TYPE_DEPOSIT);
        assertThat(t.getAmount()).isEqualByComparingTo("200000.00");
        assertThat(t.getCurrency()).isEqualTo("INR");
        assertThat(t.getDebitGlAccount()).isEqualTo(GLAccounts.ASSET_CUSTOMER_REMITTANCE);
        assertThat(t.getCreditGlAccount()).isEqualTo(GLAccounts.LIABILITY_FD_DEPOSITS);
        assertThat(t.getStatus()).isEqualTo(FDTransaction.STATUS_POSTED);
        assertThat(t.getRemarks()).isEqualTo("Initial Deposit");
        assertThat(t.getCreatedBy()).isEqualTo("officer1");
    }

    @Test
    void recordInitialDeposit_existingDeposit_isReturnedAndNothingIsWritten() {
        FDTransaction existing = new FDTransaction(ACCOUNT_NO, "DEPOSIT", new BigDecimal("200000.00"), "INR",
                GLAccounts.ASSET_CUSTOMER_REMITTANCE, GLAccounts.LIABILITY_FD_DEPOSITS, "Initial Deposit", "officer1");
        when(transactionRepository.findFirstByFdAccountNoAndTxnTypeOrderByTxnIdAsc(ACCOUNT_NO, "DEPOSIT"))
                .thenReturn(Optional.of(existing));

        assertThat(service.recordInitialDeposit(fd, "officer1")).isSameAs(existing);
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void createFDAccountWithTransaction_usesL13CreationThenLogsDepositAndReturnsIds() {
        FDAccountRequest request = new FDAccountRequest();
        FDAccountResponse l13Response = new FDAccountResponse(ACCOUNT_NO, "CUST001", "FDSTD",
                new BigDecimal("200000.00"), new BigDecimal("6.50"), 12, LocalDate.now().plusMonths(12),
                "ACTIVE", "officer1");
        when(fdAccountService.create(request, "officer1")).thenReturn(l13Response);
        when(fdRepository.findById(ACCOUNT_NO)).thenReturn(Optional.of(fd));
        when(transactionRepository.findFirstByFdAccountNoAndTxnTypeOrderByTxnIdAsc(ACCOUNT_NO, "DEPOSIT"))
                .thenReturn(Optional.empty());
        when(transactionRepository.save(any(FDTransaction.class))).thenAnswer(i -> {
            FDTransaction t = i.getArgument(0);
            ReflectionTestUtils.setField(t, "txnId", 2001L);   // simulates the AUTO_INCREMENT id
            return t;
        });

        FDAccountCreationResponse response = service.createFDAccountWithTransaction(request, "officer1");

        assertThat(response.fdAccountNo()).isEqualTo(ACCOUNT_NO);
        assertThat(response.initialTransactionId()).isEqualTo(2001L);
        assertThat(response.message()).isEqualTo("Account and initial deposit created.");
        assertThat(response.transactionHistoryUrl()).isEqualTo("/api/fd/account/" + ACCOUNT_NO + "/transactions");

        // Account is created and flushed before the ledger row is written (FK order).
        InOrder order = inOrder(fdAccountService, fdRepository, transactionRepository);
        order.verify(fdAccountService).create(request, "officer1");
        order.verify(fdRepository).flush();
        order.verify(transactionRepository).save(any(FDTransaction.class));
    }

    @Test
    void createFDAccountWithTransaction_l13ValidationFailure_writesNoTransaction() {
        FDAccountRequest request = new FDAccountRequest();
        when(fdAccountService.create(request, "officer1"))
                .thenThrow(new IllegalArgumentException("Minimum deposit is 10000.00"));

        assertThatThrownBy(() -> service.createFDAccountWithTransaction(request, "officer1"))
                .isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(transactionRepository);
    }

    @Test
    void getTransactions_unknownAccount_throws() {
        when(fdRepository.existsById("NOPE")).thenReturn(false);

        assertThatThrownBy(() -> service.getTransactions("NOPE"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("FD account not found: NOPE");
    }

    @Test
    void getTransactions_mapsLedgerRowsToResponses() {
        FDTransaction deposit = new FDTransaction(ACCOUNT_NO, "DEPOSIT", new BigDecimal("200000.00"), "INR",
                GLAccounts.ASSET_CUSTOMER_REMITTANCE, GLAccounts.LIABILITY_FD_DEPOSITS, "Initial Deposit", "officer1");
        when(fdRepository.existsById(ACCOUNT_NO)).thenReturn(true);
        when(transactionRepository.findByFdAccountNoOrderByTxnTimestampAscTxnIdAsc(ACCOUNT_NO))
                .thenReturn(List.of(deposit));

        List<FDTransactionResponse> history = service.getTransactions(ACCOUNT_NO);

        assertThat(history).hasSize(1);
        assertThat(history.get(0).txnType()).isEqualTo("DEPOSIT");
        assertThat(history.get(0).debitGlAccount()).isEqualTo(GLAccounts.ASSET_CUSTOMER_REMITTANCE);
        assertThat(history.get(0).creditGlAccount()).isEqualTo(GLAccounts.LIABILITY_FD_DEPOSITS);
    }
}
