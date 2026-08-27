# admin-api (Conecta Geração — Backoffice)

API REST em **Spring Boot 3 + Java 17** para o painel administrativo do Conecta Geração.
Não substitui o NestJS (`apps/backend`), que continua servindo o app Flutter — esta API cobre
o que o MVP deixou de fora: CRUD de tópicos da base de conhecimento, dicas educacionais e
disparo de campanhas por um operador autenticado (substituindo a antiga `X-Internal-Service-Key`).

## Stack
- Spring Boot 3.3 (Web, Data JPA, Security, Validation, Thymeleaf)
- PostgreSQL — **mesmo banco (Supabase) do `apps/backend`**
- JWT próprio (io.jsonwebtoken) para login do operador
- springdoc-openapi (Swagger UI)
- Lombok

## Rodando localmente

1. Configure as variáveis de ambiente (mesmo banco do NestJS):

```bash
export DATABASE_URL="jdbc:postgresql://<host>:5432/<database>"
export DB_USERNAME="postgres"
export DB_PASSWORD="sua-senha"
export ADMIN_JWT_SECRET="troque-por-uma-chave-longa-aleatoria"
export ADMIN_SEED_USERNAME="admin"
export ADMIN_SEED_PASSWORD="defina-uma-senha-forte"
export ADMIN_CORS_ORIGIN="http://localhost:4200"
```

2. Aplique a migration nova (tabela `admin_users`) a partir do `apps/backend`:

```bash
cd ../backend
pnpm api:prisma:migrate
```

3. Suba a API:

```bash
cd ../admin-api
mvn spring-boot:run
```

- API: http://localhost:8081
- Swagger: http://localhost:8081/swagger-ui.html
- Página Thymeleaf (evidência da ementa): http://localhost:8081/health

## Fluxo de autenticação

```
POST /api/auth/login { "username": "admin", "password": "..." }
  -> { "token": "...", "username": "admin", "role": "ADMIN", "expiresInSeconds": 28800 }

Demais endpoints exigem:
Authorization: Bearer <token>
```

## Endpoints

| Recurso | Rota | Descrição |
|---|---|---|
| Tópicos da base (RAG) | `/api/knowledge-topics` | CRUD completo, com passos aninhados |
| Dicas educacionais | `/api/educational-tips` | CRUD completo |
| Campanhas | `/api/campaigns` | Criar/listar (dispara em nome do operador logado) |

Todas as tabelas são as **mesmas** usadas pelo NestJS (`knowledge_topics`, `knowledge_steps`,
`educational_tips`, `campaigns`) — o `admin-api` só adiciona a camada de escrita administrativa
que faltava, com autenticação e auditoria (`requestedBy`) reais.
