package com.example.fdmodule.service;

import com.example.fdmodule.client.AuthServiceClient;
import com.example.fdmodule.dto.*;
import com.example.fdmodule.entity.*;
import com.example.fdmodule.repository.*;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class FDAccountService {
    private final FixedDepositAccountRepository fdRepository;
    private final CustomerProfileRepository customerRepository;
    private final NomineeRepository nomineeRepository;
    private final BundleApplicationRepository bundleApplicationRepository;
    private final BundleItemRepository bundleItemRepository;
    private final ProductValidationService productValidationService;
    private final RateService rateService;
    private final AccountNumberGenerator accountNumberGenerator;
    @Lazy
    private final FDTransactionService fdTransactionService;
    private final FdCreatedPublisher createdPublisher;
    private final AuthServiceClient authServiceClient;

    public FDAccountService(FixedDepositAccountRepository fdRepository,
                            CustomerProfileRepository customerRepository,
                            NomineeRepository nomineeRepository,
                            BundleApplicationRepository bundleApplicationRepository,
                            BundleItemRepository bundleItemRepository,
                            ProductValidationService productValidationService,
                            RateService rateService,
                            AccountNumberGenerator accountNumberGenerator,
                            @Lazy FDTransactionService fdTransactionService,
                            FdCreatedPublisher createdPublisher,
                            AuthServiceClient authServiceClient) {
        this.fdRepository = fdRepository;
        this.customerRepository = customerRepository;
        this.nomineeRepository = nomineeRepository;
        this.bundleApplicationRepository = bundleApplicationRepository;
        this.bundleItemRepository = bundleItemRepository;
        this.productValidationService = productValidationService;
        this.rateService = rateService;
        this.accountNumberGenerator = accountNumberGenerator;
        this.fdTransactionService = fdTransactionService;
        this.createdPublisher = createdPublisher;
        this.authServiceClient = authServiceClient;
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

        ProductDTO product = productValidationService.validate(
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
        // Generate a proper customer_id (CUST + sequential number)
        // First, try to find existing customer profile by user_id with retry for timing issues
        Long userId = null;
        java.util.Optional<CustomerProfile> existingProfileOpt = java.util.Optional.empty();
        
        // Retry mechanism for auth service call (handles timing issues during OTP signup)
        for (int attempt = 0; attempt < 3; attempt++) {
            userId = authServiceClient.getUserIdByUsername(username);
            if (userId != null) {
                break;
            }
            if (attempt < 2) {
                try {
                    Thread.sleep(500); // Wait 500ms before retry
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
        
        if (userId == null) {
            System.err.println("CRITICAL ERROR: Could not fetch user_id from auth service for username: " + username + " after 3 retries. Cannot proceed with FD application.");
            throw new IllegalStateException("User authentication failed. Please try logging out and back in.");
        }
        
        existingProfileOpt = customerRepository.findByUserId(userId);
        
        String customerId;
        CustomerProfile profile;
        
        if (existingProfileOpt.isPresent()) {
            // Use existing customer profile
            CustomerProfile existingProfile = existingProfileOpt.get();
            customerId = existingProfile.getCustomerId();
            profile = existingProfile;
            // Update profile with latest info
            profile.setFullName(request.getApplicantFullName());
            profile.setPhone(request.getApplicantPhone());
            customerRepository.save(profile);
        } else {
            // Create new customer profile with generated customer_id
            String maxCustomerId = customerRepository.findMaxCustomerId();
            int nextNum = 1;
            if (maxCustomerId != null && maxCustomerId.startsWith("CUST")) {
                try {
                    nextNum = Integer.parseInt(maxCustomerId.substring(4)) + 1;
                } catch (NumberFormatException e) {
                    nextNum = 1;
                }
            }
            customerId = String.format("CUST%06d", nextNum);
            
            CustomerProfile newProfile = new CustomerProfile();
            newProfile.setCustomerId(customerId);
            newProfile.setUserId(userId); // userId is guaranteed non-null here
            newProfile.setFullName(request.getApplicantFullName());
            newProfile.setPhone(request.getApplicantPhone());
            newProfile.setCategory("GENERAL");
            profile = customerRepository.save(newProfile);
            
            System.out.println("Created new customer profile: customerId=" + customerId + ", userId=" + userId + ", username=" + username);
        }

        int termMonthsInt = Integer.parseInt(request.getTermMonths());
        ProductDTO product = productValidationService.validate(
                request.getProductCode(), termMonthsInt, request.getPrincipalAmount());

        var rate = rateService.determineFinalRate(
                request.getProductCode(), customerId,
                termMonthsInt, request.getPrincipalAmount());

        String accountNo = accountNumberGenerator.generate("DEFAULT");

        FixedDepositAccount fd = new FixedDepositAccount();
        fd.setFdAccountNo(accountNo);
        fd.setCustomerId(customerId);
        fd.setProductCode(request.getProductCode());
        fd.setCurrency(product.getCurrency());
        fd.setPrincipalAmount(request.getPrincipalAmount());
        fd.setInterestRate(rate);
        fd.setTenureMonths(termMonthsInt);
        fd.setCompoundingFrequency(product.getCompoundingFrequency());
        fd.setStatus("PENDING");
        fd.setApprovalStatus("PENDING_APPROVAL");
        fd.setApplicantFullName(request.getApplicantFullName());
        fd.setApplicantFirstName(request.getApplicantFirstName());
        fd.setApplicantMiddleName(request.getApplicantMiddleName());
        fd.setApplicantLastName(request.getApplicantLastName());
        fd.setApplicantAge(request.getApplicantAge());
        fd.setApplicantGender(request.getApplicantGender());
        fd.setApplicantOccupation(request.getApplicantOccupation());
        fd.setApplicantAnnualIncome(request.getApplicantAnnualIncome());
        fd.setApplicantAddress(request.getApplicantAddress());
        fd.setApplicantCity(request.getApplicantCity());
        fd.setApplicantState(request.getApplicantState());
        fd.setApplicantPincode(request.getApplicantPincode());
        fd.setApplicantNationality(request.getApplicantNationality());
        fd.setApplicantMaritalStatus(request.getApplicantMaritalStatus());
        fd.setApplicantEmail(request.getApplicantEmail());
        fd.setApplicantPhone(request.getApplicantPhone());
        fd.setApplicantPan(request.getApplicantPan());
        fd.setApplicantAccountNumber(request.getApplicantAccountNumber());
        fd.setApplicantIfsc(request.getApplicantIfsc());
        fd.setMaturityDate(today().plusMonths(termMonthsInt));
        fd.setCreatedAt(today().atTime(java.time.LocalTime.now(java.time.ZoneId.of("Asia/Kolkata"))));
        fd.setCreatedBy(username);

        // Persist the parent before inserting nominees with an account foreign key.
        fdRepository.saveAndFlush(fd);

        // Handle nominees - support both new array format and legacy single nominee
        if (request.getNominees() != null && !request.getNominees().isEmpty()) {
            // Use new multiple nominees format
            for (FDApplicationRequest.NomineeDTO nomineeDto : request.getNominees()) {
                Nominee nominee = new Nominee();
                nominee.setFdAccountNo(accountNo);
                nominee.setNomineeName(nomineeDto.getName());
                nominee.setNomineeRelation(nomineeDto.getRelation());
                nomineeRepository.save(nominee);
            }
            // Set first nominee name in legacy fields for backward compatibility
            fd.setNomineeName(request.getNominees().get(0).getName());
            fd.setNomineeRelation(request.getNominees().get(0).getRelation());
        } else if (request.getNomineeName() != null && !request.getNomineeName().isEmpty()) {
            // Use legacy single nominee format
            fd.setNomineeName(request.getNomineeName());
            fd.setNomineeRelation(request.getNomineeRelation());
            // Also save as a nominee record for consistency
            Nominee nominee = new Nominee();
            nominee.setFdAccountNo(accountNo);
            nominee.setNomineeName(request.getNomineeName());
            nominee.setNomineeRelation(request.getNomineeRelation());
            nomineeRepository.save(nominee);
        }

        FixedDepositAccount saved = fdRepository.save(fd);
        if (createdPublisher != null) createdPublisher.publishStatus(saved, username);

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

        // Require rejection reason when action is REJECT
        if ("REJECT".equalsIgnoreCase(request.getAction()) && 
            (request.getRejectionReason() == null || request.getRejectionReason().trim().isEmpty())) {
            throw new IllegalArgumentException("Rejection reason is required when action is REJECT");
        }

        LocalDateTime now = today().atTime(java.time.LocalTime.now(java.time.ZoneId.of("Asia/Kolkata")));
        fd.setApprovedBy(approvedBy);
        fd.setApprovedAt(now);

        if ("APPROVE".equalsIgnoreCase(request.getAction())) {
            fd.setStatus("ACTIVE");
            fd.setApprovalStatus("APPROVED");
            // Set maturity date from approval date, not application date
            fd.setMaturityDate(today().plusMonths(fd.getTenureMonths()));
            fd.setCreatedAt(now);

            // Record the initial deposit transaction and publish FdCreated event
            fdRepository.flush();
            fdTransactionService.recordInitialDeposit(fd, approvedBy);
            if (createdPublisher != null) {
                createdPublisher.publish(fd, approvedBy);
            }
        } else if ("REJECT".equalsIgnoreCase(request.getAction())) {
            fd.setStatus("REJECTED");
            fd.setApprovalStatus("REJECTED");
            fd.setRejectionReason(request.getRejectionReason());
            if (createdPublisher != null) createdPublisher.publishStatus(fd, approvedBy);
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
        // Get user_id from auth-service with retry - NO FALLBACK to username
        Long userId = null;
        for (int attempt = 0; attempt < 3; attempt++) {
            userId = authServiceClient.getUserIdByUsername(username);
            if (userId != null) break;
            if (attempt < 2) {
                try {
                    Thread.sleep(500);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
        
        System.out.println("getCustomerApplications - username: " + username + ", userId from auth: " + userId);

        if (userId == null) {
            System.err.println("CRITICAL: User ID not found in auth-service for username: " + username + ". User session is invalid.");
            throw new IllegalStateException("User session invalid. Please log out and log in again. User ID synchronization failed.");
        }

        // Look up customerId from CustomerProfile using user_id
        Optional<CustomerProfile> profileOpt = customerRepository.findByUserId(userId);
        if (profileOpt.isEmpty()) {
            System.err.println("getCustomerApplications - no profile found for userId: " + userId);
            // This is OK for new users who haven't applied for FD yet
            return List.of();
        }

        String customerId = profileOpt.get().getCustomerId();
        System.out.println("getCustomerApplications - found customerId: " + customerId);
        List<FixedDepositAccount> accounts = fdRepository.findByCustomerId(customerId);
        System.out.println("getCustomerApplications - found " + accounts.size() + " accounts for customerId: " + customerId);
        
        // Additional safety check: verify all accounts belong to this customer
        for (FixedDepositAccount account : accounts) {
            if (!customerId.equals(account.getCustomerId())) {
                System.err.println("SECURITY WARNING: Account " + account.getFdAccountNo() + 
                    " has customerId " + account.getCustomerId() + " but expected " + customerId);
            }
        }
        
        return accounts;
    }

    @Transactional(readOnly = true)
    public List<FixedDepositAccount> getAllApplications() {
        return fdRepository.findAll();
    }

    @Transactional(readOnly = true)
    public FixedDepositAccount getById(String accountNo) {
        return fdRepository.findById(accountNo)
                .orElseThrow(() -> new IllegalArgumentException("FD account not found: " + accountNo));
    }

    @Transactional
    public BundleApplicationResponse applyForBundle(BundleApplicationRequest request, String username) {
        // Get user_id from auth-service - NO FALLBACK to username
        Long userId = authServiceClient.getUserIdByUsername(username);
        if (userId == null) {
            System.err.println("CRITICAL: User ID not found in auth-service for username: " + username + ". User session is invalid.");
            throw new IllegalStateException("User session invalid. Please log out and log in again. User ID synchronization failed.");
        }

        // Look up customerId from CustomerProfile using user_id
        Optional<CustomerProfile> profileOpt = customerRepository.findByUserId(userId);
        String customerId;
        
        if (profileOpt.isPresent()) {
            customerId = profileOpt.get().getCustomerId();
        } else {
            // Create new customer profile with generated customer_id
            String maxCustomerId = customerRepository.findMaxCustomerId();
            int nextNum = 1;
            if (maxCustomerId != null && maxCustomerId.startsWith("CUST")) {
                try {
                    nextNum = Integer.parseInt(maxCustomerId.substring(4)) + 1;
                } catch (NumberFormatException e) {
                    nextNum = 1;
                }
            }
            customerId = String.format("CUST%06d", nextNum);
            
            CustomerProfile newProfile = new CustomerProfile();
            newProfile.setCustomerId(customerId);
            newProfile.setUserId(userId);
            newProfile.setFullName(request.getFdItems().get(0).getApplicantFirstName() + " " +
                                   request.getFdItems().get(0).getApplicantLastName());
            newProfile.setPhone(request.getFdItems().get(0).getApplicantPhone());
            newProfile.setCategory("GENERAL");
            customerRepository.save(newProfile);
            
            System.out.println("Created customer profile for bundle: customerId=" + customerId + ", userId=" + userId);
        }

        // Generate bundle ID
        String bundleId = "BNDL" + System.currentTimeMillis();

        // Create bundle application record
        BundleApplication bundle = new BundleApplication();
        bundle.setBundleId(bundleId);
        bundle.setCustomerId(customerId);
        bundle.setBundleName(request.getBundleName());
        bundle.setBundleDescription(request.getBundleDescription());
        bundle.setTotalAmount(request.getTotalAmount());
        bundle.setEstimatedReturn(request.getEstimatedReturn());
        bundle.setStatus("PENDING");
        bundle.setApprovalStatus("PENDING_APPROVAL");
        bundle.setCreatedAt(today().atTime(java.time.LocalTime.now(java.time.ZoneId.of("Asia/Kolkata"))));
        bundleApplicationRepository.save(bundle);

        // Create individual FD accounts for each item in the bundle
        List<BundleApplicationResponse.FDItemSummary> fdSummaries = new java.util.ArrayList<>();
        int sequenceOrder = 1;

        for (BundleApplicationRequest.BundleFDItem item : request.getFdItems()) {
            int termMonthsInt = item.getTenureMonths();
            ProductDTO product = productValidationService.validate(
                    item.getProductCode(), termMonthsInt, item.getPrincipalAmount());

            java.math.BigDecimal rate;
            try {
                rate = rateService.determineFinalRate(
                        item.getProductCode(), customerId,
                        termMonthsInt, item.getPrincipalAmount());
            } catch (Exception e) {
                // Fallback to product's max rate if rate service fails
                System.err.println("Rate service failed for bundle item, using fallback: " + e.getMessage());
                rate = product.getMaxRate() != null ? product.getMaxRate() : new java.math.BigDecimal("7.0");
            }

            String accountNo = accountNumberGenerator.generate("DEFAULT");

            FixedDepositAccount fd = new FixedDepositAccount();
            fd.setFdAccountNo(accountNo);
            fd.setCustomerId(customerId);
            fd.setBundleId(bundleId);
            fd.setBundleName(request.getBundleName());
            // Truncate product code to max 10 characters to fit database constraint
            String truncatedProductCode = item.getProductCode() != null && item.getProductCode().length() > 10
                    ? item.getProductCode().substring(0, 10)
                    : item.getProductCode();
            fd.setProductCode(truncatedProductCode);
            fd.setCurrency(product.getCurrency());
            fd.setPrincipalAmount(item.getPrincipalAmount());
            fd.setInterestRate(new java.math.BigDecimal(rate.toString()));
            fd.setTenureMonths(termMonthsInt);
            fd.setCompoundingFrequency(product.getCompoundingFrequency());
            fd.setStatus("PENDING");
            fd.setApprovalStatus("PENDING_APPROVAL");
            
            // Set applicant details
            fd.setApplicantFirstName(item.getApplicantFirstName());
            fd.setApplicantMiddleName(item.getApplicantMiddleName());
            fd.setApplicantLastName(item.getApplicantLastName());
            fd.setApplicantAge(item.getApplicantAge());
            fd.setApplicantGender(item.getApplicantGender());
            fd.setApplicantOccupation(item.getApplicantOccupation());
            fd.setApplicantAnnualIncome(item.getApplicantAnnualIncome());
            fd.setApplicantAddress(item.getApplicantAddress());
            fd.setApplicantCity(item.getApplicantCity());
            fd.setApplicantState(item.getApplicantState());
            fd.setApplicantPincode(item.getApplicantPincode());
            fd.setApplicantNationality(item.getApplicantNationality());
            fd.setApplicantMaritalStatus(item.getApplicantMaritalStatus());
            fd.setApplicantEmail(item.getApplicantEmail());
            fd.setApplicantPhone(item.getApplicantPhone());
            fd.setApplicantPan(item.getApplicantPan());
            fd.setApplicantAccountNumber(item.getApplicantAccountNumber());
            fd.setApplicantIfsc(item.getApplicantIfsc());
            fd.setNomineeName(item.getNomineeName());
            fd.setNomineeRelation(item.getNomineeRelation());
            
            fd.setMaturityDate(today().plusMonths(termMonthsInt));
            fd.setCreatedAt(today().atTime(java.time.LocalTime.now(java.time.ZoneId.of("Asia/Kolkata"))));
            fd.setCreatedBy(username);

            fdRepository.saveAndFlush(fd);

            if (createdPublisher != null) createdPublisher.publishStatus(fd, username);

            // Create bundle item record
            BundleItem bundleItem = new BundleItem();
            bundleItem.setBundleId(bundleId);
            bundleItem.setFdAccountNo(accountNo);
            bundleItem.setSequenceOrder(sequenceOrder++);
            bundleItemRepository.save(bundleItem);

            // Add to summary
            fdSummaries.add(new BundleApplicationResponse.FDItemSummary(
                    accountNo, item.getProductCode(), item.getPrincipalAmount(),
                    termMonthsInt, "PENDING", "PENDING_APPROVAL"));
        }

        // Build response
        BundleApplicationResponse response = new BundleApplicationResponse();
        response.setBundleId(bundleId);
        response.setCustomerId(customerId);
        response.setBundleName(request.getBundleName());
        response.setBundleDescription(request.getBundleDescription());
        response.setTotalAmount(request.getTotalAmount());
        response.setEstimatedReturn(request.getEstimatedReturn());
        response.setStatus("PENDING");
        response.setApprovalStatus("PENDING_APPROVAL");
        response.setCreatedAt(bundle.getCreatedAt());
        response.setFdItems(fdSummaries);

        return response;
    }

    @Transactional
    public void approveOrRejectBundle(String bundleId, String action, String rejectionReason, String approvedBy) {
        BundleApplication bundle = bundleApplicationRepository.findById(bundleId)
                .orElseThrow(() -> new IllegalArgumentException("Bundle not found: " + bundleId));

        if (!"PENDING_APPROVAL".equals(bundle.getApprovalStatus())) {
            throw new IllegalArgumentException("Bundle is not in pending approval status");
        }

        if ("REJECT".equalsIgnoreCase(action) && 
            (rejectionReason == null || rejectionReason.trim().isEmpty())) {
            throw new IllegalArgumentException("Rejection reason is required when action is REJECT");
        }

        LocalDateTime now = today().atTime(java.time.LocalTime.now(java.time.ZoneId.of("Asia/Kolkata")));
        bundle.setApprovedBy(approvedBy);
        bundle.setApprovedAt(now);

        if ("APPROVE".equalsIgnoreCase(action)) {
            bundle.setStatus("ACTIVE");
            bundle.setApprovalStatus("APPROVED");
        } else if ("REJECT".equalsIgnoreCase(action)) {
            bundle.setStatus("REJECTED");
            bundle.setApprovalStatus("REJECTED");
            bundle.setRejectionReason(rejectionReason);
        } else {
            throw new IllegalArgumentException("Invalid action. Must be APPROVE or REJECT");
        }

        bundleApplicationRepository.save(bundle);

        // Update all FD accounts in the bundle
        List<BundleItem> bundleItems = bundleItemRepository.findByBundleId(bundleId);
        for (BundleItem item : bundleItems) {
            FixedDepositAccount fd = fdRepository.findById(item.getFdAccountNo())
                    .orElseThrow(() -> new IllegalArgumentException("FD account not found: " + item.getFdAccountNo()));

            fd.setApprovedBy(approvedBy);
            fd.setApprovedAt(now);

            if ("APPROVE".equalsIgnoreCase(action)) {
                fd.setStatus("ACTIVE");
                fd.setApprovalStatus("APPROVED");
                fd.setMaturityDate(today().plusMonths(fd.getTenureMonths()));
                fd.setCreatedAt(now);

                // Record the initial deposit transaction and publish FdCreated event
                fdRepository.flush();
                fdTransactionService.recordInitialDeposit(fd, approvedBy);
                if (createdPublisher != null) {
                    createdPublisher.publish(fd, approvedBy);
                }
            } else if ("REJECT".equalsIgnoreCase(action)) {
                fd.setStatus("REJECTED");
                fd.setApprovalStatus("REJECTED");
                fd.setRejectionReason(rejectionReason);
                if (createdPublisher != null) createdPublisher.publishStatus(fd, approvedBy);
            }

            fdRepository.save(fd);
        }
    }

    @Transactional(readOnly = true)
    public List<BundleApplication> getPendingBundles() {
        return bundleApplicationRepository.findByApprovalStatus("PENDING_APPROVAL");
    }

    @Transactional(readOnly = true)
    public List<BundleApplication> getCustomerBundles(String username) {
        // Get user_id from auth-service - NO FALLBACK
        Long userId = authServiceClient.getUserIdByUsername(username);
        if (userId == null) {
            System.err.println("CRITICAL: User ID not found in auth-service for username: " + username + ". User session is invalid.");
            throw new IllegalStateException("User session invalid. Please log out and log in again. User ID synchronization failed.");
        }

        // Look up customerId from CustomerProfile using user_id
        Optional<CustomerProfile> profileOpt = customerRepository.findByUserId(userId);
        if (profileOpt.isEmpty()) {
            // This is OK for new users who haven't applied for bundles yet
            return List.of();
        }

        return bundleApplicationRepository.findByCustomerId(profileOpt.get().getCustomerId());
    }

    @Transactional
    public void withdrawApplication(String fdAccountNo, String username) {
        FixedDepositAccount fd = fdRepository.findById(fdAccountNo)
                .orElseThrow(() -> new IllegalArgumentException("FD account not found: " + fdAccountNo));

        if (!username.equals(fd.getCustomerId())) {
            throw new IllegalArgumentException("You can only withdraw your own applications");
        }

        if (!"PENDING".equals(fd.getStatus()) && !"PENDING_APPROVAL".equals(fd.getApprovalStatus())) {
            throw new IllegalArgumentException("Only pending applications can be withdrawn");
        }

        fd.setStatus("REJECTED");
        fd.setApprovalStatus("REJECTED");
        fd.setRejectionReason("Withdrawn by customer");
        if (createdPublisher != null) createdPublisher.publishStatus(fd, username);
        fdRepository.save(fd);
    }
}
