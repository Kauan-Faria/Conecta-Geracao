package com.conectageracao.adminapi.repository;

import com.conectageracao.adminapi.domain.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminUserRepository extends JpaRepository<AdminUser, String> {
    Optional<AdminUser> findByUsername(String username);
    boolean existsByUsername(String username);
}
