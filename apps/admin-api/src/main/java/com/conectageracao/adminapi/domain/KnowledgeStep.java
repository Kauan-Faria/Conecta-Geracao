package com.conectageracao.adminapi.domain;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;

/** Espelha `knowledge_steps`, filho de KnowledgeTopic. */
@Entity
@Table(name = "knowledge_steps")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KnowledgeStep {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    @JsonBackReference
    private KnowledgeTopic topic;

    @Column(name = "\"order\"", nullable = false)
    private Integer order;

    @Column(nullable = false, length = 500)
    private String instruction;

    @Column(name = "checkpoint_question", length = 300)
    private String checkpointQuestion;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "checkpoint_hints", columnDefinition = "text[]")
    @Builder.Default
    private List<String> checkpointHints = new ArrayList<>();

    @PrePersist
    void prePersist() {
        if (id == null) id = java.util.UUID.randomUUID().toString();
    }
}
