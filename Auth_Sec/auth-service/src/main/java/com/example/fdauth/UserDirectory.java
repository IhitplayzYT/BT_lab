package com.example.fdauth;

import com.example.fdauth.entity.User;
import com.example.fdauth.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * User directory backed by MySQL database.
 * Passwords are kept only as BCrypt hashes, and an unknown username costs the same time as a wrong password.
 */
@Component
public class UserDirectory {
    public record Account(String username, String passwordHash, List<String> roles) { }

    private final PasswordEncoder encoder;
    private final UserRepository userRepository;

    public UserDirectory(PasswordEncoder encoder, UserRepository userRepository) {
        this.encoder = encoder;
        this.userRepository = userRepository;
    }

    /** The account if the password is right, otherwise empty. */
    @Transactional
    public Optional<Account> authenticate(String username, String password) {
        if (username == null || password == null) {
            return Optional.empty();
        }
        return userRepository.findByUsername(username)
                .filter(user -> user.getEnabled() != null && user.getEnabled())
                .filter(user -> encoder.matches(password, user.getPasswordHash()))
                .map(user -> {
                    // Update last login time
                    user.setLastLoginAt(java.time.LocalDateTime.now());
                    userRepository.save(user);
                    return new Account(user.getUsername(), user.getPasswordHash(), parseRoles(user.getRoles()));
                });
    }

    /** Create a new user account */
    @Transactional
    public Optional<Account> createUser(String username, String password, String email, List<String> roles) {
        if (userRepository.existsByUsername(username)) {
            return Optional.empty();
        }
        if (userRepository.existsByEmail(email)) {
            return Optional.empty();
        }
        User user = new User(username, encoder.encode(password), email, String.join(",", roles));
        user.setEnabled(true);
        User saved = userRepository.save(user);
        return Optional.of(new Account(saved.getUsername(), saved.getPasswordHash(), roles));
    }

    /** Create a user from a previously encoded password held in a signup challenge. */
    @Transactional
    public Optional<Account> createUserWithPasswordHash(String username, String passwordHash, String email, List<String> roles) {
        if (userRepository.existsByUsername(username) || userRepository.existsByEmail(email)) {
            return Optional.empty();
        }
        User user = new User(username, passwordHash, email, String.join(",", roles));
        user.setEnabled(true);
        User saved = userRepository.save(user);
        return Optional.of(new Account(saved.getUsername(), saved.getPasswordHash(), roles));
    }

    /** Find user by username without password verification */
    @Transactional
    public Optional<Account> findByUsername(String username) {
        return userRepository.findByUsername(username)
                .filter(user -> user.getEnabled() != null && user.getEnabled())
                .map(user -> new Account(user.getUsername(), user.getPasswordHash(), parseRoles(user.getRoles())));
    }

    /** Get all users (admin only) */
    @Transactional
    public List<com.example.fdauth.entity.User> getAllUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc();
    }

    /** Update user roles (admin only) */
    @Transactional
    public Optional<com.example.fdauth.entity.User> updateUserRoles(String username, List<String> roles) {
        return userRepository.findByUsername(username).map(user -> {
            user.setRoles(String.join(",", roles));
            return userRepository.save(user);
        });
    }

    /** Ban/Unban user (admin only) */
    @Transactional
    public Optional<com.example.fdauth.entity.User> setUserEnabled(String username, boolean enabled) {
        return userRepository.findByUsername(username).map(user -> {
            user.setEnabled(enabled);
            return userRepository.save(user);
        });
    }

    /** Create user with specific role (admin only) */
    @Transactional
    public Optional<Account> createUserWithRole(String username, String password, String email, List<String> roles) {
        if (userRepository.existsByUsername(username)) {
            return Optional.empty();
        }
        if (userRepository.existsByEmail(email)) {
            return Optional.empty();
        }
        User user = new User(username, encoder.encode(password), email, String.join(",", roles));
        user.setEnabled(true);
        User saved = userRepository.save(user);
        return Optional.of(new Account(saved.getUsername(), saved.getPasswordHash(), roles));
    }

    /** Delete user (admin only) */
    @Transactional
    public boolean deleteUser(String username) {
        if (!userRepository.existsByUsername(username)) {
            return false;
        }
        userRepository.deleteByUsername(username);
        return true;
    }

    private List<String> parseRoles(String rolesString) {
        if (rolesString == null || rolesString.isBlank()) {
            return List.of();
        }
        return List.of(rolesString.split(","));
    }
}
