package com.example.fdmodule.integration;

import com.example.fdmodule.dto.FDAccountCreationResponse;
import com.example.fdmodule.entity.FDTransaction;
import com.example.fdmodule.entity.FixedDepositAccount;
import com.example.fdmodule.repository.CustomerProfileRepository;
import com.example.fdmodule.repository.FDTransactionRepository;
import com.example.fdmodule.repository.FixedDepositAccountRepository;
import com.example.fdmodule.client.ProductServiceClient;
import com.example.fdmodule.client.AuthServiceClient;
import com.example.fdmodule.service.FDTransactionService;
import com.example.fdmodule.service.GLAccounts;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.IllegalTransactionStateException;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static com.example.fdmodule.test.JwtTestSupport.jwtAuth;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Lab 16 end-to-end tests against the real Spring context, real security configuration and an
 * in-memory H2 database (profile "test").
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class FDTransactionApiIntegrationTest {

    private static final String CREATE_WITH_TXN = "/api/fd/account/create-with-txn";

    @Autowired private MockMvc mvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private JdbcTemplate jdbc;
    @org.springframework.boot.test.mock.mockito.MockBean private ProductServiceClient productRepository;
    @org.springframework.boot.test.mock.mockito.MockBean private AuthServiceClient authServiceClient;
    @Autowired private CustomerProfileRepository customerRepository;
    @Autowired private FixedDepositAccountRepository fdRepository;
    @Autowired private FDTransactionRepository transactionRepository;
    @Autowired private FDTransactionService fdTransactionService;
    @Autowired private PlatformTransactionManager transactionManager;

    @BeforeEach
    void setUp() {
        TestData.reset(jdbc, productRepository, customerRepository);
        Long userId = jdbc.queryForObject("SELECT id FROM users WHERE username='customer1'", Long.class);
        org.mockito.Mockito.when(authServiceClient.getUserIdByUsername("customer1")).thenReturn(userId);
    }

    // ---- Deliverables 2, 3 and 4: creation + DEPOSIT + GL + response -------------------------

    @Test
    void createWithTxn_createsAccountAndExactlyOneBalancedDeposit() throws Exception {
        JsonNode body = createAs("officer1", "officer123");
        String fdAccountNo = body.get("fdAccountNo").asText();
        long initialTransactionId = body.get("initialTransactionId").asLong();

        assertThat(fdRepository.existsById(fdAccountNo)).isTrue();

        List<FDTransaction> rows = transactionRepository.findByFdAccountNoOrderByTxnTimestampAscTxnIdAsc(fdAccountNo);
        assertThat(rows).hasSize(1);
        FDTransaction deposit = rows.get(0);

        assertThat(deposit.getTxnId()).isEqualTo(initialTransactionId);
        assertThat(deposit.getFdAccountNo()).isEqualTo(fdAccountNo);
        assertThat(deposit.getTxnType()).isEqualTo("DEPOSIT");
        assertThat(deposit.getAmount()).isEqualByComparingTo("200000.00");
        assertThat(deposit.getCurrency()).isEqualTo("INR");
        assertThat(deposit.getDebitGlAccount()).isEqualTo(GLAccounts.ASSET_CUSTOMER_REMITTANCE);
        assertThat(deposit.getCreditGlAccount()).isEqualTo(GLAccounts.LIABILITY_FD_DEPOSITS);
        assertThat(deposit.getStatus()).isEqualTo("POSTED");
        assertThat(deposit.getRemarks()).isEqualTo("Initial Deposit");
        assertThat(deposit.getCreatedBy()).isEqualTo("officer1");
        assertThat(deposit.getUuid()).isNotBlank();
        assertThat(deposit.getTxnTimestamp()).isNotNull();
        assertThat(deposit.getCreatedAt()).isNotNull();

        // Deposit amount equals the FD principal actually stored on the account.
        FixedDepositAccount fd = fdRepository.findById(fdAccountNo).orElseThrow();
        assertThat(deposit.getAmount()).isEqualByComparingTo(fd.getPrincipalAmount());
    }

    @Test
    void createWithTxn_responseMatchesLabManualContractPlusHistoryLink() throws Exception {
        JsonNode body = createAs("officer1", "officer123");
        String fdAccountNo = body.get("fdAccountNo").asText();

        assertThat(fdAccountNo).startsWith("BR001");
        assertThat(body.get("initialTransactionId").isNumber()).isTrue();
        assertThat(body.get("message").asText()).isEqualTo("Account and initial deposit created.");
        assertThat(body.get("transactionHistoryUrl").asText())
                .isEqualTo("/api/fd/account/" + fdAccountNo + "/transactions");
    }

    @Test
    void historyLink_returnsTheInitialDeposit() throws Exception {
        JsonNode created = createAs("officer1", "officer123");
        String historyUrl = created.get("transactionHistoryUrl").asText();
        long txnId = created.get("initialTransactionId").asLong();

        mvc.perform(get(historyUrl).with(jwtAuth("officer1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].txnId").value(txnId))
                .andExpect(jsonPath("$[0].txnType").value("DEPOSIT"))
                .andExpect(jsonPath("$[0].amount").value(200000.00))
                .andExpect(jsonPath("$[0].debitGlAccount").value(GLAccounts.ASSET_CUSTOMER_REMITTANCE))
                .andExpect(jsonPath("$[0].creditGlAccount").value(GLAccounts.LIABILITY_FD_DEPOSITS))
                .andExpect(jsonPath("$[0].status").value("POSTED"));
    }

    @Test
    void history_isScopedToTheRequestedAccount() throws Exception {
        String first = createAs("officer1", "officer123").get("fdAccountNo").asText();
        String second = createAs("officer1", "officer123").get("fdAccountNo").asText();
        assertThat(first).isNotEqualTo(second);

        mvc.perform(get("/api/fd/account/" + first + "/transactions").with(jwtAuth("officer1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].fdAccountNo").value(first));
    }

    @Test
    void history_unknownAccount_returns400() throws Exception {
        mvc.perform(get("/api/fd/account/NOPE000000/transactions").with(jwtAuth("officer1")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("FD account not found: NOPE000000"));
    }

    // ---- Atomicity on business-rule failure ------------------------------------------------------

    @Test
    void createWithTxn_belowMinimumDeposit_createsNothing() throws Exception {
        String belowMinimum = TestData.VALID_REQUEST_JSON.replace("200000", "5000");
        mvc.perform(post(CREATE_WITH_TXN).with(jwtAuth("officer1"))
                        .contentType(MediaType.APPLICATION_JSON).content(belowMinimum))
                .andExpect(status().isBadRequest());

        assertThat(countRows("fd_accounts")).isZero();
        assertThat(countRows("fd_transactions")).isZero();
    }

    @Test
    void createWithTxn_unknownCustomer_createsNothing() throws Exception {
        String unknownCustomer = TestData.VALID_REQUEST_JSON.replace("CUST001", "CUST999");
        mvc.perform(post(CREATE_WITH_TXN).with(jwtAuth("officer1"))
                        .contentType(MediaType.APPLICATION_JSON).content(unknownCustomer))
                .andExpect(status().isBadRequest());

        assertThat(countRows("fd_accounts")).isZero();
        assertThat(countRows("fd_transactions")).isZero();
    }

    // ---- Idempotency ----------------------------------------------------------------------------

    @Test
    void recordInitialDeposit_calledAgain_returnsExistingDepositAndWritesNothing() {
        FDAccountCreationResponse created =
                fdTransactionService.createFDAccountWithTransaction(TestData.validRequest(), "officer1");

        Long secondCallTxnId = new TransactionTemplate(transactionManager).execute(tx ->
                fdTransactionService.recordInitialDeposit(
                        fdRepository.findById(created.fdAccountNo()).orElseThrow(), "officer1").getTxnId());

        assertThat(secondCallTxnId).isEqualTo(created.initialTransactionId());
        assertThat(transactionRepository.countByFdAccountNo(created.fdAccountNo())).isEqualTo(1);
    }

    @Test
    void recordInitialDeposit_outsideATransaction_isRejected() {
        FDAccountCreationResponse created =
                fdTransactionService.createFDAccountWithTransaction(TestData.validRequest(), "officer1");
        FixedDepositAccount fd = fdRepository.findById(created.fdAccountNo()).orElseThrow();

        assertThatThrownBy(() -> fdTransactionService.recordInitialDeposit(fd, "officer1"))
                .isInstanceOf(IllegalTransactionStateException.class);
    }

    // ---- Security (Lab Manual L16 section 7: only BANK_OFFICER creates) -----------------------------

    @Test
    void createWithTxn_customer_isForbidden() throws Exception {
        mvc.perform(post(CREATE_WITH_TXN).with(jwtAuth("customer1"))
                        .contentType(MediaType.APPLICATION_JSON).content(TestData.VALID_REQUEST_JSON))
                .andExpect(status().isForbidden());
        assertThat(countRows("fd_accounts")).isZero();
    }

    @Test
    void createWithTxn_admin_isForbidden() throws Exception {
        mvc.perform(post(CREATE_WITH_TXN).with(jwtAuth("admin1"))
                        .contentType(MediaType.APPLICATION_JSON).content(TestData.VALID_REQUEST_JSON))
                .andExpect(status().isForbidden());
        assertThat(countRows("fd_accounts")).isZero();
    }

    @Test
    void createWithTxn_unauthenticated_isUnauthorized() throws Exception {
        mvc.perform(post(CREATE_WITH_TXN)
                        .contentType(MediaType.APPLICATION_JSON).content(TestData.VALID_REQUEST_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void history_customerRole_canRead() throws Exception {
        String fdAccountNo = createAs("officer1", "officer123").get("fdAccountNo").asText();
        mvc.perform(get("/api/fd/account/" + fdAccountNo + "/transactions").with(jwtAuth("customer1")))
                .andExpect(status().isOk());
    }

    // ---- Existing L12/L13 behaviour is unchanged --------------------------------------------------

    @Test
    void existingL13Create_stillWorks_andIsNotChangedByLab16() throws Exception {
        String response = mvc.perform(post("/api/fd/account/create").with(jwtAuth("officer1"))
                        .contentType(MediaType.APPLICATION_JSON).content(TestData.VALID_REQUEST_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenureMonths").value(12))
                .andExpect(jsonPath("$.createdBy").value("officer1"))
                .andReturn().getResponse().getContentAsString();
        String fdAccountNo = objectMapper.readTree(response).get("fdAccountNo").asText();

        assertThat(fdRepository.existsById(fdAccountNo)).isTrue();
        // L13 endpoint is Vritika's, left untouched: it does not log a DEPOSIT (see handover).
        assertThat(transactionRepository.countByFdAccountNo(fdAccountNo)).isZero();
    }

    // ---- helpers -----------------------------------------------------------------------------------

    private JsonNode createAs(String user, String password) throws Exception {
        String json = mvc.perform(post(CREATE_WITH_TXN).with(jwtAuth(user))
                        .contentType(MediaType.APPLICATION_JSON).content(TestData.VALID_REQUEST_JSON))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(json);
    }

    private long countRows(String table) {
        Long n = jdbc.queryForObject("SELECT COUNT(*) FROM " + table, Long.class);
        return n == null ? 0 : n;
    }
}
