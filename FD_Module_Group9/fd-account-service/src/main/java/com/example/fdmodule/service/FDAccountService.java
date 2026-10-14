package com.example.fdmodule.service;

import com.example.fdmodule.dto.FDAccountRequest;
import com.example.fdmodule.dto.FDAccountResponse;
import com.example.fdmodule.entity.FixedDepositAccount;
import com.example.fdmodule.entity.Product;
import com.example.fdmodule.repository.CustomerProfileRepository;
import com.example.fdmodule.repository.FixedDepositAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

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
        fd.setMaturityDate(today().plusMonths(request.getTermMonths()));
        // Opening date follows the business clock too, so interest accrual starts on the same day.
        fd.setCreatedAt(today().atTime(java.time.LocalTime.now(java.time.ZoneId.of("Asia/Kolkata"))));
        fd.setCreatedBy(createdBy);

        FixedDepositAccount saved = fdRepository.save(fd);

        return new FDAccountResponse(
                saved.getFdAccountNo(), saved.getCustomerId(), saved.getProductCode(),
                saved.getPrincipalAmount(), saved.getInterestRate(), saved.getTenureMonths(),
                saved.getMaturityDate(), saved.getStatus(), saved.getCreatedBy());
    }

    @Transactional(readOnly = true)
    public FixedDepositAccount getById(String accountNo) {
        return fdRepository.findById(accountNo)
                .orElseThrow(() -> new IllegalArgumentException("FD account not found: " + accountNo));
    }
}
