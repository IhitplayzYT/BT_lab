package com.example.fdmodule.report;

import com.example.fdmodule.client.AuthServiceClient;
import com.example.fdmodule.clock.BusinessClock;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Read-only aggregation queries for Lab L21. Money is never summed across currencies: every total is grouped by
 * currency. "Today" comes from the business clock so reports agree with interest and maturity processing.
 */
@Service
@Transactional(readOnly = true)
public class ReportService {
    static final List<String> SUMMARY_COLUMNS = List.of("product_code", "currency", "total_accounts", "total_principal",
            "total_interest_accrued", "total_interest_posted");
    static final List<String> PORTFOLIO_COLUMNS = List.of("fd_account_no", "product_code", "currency", "principal_amount",
            "interest_rate", "tenure_months", "maturity_date", "accrued_interest", "status", "created_at");
    static final List<String> MATURITY_COLUMNS = List.of("fd_account_no", "customer_id", "product_code", "currency",
            "principal_amount", "interest_rate", "maturity_date", "days_to_maturity");
    static final List<String> HISTORY_COLUMNS = List.of("accrual_date", "interest_amount", "cumulative_interest",
            "capitalized", "settlement_status");
    static final List<String> INTEREST_REPORT_COLUMNS = List.of("txn_id", "fd_account_no", "amount", "currency",
            "txn_timestamp", "remarks");
    static final List<String> TRANSACTION_REPORT_COLUMNS = List.of("txn_id", "fd_account_no", "txn_type", "amount",
            "currency", "status", "txn_timestamp", "remarks");
    static final List<String> CUSTOMER_ACTIVITY_COLUMNS = List.of("txn_timestamp", "fd_account_no", "product_code",
            "txn_type", "amount", "currency", "status", "debit_gl_account", "credit_gl_account", "remarks");
    static final List<String> CUSTOMER_ACCRUAL_COLUMNS = List.of("accrual_date", "fd_account_no", "product_code", "currency",
            "interest_amount", "cumulative_interest", "capitalized_flag", "settlement_status");
    static final List<String> EXTRACT_COLUMNS = List.of("fd_account_no", "customer_id", "product_code", "currency",
            "principal_amount", "interest_rate", "tenure_months", "status", "maturity_date", "accrued_interest");
    static final int MAX_MATURITY_DAYS = 3650;

    private static final String PORTFOLIO_SELECT = "SELECT a.fd_account_no, a.product_code, a.currency, a.principal_amount, "
            + "a.interest_rate, a.tenure_months, a.maturity_date, a.accrued_interest, a.status, a.created_at FROM fd_accounts a ";

    private final JdbcTemplate jdbc;
    private final BusinessClock clock;
    private final AuthServiceClient authServiceClient;

    public ReportService(JdbcTemplate jdbc, BusinessClock clock, AuthServiceClient authServiceClient) {
        this.jdbc = jdbc;
        this.clock = clock;
        this.authServiceClient = authServiceClient;
    }

    public ReportData fdSummary(String status) {
        List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT a.product_code, a.currency, COUNT(a.fd_account_no) AS total_accounts, "
                        + "SUM(a.principal_amount) AS total_principal, SUM(COALESCE(a.accrued_interest,0)) AS total_interest_accrued, "
                        + "ROUND(SUM(COALESCE(t.posted,0)),2) AS total_interest_posted "
                        + "FROM fd_accounts a LEFT JOIN (SELECT fd_account_no, SUM(interest_amount) AS posted "
                        + "FROM fd_interest_transactions GROUP BY fd_account_no) t ON t.fd_account_no=a.fd_account_no "
                        + "WHERE a.status=? GROUP BY a.product_code, a.currency ORDER BY a.product_code, a.currency", status);
        return new ReportData("FD summary - " + status, SUMMARY_COLUMNS, rows);
    }

    /** Customer path: the customer is found from the logged-in username, never from a request parameter. */
    public ReportData portfolioForUsername(String username) {
        // Get user_id from auth-service - NO FALLBACK, userId must be synchronized
        Long userId = authServiceClient.getUserIdByUsername(username);
        if (userId == null) {
            System.err.println("CRITICAL: User ID not found in auth-service for username: " + username + ". User session is invalid.");
            throw new IllegalStateException("User session invalid. Please log out and log in again. User ID synchronization failed.");
        }

        List<Map<String, Object>> rows = jdbc.queryForList(PORTFOLIO_SELECT
                + "JOIN customer_profile c ON c.customer_id=a.customer_id "
                + "WHERE c.user_id=? AND (a.approval_status='APPROVED' OR a.approval_status IS NULL) "
                + "ORDER BY a.created_at, a.fd_account_no", userId);
        return new ReportData("Customer portfolio", PORTFOLIO_COLUMNS, rows);
    }

    /** Append-only posted ledger activity for the authenticated customer's own FDs. */
    public ReportData customerActivityForUsername(String username) {
        Long userId = authServiceClient.getUserIdByUsername(username);
        if (userId == null) throw new IllegalStateException("User session invalid. Please log out and log in again.");
        List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT t.txn_timestamp,t.fd_account_no,a.product_code,t.txn_type,t.amount,t.currency,t.status,"
                        + "t.debit_gl_account,t.credit_gl_account,t.remarks FROM fd_transactions t "
                        + "JOIN fd_accounts a ON a.fd_account_no=t.fd_account_no "
                        + "JOIN customer_profile c ON c.customer_id=a.customer_id WHERE c.user_id=? "
                        + "ORDER BY t.txn_timestamp,t.txn_id", userId);
        return new ReportData("Customer FD activity", CUSTOMER_ACTIVITY_COLUMNS, rows);
    }

    /** Daily accrual rows, including historical catch-up days and settlement state, for the authenticated customer. */
    public ReportData customerAccrualHistoryForUsername(String username) {
        Long userId = authServiceClient.getUserIdByUsername(username);
        if (userId == null) throw new IllegalStateException("User session invalid. Please log out and log in again.");
        List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT i.accrual_date,i.fd_account_no,a.product_code,a.currency,i.interest_amount,i.cumulative_interest,"
                        + "i.capitalized_flag,i.settlement_status FROM fd_interest_transactions i "
                        + "JOIN fd_accounts a ON a.fd_account_no=i.fd_account_no "
                        + "JOIN customer_profile c ON c.customer_id=a.customer_id WHERE c.user_id=? "
                        + "ORDER BY i.accrual_date,i.fd_account_no", userId);
        return new ReportData("Customer daily interest accruals", CUSTOMER_ACCRUAL_COLUMNS, rows);
    }

    public ReportData portfolioForCustomer(String customerId) {
        List<Map<String, Object>> rows = jdbc.queryForList(PORTFOLIO_SELECT
                + "WHERE a.customer_id=? AND (a.approval_status='APPROVED' OR a.approval_status IS NULL) "
                + "ORDER BY a.created_at, a.fd_account_no", customerId);
        return new ReportData("Customer portfolio " + customerId, PORTFOLIO_COLUMNS, rows);
    }

    /** ACTIVE deposits that mature within the next {@code days} days (business date), soonest first. */
    public ReportData maturitySummary(int days) {
        if (days < 1 || days > MAX_MATURITY_DAYS) throw new IllegalArgumentException("days must be between 1 and " + MAX_MATURITY_DAYS);
        LocalDate today = clock.today();
        List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT a.fd_account_no, a.customer_id, a.product_code, a.currency, a.principal_amount, a.interest_rate, "
                        + "a.maturity_date FROM fd_accounts a WHERE a.status='ACTIVE' AND a.maturity_date BETWEEN ? AND ? "
                        + "ORDER BY a.maturity_date, a.fd_account_no", today, today.plusDays(days));
        for (Map<String, Object> row : rows) {
            row.put("days_to_maturity", java.time.temporal.ChronoUnit.DAYS.between(today, toLocalDate(row.get("maturity_date"))));
        }
        return new ReportData("Maturing within " + days + " days (as of " + today + ")", MATURITY_COLUMNS, rows);
    }

    public ReportData interestHistory(String fdAccountNo) {
        List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT accrual_date, interest_amount, cumulative_interest, capitalized_flag AS capitalized, settlement_status "
                        + "FROM fd_interest_transactions WHERE fd_account_no=? ORDER BY accrual_date", fdAccountNo);
        return new ReportData("Interest history " + fdAccountNo, HISTORY_COLUMNS, rows);
    }

    public ReportData interestReport() {
        List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT txn_id, fd_account_no, amount, currency, txn_timestamp, remarks FROM fd_transactions "
                        + "WHERE txn_type='INTEREST' ORDER BY txn_timestamp, txn_id");
        return new ReportData("Posted interest transactions", INTEREST_REPORT_COLUMNS, rows);
    }

    public ReportData transactionReport() {
        List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT txn_id, fd_account_no, txn_type, amount, currency, status, txn_timestamp, remarks "
                        + "FROM fd_transactions ORDER BY txn_timestamp, txn_id");
        return new ReportData("FD transaction ledger", TRANSACTION_REPORT_COLUMNS, rows);
    }

    /** Account-level dump used by the nightly extract and the Python report. */
    public ReportData allAccounts() {
        List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT fd_account_no, customer_id, product_code, currency, principal_amount, interest_rate, tenure_months, "
                        + "status, maturity_date, accrued_interest FROM fd_accounts ORDER BY fd_account_no");
        return new ReportData("FD account extract", EXTRACT_COLUMNS, rows);
    }

    private static LocalDate toLocalDate(Object value) {
        return value instanceof LocalDate d ? d : ((java.sql.Date) value).toLocalDate();
    }

    public boolean accountExists(String fdAccountNo) {
        Integer n = jdbc.queryForObject("SELECT COUNT(*) FROM fd_accounts WHERE fd_account_no=?", Integer.class, fdAccountNo);
        return n != null && n > 0;
    }
}
