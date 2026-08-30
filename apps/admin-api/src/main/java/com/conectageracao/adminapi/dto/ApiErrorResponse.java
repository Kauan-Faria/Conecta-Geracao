package com.conectageracao.adminapi.dto;

import java.time.Instant;
import java.util.List;

public record ApiErrorResponse(
        String code,
        String message,
        Instant timestamp,
        List<String> details
) {
    public static ApiErrorResponse of(String code, String message) {
        return new ApiErrorResponse(code, message, Instant.now(), List.of());
    }

    public static ApiErrorResponse of(String code, String message, List<String> details) {
        return new ApiErrorResponse(code, message, Instant.now(), details);
    }
}
