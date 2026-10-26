package com.example.fdmodule.maturity;

import com.example.fdmodule.service.GLAccounts;
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
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** L18/L19 maturity processing against the real context and Parth's interest posting (H2, profile "test"). */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Sql(scripts = "/interest-schema.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_CLASS)
class MaturityIntegrationTest {

    static final String ACTOR = "SYSTEM_MATURITY_JOB";

    @Autowired MaturityService maturity;
    @Autowired com.example.fdmodule.interest.InterestPostingService interest;
    @Autowired JdbcTemplate jdbc;
    @Autowired MockMvc mvc;
    @Autowired TransactionTemplate tx;

    LocalDate today;

    @BeforeEach
    void seed() {
        for (String table : List.of("event_outbox", "processed_interest_requests", "fd_interest_transactions",
                "fd_interest_state", "fd_transactions", "fd_accounts", "products", "customer_profile")) {
            jdbc.update("DELETE FROM " + table);
        }
        today = LocalDate.now(ZoneId.of("Asia/Kolkata"));
        jdbc.update("INSERT INTO products(product_code,currency,status) VALUES('FDSTD','INR','ACTIVE')");
        jdbc.update("INSERT INTO customer_profile(customer_id) VALUES('CUST001')");
    }

    void fd(String account, LocalDate opened, LocalDate maturityDate) {
        fd(account, opened, maturityDate, 12);
    }

    void fd(String account, LocalDate opened, LocalDate maturityDate, int ratePercent) {
        jdbc.update("INSERT INTO fd_accounts(fd_account_no,customer_id,product_code,currency,principal_amount,"
                + "interest_rate,tenure_months,status,maturity_date,accrued_interest,created_at) "
                + "VALUES(?,'CUST001','FDSTD','INR',100000,?,12,'ACTIVE',?,0,?)",
                account, ratePercent, maturityDate, opened.atStartOfDay());
    }

    List<Map<String, Object>> ledger(String account) {
        return jdbc.queryForList("SELECT * FROM fd_transactions WHERE fd_account_no=? ORDER BY txn_id", account);
    }

    String fdStatus(String account) {
        return jdbc.queryForObject("SELECT status FROM fd_accounts WHERE fd_account_no=?", String.class, account);
    }

    BigDecimal decimal(String sql, Object... args) {
        return jdbc.queryForObject(sql, BigDecimal.class, args);
    }

    @Test
    void paysPrincipalAndInterestWithCorrectGlAndClosesTheFd() {
        // 29 accrual days (opening day inclusive, maturity day exclusive) at 12% on 100000.
        fd("BR001MAT", today.minusDays(30), today.minusDays(1));

        var result = maturity.run(today, ACTOR);

        assertThat(result.matured()).isEqualTo(1);
        assertThat(fdStatus("BR001MAT")).isEqualTo("MATURED");
        var rows = ledger("BR001MAT");
        assertThat(rows).hasSize(3);

        BigDecimal expectedInterest = new BigDecimal("32.876712").multiply(BigDecimal.valueOf(29))
                .setScale(2, RoundingMode.HALF_UP);
        assertThat(rows.get(0).get("txn_type")).isEqualTo("INTEREST_ACCRUAL");
        assertThat((BigDecimal) rows.get(0).get("amount")).isEqualByComparingTo(expectedInterest);
        assertThat(rows.get(0).get("debit_gl_account")).isEqualTo(GLAccounts.EXPENSE_INTEREST);
        assertThat(rows.get(0).get("credit_gl_account")).isEqualTo(GLAccounts.LIABILITY_INTEREST_PAYABLE);

        assertThat(rows.get(1).get("txn_type")).isEqualTo("INTEREST");
        assertThat((BigDecimal) rows.get(1).get("amount")).isEqualByComparingTo(expectedInterest);
        assertThat(rows.get(1).get("debit_gl_account")).isEqualTo(GLAccounts.LIABILITY_INTEREST_PAYABLE);
        assertThat(rows.get(1).get("credit_gl_account")).isEqualTo(GLAccounts.ASSET_CUSTOMER_SETTLEMENT);
        assertThat(rows.get(2).get("txn_type")).isEqualTo("MATURITY_PAYOUT");
        assertThat((BigDecimal) rows.get(2).get("amount")).isEqualByComparingTo("100000.00");
        assertThat(rows.get(2).get("debit_gl_account")).isEqualTo(GLAccounts.LIABILITY_FD_DEPOSITS);
        assertThat(rows.get(2).get("credit_gl_account")).isEqualTo(GLAccounts.ASSET_CUSTOMER_SETTLEMENT);
        assertThat(rows).allSatisfy(r -> assertThat(r.get("status")).isEqualTo("POSTED"));

        // Interest sub-ledger is settled and the authoritative balance state is emptied.
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM fd_interest_transactions WHERE settlement_status<>'PAID'",
                Integer.class)).isZero();
        assertThat(decimal("SELECT current_balance FROM fd_interest_state WHERE fd_account_no=?", "BR001MAT")).isZero();
        assertThat(decimal("SELECT accrued_precise FROM fd_interest_state WHERE fd_account_no=?", "BR001MAT")).isZero();
        assertThat(decimal("SELECT accrued_interest FROM fd_accounts WHERE fd_account_no=?", "BR001MAT")).isZero();

        // Events go through the outbox to topics the relay is allowed to publish.
        List<String> topics = jdbc.queryForList("SELECT DISTINCT routing_key FROM event_outbox", String.class);
        assertThat(topics).contains("event.interest.paid", "event.fd.matured");
        assertThat(List.of(EventInfrastructure.TOPICS)).containsAll(topics);
    }

    @Test
    void rerunDoesNotPayTwice() {
        fd("BR001MAT", today.minusDays(30), today.minusDays(1));
        maturity.run(today, ACTOR);

        var second = maturity.run(today, ACTOR);

        assertThat(second.matured()).isZero();
        assertThat(ledger("BR001MAT")).hasSize(3);
    }

    @Test
    void concurrentRunWaitsForTheLockAndDoesNotPayTwice() throws Exception {
        fd("BR001MAT", today.minusDays(30), today.minusDays(1));
        var otherRunHoldsLock = new CountDownLatch(1);
        var release = new CountDownLatch(1);
        ExecutorService threads = Executors.newFixedThreadPool(2);
        try {
            // Stand-in for a parallel run that has locked the FD and matured it, but not yet committed.
            Future<?> otherRun = threads.submit(() -> tx.executeWithoutResult(s -> {
                jdbc.queryForMap("SELECT status FROM fd_accounts WHERE fd_account_no='BR001MAT' FOR UPDATE");
                jdbc.update("UPDATE fd_accounts SET status='MATURED' WHERE fd_account_no='BR001MAT'");
                otherRunHoldsLock.countDown();
                try {
                    release.await(10, TimeUnit.SECONDS);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }));
            assertThat(otherRunHoldsLock.await(10, TimeUnit.SECONDS)).isTrue();

            // This run still sees the committed ACTIVE row, selects it, then blocks on the row lock.
            Future<MaturityService.Result> run = threads.submit(() -> maturity.run(today, ACTOR));
            long deadline = System.currentTimeMillis() + 5000;
            while (jdbc.queryForObject("SELECT COUNT(*) FROM INFORMATION_SCHEMA.SESSIONS WHERE BLOCKER_ID IS NOT NULL",
                    Integer.class) == 0) {
                assertThat(System.currentTimeMillis()).as("maturity run never blocked on the row lock").isLessThan(deadline);
                Thread.sleep(10);
            }
            release.countDown();
            otherRun.get(10, TimeUnit.SECONDS);

            var result = run.get(10, TimeUnit.SECONDS);
            assertThat(result.skipped()).isEqualTo(1);
            assertThat(result.matured()).isZero();
            assertThat(result.failed()).isZero();
            assertThat(ledger("BR001MAT")).isEmpty();
        } finally {
            release.countDown();
            threads.shutdownNow();
        }
    }

    @Test
    void finalInterestRoundsHalfUpToThePaisa() {
        // 28 days x 32.876712 = 920.547936: HALF_UP gives 920.55, DOWN would give 920.54.
        fd("BR001MAT", today.minusDays(29), today.minusDays(1));

        maturity.run(today, ACTOR);

        assertThat((BigDecimal) ledger("BR001MAT").get(0).get("amount")).isEqualByComparingTo("920.55");
    }

    @Test
    void zeroInterestFdPostsOnlyThePrincipalPayout() {
        fd("BR001ZERO", today.minusDays(30), today.minusDays(1), 0);

        maturity.run(today, ACTOR);

        var rows = ledger("BR001ZERO");
        assertThat(rows).hasSize(1);
        assertThat(rows.get(0).get("txn_type")).isEqualTo("MATURITY_PAYOUT");
        assertThat((BigDecimal) rows.get(0).get("amount")).isEqualByComparingTo("100000.00");
    }

    @Test
    void notYetDueIsLeftAlone() {
        fd("BR001MAT", today.minusDays(30), today);

        var result = maturity.run(today.minusDays(1), ACTOR);

        assertThat(result.matured()).isZero();
        assertThat(fdStatus("BR001MAT")).isEqualTo("ACTIVE");
        assertThat(ledger("BR001MAT")).isEmpty();
    }

    @Test
    void catchesUpMoreThan366DaysOfUnaccruedInterest() {
        fd("BR001LONG", today.minusDays(800), today.minusDays(5));

        var result = maturity.run(today, ACTOR);

        assertThat(result.matured()).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM fd_interest_transactions WHERE fd_account_no=?",
                Integer.class, "BR001LONG")).isEqualTo(795);
    }

    @Test
    void monthlyCompoundPaysCapitalizedBalanceFromDepositsAndRestAsInterest() {
        fd("BR001CMP", today.minusMonths(3), today.minusDays(1));
        interest.configure("BR001CMP", "MONTHLY_COMPOUND");

        maturity.run(today, ACTOR);

        BigDecimal accrued = decimal("SELECT SUM(interest_amount) FROM fd_interest_transactions WHERE fd_account_no=?",
                "BR001CMP");
        BigDecimal payout = decimal("SELECT amount FROM fd_transactions WHERE fd_account_no=? AND txn_type='MATURITY_PAYOUT'",
                "BR001CMP");
        BigDecimal finalInterest = decimal("SELECT amount FROM fd_transactions WHERE fd_account_no=? AND txn_type='INTEREST' "
                + "AND debit_gl_account=? AND credit_gl_account=?", "BR001CMP",
                GLAccounts.LIABILITY_INTEREST_PAYABLE, GLAccounts.ASSET_CUSTOMER_SETTLEMENT);

        assertThat(payout).isGreaterThan(new BigDecimal("100000"));
        // Everything accrued is paid out: capitalized part via deposits, remainder as interest.
        assertThat(payout.add(finalInterest).subtract(new BigDecimal("100000")).subtract(accrued).abs())
                .isLessThanOrEqualTo(new BigDecimal("0.005"));
        assertThat(decimal("SELECT current_balance FROM fd_interest_state WHERE fd_account_no=?", "BR001CMP"))
                .isEqualByComparingTo("0.00");
        assertThat(decimal("SELECT accrued_precise FROM fd_interest_state WHERE fd_account_no=?", "BR001CMP"))
                .isEqualByComparingTo("0.000000");
    }

    @Test
    void oneBadAccountDoesNotBlockTheBatch() {
        fd("BR001BAD", today.minusDays(30), today.minusDays(1));
        fd("BR001OK", today.minusDays(30), today.minusDays(1));
        // Legacy accrued interest without interest state: Parth's enrolment refuses it.
        jdbc.update("UPDATE fd_accounts SET accrued_interest=5 WHERE fd_account_no='BR001BAD'");

        var result = maturity.run(today, ACTOR);

        assertThat(result.matured()).isEqualTo(1);
        assertThat(result.failed()).isEqualTo(1);
        assertThat(fdStatus("BR001BAD")).isEqualTo("ACTIVE");
        assertThat(ledger("BR001BAD")).isEmpty();
        assertThat(fdStatus("BR001OK")).isEqualTo("MATURED");
    }

    @Test
    void maturedFdIsSkippedByTheInterestBatch() {
        fd("BR001MAT", today.minusDays(30), today.minusDays(1));
        maturity.run(today, ACTOR);
        int before = jdbc.queryForObject("SELECT COUNT(*) FROM fd_interest_transactions", Integer.class);

        interest.processBatch(UUID.randomUUID().toString(), today, "admin1");

        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM fd_interest_transactions", Integer.class)).isEqualTo(before);
    }

    @Test
    void futureBusinessDateRejected() {
        assertThatThrownBy(() -> maturity.run(today.plusDays(1), ACTOR)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void manualRunIsAdminOnly() throws Exception {
        fd("BR001MAT", today.minusDays(30), today.minusDays(1));
        String body = "{\"businessDate\":\"" + today + "\"}";

        mvc.perform(post("/api/fd/maturity/run").with(user("officer1").roles("BANK_OFFICER"))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/fd/maturity/run").with(user("admin1").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.matured").value(1));
    }
}
