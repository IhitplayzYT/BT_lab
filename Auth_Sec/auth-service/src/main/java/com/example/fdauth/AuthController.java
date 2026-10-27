package com.example.fdauth;
import com.example.fdsecurity.TokenIssuer;
import com.example.fdauth.entity.SignupChallenge;
import com.example.fdauth.repository.SignupChallengeRepository;
import jakarta.mail.internet.MimeMessage;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

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
    public record CreateUserRequest(@NotBlank @Size(max = 100) String username, @NotBlank @Size(min = 8, max = 200) String password, @NotBlank @Size(max = 255) String email, java.util.List<String> roles) { }
    public record UpdateRolesRequest(java.util.List<String> roles) { }
    public record InitSignupRequest(@NotBlank @Size(max = 100) String username, @NotBlank @Size(min = 8, max = 200) String password, @NotBlank @Size(max = 255) String email) { }
    public record VerifyOtpRequest(@NotBlank @Size(max = 255) String email, @NotBlank @Size(min = 6, max = 6) String otp) { }
    public record ResendOtpRequest(@NotBlank @Size(max = 255) String email) { }

    private final UserDirectory users;
    private final TokenIssuer tokens;
    private final LoginAttemptLimiter limiter;
    private final RefreshTokenService refreshTokenService;
    private final com.example.fdauth.repository.UserRepository userRepository;
    private final org.springframework.mail.javamail.JavaMailSender mailSender;
    private final AccountDataCleanupClient accountDataCleanupClient;
    private final SignupChallengeRepository signupChallengeRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    
    @Value("${spring.mail.from:noreply@fd-bank.local}")
    private String emailFrom;

    public AuthApiController(UserDirectory users, TokenIssuer tokens, LoginAttemptLimiter limiter, RefreshTokenService refreshTokenService, com.example.fdauth.repository.UserRepository userRepository, org.springframework.mail.javamail.JavaMailSender mailSender, AccountDataCleanupClient accountDataCleanupClient, SignupChallengeRepository signupChallengeRepository, org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.users = users;
        this.tokens = tokens;
        this.limiter = limiter;
        this.refreshTokenService = refreshTokenService;
        this.userRepository = userRepository;
        this.mailSender = mailSender;
        this.accountDataCleanupClient = accountDataCleanupClient;
        this.signupChallengeRepository = signupChallengeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Generate 6-digit OTP
    private String generateOtp() {
        return String.format("%06d", new java.util.Random().nextInt(1000000));
    }

    // Hash OTP using SHA-256 for deterministic comparison
    private String hashOtp(String otp) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(otp.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to hash OTP", e);
        }
    }

    // Send OTP via email
    private void sendOtpEmail(String email, String otp) {
        try {
            System.out.println("Attempting to send OTP email to: " + email);
            System.out.println("Email from: " + emailFrom);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(email);
            helper.setFrom(emailFrom);
            helper.setSubject("Your UNO Bank Verification Code");
            
            String htmlContent = buildOtpEmailHtml(otp);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            System.out.println("OTP email sent successfully to: " + email);
        } catch (Exception e) {
            System.err.println("Failed to send OTP email: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage(), e);
        }
    }

    private String buildOtpEmailHtml(String otp) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #e0e0e0; margin: 0; padding: 0; background: #0a0a1a; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .email-wrapper {
                        background: linear-gradient(135deg, #0a0a1a 0%%, #1a1a2e 50%%, #0a0a1a 100%%);
                        border-radius: 20px;
                        overflow: hidden;
                        position: relative;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    }
                    .stars {
                        position: absolute;
                        inset: 0;
                        background-image:
                            radial-gradient(2px 2px at 20px 30px, #2be0cc, transparent),
                            radial-gradient(2px 2px at 40px 70px, #f6b945, transparent),
                            radial-gradient(1px 1px at 90px 40px, #2be0cc, transparent),
                            radial-gradient(2px 2px at 130px 80px, #ff5c9a, transparent),
                            radial-gradient(1px 1px at 160px 120px, #f6b945, transparent),
                            radial-gradient(2px 2px at 200px 50px, #2be0cc, transparent),
                            radial-gradient(1px 1px at 250px 90px, #ff5c9a, transparent),
                            radial-gradient(2px 2px at 300px 30px, #f6b945, transparent),
                            radial-gradient(1px 1px at 350px 70px, #2be0cc, transparent),
                            radial-gradient(2px 2px at 400px 100px, #ff5c9a, transparent),
                            radial-gradient(1px 1px at 450px 40px, #f6b945, transparent),
                            radial-gradient(2px 2px at 500px 80px, #2be0cc, transparent);
                        background-size: 550px 150px;
                        animation: twinkle 4s ease-in-out infinite;
                        opacity: 0.6;
                    }
                    @keyframes twinkle { 0%%, 100%% { opacity: 0.6; } 50%% { opacity: 0.9; } }
                    .header {
                        background: linear-gradient(135deg, #2be0cc 0%%, #f6b945 55%%, #ff5c9a 100%%);
                        padding: 40px 30px;
                        text-align: center;
                        position: relative;
                        z-index: 1;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                        font-weight: 700;
                        color: #0a0a1a;
                        text-shadow: 0 2px 10px rgba(43, 224, 204, 0.3);
                        letter-spacing: -0.5px;
                    }
                    .content {
                        background: rgba(26, 26, 46, 0.95);
                        padding: 40px 30px;
                        position: relative;
                        z-index: 1;
                    }
                    .greeting { font-size: 18px; margin-bottom: 20px; color: #2be0cc; }
                    .message { color: #b0b0c0; margin-bottom: 25px; line-height: 1.8; }
                    .otp-box {
                        background: linear-gradient(135deg, rgba(43, 224, 204, 0.15) 0%%, rgba(246, 185, 69, 0.15) 100%%);
                        border: 2px solid rgba(43, 224, 204, 0.4);
                        padding: 30px;
                        margin: 30px 0;
                        border-radius: 15px;
                        text-align: center;
                        position: relative;
                        overflow: hidden;
                    }
                    .otp-box::before {
                        content: '';
                        position: absolute;
                        top: -50%%;
                        left: -50%%;
                        width: 200%%;
                        height: 200%%;
                        background: radial-gradient(circle, rgba(43, 224, 204, 0.1) 0%%, transparent 70%%);
                        animation: rotate 20s linear infinite;
                    }
                    @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    .otp-code {
                        font-size: 42px;
                        font-weight: 700;
                        letter-spacing: 8px;
                        background: linear-gradient(135deg, #2be0cc, #f6b945, #ff5c9a);
                        -webkit-background-clip: text;
                        background-clip: text;
                        -webkit-text-fill-color: transparent;
                        margin: 10px 0;
                        position: relative;
                        z-index: 1;
                    }
                    .expiry-info {
                        color: #f6b945;
                        font-size: 14px;
                        margin-top: 15px;
                        position: relative;
                        z-index: 1;
                    }
                    .info-box {
                        background: linear-gradient(135deg, rgba(246, 185, 69, 0.1) 0%%, rgba(43, 224, 204, 0.1) 100%%);
                        border: 1px solid rgba(246, 185, 69, 0.3);
                        padding: 20px;
                        margin: 25px 0;
                        border-radius: 12px;
                        position: relative;
                        overflow: hidden;
                    }
                    .info-box::before {
                        content: '';
                        position: absolute;
                        top: -50%%;
                        left: -50%%;
                        width: 200%%;
                        height: 200%%;
                        background: radial-gradient(circle, rgba(246, 185, 69, 0.1) 0%%, transparent 70%%);
                        animation: rotate 20s linear infinite;
                    }
                    .info-box p {
                        margin: 0;
                        color: #b0b0c0;
                        font-size: 14px;
                        position: relative;
                        z-index: 1;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid rgba(43, 224, 204, 0.2);
                        color: #666;
                        font-size: 12px;
                        position: relative;
                        z-index: 1;
                    }
                    .footer p { margin: 5px 0; }
                    .glow-text {
                        color: #2be0cc;
                        text-shadow: 0 0 10px rgba(43, 224, 204, 0.5);
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="email-wrapper">
                        <div class="stars"></div>
                        <div class="header">
                            <h1>🔐 Verify Your Email Address</h1>
                        </div>
                        <div class="content">
                            <p class="greeting">Welcome to <strong class="glow-text">UNO Bank</strong>!</p>
                            <p class="message">Thank you for signing up. To complete your registration and activate your account, please use the verification code below.</p>
                            
                            <div class="otp-box">
                                <div class="otp-code">%s</div>
                                <div class="expiry-info">⏰ This code expires in 10 minutes</div>
                            </div>
                            
                            <p class="message">Enter this code on the verification page to proceed with your account creation.</p>
                            
                            <div class="info-box">
                                <p><strong>Security Notice:</strong> If you did not request this verification code, please ignore this email. Your account remains secure.</p>
                            </div>
                            
                            <p class="message">We're excited to have you join our constellation of valued customers at UNO Bank.</p>
                            
                            <div class="footer">
                                <p>This is an automated email. Please do not reply.</p>
                                <p>&copy; 2026 UNO Bank. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(otp);
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
            refreshTokenService.deleteByUsername(verifiedToken.get().getUsername());
            return error(HttpStatus.UNAUTHORIZED, "User is unavailable");
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

    // Admin endpoints
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(Authentication authentication) {
        var user = userRepository.findByUsername(authentication.getName());
        if (user.isEmpty()) return error(HttpStatus.NOT_FOUND, "User not found");
        Map<String, Object> userData = new LinkedHashMap<>();
        userData.put("id", user.get().getId());
        userData.put("username", user.get().getUsername());
        userData.put("email", user.get().getEmail());
        userData.put("roles", user.get().getRoles());
        return ResponseEntity.ok(userData);
    }

    @GetMapping("/staff/users")
    public ResponseEntity<Map<String, Object>> getStaffUserDirectory() {
        return ResponseEntity.ok(userDirectoryResponse());
    }

    @GetMapping("/admin/users")
    public ResponseEntity<Map<String, Object>> getAllUsers() {
        return ResponseEntity.ok(userDirectoryResponse());
    }

    @GetMapping("/admin/users/by-id/{id}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable Long id) {
        var user = userRepository.findById(id);
        if (user.isEmpty()) return error(HttpStatus.NOT_FOUND, "User not found");
        Map<String, Object> userData = new LinkedHashMap<>();
        userData.put("id", user.get().getId());
        userData.put("username", user.get().getUsername());
        userData.put("enabled", user.get().getEnabled());
        userData.put("roles", user.get().getRoles());
        return ResponseEntity.ok(userData);
    }

    private Map<String, Object> userDirectoryResponse() {
        var userList = users.getAllUsers();
        List<Map<String, Object>> usersData = userList.stream().map(user -> {
            Map<String, Object> userData = new LinkedHashMap<>();
            userData.put("id", user.getId());
            userData.put("username", user.getUsername());
            userData.put("email", user.getEmail());
            userData.put("roles", user.getRoles());
            userData.put("enabled", user.getEnabled());
            userData.put("createdAt", user.getCreatedAt());
            userData.put("lastLoginAt", user.getLastLoginAt());
            return userData;
        }).toList();
        return Map.of("users", usersData);
    }

    @GetMapping("/admin/users/{username}")
    public ResponseEntity<Map<String, Object>> getUserByUsername(@PathVariable String username) {
        var user = userRepository.findByUsername(username);
        if (user.isEmpty()) {
            return error(HttpStatus.NOT_FOUND, "User not found");
        }
        Map<String, Object> userData = new LinkedHashMap<>();
        userData.put("id", user.get().getId());
        userData.put("username", user.get().getUsername());
        userData.put("email", user.get().getEmail());
        userData.put("roles", user.get().getRoles());
        userData.put("enabled", user.get().getEnabled());
        return ResponseEntity.ok(userData);
    }

    @PostMapping("/admin/users")
    public ResponseEntity<Map<String, Object>> createUser(@Valid @RequestBody CreateUserRequest request) {
        var account = users.createUserWithRole(request.username(), request.password(), request.email(), request.roles());
        if (account.isEmpty()) {
            return error(HttpStatus.CONFLICT, "Username or email already exists");
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("username", account.get().username());
        body.put("roles", account.get().roles());
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @PutMapping("/admin/users/{username}/roles")
    public ResponseEntity<Map<String, Object>> updateUserRoles(@PathVariable String username, @Valid @RequestBody UpdateRolesRequest request) {
        var user = users.updateUserRoles(username, request.roles());
        if (user.isEmpty()) {
            return error(HttpStatus.NOT_FOUND, "User not found");
        }
        // A role change must not be carried forward by an existing refresh session.
        refreshTokenService.deleteByUsername(username);
        return ResponseEntity.ok(Map.of("username", user.get().getUsername(), "roles", user.get().getRoles()));
    }

    @PutMapping("/admin/users/{username}/ban")
    public ResponseEntity<Map<String, Object>> banUser(@PathVariable String username) {
        var user = users.setUserEnabled(username, false);
        if (user.isEmpty()) {
            return error(HttpStatus.NOT_FOUND, "User not found");
        }
        refreshTokenService.deleteByUsername(username);
        return ResponseEntity.ok(Map.of("status", "success", "message", "User banned successfully"));
    }

    @PutMapping("/admin/users/{username}/unban")
    public ResponseEntity<Map<String, Object>> unbanUser(@PathVariable String username) {
        var user = users.setUserEnabled(username, true);
        if (user.isEmpty()) {
            return error(HttpStatus.NOT_FOUND, "User not found");
        }
        return ResponseEntity.ok(Map.of("status", "success", "message", "User unbanned successfully"));
    }

    @DeleteMapping("/admin/users/{username}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable String username) {
        var user = users.findByUsername(username);
        if (user.isEmpty()) {
            return error(HttpStatus.NOT_FOUND, "User not found");
        }
        
        // Detach account data first. Fail closed so a recreated username cannot inherit the old portfolio.
        try {
            accountDataCleanupClient.cleanup(username);
        } catch (Exception e) {
            return error(HttpStatus.SERVICE_UNAVAILABLE, "Could not clean up the user's account data; user was not deleted");
        }

        // Delete refresh tokens for this user
        refreshTokenService.deleteByUsername(username);
        
        // Delete the user
        boolean deleted = users.deleteUser(username);
        if (!deleted) {
            return error(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to delete user");
        }
        
        return ResponseEntity.ok(Map.of("status", "success", "message", "User deleted successfully"));
    }

    // OTP endpoints for customer signup
    @PostMapping("/init-signup")
    public ResponseEntity<Map<String, Object>> initSignup(@Valid @RequestBody InitSignupRequest request) {
        // Check if user already exists
        if (users.findByUsername(request.username()).isPresent()) {
            return error(HttpStatus.CONFLICT, "Username '" + request.username() + "' is already taken. Please choose a different username.");
        }
        if (userRepository.existsByEmail(request.email())) {
            return error(HttpStatus.CONFLICT, "Email '" + request.email() + "' is already registered. Please use a different email or try logging in.");
        }

        // Generate OTP
        String otp = generateOtp();
        java.time.LocalDateTime expiresAt = java.time.LocalDateTime.now().plusMinutes(10);

        // Persist only hashes so a restart does not invalidate a live code or expose raw credentials.
        signupChallengeRepository.save(new SignupChallenge(request.email(), request.username(),
                passwordEncoder.encode(request.password()), hashOtp(otp), expiresAt));

        // Send OTP via email
        sendOtpEmail(request.email(), otp);

        return ResponseEntity.ok(Map.of("status", "success", "message", "OTP sent to your email"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        System.out.println("OTP Verification attempt for email: " + request.email());
        System.out.println("OTP provided: " + request.otp());
        
        SignupChallenge challenge = signupChallengeRepository.findById(request.email()).orElse(null);

        if (challenge == null) {
            System.out.println("OTP session not found for email: " + request.email());
            return error(HttpStatus.BAD_REQUEST, "OTP session expired or not found. Please start signup again.");
        }

        System.out.println("OTP session found for username: " + challenge.getUsername());
        System.out.println("OTP expires at: " + challenge.getExpiresAt());
        System.out.println("Current time: " + java.time.LocalDateTime.now());

        // Check if OTP expired
        if (java.time.LocalDateTime.now().isAfter(challenge.getExpiresAt())) {
            System.out.println("OTP expired for email: " + request.email());
            signupChallengeRepository.delete(challenge);
            return error(HttpStatus.GONE, "OTP has expired. Please request a new one.");
        }

        // Verify OTP using SHA-256 hash comparison
        String providedOtpHash = hashOtp(request.otp().trim());
        String storedOtpHash = challenge.getOtpHash();
        System.out.println("Provided OTP hash: " + providedOtpHash);
        System.out.println("Stored OTP hash: " + storedOtpHash);
        System.out.println("Hashes match: " + providedOtpHash.equals(storedOtpHash));
        
        if (!providedOtpHash.equals(storedOtpHash)) {
            System.out.println("Invalid OTP for email: " + request.email());
            return error(HttpStatus.BAD_REQUEST, "Invalid OTP. Please try again.");
        }

        System.out.println("OTP verified successfully for email: " + request.email());

        // Create user account in auth DB
        var account = users.createUserWithPasswordHash(challenge.getUsername(), challenge.getPasswordHash(),
                challenge.getEmail(), List.of("CUSTOMER"));
        if (account.isEmpty()) {
            System.out.println("User creation failed for username: " + challenge.getUsername());
            signupChallengeRepository.delete(challenge);
            return error(HttpStatus.CONFLICT, "Username or email already exists");
        }

        System.out.println("User created successfully: " + account.get().username());
        
        // Get the user ID from the created user entity
        Long userId = userRepository.findByUsername(challenge.getUsername())
            .map(user -> user.getId())
            .orElse(null);
        System.out.println("User ID from auth DB: " + userId);
        
        if (userId != null) {
            // Store user_id in challenge before syncing
            challenge.setUserId(userId);
            signupChallengeRepository.save(challenge);
            
            // Sync with fd-account-service - create customer profile with correct user_id
            try {
                accountDataCleanupClient.syncCustomerProfile(challenge.getUsername(), challenge.getEmail(), userId);
                System.out.println("Successfully synced customer profile to fd-account-service for user: " + challenge.getUsername());
            } catch (Exception e) {
                System.err.println("Failed to sync customer profile to fd-account-service: " + e.getMessage());
                // Don't fail the signup if sync fails - user can still apply for FD later
            }
        }
        
        signupChallengeRepository.delete(challenge);

        // Generate tokens
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

    @PostMapping("/resend-otp")
    public ResponseEntity<Map<String, Object>> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        SignupChallenge existingData = signupChallengeRepository.findById(request.email()).orElse(null);

        if (existingData == null) {
            return error(HttpStatus.BAD_REQUEST, "No pending signup found. Please start signup again.");
        }

        // Generate new OTP
        String newOtp = generateOtp();
        java.time.LocalDateTime newExpiresAt = java.time.LocalDateTime.now().plusMinutes(10);

        // Update OTP data
        existingData.setOtpHash(hashOtp(newOtp));
        existingData.setExpiresAt(newExpiresAt);
        signupChallengeRepository.save(existingData);

        // Send new OTP via email
        sendOtpEmail(request.email(), newOtp);

        return ResponseEntity.ok(Map.of("status", "success", "message", "New OTP sent to your email"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Map<String, Object>> invalid(MethodArgumentNotValidException ex) {
        return error(HttpStatus.BAD_REQUEST, "Invalid request parameters");
    }

    private static ResponseEntity<Map<String, Object>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("status", "error", "message", message));
    }
}
