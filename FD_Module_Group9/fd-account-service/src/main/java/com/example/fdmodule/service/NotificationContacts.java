package com.example.fdmodule.service;

import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;

/** Include account-specific contacts on every event, including for pre-existing FDs. */
public final class NotificationContacts {
    private NotificationContacts() { }
    public static void enrich(JdbcTemplate jdbc, String account, Map<String, Object> data) {
        jdbc.queryForList("SELECT COALESCE(NULLIF(a.applicant_full_name,''),c.full_name) AS customerName, "
                + "COALESCE(NULLIF(a.applicant_email,''),u.email) AS email, "
                + "COALESCE(NULLIF(a.applicant_phone,''),c.phone) AS phone "
                + "FROM fd_accounts a LEFT JOIN customer_profile c ON c.customer_id=a.customer_id "
                + "LEFT JOIN users u ON u.id=c.user_id WHERE a.fd_account_no=?", account)
                .stream().findFirst().ifPresent(data::putAll);
    }
}
