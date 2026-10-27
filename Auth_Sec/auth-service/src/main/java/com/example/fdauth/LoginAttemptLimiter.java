package com.example.fdauth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/** After {@code maxFailures} wrong passwords in a row a username is locked for {@code lockSeconds}; a good login clears the count. */
@Component
public class LoginAttemptLimiter {
    private record State(int failures, Instant lockedUntil) { }

    private final Map<String, State> states = new ConcurrentHashMap<>();
    private final int maxFailures;
    private final Duration lock;

    public LoginAttemptLimiter(@Value("${app.login.max-failures:5}") int maxFailures,
                               @Value("${app.login.lock-seconds:60}") long lockSeconds) {
        this.maxFailures = maxFailures;
        this.lock = Duration.ofSeconds(lockSeconds);
    }

    public boolean isLocked(String username) {
        State s = states.get(key(username));
        return s != null && s.lockedUntil() != null && Instant.now().isBefore(s.lockedUntil());
    }

    public void failed(String username) {
        states.merge(key(username), new State(1, null), (old, _ignored) -> {
            if (old.lockedUntil() != null && Instant.now().isBefore(old.lockedUntil())) return old;
            int failures = old.lockedUntil() != null ? 1 : old.failures() + 1;
            return failures >= maxFailures ? new State(failures, Instant.now().plus(lock)) : new State(failures, null);
        });
    }

    public void succeeded(String username) { states.remove(key(username)); }

    private static String key(String username) { return username == null ? "" : username.toLowerCase(); }
}
