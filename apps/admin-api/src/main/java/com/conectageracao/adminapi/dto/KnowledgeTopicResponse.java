package com.conectageracao.adminapi.dto;

import java.time.Instant;
import java.util.List;

public record KnowledgeTopicResponse(
        String id,
        String slug,
        String title,
        String summary,
        List<String> keywords,
        Integer displayOrder,
        Boolean isActive,
        Instant createdAt,
        Instant updatedAt,
        List<KnowledgeStepResponse> steps
) {}
