package com.conectageracao.adminapi.dto;

public record ConsumptionDynamicTotalsResponse(
        Long readingTotal,
        Long alertCount,
        Long logCount
) {}
