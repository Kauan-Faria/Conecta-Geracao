package com.conectageracao.adminapi.dto;

import java.time.Instant;

public record EducationalTipResponse(
        String id,
        String title,
        String body,
        String deepLink,
        String topicTag,
        Boolean isActive,
        Integer sortOrder,
        Instant createdAt
) {}
