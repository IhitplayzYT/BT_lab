package com.example.fdmodule.service;

import com.example.fdmodule.client.AuthServiceClient;
import com.example.fdmodule.entity.CustomerProfile;
import com.example.fdmodule.entity.FixedDepositAccount;
import com.example.fdmodule.maturity.MaturityService;
import com.example.fdmodule.repository.CustomerProfileRepository;
import com.example.fdmodule.repository.FixedDepositAccountRepository;
import com.example.fdmodule.withdrawal.WithdrawalService;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/** Removes a deleted login's ownership link while retaining its financial audit trail. */
@Service
public class UserDataCleanupService {
    private static final String ACCOUNT_DELETION_ACTOR = "ACCOUNT_DELETION";

    private final JdbcTemplate jdbc;
    private final AuthServiceClient authServiceClient;
    private final CustomerProfileRepository customerRepository;
    private final FixedDepositAccountRepository fdRepository;
    private final MaturityService maturityService;
    private final WithdrawalService withdrawalService;
    private final com.example.fdmodule.clock.BusinessClock clock;

    public UserDataCleanupService(JdbcTemplate jdbc,
                                  AuthServiceClient authServiceClient,
                                  CustomerProfileRepository customerRepository,
                                  FixedDepositAccountRepository fdRepository,
                                  MaturityService maturityService,
                                  WithdrawalService withdrawalService,
                                  com.example.fdmodule.clock.BusinessClock clock) {
        this.jdbc = jdbc;
        this.authServiceClient = authServiceClient;
        this.customerRepository = customerRepository;
        this.fdRepository = fdRepository;
        this.maturityService = maturityService;
        this.withdrawalService = withdrawalService;
        this.clock = clock;
    }

    @Transactional
    public void detach(String username) {
        // Auth owns the canonical user ID. The account service's local users table is not
        // synchronized reliably and must never be used to decide whose contracts to close.
        Long userId = authServiceClient.getUserIdByUsername(username);
        if (userId == null) {
            throw new IllegalStateException("Could not resolve the auth user before account cleanup");
        }

        List<CustomerProfile> profiles = customerRepository.findAllByUserId(userId);
        List<String> customerIds = profiles.stream()
                .map(CustomerProfile::getCustomerId)
                .distinct()
                .toList();

        if (!customerIds.isEmpty()) {
            List<FixedDepositAccount> accounts = fdRepository.findByCustomerIdIn(customerIds);
            LocalDate businessDate = clock.today();
            for (FixedDepositAccount account : accounts) {
                String status = account.getStatus() == null ? "" : account.getStatus().toUpperCase();
                String approval = account.getApprovalStatus() == null ? "" : account.getApprovalStatus().toUpperCase();

                if ("PENDING".equals(status) || "PENDING_APPROVAL".equals(approval)) {
                    jdbc.update("UPDATE fd_accounts SET status='WITHDRAWN', approval_status='WITHDRAWN', " +
                                    "rejection_reason='Withdrawn because the customer account was deleted', " +
                                    "modified_at=CURRENT_TIMESTAMP WHERE fd_account_no=?",
                            account.getFdAccountNo());
                } else if ("ACTIVE".equals(status)) {
                    if (account.getMaturityDate() == null) {
                        throw new IllegalStateException("Cannot settle FD without a maturity date: " + account.getFdAccountNo());
                    }
                    if (!account.getMaturityDate().isAfter(businessDate)) {
                        maturityService.matureAccount(account.getFdAccountNo(), businessDate, ACCOUNT_DELETION_ACTOR);
                    } else {
                        // A future-dated FD cannot be labeled matured without an invalid payout.
                        // Close it through the normal early-withdrawal ledger and penalty path.
                        withdrawalService.withdraw(account.getFdAccountNo(),
                                "Customer account deleted", ACCOUNT_DELETION_ACTOR);
                    }
                }
            }

            jdbc.update("UPDATE bundle_applications SET status='WITHDRAWN', approval_status='WITHDRAWN', " +
                            "rejection_reason='Withdrawn because the customer account was deleted', " +
                            "modified_at=CURRENT_TIMESTAMP WHERE customer_id IN (" +
                            String.join(",", java.util.Collections.nCopies(customerIds.size(), "?")) +
                            ") AND (status='PENDING' OR approval_status='PENDING_APPROVAL')",
                    customerIds.toArray());

            // Keep profile and account rows for statements/audit, but sever the deleted login link.
            profiles.forEach(profile -> profile.setUserId(null));
            customerRepository.saveAll(profiles);
        }

        // Remove any legacy local mirror row. The canonical auth user is deleted by auth-service
        // only after this method completes successfully.
        jdbc.update("DELETE FROM users WHERE username=?", username);
    }

    @Transactional
    public void syncCustomerProfile(String username, String email, Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("Auth user ID is required to sync a customer profile");
        }
        if (!customerRepository.findAllByUserId(userId).isEmpty()) {
            return;
        }

        CustomerProfile profile = new CustomerProfile();
        profile.setCustomerId(customerRepository.nextCustomerId());
        profile.setUserId(userId);
        profile.setFullName(username);
        profile.setCategory("GENERAL");
        customerRepository.save(profile);
    }
}
