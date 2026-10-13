package com.bank.calculator.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

/**
 * Standard error response body returned by the global exception handler.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Standard error response")
public record ErrorResponse(

    @Schema(description = "Error timestamp (UTC)", example = "2026-09-11T12:00:00Z")
    Instant timestamp,

    @Schema(description = "HTTP status code", example = "422")
    int status,

    @Schema(description = "Machine-readable error code", example = "INVALID_TERM")
    String error,

    @Schema(description = "Human-readable error description")
    String message,

    @Schema(description = "Request path that produced this error", example = "/api/v1/fd/calculations")
    String path,

    @Schema(description = "Correlation / request ID from X-Request-ID header")
    String requestId

) {
    public static ErrorResponse of(int status, String error, String message, String path, String requestId) {
        return new ErrorResponse(Instant.now(), status, error, message, path, requestId);
    }
}
