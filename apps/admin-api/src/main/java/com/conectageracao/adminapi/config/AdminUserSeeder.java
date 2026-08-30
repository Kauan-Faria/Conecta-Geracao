package com.conectageracao.adminapi.config;

import com.conectageracao.adminapi.domain.AdminUser;
import com.conectageracao.adminapi.repository.AdminUserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Cria o primeiro usuario admin automaticamente se a tabela admin_users
 * estiver vazia, so para nao travar o primeiro login em ambiente de
 * desenvolvimento/apresentacao. TROQUE as credenciais via variaveis de
 * ambiente (ADMIN_SEED_USERNAME / ADMIN_SEED_PASSWORD) antes de qualquer
 * uso real.
 */
@Component
public class AdminUserSeeder implements CommandLineRunner {

    private final AdminUserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final String seedUsername;
    private final String seedPassword;

    public AdminUserSeeder(AdminUserRepository repository,
                            PasswordEncoder passwordEncoder,
                            @Value("${admin.seed.username}") String seedUsername,
                            @Value("${admin.seed.password}") String seedPassword) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.seedUsername = seedUsername;
        this.seedPassword = seedPassword;
    }

    @Override
    public void run(String... args) {
        if (repository.count() == 0) {
            AdminUser admin = AdminUser.builder()
                    .username(seedUsername)
                    .passwordHash(passwordEncoder.encode(seedPassword))
                    .role("ADMIN")
                    .build();
            repository.save(admin);
            System.out.println(">> [admin-api] Usuario admin padrao criado: " + seedUsername
                    + " (troque a senha em producao via ADMIN_SEED_PASSWORD)");
        }
    }
}
