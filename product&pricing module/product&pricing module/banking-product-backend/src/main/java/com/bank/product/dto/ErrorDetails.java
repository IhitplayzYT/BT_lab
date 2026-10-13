package com.bank.product.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorDetails {
    private Instant timestamp;
    private Integer status;
    private String errorCode;
    private String message;
    private String path;
    private String details;
    /** Only present on VALIDATION_FAILED: request field name to message. */
    private Map<String, String> fieldErrors;
}
