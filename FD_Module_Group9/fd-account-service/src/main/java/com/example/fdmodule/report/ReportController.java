package com.example.fdmodule.report;

import com.example.fdmodule.clock.BusinessClock;
import com.example.fdmodule.security.AccountAccess;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Map;
import java.util.Set;

/**
 * Lab L21 reports. Staff (BANK_OFFICER, ADMIN) see bank-wide reports; a CUSTOMER only ever sees their own data.
 * Every report accepts format=json (default), csv, pdf or xlsx.
 */
@RestController
@RequestMapping("/api/report")
public class ReportController {
    private static final Set<String> STATUSES = Set.of("ACTIVE", "MATURED", "PREMATURELY_CLOSED", "REJECTED");

    private final ReportService service;
    private final ReportRenderer renderer;
    private final ExtractService extracts;
    private final PythonReportService python;
    private final CustomerPdfService customerPdfService;
    private final BusinessClock clock;
    private final AccountAccess access;

    public ReportController(ReportService service, ReportRenderer renderer, ExtractService extracts,
                            PythonReportService python, CustomerPdfService customerPdfService,
                            BusinessClock clock, AccountAccess access) {
        this.access = access;
        this.service = service;
        this.renderer = renderer;
        this.extracts = extracts;
        this.python = python;
        this.customerPdfService = customerPdfService;
        this.clock = clock;
    }

    @GetMapping("/fd-summary")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN')")
    public ResponseEntity<?> fdSummary(@RequestParam(defaultValue = "ACTIVE") String status,
                                       @RequestParam(defaultValue = "json") String format) {
        String s = status.toUpperCase();
        if (!STATUSES.contains(s)) throw new IllegalArgumentException("status must be ACTIVE, MATURED, PREMATURELY_CLOSED or REJECTED");
        return respond(service.fdSummary(s), format, "fd-summary-" + s.toLowerCase());
    }

    @GetMapping("/customer-portfolio")
    @PreAuthorize("hasAnyRole('CUSTOMER','BANK_OFFICER','ADMIN')")
    public ResponseEntity<?> customerPortfolio(@RequestParam(required = false) String customerId,
                                               @RequestParam(defaultValue = "json") String format,
                                               Authentication auth) {
        // For professional PDF with charts, use the dedicated endpoint
        if ("pdf".equalsIgnoreCase(format) && !AccountAccess.isStaff(auth)) {
            byte[] pdfBytes = customerPdfService.generateCustomerPdf(auth.getName());
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, "application/pdf")
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=customer-portfolio.pdf")
                    .body(pdfBytes);
        }

        ReportData data;
        if (AccountAccess.isStaff(auth)) {
            if (customerId == null || customerId.isBlank()) throw new IllegalArgumentException("customerId is required for staff");
            data = service.portfolioForCustomer(customerId);
        } else {
            // A customer can only ever see their own deposits; any customerId parameter is ignored.
            data = service.portfolioForUsername(auth.getName());
        }
        return respond(data, format, "customer-portfolio");
    }

    @GetMapping("/maturity-summary")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN')")
    public ResponseEntity<?> maturitySummary(@RequestParam(defaultValue = "30") int days,
                                             @RequestParam(defaultValue = "json") String format) {
        return respond(service.maturitySummary(days), format, "maturity-summary-" + days + "d");
    }

    @GetMapping("/interest-report")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN')")
    public ResponseEntity<?> interestReport(@RequestParam(defaultValue = "pdf") String format) {
        return respond(service.interestReport(), format, "interest-report");
    }

    @GetMapping("/transaction-report")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN')")
    public ResponseEntity<?> transactionReport(@RequestParam(defaultValue = "xlsx") String format) {
        return respond(service.transactionReport(), format, "transaction-report");
    }

    @GetMapping("/interest-history/{fdAccountNo}")
    @PreAuthorize("hasAnyRole('CUSTOMER','BANK_OFFICER','ADMIN')")
    public ResponseEntity<?> interestHistory(@PathVariable String fdAccountNo,
                                             @RequestParam(defaultValue = "json") String format,
                                             Authentication auth) {
        access.requireAccess(auth, fdAccountNo); // customers: 403 unless it is theirs (hides unknown accounts too)
        if (!service.accountExists(fdAccountNo)) throw new IllegalArgumentException("Unknown FD account " + fdAccountNo);
        return respond(service.interestHistory(fdAccountNo), format, "interest-history-" + fdAccountNo);
    }

    /** Runs (or reuses) the extract for a business date. Idempotent: an existing file is never overwritten. */
    @PostMapping("/extract/run")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN')")
    public Map<String, Object> runExtract(@RequestParam(required = false) String date) {
        ExtractService.ExtractResult r = extracts.run(parseDate(date));
        return Map.of("businessDate", r.businessDate().toString(), "file", r.file().toString(),
                "created", r.created(), "accounts", r.accounts());
    }

    /** Runs the Python report generator on the extract for a business date. */
    @PostMapping("/python")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN')")
    public ResponseEntity<?> pythonReport(@RequestParam(required = false) String date) {
        try {
            return ResponseEntity.ok(python.generate(parseDate(date)));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    private ResponseEntity<?> respond(ReportData data, String format, String baseName) {
        if ("json".equalsIgnoreCase(format)) return ResponseEntity.ok(data.rows());
        if (!ReportRenderer.isFileFormat(format)) throw new IllegalArgumentException("format must be json, csv, pdf or xlsx");
        ReportRenderer.Rendered file = renderer.render(data, format, baseName);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, file.contentType())
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + file.fileName())
                .body(file.body());
    }

    private LocalDate parseDate(String date) {
        if (date == null || date.isBlank()) return clock.today();
        try {
            return LocalDate.parse(date);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("date must look like 2026-10-14");
        }
    }

}
