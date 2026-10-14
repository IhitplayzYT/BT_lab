package com.example.fdbatch;
import jakarta.validation.Valid;import jakarta.validation.constraints.*;import org.springframework.web.bind.annotation.*;import org.springframework.security.access.prepost.PreAuthorize;import org.springframework.security.core.Authentication;import org.springframework.http.ResponseEntity;import java.time.LocalDate;
@RestController @RequestMapping("/api/admin/interest-batches") @PreAuthorize("hasRole('ADMIN')") public class BatchController {
 private final BatchService service;public BatchController(BatchService service){this.service=service;}
 public record Request(@NotBlank String requestId,@NotNull LocalDate businessDate,@NotBlank String type,String fdAccountNo){}
 @PostMapping public ResponseEntity<Object> submit(@Valid @RequestBody Request r,Authentication a){return ResponseEntity.accepted().body(service.request(r.requestId(),r.type(),r.businessDate(),r.fdAccountNo(),a.getName()));}
 @GetMapping public Object list(){return service.list();}@GetMapping("/{id}") public Object get(@PathVariable String id){return service.get(id);}
}
