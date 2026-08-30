package com.conectageracao.adminapi.service;

import com.conectageracao.adminapi.domain.Campaign;
import com.conectageracao.adminapi.domain.CampaignStatus;
import com.conectageracao.adminapi.dto.CampaignRequest;
import com.conectageracao.adminapi.dto.CampaignResponse;
import com.conectageracao.adminapi.exception.ResourceNotFoundException;
import com.conectageracao.adminapi.exception.ValidationException;
import com.conectageracao.adminapi.repository.CampaignRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class CampaignService {

    private final CampaignRepository repository;
    private final ObjectMapper objectMapper;

    public CampaignService(CampaignRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<CampaignResponse> findAll() {
        return repository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CampaignResponse findById(String id) {
        return toResponse(getOrThrow(id));
    }

    /** Cria a campanha em nome do operador logado (substitui a X-Internal-Service-Key). */
    public CampaignResponse create(CampaignRequest request, String requestedByUsername) {
        if (request.idempotencyKey() != null
                && repository.existsByIdempotencyKey(request.idempotencyKey())) {
            throw new ValidationException("Ja existe uma campanha com essa idempotencyKey");
        }

        if (request.segmentType().name().equals("uid_list")
                && (request.firebaseUids() == null || request.firebaseUids().isEmpty())) {
            throw new ValidationException("firebaseUids e obrigatorio quando segmentType = uid_list");
        }

        String payloadJson = null;
        if (request.firebaseUids() != null && !request.firebaseUids().isEmpty()) {
            try {
                payloadJson = objectMapper.writeValueAsString(Map.of("firebaseUids", request.firebaseUids()));
            } catch (Exception e) {
                throw new ValidationException("Nao foi possivel serializar firebaseUids");
            }
        }

        Campaign campaign = Campaign.builder()
                .title(request.title())
                .body(request.body())
                .deepLink(request.deepLink())
                .segmentType(request.segmentType())
                .segmentPayload(payloadJson)
                .status(CampaignStatus.pending)
                .requestedBy(requestedByUsername)
                .idempotencyKey(request.idempotencyKey())
                .build();

        return toResponse(repository.save(campaign));
    }

    private Campaign getOrThrow(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campanha nao encontrada: " + id));
    }

    private CampaignResponse toResponse(Campaign c) {
        return new CampaignResponse(c.getId(), c.getTitle(), c.getBody(), c.getDeepLink(),
                c.getSegmentType(), c.getStatus(), c.getRequestedBy(), c.getRequestedAt(),
                c.getCompletedAt(), c.getSentCount(), c.getSkippedCount());
    }
}
