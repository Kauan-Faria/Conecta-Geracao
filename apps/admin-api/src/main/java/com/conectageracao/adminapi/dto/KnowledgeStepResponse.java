package com.conectageracao.adminapi.dto;

import java.util.List;

public record KnowledgeStepResponse(
        String id,
        Integer order,
        String instruction,
        String checkpointQuestion,
        List<String> checkpointHints
) {}
