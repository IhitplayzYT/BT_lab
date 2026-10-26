package com.example.fdmodule.controller;

import com.example.fdmodule.service.UserDataCleanupService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/internal/users")
public class UserDataCleanupController {
    private final UserDataCleanupService cleanup;

    public UserDataCleanupController(UserDataCleanupService cleanup) {
        this.cleanup = cleanup;
    }

    @DeleteMapping("/{username}/portfolio")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, String> cleanup(@PathVariable String username) {
        cleanup.detach(username);
        return Map.of("status", "success");
    }

    @PostMapping("/sync-profile")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, String> syncProfile(@RequestBody Map<String, Object> request) {
        String username = (String) request.get("username");
        String email = (String) request.get("email");
        Long userId = request.get("userId") != null ? Long.valueOf(request.get("userId").toString()) : null;
        
        cleanup.syncCustomerProfile(username, email, userId);
        return Map.of("status", "success", "message", "Customer profile synced successfully");
    }
}
