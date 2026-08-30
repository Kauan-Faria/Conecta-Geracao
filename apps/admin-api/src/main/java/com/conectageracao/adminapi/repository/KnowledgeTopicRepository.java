package com.conectageracao.adminapi.repository;

import com.conectageracao.adminapi.domain.KnowledgeTopic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface KnowledgeTopicRepository extends JpaRepository<KnowledgeTopic, String> {
    Optional<KnowledgeTopic> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
