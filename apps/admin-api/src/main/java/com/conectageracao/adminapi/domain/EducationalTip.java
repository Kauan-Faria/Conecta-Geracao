package com.conectageracao.adminapi.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Espelha `educational_tips`. Essa tabela existe no banco mas NENHUM
 * controller do NestJS a expoe hoje - e a lacuna de CRUD que o admin-api
 * preenche integralmente (create/read/update/delete).
 */
@Entity
@Table(name = "educational_tips")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EducationalTip {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(nullable = false, columnDefinition = "text")
    private String body;

    @Column(name = "deep_link", nullable = false, length = 256)
    private String deepLink;

    @Column(name = "topic_tag", unique = true, length = 64)
    private String topicTag;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (id == null) id = java.util.UUID.randomUUID().toString();
        if (createdAt == null) createdAt = Instant.now();
    }
}
