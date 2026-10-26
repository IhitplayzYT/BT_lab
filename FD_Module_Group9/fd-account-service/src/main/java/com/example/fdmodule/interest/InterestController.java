package com.example.fdmodule.interest;
import jakarta.validation.Valid;import jakarta.validation.constraints.*;import org.springframework.security.access.prepost.PreAuthorize;import org.springframework.security.core.Authentication;import org.springframework.web.bind.annotation.*;import java.math.BigDecimal;import java.util.*;
@RestController @RequestMapping("/api/fd/interest") public class InterestController {
 private final InterestPostingService service;public InterestController(InterestPostingService service){this.service=service;}
 public record Quote(@NotNull @DecimalMin("0.01") BigDecimal principal,@NotNull @DecimalMin("0") BigDecimal annualRate,@Min(1) @Max(1200) int months,@NotBlank String mode){}
 public record Settings(@NotBlank String mode){}
 @PostMapping("/quote") @PreAuthorize("hasAnyRole('ADMIN','BANK_OFFICER','CUSTOMER')") public Map<String,Object> quote(@Valid @RequestBody Quote q){BigDecimal amount=InterestEngine.quote(q.principal(),q.annualRate(),q.months(),q.mode());return Map.of("maturityAmount",amount,"interest",amount.subtract(q.principal()),"mode",q.mode(),"basis","Monthly quotation; actual daily accrual may differ");}
 @GetMapping("/accounts") @PreAuthorize("hasAnyRole('ADMIN','BANK_OFFICER')") public Object accounts(){return service.accounts();}
 @GetMapping("/mine") @PreAuthorize("hasRole('CUSTOMER')") public Object mine(Authentication authentication){return service.accountsForCustomer(authentication.getName());}
 @PutMapping("/{account}/settings") @PreAuthorize("hasRole('ADMIN')") public Map<String,String> configure(@PathVariable String account,@Valid @RequestBody Settings s){service.configure(account,s.mode());return Map.of("fdAccountNo",account,"mode",s.mode());}
}
