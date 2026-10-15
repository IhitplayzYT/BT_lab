package com.example.fdmodule.service;

import com.example.fdmodule.dto.*;
import com.example.fdmodule.entity.FixedDepositAccount;
import com.example.fdmodule.entity.Product;
import com.example.fdmodule.repository.CustomerProfileRepository;
import com.example.fdmodule.repository.FixedDepositAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class FDAccountService {
    private final FixedDepositAccountRepository fdRepository;
    private final CustomerProfileRepository customerRepository;
    private final ProductValidationService productValidationService;
    private final RateService rateService;
    private final AccountNumberGenerator accountNumberGenerator;

    public FDAccountService(FixedDepositAccountRepository fdRepository,
                            CustomerProfileRepository customerRepository,
                            ProductValidationService productValidationService,
                            RateService rateService,
                            AccountNumberGenerator accountNumberGenerator) {
        this.fdRepository = fdRepository;
        this.customerRepository = customerRepository;
        this.productValidationService = productValidationService;
        this.rateService = rateService;
        this.accountNumberGenerator = accountNumberGenerator;
    }

    private com.example.fdmodule.clock.BusinessClock clock;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    void setClock(com.example.fdmodule.clock.BusinessClock clock) {
        this.clock = clock;
    }

    private LocalDate today() {
        return clock != null ? clock.today() : LocalDate.now();
    }

    @Transactional
    public FDAccountResponse create(FDAccountRequest request, String createdBy) {
        if (!customerRepository.existsById(request.getCustomerId())) {
            throw new IllegalArgumentException("Customer does not exist: " + request.getCustomerId());
        }

        Product product = productValidationService.validate(
                request.getProductCode(), request.getTermMonths(), request.getPrincipalAmount());

        var rate = rateService.determineFinalRate(
                request.getProductCode(), request.getCustomerId(),
                request.getTermMonths(), request.getPrincipalAmount());

        String accountNo = accountNumberGenerator.generate(request.getBranchCode());

        FixedDepositAccount fd = new FixedDepositAccount();
        fd.setFdAccountNo(accountNo);
        fd.setCustomerId(request.getCustomerId());
        fd.setProductCode(request.getProductCode());
        fd.setCurrency(product.getCurrency());
        fd.setPrincipalAmount(request.getPrincipalAmount());
        fd.setInterestRate(rate);
        fd.setTenureMonths(request.getTermMonths());
        fd.setCompoundingFrequency(product.getCompoundingFrequency());
        fd.setStatus("ACTIVE");
        fd.setApprovalStatus("APPROVED");
        fd.setApprovedBy(createdBy);
        fd.setApprovedAt(today().atTime(java.time.LocalTime.now(java.time.ZoneId.of("Asia/Kolkata"))));
        fd.setMaturityDate(today().plusMonths(request.getTermMonths()));
        fd.setCreatedAt(today().atTime(java.time.LocalTime.now(java.time.ZoneId.of("Asia/Kolkata"))));
        fd.setCreatedBy(createdBy);

        FixedDepositAccount saved = fdRepository.save(fd);

        return new FDAccountResponse(
                saved.getFdAccountNo(), saved.getCustomerId(), saved.getProductCode(),
                saved.getPrincipalAmount(), saved.getInterestRate(), saved.getTenureMonths(),
                saved.getMaturityDate(), saved.getStatus(), saved.getCreatedBy());
    }

    @Transactional
    public FDApplicationResponse applyForFD(FDApplicationRequest request, String username) {
        // For demo purposes, use customer1 as the customer ID
        // In production, this should come from the auth service JWT token
        String customerId = "CUST001";

        Product product = productValidationService.validate(
                request.getProductCode(), request.getTermMonths(), request.getPrincipalAmount());

        var rate = rateService.determineFinalRate(
                request.getProductCode(), customerId,
                request.getTermMonths(), request.getPrincipalAmount());

        String accountNo = accountNumberGenerator.generate("DEFAULT");

        FixedDepositAccount fd = new FixedDepositAccount();
        fd.setFdAccountNo(accountNo);
        fd.setCustomerId(customerId);
        fd.setProductCode(request.getProductCode());
        fd.setCurrency(product.getCurrency());
        fd.setPrincipalAmount(request.getPrincipalAmount());
        fd.setInterestRate(rate);
        fd.setTenureMonths(request.getTermMonths());
        fd.setCompoundingFrequency(product.getCompoundingFrequency());
        fd.setStatus("PENDING");
        fd.setApprovalStatus("PENDING_APPROVAL");
        fd.setMaturityDate(today().plusMonths(request.getTermMonths()));
        fd.setCreatedAt(today().atTime(java.time.LocalTime.now(java.time.ZoneId.of("Asia/Kolkata"))));
        fd.setCreatedBy(username);

        FixedDepositAccount saved = fdRepository.save(fd);

        return new FDApplicationResponse(
                saved.getFdAccountNo(), saved.getCustomerId(), saved.getProductCode(),
                saved.getPrincipalAmount().toString(), saved.getInterestRate().toString(),
                saved.getTenureMonths(), saved.getMaturityDate().toString(),
                saved.getStatus(), saved.getApprovalStatus(), saved.getCreatedAt().toString());
    }

    @Transactional
    public void approveOrRejectFD(FDApprovalRequest request, String approvedBy) {
        FixedDepositAccount fd = fdRepository.findById(request.getFdAccountNo())
                .orElseThrow(() -> new IllegalArgumentException("FD account not found: " + request.getFdAccountNo()));

        if (!"PENDING_APPROVAL".equals(fd.getApprovalStatus())) {
            throw new IllegalArgumentException("FD is not in pending approval status");
        }

        if ("APPROVE".equalsIgnoreCase(request.getAction())) {
            fd.setStatus("ACTIVE");
            fd.setApprovalStatus("APPROVED");
            fd.setApprovedBy(approvedBy);
            fd.setApprovedAt(today().atTime(java.time.LocalTime.now(java.time.ZoneId.of("Asia/Kolkata"))));
        } else if ("REJECT".equalsIgnoreCase(request.getAction())) {
            fd.setStatus("REJECTED");
            fd.setApprovalStatus("REJECTED");
            fd.setApprovedBy(approvedBy);
            fd.setApprovedAt(today().atTime(java.time.LocalTime.now(java.time.ZoneId.of("Asia/Kolkata"))));
            fd.setRejectionReason(request.getRejectionReason());
        } else {
            throw new IllegalArgumentException("Invalid action. Must be APPROVE or REJECT");
        }

        fdRepository.save(fd);
    }

    @Transactional(readOnly = true)
    public List<FixedDepositAccount> getPendingApplications() {
        return fdRepository.findByApprovalStatus("PENDING_APPROVAL");
    }

    @Transactional(readOnly = true)
    public List<FixedDepositAccount> getCustomerApplications(String username) {
        // For demo purposes, use customer1 as the customer ID
        // In production, this should come from the auth service JWT token
        String customerId = "CUST001";
        return fdRepository.findByCustomerId(customerId);
    }

    @Transactional(readOnly = true)
    public FixedDepositAccount getById(String accountNo) {
        return fdRepository.findById(accountNo)
                .orElseThrow(() -> new IllegalArgumentException("FD account not found: " + accountNo));
    }
}
