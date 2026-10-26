package com.example.fdmodule.maturity;

import com.example.fdmodule.entity.FDTransaction;
import com.example.fdmodule.interest.InterestPostingService;
import com.example.fdmodule.repository.FDTransactionRepository;
import com.example.fdmodule.service.GLAccounts;
import com.example.fdshared.Outbox;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * L18/L19 - maturity processing (owner: Pratham).
 *
 * <p>Daily at 04:00 IST (after Parth's 03:00 interest batch) every ACTIVE FD whose maturity date
 * has arrived is settled, one account per database transaction:
 * <pre>
 * lock fd_accounts row, re-check ACTIVE and due        (duplicate guard for reruns/parallel runs)
 * InterestPostingService.accrueToMaturity              (catch-up through maturity - 1 day)
 * read fd_interest_state: current_balance + accrued_precise
 * INTEREST         Dr LIABILITY_INTEREST_PAYABLE Cr ASSET_CUSTOMER_SETTLEMENT   unpaid interest
 * MATURITY_PAYOUT  Dr LIABILITY_FD_DEPOSITS Cr ASSET_CUSTOMER_SETTLEMENT   principal + capitalized interest
 * settle interest sub-ledger, zero the balance state, status = MATURED
 * outbox: event.interest.paid (statements), event.fd.matured (notifications)
 * </pre>
 * Fund transfer is simulated: the payout credits the settlement clearing GL.
 */
@Service
public class MaturityService {

    private static final Logger log = LoggerFactory.getLogger(MaturityService.class);
    static final ZoneId IST = ZoneId.of("Asia/Kolkata");
    static final String SYSTEM_ACTOR = "SYSTEM_MATURITY_JOB";

    public record Result(LocalDate businessDate, int matured, int skipped, int failed) {
    }

    private final JdbcTemplate jdbc;
    private final InterestPostingService interest;
    private final FDTransactionRepository ledger;
    private final Outbox outbox;
    // Each account gets its own transaction so one failure can't roll back the batch.
    private final TransactionTemplate tx;

    public MaturityService(JdbcTemplate jdbc, InterestPostingService interest, FDTransactionRepository ledger,
                           Outbox outbox, TransactionTemplate tx) {
        this.jdbc = jdbc;
        this.interest = interest;
        this.ledger = ledger;
        this.outbox = outbox;
        this.tx = tx;
    }

    private com.example.fdmodule.clock.BusinessClock clock;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    void setClock(com.example.fdmodule.clock.BusinessClock clock) {
        this.clock = clock;
    }

    /** Business date (real IST date unless time travel is enabled). */
    public LocalDate today() {
        return clock != null ? clock.today() : LocalDate.now(IST);
    }

    @Scheduled(cron = "${maturity.cron:0 0 4 * * *}", zone = "Asia/Kolkata")
    public void daily() {
        log.info("Scheduled maturity run: {}", run(today(), SYSTEM_ACTOR));
    }

    /** Matures every ACTIVE FD whose maturity date is on or before {@code businessDate}. */
    public Result run(LocalDate businessDate, String actor) {
        if (businessDate.isAfter(today())) {
            throw new IllegalArgumentException("Future maturity dates are not permitted");
        }
        int matured = 0, skipped = 0, failed = 0;
        for (String account : jdbc.queryForList(
                "SELECT fd_account_no FROM fd_accounts WHERE status='ACTIVE' AND maturity_date<=? ORDER BY fd_account_no",
                String.class, businessDate)) {
            try {
                if (Boolean.TRUE.equals(tx.execute(status -> matureOne(account, businessDate, actor)))) matured++;
                else skipped++;
            } catch (RuntimeException e) {
                failed++;
                log.error("Maturity failed for FD {}", account, e);
            }
        }
        jdbc.update("INSERT INTO admin_operation_logs(actor,operation_type,target_type,target_id,summary) VALUES(?,?,?,?,?)",
                actor, "MATURITY_BATCH_COMPLETED", "MATURITY_BATCH", businessDate.toString(),
                "Maturity batch completed: " + matured + " matured, " + skipped + " skipped, " + failed + " failed");
        return new Result(businessDate, matured, skipped, failed);
    }

    /** Settle one due account using the same guarded maturity transaction as the daily batch. */
    public boolean matureAccount(String account, LocalDate businessDate, String actor) {
        if (businessDate.isAfter(today())) {
            throw new IllegalArgumentException("Future maturity dates are not permitted");
        }
        return Boolean.TRUE.equals(tx.execute(status -> matureOne(account, businessDate, actor)));
    }

    private boolean matureOne(String account, LocalDate businessDate, String actor) {
        Map<String, Object> fd = jdbc.queryForMap("SELECT * FROM fd_accounts WHERE fd_account_no=? FOR UPDATE", account);
        LocalDate maturityDate = ((java.sql.Date) fd.get("maturity_date")).toLocalDate();
        // Re-check under the lock: a parallel run or a premature withdrawal may have closed it.
        if (!"ACTIVE".equals(fd.get("status")) || maturityDate.isAfter(businessDate)) {
            return false;
        }

        interest.accrueToMaturity(account, actor);
        Map<String, Object> state = jdbc.queryForMap(
                "SELECT current_balance, accrued_precise FROM fd_interest_state WHERE fd_account_no=? FOR UPDATE", account);
        BigDecimal depositBalance = ((BigDecimal) state.get("current_balance")).setScale(2, RoundingMode.HALF_UP);
        // Final settlement: nothing remains to carry a sub-cent remainder, so round to the nearest paisa.
        BigDecimal finalInterest = ((BigDecimal) state.get("accrued_precise")).setScale(2, RoundingMode.HALF_UP);
        String currency = (String) fd.get("currency");

        if (finalInterest.signum() > 0) {
            ledger.save(new FDTransaction(account, FDTransaction.TYPE_INTEREST, finalInterest, currency,
                    GLAccounts.LIABILITY_INTEREST_PAYABLE, GLAccounts.ASSET_CUSTOMER_SETTLEMENT,
                    "Interest paid on maturity " + maturityDate, actor));
        }
        ledger.save(new FDTransaction(account, FDTransaction.TYPE_MATURITY_PAYOUT, depositBalance, currency,
                GLAccounts.LIABILITY_FD_DEPOSITS, GLAccounts.ASSET_CUSTOMER_SETTLEMENT,
                "Maturity payout of principal and capitalized interest " + maturityDate, actor));

        jdbc.update("UPDATE fd_interest_transactions SET settlement_status='PAID' WHERE fd_account_no=? AND settlement_status='PENDING'", account);
        jdbc.update("UPDATE fd_interest_state SET current_balance=0, accrued_precise=0 WHERE fd_account_no=?", account);
        jdbc.update("UPDATE fd_accounts SET status='MATURED', accrued_interest=0, modified_at=CURRENT_TIMESTAMP WHERE fd_account_no=?", account);

        // Same snapshot shape as Parth's InterestPaid so the statement projection needs no change.
        var paid = new LinkedHashMap<String, Object>();
        paid.put("fdAccountNo", account);
        paid.put("customerId", fd.get("customer_id"));
        paid.put("businessDate", maturityDate.toString());
        paid.put("currency", currency);
        paid.put("openingBalance", depositBalance);
        paid.put("interestAccrued", BigDecimal.ZERO);
        paid.put("interestCapitalized", BigDecimal.ZERO);
        paid.put("interestPaid", finalInterest);
        paid.put("closingBalance", BigDecimal.ZERO);
        paid.put("outstandingInterest", BigDecimal.ZERO);
        paid.put("actor", actor);
        com.example.fdmodule.service.NotificationContacts.enrich(jdbc, account, paid);
   outbox.emit("event.interest.paid", "InterestPaid", account, paid);

        var matured = new LinkedHashMap<String, Object>();
        matured.put("fdAccountNo", account);
        matured.put("customerId", fd.get("customer_id"));
        matured.put("currency", currency);
        matured.put("maturityDate", maturityDate.toString());
        matured.put("businessDate", businessDate.toString());
        matured.put("depositPaid", depositBalance);
        matured.put("interestPaid", finalInterest);
        matured.put("totalPaid", depositBalance.add(finalInterest));
        matured.put("actor", actor);
        com.example.fdmodule.service.NotificationContacts.enrich(jdbc, account, matured);
   outbox.emit("event.fd.matured", "FdMatured", account, matured);
        return true;
    }
}
