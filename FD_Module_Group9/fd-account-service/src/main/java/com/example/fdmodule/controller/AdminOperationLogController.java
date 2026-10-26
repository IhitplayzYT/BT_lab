package com.example.fdmodule.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/admin/operation-logs")
public class AdminOperationLogController {
    public record CreateLogRequest(
            @NotBlank @Pattern(regexp = "[A-Z][A-Z0-9_]{1,63}") String operationType,
            @NotBlank @Size(max = 64) String targetType,
            @Size(max = 255) String targetId,
            @NotBlank @Size(max = 512) String summary) { }

    public record OperationLog(
            long logId,
            String actor,
            String operationType,
            String targetType,
            String targetId,
            String summary,
            LocalDateTime occurredAt) { }

    public record OperationLogPage(List<OperationLog> logs, long totalElements, int page, int size) { }

    private final JdbcTemplate jdbc;

    public AdminOperationLogController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** Staff clients write a compact summary after a successful operation; actor comes from JWT. */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','BANK_OFFICER','CUSTOMER')")
    public ResponseEntity<OperationLog> create(@Valid @RequestBody CreateLogRequest request,
                                                Authentication authentication) {
        boolean staff = authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN")
                        || authority.getAuthority().equals("ROLE_BANK_OFFICER"));
        if (!staff && !Set.of("FD_APPLICATION_SUBMITTED", "FD_BUNDLE_SUBMITTED", "FD_PREMATURE_WITHDRAWAL")
                .contains(request.operationType())) {
            throw new org.springframework.security.access.AccessDeniedException("Customers may only log their own FD operations");
        }
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            var statement = connection.prepareStatement(
                    "INSERT INTO admin_operation_logs(actor,operation_type,target_type,target_id,summary) VALUES(?,?,?,?,?)",
                    Statement.RETURN_GENERATED_KEYS);
            statement.setString(1, authentication.getName());
            statement.setString(2, request.operationType());
            statement.setString(3, request.targetType());
            statement.setString(4, request.targetId());
            statement.setString(5, request.summary());
            return statement;
        }, keyHolder);
        long logId = keyHolder.getKey().longValue();
        OperationLog created = jdbc.queryForObject(
                "SELECT log_id,actor,operation_type,target_type,target_id,summary,occurred_at FROM admin_operation_logs WHERE log_id=?",
                (rs, rowNum) -> new OperationLog(rs.getLong("log_id"), rs.getString("actor"),
                        rs.getString("operation_type"), rs.getString("target_type"), rs.getString("target_id"),
                        rs.getString("summary"), rs.getTimestamp("occurred_at").toLocalDateTime()), logId);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public OperationLogPage search(
            @RequestParam(required = false) String operationType,
            @RequestParam(required = false) String actor,
            @RequestParam(required = false) String target,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "time") String sortBy,
            @RequestParam(defaultValue = "DESC") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        if (page < 0 || size < 1 || size > 100) {
            throw new IllegalArgumentException("Page must be non-negative and size must be between 1 and 100");
        }
        if (from != null && to != null && from.isAfter(to)) {
            throw new IllegalArgumentException("From time must be before To time");
        }
        String direction = "ASC".equalsIgnoreCase(sort) ? "ASC" : "DESC";
        String sortColumn = switch (sortBy.toLowerCase()) {
            case "operationtype" -> "operation_type";
            case "actor" -> "actor";
            case "target" -> "target_id";
            default -> "occurred_at";
        };
        StringBuilder where = new StringBuilder(" WHERE 1=1");
        List<Object> args = new ArrayList<>();
        if (operationType != null && !operationType.isBlank()) {
            where.append(" AND operation_type=?");
            args.add(operationType.trim().toUpperCase());
        }
        if (actor != null && !actor.isBlank()) {
            where.append(" AND actor LIKE ?");
            args.add("%" + actor.trim() + "%");
        }
        if (target != null && !target.isBlank()) {
            where.append(" AND (target_id LIKE ? OR summary LIKE ?)");
            args.add("%" + target.trim() + "%");
            args.add("%" + target.trim() + "%");
        }
        if (from != null) {
            where.append(" AND occurred_at>=?");
            args.add(from);
        }
        if (to != null) {
            where.append(" AND occurred_at<=?");
            args.add(to);
        }

        long total = jdbc.queryForObject("SELECT COUNT(*) FROM admin_operation_logs" + where, Long.class, args.toArray());
        List<Object> pageArgs = new ArrayList<>(args);
        pageArgs.add(size);
        pageArgs.add((long) page * size);
        List<OperationLog> logs = jdbc.query(
                "SELECT log_id,actor,operation_type,target_type,target_id,summary,occurred_at FROM admin_operation_logs"
                        + where + " ORDER BY " + sortColumn + " " + direction + ",occurred_at DESC,log_id DESC LIMIT ? OFFSET ?",
                (rs, rowNum) -> new OperationLog(rs.getLong("log_id"), rs.getString("actor"),
                        rs.getString("operation_type"), rs.getString("target_type"), rs.getString("target_id"),
                        rs.getString("summary"), rs.getTimestamp("occurred_at").toLocalDateTime()),
                pageArgs.toArray());
        return new OperationLogPage(logs, total, page, size);
    }
}
