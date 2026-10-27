package com.example.fdnotify;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private static final String COLS = "id,event_type,fd_account_no,customer_id,channel,subject,body,status,created_at";
    private final JdbcTemplate jdbc;
    private final RestTemplate restTemplate;
    private final String accountServiceUrl;

    public NotificationController(JdbcTemplate jdbc, RestTemplate restTemplate,
                                  @Value("${account.service.url:http://localhost:8086}") String accountServiceUrl) {
        this.jdbc = jdbc;
        this.restTemplate = restTemplate;
        this.accountServiceUrl = accountServiceUrl;
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('CUSTOMER')")
    public List<Map<String, Object>> listMine(@org.springframework.web.bind.annotation.RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
                                               @RequestParam(defaultValue = "50") int limit,
                                               @RequestParam(defaultValue = "0") int offset) {
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.AUTHORIZATION, authorization);
        Map<?, ?> identity = restTemplate.exchange(accountServiceUrl + "/api/fd/account/profile",
                HttpMethod.GET, new HttpEntity<>(headers), Map.class).getBody();
        // The account service validates this forwarded token and returns only the
        // customer IDs linked to its subject.
        if (identity == null) return List.of();
        Object rawIds = identity.get("customerIds");
        if (!(rawIds instanceof List<?> ids) || ids.isEmpty()) return List.of();
        List<String> customerIds = ids.stream().filter(String.class::isInstance).map(String.class::cast).distinct().toList();
        if (customerIds.isEmpty()) return List.of();
        int n = Math.min(Math.max(limit, 1), 200);
        int start = Math.max(offset, 0);
        String placeholders = String.join(",", java.util.Collections.nCopies(customerIds.size(), "?"));
        List<Object> args = new java.util.ArrayList<>(customerIds);
        args.add(n);
        args.add(start);
        // The dashboard is an in-app event feed, so it must not depend on email
        // delivery being configured. Return a single usable channel record for
        // each event, preferring EMAIL when both channels were recorded.
        String sql = "SELECT " + COLS + " FROM notifications_log n "
                + "WHERE n.status NOT IN ('SKIPPED','BATCHED') AND n.customer_id IN (" + placeholders + ") "
                + "AND (n.channel='EMAIL' OR NOT EXISTS ("
                + "SELECT 1 FROM notifications_log email_log "
                + "WHERE email_log.event_id=n.event_id AND email_log.customer_id=n.customer_id "
                + "AND email_log.channel='EMAIL' AND email_log.status NOT IN ('SKIPPED','BATCHED'))) "
                + "ORDER BY n.id DESC LIMIT ? OFFSET ?";
        return jdbc.queryForList(sql, args.toArray());
    }

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
