package com.conectageracao.adminapi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EducationalTipRequest(
        @NotBlank @Size(max = 120) String title,
        @NotBlank String body,
        @NotBlank @Size(max = 256) String deepLink,
        @Size(max = 64) String topicTag,
        Boolean isActive,
        Integer sortOrder
) {}
