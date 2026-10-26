package com.example.fdmodule.withdrawal;

import com.example.fdmodule.entity.FDTransaction;
import com.example.fdmodule.interest.InterestPostingService;
import com.example.fdmodule.repository.FDTransactionRepository;
import com.example.fdmodule.service.GLAccounts;
import com.example.fdshared.Outbox;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * L20 - premature withdrawal (owner: Niranjan; ported from the prototype).
 *
 * <p>Quote and close an ACTIVE FD before its maturity date. Penalty is on interest only:
 * {@code penalty = interest x product withdrawal fee percentage / 100}, and the customer gets
 * {@code principal + interest - penalty}. Under the FD row lock:
 * <pre>
 * InterestPostingService.accrueThrough(yesterday)      (interest is earned for completed days)
 * read fd_interest_state: current_balance + accrued_precise
 * INTEREST              Dr LIABILITY_INTEREST_PAYABLE Cr ASSET_CUSTOMER_SETTLEMENT   unpaid interest
 * PENALTY_DEBIT         Dr LIABILITY_FD_DEPOSITS Cr INCOME_PREMATURE_PENALTY    penalty
 * PREMATURE_WITHDRAWAL  Dr LIABILITY_FD_DEPOSITS Cr ASSET_CUSTOMER_SETTLEMENT   deposit balance - penalty
 * settle interest sub-ledger, zero the balance state, status = PREMATURELY_CLOSED
 * outbox: event.interest.paid (statements), event.fd.prematurely-closed (notifications)
 * </pre>
 * The inquiry runs the same code and rolls back, so a quote always matches a same-day withdrawal.
 */
@Service
public class WithdrawalService {

    static final ZoneId IST = ZoneId.of("Asia/Kolkata");
    private static final BigDecimal HUNDRED = new BigDecimal("100");

    /** Swagger FD_PrematureWithdrawalInquiryResponse. */
    public record Inquiry(String accountNumber, BigDecimal originalPrincipal, BigDecimal interestAccruedToDate,
                          BigDecimal penaltyAmount, BigDecimal finalPayoutAmount, LocalDate inquiryDate) {
    }

    private final com.example.fdmodule.client.ProductServiceClient products;
    private final JdbcTemplate jdbc;
    private final InterestPostingService interest;
    private final FDTransactionRepository ledger;
    private final Outbox outbox;
    private final TransactionTemplate tx;

    public WithdrawalService(JdbcTemplate jdbc, InterestPostingService interest, FDTransactionRepository ledger,
                             Outbox outbox, TransactionTemplate tx, com.example.fdmodule.client.ProductServiceClient products) {
        this.products = products;
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

    private LocalDate today() {
        return clock != null ? clock.today() : LocalDate.now(IST);
    }

    /** Read-only quote: performs the withdrawal and rolls it back, so nothing is written. */
    public Inquiry inquire(String account, String actor) {
        return tx.execute(status -> {
            status.setRollbackOnly();
            return close(account, null, actor);
        });
    }

    /** Closes the FD early, paying the quoted amount to the settlement GL. */
    public Inquiry withdraw(String account, String reason, String actor) {
        return tx.execute(status -> close(account, reason, actor));
    }

    private Inquiry close(String account, String reason, String actor) {
        LocalDate today = today();
        List<Map<String, Object>> rows = jdbc.queryForList("SELECT * FROM fd_accounts WHERE fd_account_no=? FOR UPDATE", account);
        if (rows.isEmpty()) {
            throw new IllegalArgumentException("FD account not found: " + account);
        }
        Map<String, Object> fd = rows.get(0);
        if (!"ACTIVE".equals(fd.get("status"))) {
            throw new IllegalArgumentException("FD " + account + " is " + fd.get("status") + "; only ACTIVE FDs can be withdrawn");
        }
        LocalDate maturityDate = ((java.sql.Date) fd.get("maturity_date")).toLocalDate();
        if (!today.isBefore(maturityDate)) {
            throw new IllegalArgumentException("FD " + account + " has reached maturity; it is settled by maturity processing");
        }

        interest.accrueThrough(account, today.minusDays(1), actor);
        Map<String, Object> state = jdbc.queryForMap(
                "SELECT current_balance, accrued_precise FROM fd_interest_state WHERE fd_account_no=? FOR UPDATE", account);
        BigDecimal principal = ((BigDecimal) fd.get("principal_amount")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal depositBalance = ((BigDecimal) state.get("current_balance")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal unpaidInterest = ((BigDecimal) state.get("accrued_precise")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalInterest = depositBalance.subtract(principal).add(unpaidInterest);
        
        // A withdrawal must use the product's configured fee. Let upstream errors propagate so
        // the transaction rolls back and the API reports the product service failure.
        var product = products.getProductByCode((String) fd.get("product_code"));
        if (product == null || product.isNull()) {
            throw new IllegalStateException("Product service returned no product for FD account " + account);
        }
        var fee = product.path("charges").path("withdrawalFees");
        BigDecimal pct = fee.isNumber() ? fee.decimalValue() : BigDecimal.ZERO;
        
        BigDecimal penalty = pct == null ? BigDecimal.ZERO.setScale(2)
                : totalInterest.multiply(pct).divide(HUNDRED, 2, RoundingMode.HALF_UP);
        BigDecimal payout = principal.add(totalInterest).subtract(penalty);
        String currency = (String) fd.get("currency");
        String why = reason == null || reason.isBlank() ? "" : " (" + reason + ")";

        if (unpaidInterest.signum() > 0) {
            ledger.save(new FDTransaction(account, FDTransaction.TYPE_INTEREST, unpaidInterest, currency,
                    GLAccounts.LIABILITY_INTEREST_PAYABLE, GLAccounts.ASSET_CUSTOMER_SETTLEMENT,
                    "Interest paid on premature closure" + why, actor));
        }
        if (penalty.signum() > 0) {
            ledger.save(new FDTransaction(account, FDTransaction.TYPE_PENALTY_DEBIT, penalty, currency,
                    GLAccounts.LIABILITY_FD_DEPOSITS, GLAccounts.INCOME_PREMATURE_PENALTY,
                    "Premature closure penalty" + why, actor));
        }
        ledger.save(new FDTransaction(account, FDTransaction.TYPE_PREMATURE_WITHDRAWAL, depositBalance.subtract(penalty), currency,
                GLAccounts.LIABILITY_FD_DEPOSITS, GLAccounts.ASSET_CUSTOMER_SETTLEMENT,
                "Premature withdrawal" + why, actor));

        jdbc.update("UPDATE fd_interest_transactions SET settlement_status='PAID' WHERE fd_account_no=? AND settlement_status='PENDING'", account);
        jdbc.update("UPDATE fd_interest_state SET current_balance=0, accrued_precise=0 WHERE fd_account_no=?", account);
        jdbc.update("UPDATE fd_accounts SET status='PREMATURELY_CLOSED', accrued_interest=0, modified_at=CURRENT_TIMESTAMP WHERE fd_account_no=?", account);

        // Same snapshot shape as maturity's InterestPaid so the statement projection needs no change.
        // ponytail: the penalty is not on the statement row; add a field there if statements must show it.
        var paid = new LinkedHashMap<String, Object>();
        paid.put("fdAccountNo", account);
        paid.put("customerId", fd.get("customer_id"));
        paid.put("businessDate", today.toString());
        paid.put("currency", currency);
        paid.put("openingBalance", depositBalance);
        paid.put("interestAccrued", BigDecimal.ZERO);
        paid.put("interestCapitalized", BigDecimal.ZERO);
        paid.put("interestPaid", unpaidInterest);
        paid.put("closingBalance", BigDecimal.ZERO);
        paid.put("outstandingInterest", BigDecimal.ZERO);
        paid.put("actor", actor);
        com.example.fdmodule.service.NotificationContacts.enrich(jdbc, account, paid);
   outbox.emit("event.interest.paid", "InterestPaid", account, paid);

        var closed = new LinkedHashMap<String, Object>();
        closed.put("fdAccountNo", account);
        closed.put("customerId", fd.get("customer_id"));
        closed.put("currency", currency);
        closed.put("maturityDate", maturityDate.toString());
        closed.put("businessDate", today.toString());
        closed.put("interest", totalInterest);
        closed.put("penalty", penalty);
        closed.put("totalPaid", payout);
        closed.put("reason", reason);
        closed.put("actor", actor);
        com.example.fdmodule.service.NotificationContacts.enrich(jdbc, account, closed);
   outbox.emit("event.fd.prematurely-closed", "FdPrematurelyClosed", account, closed);

        return new Inquiry(account, principal, totalInterest, penalty, payout, today);
    }
}
