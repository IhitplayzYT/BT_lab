package com.example.fdmodule.security;

import com.example.fdmodule.client.AuthServiceClient;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

/**
 * Who may touch which FD. Staff (BANK_OFFICER, ADMIN) may use any FD. A CUSTOMER may only use FDs that belong to the
 * customer profile linked to their login (auth-service users -> customer_profile.user_id -> fd_accounts.customer_id).
 * The login name is the same for both ways of logging in (Basic user name, or the token's "sub"), so one rule covers both.
 * A customer asking about someone else's FD, or an FD that does not exist, gets the same 403, so account numbers cannot be probed.
 */
@Component
public class AccountAccess {
    private final JdbcTemplate jdbc;
    private final AuthServiceClient authServiceClient;

    public AccountAccess(JdbcTemplate jdbc, AuthServiceClient authServiceClient) {
        this.jdbc = jdbc;
        this.authServiceClient = authServiceClient;
    }

    public static boolean isStaff(Authentication auth) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_BANK_OFFICER") || a.getAuthority().equals("ROLE_ADMIN"));
    }

    public void requireAccess(Authentication auth, String fdAccountNo) {
        if (isStaff(auth)) return;
        if (!owns(auth.getName(), fdAccountNo)) throw new AccessDeniedException("This FD account does not belong to you");
    }

    boolean owns(String username, String fdAccountNo) {
        // Get user_id from auth-service
        Long userId = authServiceClient.getUserIdByUsername(username);
        if (userId == null) {
            return false;
        }
        // Check if FD belongs to customer profile with this user_id
        Integer n = jdbc.queryForObject("SELECT COUNT(*) FROM fd_accounts a JOIN customer_profile c ON c.customer_id=a.customer_id "
                + "WHERE c.user_id=? AND a.fd_account_no=?", Integer.class, userId, fdAccountNo);
        return n != null && n > 0;
    }
}
