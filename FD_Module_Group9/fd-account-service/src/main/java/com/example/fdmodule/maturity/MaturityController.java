package com.example.fdmodule.maturity;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

/** Manual maturity run (e.g. catch-up after downtime). Same work as the 04:00 job. */
@RestController
@RequestMapping("/api/fd/maturity")
public class MaturityController {

    public record RunRequest(LocalDate businessDate) {
    }

    private final MaturityService service;

    public MaturityController(MaturityService service) {
        this.service = service;
    }

    @PostMapping("/run")
    @PreAuthorize("hasRole('ADMIN')")
    public MaturityService.Result run(@RequestBody(required = false) RunRequest request, Authentication auth) {
        LocalDate date = request == null || request.businessDate() == null
                ? service.today() : request.businessDate();
        return service.run(date, auth.getName());
    }
}
