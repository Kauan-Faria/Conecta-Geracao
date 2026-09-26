package com.conectageracao.adminapi.dto;

import java.time.LocalDateTime;

public record ConsumptionAlertResponse(
        Long id,
        Long userId,
        LocalDateTime periodStart,
        LocalDateTime periodEnd,
        Long tokenTotal,
        String message,
        LocalDateTime createdAt
) {}
