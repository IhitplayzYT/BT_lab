package com.example.fdmodule.clock;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

/**
 * The bank's "business date". Normally it equals today's date in IST. For lifecycle testing (Lab L20) it can be
 * advanced by N days so interest, maturity and early-withdrawal can be shown without waiting months.
 * Disabled unless app.time-travel.enabled=true, so normal behaviour is always the real calendar.
 */
@Component
public class BusinessClock {
    static final ZoneId IST = ZoneId.of("Asia/Kolkata");
    private final JdbcTemplate jdbc;
    private final boolean enabled;

    public BusinessClock(JdbcTemplate jdbc, @Value("${app.time-travel.enabled:false}") boolean enabled) {
        this.jdbc = jdbc;
        this.enabled = enabled;
        // MySQL's docker-entrypoint init scripts only run for a new data volume. Ensure
        // this small runtime state table also exists when upgrading an existing volume.
        jdbc.execute("CREATE TABLE IF NOT EXISTS business_clock (id INT NOT NULL PRIMARY KEY, day_offset INT NOT NULL DEFAULT 0)");
        jdbc.update("INSERT IGNORE INTO business_clock(id, day_offset) VALUES(1, 0)");
    }

    public boolean isEnabled() { return enabled; }

    public LocalDate realToday() { return LocalDate.now(IST); }

    /** Use this instead of LocalDate.now() in business logic and batch jobs. */
    public LocalDate today() { return enabled ? realToday().plusDays(offsetDays()) : realToday(); }

    public int offsetDays() {
        try {
            List<Integer> rows = jdbc.queryForList("SELECT day_offset FROM business_clock WHERE id=1", Integer.class);
            return rows.isEmpty() || rows.get(0) == null ? 0 : rows.get(0);
        } catch (DataAccessException e) {
            return 0; // Keep date reads available during a transient database issue.
        }
    }

    @Transactional
    public int advance(int days) {
        requireEnabled();
        if (days < 1 || days > 3650) throw new IllegalArgumentException("days must be between 1 and 3650");
        int next = offsetDays() + days;
        set(next);
        return next;
    }

    @Transactional
    public void reset() {
        requireEnabled();
        set(0);
    }

    private void requireEnabled() {
        if (!enabled) throw new IllegalArgumentException("Time travel is disabled. Start the service with APP_TIME_TRAVEL_ENABLED=true");
    }

    private void set(int value) {
        if (jdbc.update("UPDATE business_clock SET day_offset=? WHERE id=1", value) == 0)
            jdbc.update("INSERT INTO business_clock(id,day_offset) VALUES(1,?)", value);
    }
}
