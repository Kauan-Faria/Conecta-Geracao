package com.conectageracao.adminapi.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Usuario operador do backoffice (nao confundir com o usuario final do app,
 * que continua autenticado via Firebase no NestJS/Flutter).
 */
@Entity
@Table(name = "admin_users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUser {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, unique = true, length = 60)
    private String username;

    /** Hash BCrypt, nunca a senha em texto puro. */
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String role = "ADMIN";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (id == null) id = java.util.UUID.randomUUID().toString();
        if (createdAt == null) createdAt = Instant.now();
    }
}
