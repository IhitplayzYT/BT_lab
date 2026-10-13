package com.bank.calculator.exception;

import com.bank.calculator.dto.response.ErrorResponse;
import com.bank.calculator.util.CorrelationIdFilter;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

/**
 * Global exception handler for the FD Calculator microservice.
 *
 * <p>Returns structured {@link ErrorResponse} for all exceptions.
 * Stack traces are never sent to clients — they are logged internally.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── Domain exceptions ──────────────────────────────────────────────────

    @ExceptionHandler(ProductNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleProductNotFound(
            ProductNotFoundException ex, HttpServletRequest req) {
        return respond(HttpStatus.NOT_FOUND, ex.getErrorCode(), ex.getMessage(), req);
    }

    @ExceptionHandler(InactiveProductException.class)
    public ResponseEntity<ErrorResponse> handleInactiveProduct(
            InactiveProductException ex, HttpServletRequest req) {
        return respond(HttpStatus.UNPROCESSABLE_ENTITY, ex.getErrorCode(), ex.getMessage(), req);
    }

    @ExceptionHandler(InvalidPrincipalException.class)
    public ResponseEntity<ErrorResponse> handleInvalidPrincipal(
            InvalidPrincipalException ex, HttpServletRequest req) {
        return respond(HttpStatus.UNPROCESSABLE_ENTITY, ex.getErrorCode(), ex.getMessage(), req);
    }

    @ExceptionHandler(InvalidTermException.class)
    public ResponseEntity<ErrorResponse> handleInvalidTerm(
            InvalidTermException ex, HttpServletRequest req) {
        return respond(HttpStatus.UNPROCESSABLE_ENTITY, ex.getErrorCode(), ex.getMessage(), req);
    }

    @ExceptionHandler(UnsupportedPayoutModeException.class)
    public ResponseEntity<ErrorResponse> handleUnsupportedPayout(
            UnsupportedPayoutModeException ex, HttpServletRequest req) {
        return respond(HttpStatus.UNPROCESSABLE_ENTITY, ex.getErrorCode(), ex.getMessage(), req);
    }

    @ExceptionHandler(CalculationNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleCalculationNotFound(
            CalculationNotFoundException ex, HttpServletRequest req) {
        return respond(HttpStatus.NOT_FOUND, ex.getErrorCode(), ex.getMessage(), req);
    }

    @ExceptionHandler(ServiceUnavailableException.class)
    public ResponseEntity<ErrorResponse> handleServiceUnavailable(
            ServiceUnavailableException ex, HttpServletRequest req) {
        return respond(HttpStatus.SERVICE_UNAVAILABLE, ex.getErrorCode(), ex.getMessage(), req);
    }

    // ── Spring Validation ──────────────────────────────────────────────────

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex, HttpServletRequest req) {
        String details = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        return respond(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", details, req);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleMalformedJson(
            HttpMessageNotReadableException ex, HttpServletRequest req) {
        return respond(HttpStatus.BAD_REQUEST, "MALFORMED_REQUEST",
                "Request body is malformed or missing", req);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex, HttpServletRequest req) {
        return respond(HttpStatus.BAD_REQUEST, "INVALID_ARGUMENT",
                ex.getMessage(), req);
    }

    // ── Security ───────────────────────────────────────────────────────────

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthentication(
            AuthenticationException ex, HttpServletRequest req) {
        return respond(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED",
                "Authentication required", req);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest req) {
        return respond(HttpStatus.FORBIDDEN, "FORBIDDEN",
                "You do not have permission to access this resource", req);
    }

    // ── Catch-all ──────────────────────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(
            Exception ex, HttpServletRequest req) {
        // Log internally but never expose stack trace to caller
        org.slf4j.LoggerFactory.getLogger(GlobalExceptionHandler.class)
                .error("[{}] Unexpected error on {}: {}",
                       MDC.get(CorrelationIdFilter.MDC_KEY),
                       req.getRequestURI(), ex.getMessage(), ex);
        return respond(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR",
                "An unexpected error occurred. Please contact support.", req);
    }

    // ── Helper ─────────────────────────────────────────────────────────────

    private ResponseEntity<ErrorResponse> respond(
            HttpStatus status, String errorCode, String message, HttpServletRequest req) {
        String requestId = MDC.get(CorrelationIdFilter.MDC_KEY);
        ErrorResponse body = ErrorResponse.of(
                status.value(), errorCode, message, req.getRequestURI(), requestId);
        return ResponseEntity.status(status).body(body);
    }
}
