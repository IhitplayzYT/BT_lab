package com.example.fdauth;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * The users that can log in. These are the same demo accounts the other services have always used; when Group 1's
 * customer/login module is ready, this class is the only thing to replace (look users up there instead).
 * Passwords are kept only as BCrypt hashes, and an unknown username costs the same time as a wrong password.
 */
@Component
public class UserDirectory {
    public record Account(String username, String passwordHash, List<String> roles) { }

    private final PasswordEncoder encoder;
    private final Map<String, Account> accounts;
    private final String dummyHash;

    public UserDirectory(PasswordEncoder encoder) {
        this.encoder = encoder;
        this.accounts = Map.of(
                "admin1", new Account("admin1", encoder.encode("admin123"), List.of("ADMIN")),
                "officer1", new Account("officer1", encoder.encode("officer123"), List.of("BANK_OFFICER")),
                "customer1", new Account("customer1", encoder.encode("customer123"), List.of("CUSTOMER")));
        this.dummyHash = encoder.encode("not-a-real-password");
    }

    /** The account if the password is right, otherwise empty. */
    public Optional<Account> authenticate(String username, String password) {
        Account account = username == null ? null : accounts.get(username);
        boolean ok = encoder.matches(password == null ? "" : password, account == null ? dummyHash : account.passwordHash());
        return ok && account != null ? Optional.of(account) : Optional.empty();
    }
}
