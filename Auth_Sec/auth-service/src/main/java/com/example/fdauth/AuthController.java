package com.example.fdauth;
import com.example.fdsecurity.TokenIssuer;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
public class AuthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "auth-service"));
    }
}

@RestController
@RequestMapping("/api/auth")
class AuthApiController {
    public record LoginRequest(@NotBlank @Size(max = 100) String username, @NotBlank @Size(max = 200) String password) { }
    public record SignupRequest(@NotBlank @Size(max = 100) String username, @NotBlank @Size(min = 8, max = 200) String password, @NotBlank @Size(max = 255) String email) { }
    public record RefreshTokenRequest(@NotBlank String refreshToken) { }

    private final UserDirectory users;
    private final TokenIssuer tokens;
    private final LoginAttemptLimiter limiter;
    private final RefreshTokenService refreshTokenService;

    public AuthApiController(UserDirectory users, TokenIssuer tokens, LoginAttemptLimiter limiter, RefreshTokenService refreshTokenService) {
        this.users = users;
        this.tokens = tokens;
        this.limiter = limiter;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(@Valid @RequestBody SignupRequest request) {
        // Always create customers with CUSTOMER role. Staff accounts should be created by admin endpoint or seed data.
        var account = users.createUser(request.username(), request.password(), request.email(), List.of("CUSTOMER"));
        if (account.isEmpty()) {
            return error(HttpStatus.CONFLICT, "Username or email already exists");
        }
        TokenIssuer.IssuedToken token = tokens.issue(account.get().username(), account.get().roles());
        var refreshToken = refreshTokenService.createRefreshToken(account.get().username());
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("accessToken", token.value());
        body.put("tokenType", "Bearer");
        body.put("expiresIn", Duration.between(Instant.now(), token.expiresAt()).toSeconds());
        body.put("refreshToken", refreshToken.getToken());
        body.put("username", account.get().username());
        body.put("roles", account.get().roles());
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
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
        var refreshToken = refreshTokenService.createRefreshToken(account.get().username());
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("accessToken", token.value());
        body.put("tokenType", "Bearer");
        body.put("expiresIn", Duration.between(Instant.now(), token.expiresAt()).toSeconds());
        body.put("refreshToken", refreshToken.getToken());
        body.put("username", account.get().username());
        body.put("roles", account.get().roles());
        return ResponseEntity.ok(body);
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        var refreshToken = refreshTokenService.findByToken(request.refreshToken());
        if (refreshToken.isEmpty()) {
            return error(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }
        var verifiedToken = refreshTokenService.verifyExpiration(refreshToken.get());
        if (verifiedToken.isEmpty()) {
            return error(HttpStatus.UNAUTHORIZED, "Refresh token expired or revoked");
        }
        var account = users.findByUsername(verifiedToken.get().getUsername());
        if (account.isEmpty()) {
            return error(HttpStatus.UNAUTHORIZED, "User not found");
        }
        TokenIssuer.IssuedToken newToken = tokens.issue(account.get().username(), account.get().roles());
        var newRefreshToken = refreshTokenService.createRefreshToken(account.get().username());
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("accessToken", newToken.value());
        body.put("tokenType", "Bearer");
        body.put("expiresIn", Duration.between(Instant.now(), newToken.expiresAt()).toSeconds());
        body.put("refreshToken", newRefreshToken.getToken());
        body.put("username", account.get().username());
        body.put("roles", account.get().roles());
        return ResponseEntity.ok(body);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(@Valid @RequestBody RefreshTokenRequest request) {
        refreshTokenService.deleteByToken(request.refreshToken());
        return ResponseEntity.ok(Map.of("status", "success", "message", "Logged out successfully"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Map<String, Object>> invalid(MethodArgumentNotValidException ex) {
        return error(HttpStatus.BAD_REQUEST, "Invalid request parameters");
    }

    private static ResponseEntity<Map<String, Object>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("status", "error", "message", message));
    }
}
