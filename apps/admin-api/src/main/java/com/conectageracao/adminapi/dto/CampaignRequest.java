package com.conectageracao.adminapi.dto;

import com.conectageracao.adminapi.domain.CampaignSegmentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CampaignRequest(
        @NotBlank @Size(min = 3, max = 120) String title,
        @NotBlank @Size(min = 3) String body,
        @NotBlank @Size(max = 256) String deepLink,
        @NotNull CampaignSegmentType segmentType,
        /** Obrigatorio somente quando segmentType = uid_list. */
        List<String> firebaseUids,
        String idempotencyKey
) {}
