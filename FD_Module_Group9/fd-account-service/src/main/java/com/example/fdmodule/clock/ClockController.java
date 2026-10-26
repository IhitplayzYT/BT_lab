package com.example.fdmodule.clock;

import com.example.fdmodule.interest.InterestPostingService;
import com.example.fdmodule.maturity.MaturityService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

/** Test hook for Lab L20 lifecycle testing - available to all roles for testing. */
@RestController
@RequestMapping("/api/fd/clock")
@PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN','CUSTOMER')")
public class ClockController {
    private final BusinessClock clock;
    private final InterestPostingService interest;
    private final MaturityService maturity;

    public ClockController(BusinessClock clock, InterestPostingService interest, MaturityService maturity) {
        this.clock = clock;
        this.interest = interest;
        this.maturity = maturity;
    }

    @GetMapping
    public Map<String, Object> status() { return view(); }

    @PostMapping("/advance")
    public Map<String, Object> advance(@RequestBody Map<String, Integer> body, Authentication auth) {
        Integer days = body.get("days");
        if (days == null) throw new IllegalArgumentException("days is required");
        clock.advance(days);

        // Trigger interest accrual and maturity checks after time advance
        // Accrual is for completed banking days. The current business date is
        // still in progress, just as it is for the daily scheduler.
        LocalDate completedBusinessDate = clock.today().minusDays(1);
        String actor = auth.getName();

        try {
            // Process completed-day interest under a clock-specific request path.
            if (interest != null) {
                String requestId = java.util.UUID.randomUUID().toString();
                interest.processClockAdvance(requestId, completedBusinessDate, actor);
            }

            // Process maturity checks for the new business date
            if (maturity != null) {
                maturity.run(clock.today(), actor);
            }
        } catch (Exception e) {
            // Log but don't fail the time advance - accrual/maturity can be run separately
            System.err.println("Error during post-advance accrual/maturity: " + e.getMessage());
        }

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
