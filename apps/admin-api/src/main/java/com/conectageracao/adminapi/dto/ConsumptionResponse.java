package com.conectageracao.adminapi.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ConsumptionResponse(
        Long userId,
        LocalDateTime periodStart,
        LocalDateTime periodEnd,
        Long tokenTotal,
        String formattedText,
        List<ConsumptionAlertResponse> alerts,
        List<ConsumptionReportLineResponse> report
) {}
