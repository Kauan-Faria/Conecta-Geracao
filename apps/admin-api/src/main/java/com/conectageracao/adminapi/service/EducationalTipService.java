package com.conectageracao.adminapi.service;

import com.conectageracao.adminapi.domain.EducationalTip;
import com.conectageracao.adminapi.dto.EducationalTipRequest;
import com.conectageracao.adminapi.dto.EducationalTipResponse;
import com.conectageracao.adminapi.exception.ResourceNotFoundException;
import com.conectageracao.adminapi.repository.EducationalTipRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EducationalTipService {

    private final EducationalTipRepository repository;

    public EducationalTipService(EducationalTipRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<EducationalTipResponse> findAll() {
        return repository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public EducationalTipResponse create(EducationalTipRequest request) {
        EducationalTip tip = EducationalTip.builder()
                .title(request.title())
                .body(request.body())
                .deepLink(request.deepLink())
                .topicTag(request.topicTag())
                .isActive(request.isActive() == null || request.isActive())
                .sortOrder(request.sortOrder() == null ? 0 : request.sortOrder())
                .build();
        return toResponse(repository.save(tip));
    }

    public EducationalTipResponse update(String id, EducationalTipRequest request) {
        EducationalTip tip = getOrThrow(id);
        tip.setTitle(request.title());
        tip.setBody(request.body());
        tip.setDeepLink(request.deepLink());
        tip.setTopicTag(request.topicTag());
        if (request.isActive() != null) tip.setIsActive(request.isActive());
        if (request.sortOrder() != null) tip.setSortOrder(request.sortOrder());
        return toResponse(repository.save(tip));
    }

    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Dica nao encontrada: " + id);
        }
        repository.deleteById(id);
    }

    private EducationalTip getOrThrow(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dica nao encontrada: " + id));
    }

    private EducationalTipResponse toResponse(EducationalTip t) {
        return new EducationalTipResponse(t.getId(), t.getTitle(), t.getBody(), t.getDeepLink(),
                t.getTopicTag(), t.getIsActive(), t.getSortOrder(), t.getCreatedAt());
    }
}
