package com.conectageracao.adminapi.service;

import com.conectageracao.adminapi.domain.KnowledgeStep;
import com.conectageracao.adminapi.domain.KnowledgeTopic;
import com.conectageracao.adminapi.dto.KnowledgeStepRequest;
import com.conectageracao.adminapi.dto.KnowledgeStepResponse;
import com.conectageracao.adminapi.dto.KnowledgeTopicRequest;
import com.conectageracao.adminapi.dto.KnowledgeTopicResponse;
import com.conectageracao.adminapi.exception.ConflictException;
import com.conectageracao.adminapi.exception.ResourceNotFoundException;
import com.conectageracao.adminapi.repository.KnowledgeTopicRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class KnowledgeTopicService {

    private final KnowledgeTopicRepository repository;

    public KnowledgeTopicService(KnowledgeTopicRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<KnowledgeTopicResponse> findAll() {
        return repository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public KnowledgeTopicResponse findById(String id) {
        return toResponse(getOrThrow(id));
    }

    public KnowledgeTopicResponse create(KnowledgeTopicRequest request) {
        if (repository.existsBySlug(request.slug())) {
            throw new ConflictException("Ja existe um topico com o slug '" + request.slug() + "'");
        }

        KnowledgeTopic topic = KnowledgeTopic.builder()
                .slug(request.slug())
                .title(request.title())
                .summary(request.summary())
                .keywords(request.keywords())
                .displayOrder(request.displayOrder())
                .isActive(request.isActive() == null || request.isActive())
                .build();

        attachSteps(topic, request.steps());

        return toResponse(repository.save(topic));
    }

    public KnowledgeTopicResponse update(String id, KnowledgeTopicRequest request) {
        KnowledgeTopic topic = getOrThrow(id);

        if (!topic.getSlug().equals(request.slug()) && repository.existsBySlug(request.slug())) {
            throw new ConflictException("Ja existe um topico com o slug '" + request.slug() + "'");
        }

        topic.setSlug(request.slug());
        topic.setTitle(request.title());
        topic.setSummary(request.summary());
        topic.setKeywords(request.keywords());
        topic.setDisplayOrder(request.displayOrder());
        if (request.isActive() != null) topic.setIsActive(request.isActive());

        topic.getSteps().clear();
        attachSteps(topic, request.steps());

        return toResponse(repository.save(topic));
    }

    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Topico nao encontrado: " + id);
        }
        repository.deleteById(id);
    }

    private void attachSteps(KnowledgeTopic topic, List<KnowledgeStepRequest> stepRequests) {
        if (stepRequests == null) return;
        stepRequests.forEach(s -> topic.getSteps().add(
                KnowledgeStep.builder()
                        .topic(topic)
                        .order(s.order())
                        .instruction(s.instruction())
                        .checkpointQuestion(s.checkpointQuestion())
                        .checkpointHints(s.checkpointHints())
                        .build()
        ));
    }

    private KnowledgeTopic getOrThrow(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topico nao encontrado: " + id));
    }

    private KnowledgeTopicResponse toResponse(KnowledgeTopic t) {
        List<KnowledgeStepResponse> steps = t.getSteps().stream()
                .map(s -> new KnowledgeStepResponse(s.getId(), s.getOrder(), s.getInstruction(),
                        s.getCheckpointQuestion(), s.getCheckpointHints()))
                .collect(Collectors.toList());

        return new KnowledgeTopicResponse(t.getId(), t.getSlug(), t.getTitle(), t.getSummary(),
                t.getKeywords(), t.getDisplayOrder(), t.getIsActive(), t.getCreatedAt(), t.getUpdatedAt(), steps);
    }
}
