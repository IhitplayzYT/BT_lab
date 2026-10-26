package com.example.fdmodule.report;

import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import com.example.fdmodule.client.AuthServiceClient;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static com.example.fdmodule.test.JwtTestSupport.jwtAuth;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** L21 reports against the real context: role matrix, formats, currency grouping, extract and Python (H2, profile "test"). */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Sql(scripts = {"/interest-schema.sql", "/report-schema.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_CLASS)
class ReportIntegrationTest {

    static final Path EXTRACT_DIR = tempDir();

    static Path tempDir() {
        try {
            return Files.createTempDirectory("fd-extract-test");
        } catch (IOException e) {
            throw new IllegalStateException(e);
        }
    }

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry registry) {
        registry.add("app.extract.dir", EXTRACT_DIR::toString);
        // Surefire runs in the module folder; the script lives in the repo-level reports/ folder.
        registry.add("app.python.script", () -> Path.of("..", "reports", "python", "generate_fd_report.py").toAbsolutePath().normalize().toString());
        registry.add("app.python.executable", () -> "python3");
    }

    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired ExtractService extracts;
    @org.springframework.boot.test.mock.mockito.MockBean AuthServiceClient authServiceClient;

    LocalDate today;

    @BeforeEach
    void seed() throws IOException {
        try (var files = Files.walk(EXTRACT_DIR)) {
            // Each test starts with an empty extract folder (children before parents, keep the folder itself).
            for (Path p : files.sorted(java.util.Comparator.reverseOrder()).toList()) {
                if (!p.equals(EXTRACT_DIR)) Files.delete(p);
            }
        }
        for (String table : List.of("fd_interest_transactions", "fd_interest_state", "fd_transactions", "fd_accounts",
                "products", "customer_profile", "users")) {
            jdbc.update("DELETE FROM " + table);
        }
        today = LocalDate.now(ZoneId.of("Asia/Kolkata"));
        jdbc.update("INSERT INTO products(product_code,currency,status) VALUES('FDSTD','INR','ACTIVE')");
        jdbc.update("INSERT INTO users(username,password_hash,role) VALUES('customer1','x','CUSTOMER')");
        jdbc.update("INSERT INTO users(username,password_hash,role) VALUES('customer2','x','CUSTOMER')");
        jdbc.update("INSERT INTO customer_profile(customer_id,user_id) VALUES('CUST001',(SELECT id FROM users WHERE username='customer1'))");
        jdbc.update("INSERT INTO customer_profile(customer_id,user_id) VALUES('CUST002',(SELECT id FROM users WHERE username='customer2'))");
        org.mockito.Mockito.when(authServiceClient.getUserIdByUsername("customer1"))
                .thenAnswer(invocation -> jdbc.queryForObject("SELECT id FROM users WHERE username='customer1'", Long.class));
        org.mockito.Mockito.when(authServiceClient.getUserIdByUsername("customer2"))
                .thenAnswer(invocation -> jdbc.queryForObject("SELECT id FROM users WHERE username='customer2'", Long.class));
        org.mockito.Mockito.when(authServiceClient.getUsernameByUserId(org.mockito.ArgumentMatchers.anyLong()))
                .thenAnswer(invocation -> jdbc.queryForObject("SELECT username FROM users WHERE id=?", String.class, invocation.getArgument(0)));
        account("BR001R1", "CUST001", "ACTIVE", "INR", 100000, today.plusDays(20), "123.45");
        account("BR001R2", "CUST001", "ACTIVE", "INR", 50000, today.plusDays(100), "0");
        account("BR001R3", "CUST001", "ACTIVE", "USD", 1000, today.plusDays(10), "0");
        account("BR001R4", "CUST001", "MATURED", "INR", 70000, today.minusDays(5), "0");
        account("BR001R5", "CUST002", "ACTIVE", "INR", 25000, today.plusDays(200), "0");
        account("BR001R6", "CUST001", "REJECTED", "INR", 30000, today.plusDays(365), "0");
        jdbc.update("UPDATE fd_accounts SET approval_status='REJECTED' WHERE fd_account_no='BR001R6'");
        jdbc.update("INSERT INTO fd_interest_transactions(fd_account_no,accrual_date,interest_amount,cumulative_interest,capitalized_flag,settlement_status) "
                + "VALUES('BR001R1',?,10.5,10.5,FALSE,'PENDING')", today.minusDays(2));
        jdbc.update("INSERT INTO fd_interest_transactions(fd_account_no,accrual_date,interest_amount,cumulative_interest,capitalized_flag,settlement_status) "
                + "VALUES('BR001R1',?,10.5,21.0,FALSE,'PENDING')", today.minusDays(1));
    }

    void account(String no, String customer, String status, String currency, int principal, LocalDate maturity, String accrued) {
        jdbc.update("INSERT INTO fd_accounts(fd_account_no,customer_id,product_code,currency,principal_amount,interest_rate,"
                + "tenure_months,status,maturity_date,accrued_interest,created_at) VALUES(?,?,'FDSTD',?,?,7,12,?,?,?,?)",
                no, customer, currency, principal, status, maturity, new java.math.BigDecimal(accrued), today.minusMonths(1).atStartOfDay());
    }

    byte[] bytes(org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder request) throws Exception {
        return mvc.perform(request).andExpect(status().isOk()).andReturn().getResponse().getContentAsByteArray();
    }

    @Test
    void summaryNeverMixesCurrenciesAndCountsPostedInterest() throws Exception {
        mvc.perform(get("/api/report/fd-summary").with(jwtAuth("officer1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].currency").value("INR"))
                .andExpect(jsonPath("$[0].total_accounts").value(3))
                .andExpect(jsonPath("$[0].total_principal").value(175000.0))
                .andExpect(jsonPath("$[0].total_interest_accrued").value(123.45))
                .andExpect(jsonPath("$[0].total_interest_posted").value(21.0))
                .andExpect(jsonPath("$[1].currency").value("USD"))
                .andExpect(jsonPath("$[1].total_principal").value(1000.0));
        mvc.perform(get("/api/report/fd-summary").param("status", "MATURED").with(jwtAuth("admin1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].total_principal").value(70000.0));
    }

    @Test
    void roleMatrix() throws Exception {
        mvc.perform(get("/api/report/fd-summary")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/report/fd-summary").with(jwtAuth("customer1"))).andExpect(status().isForbidden());
        mvc.perform(get("/api/report/maturity-summary").with(jwtAuth("customer1"))).andExpect(status().isForbidden());
        mvc.perform(post("/api/report/extract/run").with(jwtAuth("officer1"))).andExpect(status().isOk());
        mvc.perform(post("/api/report/python").with(jwtAuth("officer1"))).andExpect(status().isOk());
        mvc.perform(get("/api/report/customer-portfolio").with(jwtAuth("customer1"))).andExpect(status().isOk());
    }

    @Test
    void badInputIsRejected() throws Exception {
        mvc.perform(get("/api/report/fd-summary").param("status", "CLOSED").with(jwtAuth("officer1")))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/report/fd-summary").param("format", "docx").with(jwtAuth("officer1")))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/report/maturity-summary").param("days", "0").with(jwtAuth("officer1")))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/report/customer-portfolio").with(jwtAuth("officer1")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rejectedFdSummaryAndAdvancedExportsReturnTheirOwnData() throws Exception {
        mvc.perform(get("/api/report/fd-summary").param("status", "REJECTED").param("format", "pdf")
                        .with(jwtAuth("officer1")))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=fd-summary-rejected.pdf"));

        jdbc.update("INSERT INTO fd_transactions(fd_account_no,txn_type,amount,currency,debit_gl_account,credit_gl_account,status,remarks,uuid,created_at,txn_timestamp) "
                + "VALUES('BR001R1','INTEREST',12.50,'INR','GL1','GL2','POSTED','Interest posted','report-interest-test',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)");
        mvc.perform(get("/api/report/interest-report").param("format", "csv").with(jwtAuth("officer1")))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=interest-report.csv"));
        mvc.perform(get("/api/report/transaction-report").param("format", "xlsx").with(jwtAuth("admin1")))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=transaction-report.xlsx"));
    }

    @Test
    void csvHasHeaderEvenWhenThereAreNoRows() throws Exception {
        var result = mvc.perform(get("/api/report/fd-summary").param("status", "PREMATURELY_CLOSED").param("format", "csv")
                        .with(jwtAuth("officer1")))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=fd-summary-prematurely_closed.csv"))
                .andReturn();
        assertThat(result.getResponse().getContentAsString(StandardCharsets.UTF_8))
                .isEqualTo("product_code,currency,total_accounts,total_principal,total_interest_accrued,total_interest_posted\r\n");
    }

    @Test
    void customerSeesOnlyOwnDepositsAndIgnoresTheCustomerIdParameter() throws Exception {
        mvc.perform(get("/api/report/customer-portfolio").param("customerId", "CUST002").with(jwtAuth("customer1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(4))
                .andExpect(jsonPath("$[?(@.fd_account_no=='BR001R5')]").isEmpty());
        mvc.perform(get("/api/report/customer-portfolio").param("customerId", "CUST002").with(jwtAuth("officer1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].fd_account_no").value("BR001R5"));
    }

    @Test
    void maturitySummaryListsOnlyActiveDepositsInTheWindowSoonestFirst() throws Exception {
        mvc.perform(get("/api/report/maturity-summary").param("days", "30").with(jwtAuth("officer1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].fd_account_no").value("BR001R3"))
                .andExpect(jsonPath("$[0].days_to_maturity").value(10))
                .andExpect(jsonPath("$[1].fd_account_no").value("BR001R1"))
                .andExpect(jsonPath("$[1].days_to_maturity").value(20));
    }

    @Test
    void interestHistoryChecksOwnership() throws Exception {
        mvc.perform(get("/api/report/interest-history/BR001R1").with(jwtAuth("customer1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[1].cumulative_interest").value(21.0));
        mvc.perform(get("/api/report/interest-history/BR001R5").with(jwtAuth("customer1")))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/report/interest-history/BR001R5").with(jwtAuth("officer1")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
        mvc.perform(get("/api/report/interest-history/NOPE").with(jwtAuth("officer1")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void pdfAndExcelAreRealFiles() throws Exception {
        byte[] pdf = bytes(get("/api/report/fd-summary").param("format", "pdf").with(jwtAuth("officer1")));
        assertThat(new String(pdf, 0, 5, StandardCharsets.ISO_8859_1)).isEqualTo("%PDF-");

        byte[] xlsx = bytes(get("/api/report/fd-summary").param("format", "xlsx").with(jwtAuth("officer1")));
        try (XSSFWorkbook book = new XSSFWorkbook(new ByteArrayInputStream(xlsx))) {
            Sheet sheet = book.getSheetAt(0);
            assertThat(sheet.getLastRowNum()).isEqualTo(2); // header + INR + USD
            assertThat(sheet.getRow(0).getCell(0).getStringCellValue()).isEqualTo("Product Code");
            assertThat(sheet.getRow(1).getCell(3).getNumericCellValue()).isEqualTo(175000.0);
        }
    }

    @Test
    void extractIsIdempotentAndNeverOverwrites() throws Exception {
        var first = extracts.run(today);
        assertThat(first.created()).isTrue();
        assertThat(first.accounts()).isEqualTo(6);
        String content = Files.readString(first.file());
        assertThat(content).startsWith("fd_account_no,customer_id,product_code,currency,principal_amount,interest_rate,tenure_months,status,maturity_date,accrued_interest\r\n");

        Files.writeString(first.file(), content + "MARKER\r\n");
        var second = extracts.run(today);
        assertThat(second.created()).isFalse();
        assertThat(Files.readString(second.file())).endsWith("MARKER\r\n");

        mvc.perform(post("/api/report/extract/run").param("date", today.plusDays(1).toString()).with(jwtAuth("admin1")))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/report/extract/run").param("date", "not-a-date").with(jwtAuth("admin1")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void pythonReportWritesJsonAndChart() throws Exception {
        assumeTrue(pythonAvailable(), "python is not installed on this machine");
        mvc.perform(post("/api/report/python").with(jwtAuth("admin1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.businessDate").value(today.toString()));
        Path dir = EXTRACT_DIR.resolve("python").resolve(today.toString());
        String json = Files.readString(dir.resolve("fd_report_" + today + ".json"));
        assertThat(json).contains("\"totalAccounts\": 6").contains("\"INR\"").contains("\"USD\"");
        assertThat(Files.readString(dir.resolve("fd_report_" + today + ".svg"))).startsWith("<svg");
    }

    static boolean pythonAvailable() {
        try {
            Process p = new ProcessBuilder("python", "--version").redirectErrorStream(true).start();
            return p.waitFor(10, java.util.concurrent.TimeUnit.SECONDS) && p.exitValue() == 0;
        } catch (Exception e) {
            return false;
        }
    }
}
