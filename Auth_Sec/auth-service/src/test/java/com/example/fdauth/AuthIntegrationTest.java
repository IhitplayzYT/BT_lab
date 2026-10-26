package com.example.fdauth;

import com.example.fdsecurity.JwtSupport;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.context.TestPropertySource;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.example.fdauth.entity.User;
import com.example.fdauth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "app.jwt.secret=auth-test-secret-auth-test-secret-0001",
        "app.jwt.issuer=fd-platform-auth",
        "spring.datasource.url=jdbc:h2:mem:authtest;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect"
})
class AuthIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired UserRepository users;
    @Autowired PasswordEncoder passwords;

    @BeforeEach
    void seedUsers() {
        users.deleteAll();
        users.save(new User("officer1", passwords.encode("officer123"), "officer1@example.test", "BANK_OFFICER"));
        users.save(new User("admin1", passwords.encode("admin123"), "admin1@example.test", "ADMIN"));
        users.save(new User("customer1", passwords.encode("customer123"), "customer1@example.test", "CUSTOMER"));
    }

    MvcResult login(String user, String password) throws Exception {
        return mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"" + user + "\",\"password\":\"" + password + "\"}")).andReturn();
    }

    @Test
    void goodLoginReturnsATokenTheOtherServicesWouldAccept() throws Exception {
        MvcResult result = login("officer1", "officer123");
        assertThat(result.getResponse().getStatus()).isEqualTo(200);
        JsonNode body = mapper.readTree(result.getResponse().getContentAsString());
        assertThat(body.path("tokenType").asText()).isEqualTo("Bearer");
        assertThat(body.path("expiresIn").asLong()).isBetween(3500L, 3600L);
        assertThat(body.path("roles").get(0).asText()).isEqualTo("BANK_OFFICER");

        Jwt jwt = JwtSupport.decoder("auth-test-secret-auth-test-secret-0001", "fd-platform-auth").decode(body.path("accessToken").asText());
        assertThat(jwt.getSubject()).isEqualTo("officer1");
        assertThat(jwt.<List<String>>getClaim("roles")).containsExactly("BANK_OFFICER");
        assertThat(body.toString()).doesNotContain("password");
    }

    @Test
    void adminGetsTheAdminRole() throws Exception {
        MvcResult result = login("admin1", "admin123");
        assertThat(result.getResponse().getStatus()).isEqualTo(200);
        assertThat(mapper.readTree(result.getResponse().getContentAsString()).path("roles").get(0).asText()).isEqualTo("ADMIN");
    }

    @Test
    void wrongPasswordAndUnknownUserGetTheSameAnswer() throws Exception {
        MvcResult wrong = login("admin1", "nope");
        MvcResult unknown = login("ghost", "whatever");
        assertThat(wrong.getResponse().getStatus()).isEqualTo(401);
        assertThat(unknown.getResponse().getStatus()).isEqualTo(401);
        assertThat(wrong.getResponse().getContentAsString()).isEqualTo(unknown.getResponse().getContentAsString());
        assertThat(wrong.getResponse().getContentAsString()).doesNotContain("accessToken");
    }

    @Test
    void missingFieldsAreABadRequest() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"username\":\"admin1\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"username\":\"\",\"password\":\"\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void fiveWrongPasswordsLockTheAccountEvenForTheRightPassword() throws Exception {
        for (int i = 0; i < 5; i++) assertThat(login("customer1", "wrong" + i).getResponse().getStatus()).isEqualTo(401);
        assertThat(login("customer1", "wrong-again").getResponse().getStatus()).isEqualTo(429);
        assertThat(login("customer1", "customer123").getResponse().getStatus()).isEqualTo(429);
        // Other users are not affected.
        assertThat(login("admin1", "admin123").getResponse().getStatus()).isEqualTo(200);
    }

    @Test
    void nothingElseIsExposed() throws Exception {
        mvc.perform(get("/api/auth/login")).andExpect(status().isMethodNotAllowed()); // open path, but POST only
        mvc.perform(get("/api/auth/users")).andExpect(status().isUnauthorized());
        mvc.perform(get("/actuator/env")).andExpect(status().isUnauthorized());
    }
}
