package com.example.fdnotify;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private static final String COLS = "id,event_type,fd_account_no,customer_id,channel,recipient,subject,status,error,created_at";
    private final JdbcTemplate jdbc;

    public NotificationController(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','BANK_OFFICER')")
    public List<Map<String, Object>> list(@RequestParam(required = false) String fdAccountNo,
                                          @RequestParam(defaultValue = "50") int limit,
                                          @RequestParam(defaultValue = "0") int offset) {
        int n = Math.min(Math.max(limit, 1), 200);
        int start = Math.max(offset, 0);
        if (fdAccountNo != null && !fdAccountNo.isBlank()) {
            return jdbc.queryForList("SELECT " + COLS + " FROM notifications_log WHERE fd_account_no=? ORDER BY id DESC LIMIT ? OFFSET ?", fdAccountNo, n, start);
        }
        return jdbc.queryForList("SELECT " + COLS + " FROM notifications_log ORDER BY id DESC LIMIT ? OFFSET ?", n, start);
    }
}
