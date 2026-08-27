package com.conectageracao.adminapi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record KnowledgeStepRequest(
        @NotNull Integer order,
        @NotBlank @Size(max = 500) String instruction,
        @Size(max = 300) String checkpointQuestion,
        List<String> checkpointHints
) {}
