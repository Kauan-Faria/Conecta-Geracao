package com.conectageracao.adminapi.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record KnowledgeTopicRequest(
        @NotBlank @Pattern(regexp = "^[a-z0-9-]{1,64}$", message = "slug deve ser kebab-case (letras minusculas, numeros e hifen)")
        String slug,

        @NotBlank @Size(max = 120) String title,

        @NotBlank @Size(max = 500) String summary,

        List<String> keywords,

        @NotNull Integer displayOrder,

        Boolean isActive,

        @Valid List<KnowledgeStepRequest> steps
) {}
