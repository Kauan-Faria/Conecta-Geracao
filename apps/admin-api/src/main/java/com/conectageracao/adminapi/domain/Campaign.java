package com.conectageracao.adminapi.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;

/**
 * Espelha `campaigns`. Hoje so existe POST /notifications/campaigns no
 * NestJS, protegido por header X-Internal-Service-Key (sem usuario real).
 * O admin-api cria campanhas em nome de um AdminUser autenticado por JWT,
 * gravando na MESMA tabela; um job/worker (fora do escopo desta atividade)
 * pode continuar responsavel por efetivamente disparar o push via FCM.
 */
@Entity
@Table(name = "campaigns")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Campaign {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(nullable = false, columnDefinition = "text")
    private String body;

    @Column(name = "deep_link", nullable = false, length = 256)
    private String deepLink;

    @Enumerated(EnumType.STRING)
    @Column(name = "segment_type", nullable = false)
    private CampaignSegmentType segmentType;

    /** JSON cru (ex.: {"firebaseUids":["uid1","uid2"]}) para uid_list. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "segment_payload", columnDefinition = "jsonb")
    private String segmentPayload;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CampaignStatus status = CampaignStatus.pending;

    /** Username do AdminUser que criou a campanha (substitui a service key). */
    @Column(name = "requested_by", nullable = false, length = 128)
    private String requestedBy;

    @Column(name = "requested_at", nullable = false)
    private Instant requestedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "sent_count", nullable = false)
    @Builder.Default
    private Integer sentCount = 0;

    @Column(name = "skipped_count", nullable = false)
    @Builder.Default
    private Integer skippedCount = 0;

    @Column(name = "idempotency_key", length = 128)
    private String idempotencyKey;

    @PrePersist
    void prePersist() {
        if (id == null) id = java.util.UUID.randomUUID().toString();
        if (requestedAt == null) requestedAt = Instant.now();
    }
}
