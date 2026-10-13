package com.bank.product.exception;

import com.bank.product.dto.ErrorDetails;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import com.fasterxml.jackson.databind.JsonMappingException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ProductNotFoundException.class)
    public ResponseEntity<ErrorDetails> handleProductNotFoundException(ProductNotFoundException ex, HttpServletRequest request) {
        ErrorDetails errorDetails = ErrorDetails.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.NOT_FOUND.value())
                .errorCode("PRODUCT_NOT_FOUND")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .details(request.getRequestURI())
                .build();
        return new ResponseEntity<>(errorDetails, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(DuplicateProductException.class)
    public ResponseEntity<ErrorDetails> handleDuplicateProductException(DuplicateProductException ex, HttpServletRequest request) {
        ErrorDetails errorDetails = ErrorDetails.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.CONFLICT.value())
                .errorCode("DUPLICATE_PRODUCT")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .details(request.getRequestURI())
                .build();
        return new ResponseEntity<>(errorDetails, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(InvalidProductRuleException.class)
    public ResponseEntity<ErrorDetails> handleInvalidProductRuleException(InvalidProductRuleException ex, HttpServletRequest request) {
        ErrorDetails errorDetails = ErrorDetails.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .errorCode("INVALID_PRODUCT_RULE")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .details(request.getRequestURI())
                .build();
        return new ResponseEntity<>(errorDetails, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(InvalidProductException.class)
    public ResponseEntity<ErrorDetails> handleInvalidProductException(InvalidProductException ex, HttpServletRequest request) {
        ErrorDetails errorDetails = ErrorDetails.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .errorCode("INVALID_PRODUCT")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .details(request.getRequestURI())
                .build();
        return new ResponseEntity<>(errorDetails, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ProductInactiveException.class)
    public ResponseEntity<ErrorDetails> handleProductInactiveException(ProductInactiveException ex, HttpServletRequest request) {
        ErrorDetails errorDetails = ErrorDetails.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.UNPROCESSABLE_ENTITY.value())
                .errorCode("PRODUCT_INACTIVE")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .details(request.getRequestURI())
                .build();
        return new ResponseEntity<>(errorDetails, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorDetails> handleValidationException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        // Sorted by field name so the message is deterministic; several messages for one field are joined.
        Map<String, String> fieldErrors = new TreeMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.merge(fe.getField(), String.valueOf(fe.getDefaultMessage()), (x, y) -> x + "; " + y);
        }
        String validationErrors = fieldErrors.entrySet().stream()
                .map(e -> e.getKey() + ": " + e.getValue())
                .collect(Collectors.joining(", "));

        ErrorDetails errorDetails = ErrorDetails.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .errorCode("VALIDATION_FAILED")
                .message("Validation failed: " + validationErrors)
                .path(request.getRequestURI())
                .details(validationErrors)
                .fieldErrors(fieldErrors)
                .build();
        return new ResponseEntity<>(errorDetails, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorDetails> handleUnreadableBody(HttpMessageNotReadableException ex, HttpServletRequest request) {
        String message = "Malformed JSON request body";
        if (ex.getCause() instanceof JsonMappingException jme && !jme.getPath().isEmpty()) {
            String field = jme.getPath().stream()
                    .map(ref -> ref.getFieldName() != null ? ref.getFieldName() : "[" + ref.getIndex() + "]")
                    .collect(Collectors.joining(".")).replace(".[", "[");
            message = "Invalid value for field '" + field + "' in request body";
        }
        return error(HttpStatus.BAD_REQUEST, "MALFORMED_REQUEST", message, request);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorDetails> handleTypeMismatch(MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        return error(HttpStatus.BAD_REQUEST, "INVALID_PARAMETER",
                "Parameter '" + ex.getName() + "' has an invalid value: '" + ex.getValue() + "'", request);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorDetails> handleMissingParameter(MissingServletRequestParameterException ex, HttpServletRequest request) {
        return error(HttpStatus.BAD_REQUEST, "MISSING_PARAMETER",
                "Required parameter '" + ex.getParameterName() + "' is missing", request);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorDetails> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {
        return error(HttpStatus.METHOD_NOT_ALLOWED, "METHOD_NOT_ALLOWED", "HTTP method " + ex.getMethod() + " is not supported here", request);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ErrorDetails> handleMediaType(HttpMediaTypeNotSupportedException ex, HttpServletRequest request) {
        return error(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "UNSUPPORTED_MEDIA_TYPE", "Content type is not supported; use application/json", request);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorDetails> handleNoResource(NoResourceFoundException ex, HttpServletRequest request) {
        return error(HttpStatus.NOT_FOUND, "NOT_FOUND", "No resource found at " + request.getRequestURI(), request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorDetails> handleAccessDeniedException(AccessDeniedException ex, HttpServletRequest request) {
        ErrorDetails errorDetails = ErrorDetails.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.FORBIDDEN.value())
                .errorCode("FORBIDDEN")
                .message("Access is denied for current role: " + ex.getMessage())
                .path(request.getRequestURI())
                .details(request.getRequestURI())
                .build();
        return new ResponseEntity<>(errorDetails, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorDetails> handleAuthenticationException(AuthenticationException ex, HttpServletRequest request) {
        ErrorDetails errorDetails = ErrorDetails.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.UNAUTHORIZED.value())
                .errorCode("UNAUTHORIZED")
                .message("Full authentication is required: " + ex.getMessage())
                .path(request.getRequestURI())
                .details(request.getRequestURI())
                .build();
        return new ResponseEntity<>(errorDetails, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorDetails> handleIllegalArgumentException(IllegalArgumentException ex, HttpServletRequest request) {
        ErrorDetails errorDetails = ErrorDetails.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .errorCode("INVALID_ARGUMENT")
                .message("Invalid arguments: " + ex.getMessage())
                .path(request.getRequestURI())
                .details(request.getRequestURI())
                .build();
        return new ResponseEntity<>(errorDetails, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorDetails> handleGlobalException(Exception ex, HttpServletRequest request) {
        ErrorDetails errorDetails = ErrorDetails.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .errorCode("INTERNAL_SERVER_ERROR")
                .message("An unexpected error occurred: " + ex.getMessage())
                .path(request.getRequestURI())
                .details(request.getRequestURI())
                .build();
        return new ResponseEntity<>(errorDetails, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private ResponseEntity<ErrorDetails> error(HttpStatus status, String code, String message, HttpServletRequest request) {
        ErrorDetails body = ErrorDetails.builder()
                .timestamp(Instant.now())
                .status(status.value())
                .errorCode(code)
                .message(message)
                .path(request.getRequestURI())
                .details(request.getRequestURI())
                .build();
        return new ResponseEntity<>(body, status);
    }
}
