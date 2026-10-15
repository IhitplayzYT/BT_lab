package com.example.fdauth;
import com.example.fdsecurity.TokenIssuer;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    public record LoginRequest(@NotBlank @Size(max = 100) String username, @NotBlank @Size(max = 200) String password) { }

    private final UserDirectory users;
    private final TokenIssuer tokens;
    private final LoginAttemptLimiter limiter;

    public AuthController(UserDirectory users, TokenIssuer tokens, LoginAttemptLimiter limiter) {
        this.users = users;
        this.tokens = tokens;
        this.limiter = limiter;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        if (limiter.isLocked(request.username())) {
            return error(HttpStatus.TOO_MANY_REQUESTS, "Too many failed attempts. Try again in a minute.");
        }
        var account = users.authenticate(request.username(), request.password());
        if (account.isEmpty()) {
            limiter.failed(request.username());
            return error(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }
        limiter.succeeded(request.username());
        TokenIssuer.IssuedToken token = tokens.issue(account.get().username(), account.get().roles());
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("accessToken", token.value());
        body.put("tokenType", "Bearer");
        body.put("expiresIn", Duration.between(Instant.now(), token.expiresAt()).toSeconds());
        body.put("username", account.get().username());
        body.put("roles", account.get().roles());
        return ResponseEntity.ok(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Map<String, Object>> invalid(MethodArgumentNotValidException ex) {
        return error(HttpStatus.BAD_REQUEST, "username and password are required");
    }

    private static ResponseEntity<Map<String, Object>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("status", "error", "message", message));
    }
}
