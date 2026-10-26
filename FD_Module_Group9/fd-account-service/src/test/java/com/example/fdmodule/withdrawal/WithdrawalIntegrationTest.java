package com.example.fdmodule.withdrawal;

import com.example.fdmodule.interest.InterestPostingService;
import com.example.fdmodule.maturity.MaturityService;
import com.example.fdmodule.service.GLAccounts;
import com.example.fdmodule.client.AuthServiceClient;
import com.example.fdmodule.client.ProductServiceClient;
import com.example.fdshared.EventInfrastructure;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static com.example.fdmodule.test.JwtTestSupport.jwtAuth;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** L20 premature withdrawal against the real context and Parth's interest posting (H2, profile "test"). */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Sql(scripts = {"/interest-schema.sql", "/report-schema.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_CLASS)
class WithdrawalIntegrationTest {

    static final String ACCT = "BR001WD";

    @Autowired WithdrawalService withdrawals;
    @Autowired InterestPostingService interest;
    @Autowired MaturityService maturity;
    @Autowired JdbcTemplate jdbc;
    @Autowired MockMvc mvc;
    @org.springframework.boot.test.mock.mockito.MockBean AuthServiceClient authServiceClient;
    @org.springframework.boot.test.mock.mockito.MockBean ProductServiceClient productServiceClient;

    LocalDate today;

    @BeforeEach
    void seed() {
        for (String table : List.of("event_outbox", "processed_interest_requests", "fd_interest_transactions",
                "fd_interest_state", "fd_transactions", "fd_accounts", "products", "customer_profile", "users")) {
            jdbc.update("DELETE FROM " + table);
        }
        today = LocalDate.now(ZoneId.of("Asia/Kolkata"));
        jdbc.update("INSERT INTO products(product_code,currency,status,pre_maturity_penalty_pct) VALUES('FDSTD','INR','ACTIVE',1.00)");
        jdbc.update("INSERT INTO users(username,password_hash,role) VALUES('customer1','x','CUSTOMER')");
        jdbc.update("INSERT INTO customer_profile(customer_id,user_id) VALUES('CUST001',(SELECT id FROM users WHERE username='customer1'))");
        org.mockito.Mockito.when(authServiceClient.getUserIdByUsername("customer1"))
                .thenAnswer(invocation -> jdbc.queryForObject("SELECT id FROM users WHERE username='customer1'", Long.class));
        var product = new com.fasterxml.jackson.databind.ObjectMapper().createObjectNode()
                .put("productCode", "FDSTD").put("status", "ACTIVE");
        product.putObject("charges").put("withdrawalFees", 1.0);
        org.mockito.Mockito.when(productServiceClient.getProductByCode("FDSTD")).thenReturn(product);
        // Opened 3 months ago, matures in 9 months, 12% on 100000, monthly compounding so some interest is capitalized.
        jdbc.update("INSERT INTO fd_accounts(fd_account_no,customer_id,product_code,currency,principal_amount,"
                + "interest_rate,tenure_months,status,maturity_date,accrued_interest,created_at) "
                + "VALUES(?,'CUST001','FDSTD','INR',100000,12,12,'ACTIVE',?,0,?)",
                ACCT, today.plusMonths(9), today.minusMonths(3).atStartOfDay());
        interest.configure(ACCT, "MONTHLY_COMPOUND");
    }

    int rowCount() {
        return jdbc.queryForObject("SELECT (SELECT COUNT(*) FROM fd_transactions) + (SELECT COUNT(*) FROM fd_interest_transactions)",
                Integer.class);
    }

    BigDecimal sum(String txnType) {
        return jdbc.queryForObject("SELECT COALESCE(SUM(amount),0) FROM fd_transactions WHERE txn_type=?", BigDecimal.class, txnType);
    }

    /** Credits minus debits for a GL across the ledger. */
    BigDecimal gl(String account) {
        return jdbc.queryForObject("SELECT COALESCE(SUM(CASE WHEN credit_gl_account=? THEN amount ELSE 0 END),0)"
                + " - COALESCE(SUM(CASE WHEN debit_gl_account=? THEN amount ELSE 0 END),0) FROM fd_transactions",
                BigDecimal.class, account, account);
    }

    String fdStatus() {
        return jdbc.queryForObject("SELECT status FROM fd_accounts WHERE fd_account_no=?", String.class, ACCT);
    }

    @Test
    void inquiryQuotesPenaltyAndPayoutWithoutWritingAnything() {
        var q = withdrawals.inquire(ACCT, "officer1");

        assertThat(q.interestAccruedToDate()).isPositive();
        assertThat(q.originalPrincipal()).isEqualByComparingTo("100000.00");
        assertThat(q.penaltyAmount()).isEqualByComparingTo(
                q.interestAccruedToDate().multiply(new BigDecimal("0.01")).setScale(2, RoundingMode.HALF_UP));
        assertThat(q.finalPayoutAmount()).isEqualByComparingTo(
                q.originalPrincipal().add(q.interestAccruedToDate()).subtract(q.penaltyAmount()));
        assertThat(q.inquiryDate()).isEqualTo(today);

        assertThat(rowCount()).isZero();
        assertThat(fdStatus()).isEqualTo("ACTIVE");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM event_outbox", Integer.class)).isZero();
    }

    @Test
    void withdrawalPaysExactlyTheQuoteAndClosesTheDepositLiability() {
        var quote = withdrawals.inquire(ACCT, "officer1");

        var paid = withdrawals.withdraw(ACCT, "medical emergency", "officer1");

        assertThat(paid).isEqualTo(quote);
        assertThat(fdStatus()).isEqualTo("PREMATURELY_CLOSED");
        assertThat(sum("PENALTY_DEBIT")).isEqualByComparingTo(quote.penaltyAmount());
        // Customer receives everything that hit the settlement GL on closure.
        BigDecimal settled = sum("PREMATURE_WITHDRAWAL").add(jdbc.queryForObject(
                "SELECT COALESCE(SUM(amount),0) FROM fd_transactions WHERE txn_type='INTEREST' AND credit_gl_account=?",
                BigDecimal.class, GLAccounts.ASSET_CUSTOMER_SETTLEMENT));
        assertThat(settled).isEqualByComparingTo(quote.finalPayoutAmount());
        // No DEPOSIT row is seeded, so the deposit GL nets to minus the principal once closure pays out principal + capitalized.
        assertThat(gl(GLAccounts.LIABILITY_FD_DEPOSITS)).isEqualByComparingTo("-100000.00");
        assertThat(gl(GLAccounts.INCOME_PREMATURE_PENALTY)).isEqualByComparingTo(quote.penaltyAmount());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM fd_interest_transactions WHERE settlement_status='PENDING'",
                Integer.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT remarks FROM fd_transactions WHERE txn_type='PREMATURE_WITHDRAWAL'",
                String.class)).contains("medical emergency");

        List<String> topics = jdbc.queryForList("SELECT DISTINCT routing_key FROM event_outbox", String.class);
        assertThat(topics).contains("event.interest.paid", "event.fd.prematurely-closed");
        assertThat(List.of(EventInfrastructure.TOPICS)).containsAll(topics);
    }

    @Test
    void secondWithdrawalIsRejectedWithoutNewRows() {
        withdrawals.withdraw(ACCT, null, "officer1");
        int rows = rowCount();

        assertThatThrownBy(() -> withdrawals.withdraw(ACCT, null, "officer1")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> withdrawals.inquire(ACCT, "officer1")).isInstanceOf(IllegalArgumentException.class);
        assertThat(rowCount()).isEqualTo(rows);
    }

    @Test
    void onOrAfterMaturityIsLeftToMaturityProcessing() {
        jdbc.update("UPDATE fd_accounts SET maturity_date=? WHERE fd_account_no=?", today, ACCT);

        assertThatThrownBy(() -> withdrawals.withdraw(ACCT, null, "officer1")).isInstanceOf(IllegalArgumentException.class);
        assertThat(rowCount()).isZero();
    }

    @Test
    void prematurelyClosedFdIsSkippedByMaturityAndInterestBatch() {
        withdrawals.withdraw(ACCT, null, "officer1");
        int rows = rowCount();
        jdbc.update("UPDATE fd_accounts SET maturity_date=? WHERE fd_account_no=?", today, ACCT);

        assertThat(maturity.run(today, "admin1").matured()).isZero();
        interest.processBatch("req-after-close", today, "admin1");
        assertThat(rowCount()).isEqualTo(rows);
    }

    @Test
    void endpointsReturnQuoteAndClosedAccount() throws Exception {
        mvc.perform(get("/api/fd/account/" + ACCT + "/withdrawal-inquiry").with(jwtAuth("customer1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accountNumber").value(ACCT))
                .andExpect(jsonPath("$.inquiryDate").value(today.toString()));
        mvc.perform(post("/api/fd/account/" + ACCT + "/withdrawal").with(jwtAuth("officer1"))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"reason\":\"need funds\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PREMATURELY_CLOSED"));
        mvc.perform(post("/api/fd/account/" + ACCT + "/withdrawal").with(jwtAuth("officer1")))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/fd/account/BR999NONE/withdrawal-inquiry").with(jwtAuth("officer1")))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/fd/account/" + ACCT + "/withdrawal-inquiry")).andExpect(status().isUnauthorized());
    }
}
