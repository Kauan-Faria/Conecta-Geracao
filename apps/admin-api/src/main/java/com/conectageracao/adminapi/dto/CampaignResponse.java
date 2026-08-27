package com.conectageracao.adminapi.dto;

import com.conectageracao.adminapi.domain.CampaignSegmentType;
import com.conectageracao.adminapi.domain.CampaignStatus;

import java.time.Instant;

public record CampaignResponse(
        String id,
        String title,
        String body,
        String deepLink,
        CampaignSegmentType segmentType,
        CampaignStatus status,
        String requestedBy,
        Instant requestedAt,
        Instant completedAt,
        Integer sentCount,
        Integer skippedCount
) {}
