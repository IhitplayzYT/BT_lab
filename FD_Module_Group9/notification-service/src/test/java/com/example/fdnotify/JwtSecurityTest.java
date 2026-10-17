package com.example.fdnotify;

import com.example.fdsecurity.TokenIssuer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Duration;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** The notification service (staff only) accepts a JWT from auth-service; roles decide access, bad tokens get 401. */
@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class JwtSecurityTest {
    static final String SECRET = "test-only-secret-test-only-secret-0001"; // same value as application-test.properties

    @Autowired MockMvc mvc;

    String bearer(String secret, String user, String role) {
        return "Bearer " + new TokenIssuer(secret, "fd-platform-auth", Duration.ofMinutes(10)).issue(user, List.of(role)).value();
    }

    @Test
    void allowedRolesGetThrough() throws Exception {
        mvc.perform(get("/api/notifications").header("Authorization", bearer(SECRET, "admin1", "ADMIN"))).andExpect(status().isOk());
        mvc.perform(get("/api/notifications").header("Authorization", bearer(SECRET, "officer1", "BANK_OFFICER"))).andExpect(status().isOk());
    }

    @Test
    void otherRolesAreForbiddenNotJustUnauthenticated() throws Exception {
        mvc.perform(get("/api/notifications").header("Authorization", bearer(SECRET, "customer1", "CUSTOMER"))).andExpect(status().isForbidden());
    }

    @Test
    void badTokensGet401() throws Exception {
        mvc.perform(get("/api/notifications").header("Authorization", bearer("another-secret-another-secret-123456", "admin1", "ADMIN")))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/notifications").header("Authorization", "Bearer garbage")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/notifications")).andExpect(status().isUnauthorized());
    }
}
