package com.example.fdmodule.security;

import com.example.fdsecurity.JwtSupport;
import com.example.fdsecurity.TokenIssuer;
import com.example.fdmodule.client.AuthServiceClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import org.mockito.Mockito;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Bearer-token login and the "a customer only sees their own FD" rule (H2, profile "test"). */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Sql(scripts = {"/interest-schema.sql", "/report-schema.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_CLASS)
class JwtSecurityIntegrationTest {
    static final String SECRET = "test-only-secret-test-only-secret-0001"; // same value as application-test.properties
    static final String MINE = "BR001J1";    // belongs to CUST001, whose login is customer1
    static final String OTHERS = "BR001J2";  // belongs to CUST002, whose login is customer2

    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @org.springframework.boot.test.mock.mockito.MockBean AuthServiceClient authServiceClient;

    TokenIssuer issuer = new TokenIssuer(SECRET, "fd-platform-auth", Duration.ofMinutes(10));

    String bearer(String user, String... roles) { return "Bearer " + issuer.issue(user, List.of(roles)).value(); }

    @BeforeEach
    void seed() {
        for (String table : List.of("fd_interest_transactions", "fd_interest_state", "fd_transactions", "fd_accounts",
                "products", "customer_profile", "users")) {
            jdbc.update("DELETE FROM " + table);
        }
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Kolkata"));
        jdbc.update("INSERT INTO products(product_code,currency,status) VALUES('FDSTD','INR','ACTIVE')");
        jdbc.update("INSERT INTO users(username,password_hash,role) VALUES('customer1','x','CUSTOMER')");
        jdbc.update("INSERT INTO users(username,password_hash,role) VALUES('customer2','x','CUSTOMER')");
        jdbc.update("INSERT INTO customer_profile(customer_id,user_id) VALUES('CUST001',(SELECT id FROM users WHERE username='customer1'))");
        jdbc.update("INSERT INTO customer_profile(customer_id,user_id) VALUES('CUST002',(SELECT id FROM users WHERE username='customer2'))");
        for (String[] a : new String[][]{{MINE, "CUST001"}, {OTHERS, "CUST002"}}) {
            jdbc.update("INSERT INTO fd_accounts(fd_account_no,customer_id,product_code,currency,principal_amount,interest_rate,"
                    + "tenure_months,status,maturity_date,accrued_interest,created_at) VALUES(?,?,'FDSTD','INR',50000,7,12,'ACTIVE',?,0,?)",
                    a[0], a[1], today.plusMonths(6), today.minusMonths(1).atStartOfDay());
        }
        Mockito.when(authServiceClient.getUserIdByUsername("customer1"))
                .thenAnswer(invocation -> jdbc.queryForObject("SELECT id FROM users WHERE username='customer1'", Long.class));
        Mockito.when(authServiceClient.getUserIdByUsername("customer2"))
                .thenAnswer(invocation -> jdbc.queryForObject("SELECT id FROM users WHERE username='customer2'", Long.class));
        Mockito.when(authServiceClient.getUsernameByUserId(Mockito.anyLong()))
                .thenAnswer(invocation -> jdbc.queryForObject("SELECT username FROM users WHERE id=?", String.class, invocation.getArgument(0)));
    }

    @Test
    void validTokenLogsInAndRoleDecidesWhatIsAllowed() throws Exception {
        mvc.perform(get("/api/fd/clock").header("Authorization", bearer("admin1", "ADMIN"))).andExpect(status().isOk());
        mvc.perform(get("/api/fd/clock").header("Authorization", bearer("officer1", "BANK_OFFICER"))).andExpect(status().isOk());
        mvc.perform(get("/api/report/fd-summary").header("Authorization", bearer("officer1", "BANK_OFFICER"))).andExpect(status().isOk());
        mvc.perform(get("/api/report/fd-summary").header("Authorization", bearer("customer1", "CUSTOMER"))).andExpect(status().isForbidden());
    }

    @Test
    void badTokensAreRejectedWith401() throws Exception {
        TokenIssuer wrongKey = new TokenIssuer("another-secret-another-secret-123456", "fd-platform-auth", Duration.ofMinutes(10));
        TokenIssuer wrongIssuer = new TokenIssuer(SECRET, "someone-else", Duration.ofMinutes(10));
        mvc.perform(get("/api/fd/clock").header("Authorization", "Bearer " + wrongKey.issue("admin1", List.of("ADMIN")).value()))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/fd/clock").header("Authorization", "Bearer " + wrongIssuer.issue("admin1", List.of("ADMIN")).value()))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/fd/clock").header("Authorization", "Bearer not.a.token")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/fd/clock")).andExpect(status().isUnauthorized());
        // A token that expired two hours ago.
        mvc.perform(get("/api/fd/clock").header("Authorization", "Bearer " + expiredToken())).andExpect(status().isUnauthorized());
    }

    String expiredToken() {
        JwtClaimsSet claims = JwtClaimsSet.builder().issuer("fd-platform-auth").subject("admin1")
                .issuedAt(Instant.now().minus(Duration.ofHours(3))).expiresAt(Instant.now().minus(Duration.ofHours(2)))
                .claim("roles", List.of("ADMIN")).build();
        return JwtSupport.encoder(SECRET)
                .encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
    }
    @Test
    void customerCanReadOnlyTheirOwnFd() throws Exception {
        String customer = bearer("customer1", "CUSTOMER");
        mvc.perform(get("/api/fd/account/" + MINE).header("Authorization", customer)).andExpect(status().isOk());
        mvc.perform(get("/api/fd/account/" + MINE + "/transactions").header("Authorization", customer)).andExpect(status().isOk());
        mvc.perform(get("/api/report/interest-history/" + MINE).header("Authorization", customer)).andExpect(status().isOk());

        mvc.perform(get("/api/fd/account/" + OTHERS).header("Authorization", customer)).andExpect(status().isForbidden());
        mvc.perform(get("/api/fd/account/" + OTHERS + "/transactions").header("Authorization", customer)).andExpect(status().isForbidden());
        mvc.perform(get("/api/fd/account/" + OTHERS + "/withdrawal-inquiry").header("Authorization", customer)).andExpect(status().isForbidden());
        mvc.perform(get("/api/report/interest-history/" + OTHERS).header("Authorization", customer)).andExpect(status().isForbidden());
    }

    @Test
    void customerCannotWithdrawFromSomeoneElsesFd() throws Exception {
        mvc.perform(post("/api/fd/account/" + OTHERS + "/withdrawal").header("Authorization", bearer("customer1", "CUSTOMER"))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"reason\":\"not mine\"}"))
                .andExpect(status().isForbidden());
        assertThat(jdbc.queryForObject("SELECT status FROM fd_accounts WHERE fd_account_no=?", String.class, OTHERS)).isEqualTo("ACTIVE");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM fd_transactions", Integer.class)).isZero();
    }

    @Test
    void unknownAccountLooksTheSameAsSomeoneElsesToACustomer() throws Exception {
        mvc.perform(get("/api/fd/account/BR999NONE").header("Authorization", bearer("customer1", "CUSTOMER"))).andExpect(status().isForbidden());
        // Staff get the normal business answer instead.
        mvc.perform(get("/api/report/interest-history/BR999NONE").header("Authorization", bearer("officer1", "BANK_OFFICER")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void staffMayUseAnyFd() throws Exception {
        mvc.perform(get("/api/fd/account/" + OTHERS).header("Authorization", bearer("officer1", "BANK_OFFICER"))).andExpect(status().isOk());
        mvc.perform(get("/api/fd/account/" + OTHERS + "/transactions").header("Authorization", bearer("admin1", "ADMIN")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void customerPortfolioFollowsTheTokenSubject() throws Exception {
        mvc.perform(get("/api/report/customer-portfolio").param("customerId", "CUST002").header("Authorization", bearer("customer1", "CUSTOMER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].fd_account_no").value(MINE));
    }

    @Test
    void basicAuthenticationIsDisabledInTheJwtOnlyProfile() throws Exception {
        mvc.perform(get("/api/fd/account/" + MINE).header("Authorization", "Basic Y3VzdG9tZXIxOmN1c3RvbWVyMTIz"))
                .andExpect(status().isUnauthorized());
    }
}
