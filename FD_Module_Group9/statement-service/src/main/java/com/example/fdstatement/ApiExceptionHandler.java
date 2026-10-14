package com.example.fdstatement;
import org.springframework.web.bind.annotation.*;import org.springframework.http.*;import java.util.Map;
@RestControllerAdvice public class ApiExceptionHandler {
 @ExceptionHandler(IllegalArgumentException.class) ResponseEntity<Object> bad(IllegalArgumentException e){return ResponseEntity.badRequest().body(Map.of("status","error","message",e.getMessage()));}
 @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class) ResponseEntity<Object> invalid(Exception e){return ResponseEntity.badRequest().body(Map.of("status","error","message","Invalid request fields"));}
 @ExceptionHandler(org.springframework.dao.DuplicateKeyException.class) ResponseEntity<Object> conflict(Exception e){return ResponseEntity.status(409).body(Map.of("status","error","message","Concurrent duplicate request; retry the same request ID"));}
}
