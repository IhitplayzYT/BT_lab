package com.example.fdmodule.withdrawal;

import com.example.fdmodule.entity.FixedDepositAccount;
import com.example.fdmodule.security.AccountAccess;
import com.example.fdmodule.service.FDAccountService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Swagger getWithdrawalInquiry / performEarlyWithdrawal, under the team's /api/fd/account prefix. */
@RestController
@RequestMapping("/api/fd/account")
public class WithdrawalController {

    /** Swagger FD_EarlyWithdrawlRequest (sic). */
    public record EarlyWithdrawalRequest(String reason) {
    }

    private final WithdrawalService service;
    private final FDAccountService accounts;
    private final AccountAccess access;

    public WithdrawalController(WithdrawalService service, FDAccountService accounts, AccountAccess access) {
        this.service = service;
        this.accounts = accounts;
        this.access = access;
    }

    // A CUSTOMER may only inquire about / withdraw from their own FD (AccountAccess); staff may act on any FD.
    @GetMapping("/{fdAccountNo}/withdrawal-inquiry")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN','CUSTOMER')")
    public WithdrawalService.Inquiry inquiry(@PathVariable String fdAccountNo, Authentication auth) {
        access.requireAccess(auth, fdAccountNo);
        return service.inquire(fdAccountNo, auth.getName());
    }

    @PostMapping("/{fdAccountNo}/withdrawal")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN','CUSTOMER')")
    public FixedDepositAccount withdraw(@PathVariable String fdAccountNo,
                                        @RequestBody(required = false) EarlyWithdrawalRequest request,
                                        Authentication auth) {
        access.requireAccess(auth, fdAccountNo);
        service.withdraw(fdAccountNo, request == null ? null : request.reason(), auth.getName());
        return accounts.getById(fdAccountNo);
    }
}
