package com.example.fdstatement;
import org.springframework.web.bind.annotation.*;import org.springframework.security.access.prepost.PreAuthorize;
@RestController @RequestMapping("/api/statements") @PreAuthorize("hasAnyRole('ADMIN','BANK_OFFICER')") public class StatementController {
 private final StatementService service;public StatementController(StatementService service){this.service=service;}
 @GetMapping("/{account}") public Object list(@PathVariable String account){return service.list(account);}
 @GetMapping("/summary/all") public Object summary(){return service.summary();}
}
