package com.example.fdmodule.report;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Runs reports/python/generate_customer_portfolio_pdf.py to generate professional PDF reports
 * with charts for individual customers.
 */
@Service
public class CustomerPdfService {
    private final ReportService reportService;
    private final String executable;
    private final Path script;
    private final long timeoutSeconds;

    public CustomerPdfService(ReportService reportService,
                              @Value("${app.python.executable:python}") String executable,
                              @Value("${app.python.customer-script:reports/python/generate_customer_portfolio_pdf.py}") String script,
                              @Value("${app.python.timeout-seconds:60}") long timeoutSeconds) {
        this.reportService = reportService;
        this.executable = executable;
        this.script = Path.of(script).toAbsolutePath().normalize();
        this.timeoutSeconds = timeoutSeconds;
    }

    /**
     * Generate a professional PDF report for a specific customer.
     */
    public byte[] generateCustomerPdf(String username) {
        if (!Files.isRegularFile(script)) {
            throw new IllegalStateException("Customer PDF script not found: " + script);
        }

        try {
            // Get customer portfolio data
            ReportData portfolioData = reportService.portfolioForUsername(username);
            
            // Snapshot the portfolio, posted journal entries and daily accrual rows together for this export.
            Path tempDir = Files.createTempDirectory("customer_pdf_");
            Path csvFile = tempDir.resolve("portfolio.csv");
            Path activityFile = tempDir.resolve("activity.csv");
            Path accrualFile = tempDir.resolve("accruals.csv");
            CsvWriter.writeCsv(portfolioData, csvFile.toString());
            CsvWriter.writeCsv(reportService.customerActivityForUsername(username), activityFile.toString());
            CsvWriter.writeCsv(reportService.customerAccrualHistoryForUsername(username), accrualFile.toString());
            
            // Create output path
            Path pdfFile = tempDir.resolve("portfolio.pdf");
            
            // Build command
            List<String> command = List.of(
                executable,
                script.toString(),
                "--input", csvFile.toString(),
                "--activity", activityFile.toString(),
                "--accruals", accrualFile.toString(),
                "--output", pdfFile.toString(),
                "--customer", username
            );

            // Run Python script
            Process process = new ProcessBuilder(command)
                .redirectErrorStream(true)
                .start();

            if (!process.waitFor(timeoutSeconds, TimeUnit.SECONDS)) {
                process.destroyForcibly();
                throw new IllegalStateException("Customer PDF generation timed out after " + timeoutSeconds + "s");
            }

            String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8).trim();
            if (process.exitValue() != 0) {
                throw new IllegalStateException("Customer PDF generation failed: " + output);
            }

            // Read generated PDF
            byte[] pdfBytes = Files.readAllBytes(pdfFile);

            // Cleanup
            Files.deleteIfExists(csvFile);
            Files.deleteIfExists(activityFile);
            Files.deleteIfExists(accrualFile);
            Files.deleteIfExists(pdfFile);
            Files.deleteIfExists(tempDir);

            return pdfBytes;

        } catch (IOException e) {
            throw new IllegalStateException("Could not start Python (" + executable + "): " + e.getMessage(), e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Customer PDF generation interrupted", e);
        }
    }
}
