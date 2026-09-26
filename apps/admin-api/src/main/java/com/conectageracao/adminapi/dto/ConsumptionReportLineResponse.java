package com.conectageracao.adminapi.dto;

public record ConsumptionReportLineResponse(
        Long userId,
        String name,
        Long tokenTotal,
        boolean hasAlert
) {}
