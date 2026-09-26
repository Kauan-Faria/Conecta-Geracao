package com.conectageracao.adminapi.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

public record RegisterAlertRequest(
        @NotNull @Positive Long userId,
        @NotNull LocalDateTime periodStart,
        @NotNull LocalDateTime periodEnd,
        Long limit
) {}
