package com.example.fdmodule.clock;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/** Test hook for Lab L20 lifecycle testing - available to all roles for testing. */
@RestController
@RequestMapping("/api/fd/clock")
@PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN','CUSTOMER')")
public class ClockController {
    private final BusinessClock clock;

    public ClockController(BusinessClock clock) { this.clock = clock; }

    @GetMapping
    public Map<String, Object> status() { return view(); }

    @PostMapping("/advance")
    public Map<String, Object> advance(@RequestBody Map<String, Integer> body) {
        Integer days = body.get("days");
        if (days == null) throw new IllegalArgumentException("days is required");
        clock.advance(days);
        return view();
    }

    @PostMapping("/reset")
    public Map<String, Object> reset() {
        clock.reset();
        return view();
    }

    private Map<String, Object> view() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("timeTravelEnabled", clock.isEnabled());
        m.put("realDate", clock.realToday().toString());
        m.put("businessDate", clock.today().toString());
        m.put("offsetDays", clock.isEnabled() ? clock.offsetDays() : 0);
        return m;
    }
}
