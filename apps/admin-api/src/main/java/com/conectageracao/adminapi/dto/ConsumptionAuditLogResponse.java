package com.conectageracao.adminapi.dto;

import java.time.LocalDateTime;

public record ConsumptionAuditLogResponse(
        Long id,
        Long alertId,
        String operation,
        Long userId,
        Long tokenTotal,
        String message,
        LocalDateTime registeredAt
) {}
