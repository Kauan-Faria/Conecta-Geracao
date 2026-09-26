# admin-api (Conecta Geração — Backoffice)

API REST em **Spring Boot 3 + Java 17** para o painel administrativo do Conecta Geração.
Não substitui o NestJS (`apps/backend`), que continua servindo o app Flutter — esta API cobre
o que o MVP deixou de fora: CRUD de tópicos da base de conhecimento, dicas educacionais,
disparo de campanhas e a consulta de consumo simulado da IA.

Dois bancos, com papéis separados:

- **PostgreSQL (Supabase)** — datasource principal do Spring (`spring.datasource`). Conteúdos, dicas, campanhas, login do operador e o dashboard. `ddl-auto: validate`. O schema continua nas migrations Prisma.
- **Oracle na máquina de quem roda o projeto** — pool JDBC próprio (`OracleConsumoAccess`), só da rota de consumo. Cada pessoa instala o Oracle, cria o schema e aplica os scripts. Não há banco Oracle compartilhado. A série simulada de tokens, as functions e as procedures PL/SQL nascem nessa instância. Esse pool não é bean `DataSource` do JPA. Com o Oracle desligado, ou sem `ORACLE_URL` / `ORACLE_USERNAME`, a API sobe e os endpoints do Postgres seguem respondendo. `GET` e `POST` de consumo devolvem 503.

## Stack
- Spring Boot 3.3 (Web, Data JPA, Security, Validation, Thymeleaf)
- PostgreSQL — mesmo banco (Supabase) do `apps/backend`
- Oracle JDBC (Hikari) — segundo pool, só consumo
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

# Oracle instalado na sua máquina (não é um banco compartilhado).
# Sem estas variáveis a API sobe e /api/consumption responde 503.
export ORACLE_URL="jdbc:oracle:thin:@//localhost:1521/<service>"
export ORACLE_USERNAME="usuario_do_schema"
export ORACLE_PASSWORD="senha"
```

2. Aplique a migration (tabela `admin_users`) a partir do `apps/backend`:

```bash
cd ../backend
pnpm api:prisma:migrate
```

3. Na instância Oracle da sua máquina, aplique os scripts de `src/main/resources/db/oracle/` já conectado no schema que você criou (sem credencial no arquivo), nesta ordem:

`001_ddl_consumo.sql`, `002_seed_consumo.sql`, `003_fn_indicador_tokens.sql`, `004_fn_consumo_formatado.sql`, `006_pr_registrar_alerta_consumo.sql`, `007_pr_relatorio_consumo.sql`.

`005_test_consumo.sql` e `008_test_procedures.sql` são suítes repetíveis, não fazem parte da subida. O modelo, o DER e o limite de **10.000 tokens** estão em `MODELO.md`.

4. Suba a API:

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
| Consumo da IA | `GET /api/consumption` | Indicador, texto formatado, alertas e relatório no Oracle |
| Alerta de consumo | `POST /api/consumption/alerts` | Chama `PR_REGISTRAR_ALERTA_CONSUMO` via JDBC |

Conteúdos, dicas e campanhas usam as **mesmas** tabelas do NestJS (`knowledge_topics`, `knowledge_steps`,
`educational_tips`, `campaigns`). O consumo fica no Oracle da máquina de quem está rodando (`USUARIO_CONSUMO`, `LEITURA_CONSUMO`,
`ALERTA_CONSUMO`), criado por essa pessoa ao aplicar os scripts. Não copia usuário real do Supabase.

`/api/consumption` exige JWT. Sem token a API recusa e o Oracle não é chamado. Período invertido responde 400. Oracle fora do ar responde 503 (`ORACLE_UNAVAILABLE`) e o restante do painel continua no Postgres.
