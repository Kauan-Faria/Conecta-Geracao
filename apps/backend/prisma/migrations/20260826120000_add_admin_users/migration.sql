-- Tabela de operadores do backoffice administrativo (admin-api, Spring Boot).
-- Nao afeta a autenticacao do app mobile, que continua via Firebase.
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(60) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" VARCHAR(20) NOT NULL DEFAULT 'ADMIN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "admin_users_username_key" ON "admin_users"("username");
