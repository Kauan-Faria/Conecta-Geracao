---
unit: 002-knowledge-base
bolt: 002-knowledge-base
stage: design
status: complete
created: 2026-06-01T12:30:00Z
---

# Technical Design - Knowledge Base

> **Nota histórica (2026-06-10)**: este artefato foi escrito antes do scaffold da API. O caminho atual do backend é `apps/backend/` (pacote pnpm `@conecta-geracao/api`), não `apps/api/`.

## Architecture Pattern

**Modular monolith NestJS + DDD hexagonal** (alinhado a `system-architecture.md` e `coding-standards.md`).

**Rationale**:
- Bolt `002` entrega **persistência + domínio + seed**; endpoints REST ficam no bolt `003-knowledge-base`.
- Domínio isolado de Prisma via port `KnowledgeTopicRepository`.
- Bootstrap mínimo da API (`apps/api`) neste bolt, pois o repositório ainda não contém código NestJS — apenas `.env`.

---

## Layer Structure

```text
apps/api/
├── prisma/
│   ├── schema.prisma          # KnowledgeTopic, KnowledgeStep
│   ├── migrations/
│   └── seed.ts                # 6 tópicos MVP
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── shared/
│   │   └── prisma/
│   │       └── prisma.service.ts
│   └── modules/
│       └── knowledge-base/
│           ├── knowledge-base.module.ts
│           ├── domain/
│           │   ├── entities/
│           │   │   ├── knowledge-topic.entity.ts
│           │   │   └── knowledge-step.entity.ts
│           │   ├── value-objects/
│           │   │   └── topic-slug.vo.ts
│           │   ├── services/
│           │   │   └── knowledge-content-policy.ts
│           │   └── errors/
│           │       └── domain.errors.ts
│           ├── application/
│           │   ├── ports/
│           │   │   └── knowledge-topic.repository.ts
│           │   └── use-cases/
│           │       └── seed-knowledge-base.use-case.ts
│           └── infrastructure/
│               ├── persistence/
│               │   └── prisma-knowledge-topic.repository.ts
│               └── seed/
│                   └── mvp-topics.data.ts   # conteúdo curado (PT-BR)
```

**Responsabilidades por camada**:

| Camada | Responsabilidade neste bolt |
|--------|----------------------------|
| **Domain** | Entidades, VOs, `KnowledgeContentPolicy`, erros de domínio |
| **Application** | Port do repositório, `SeedKnowledgeBaseUseCase` (idempotente) |
| **Infrastructure** | Adapter Prisma, dados do seed, `PrismaService` |
| **Presentation** | *Fora de escopo* — controllers no bolt `003` |

---

## API Design (escopo deste bolt)

Nenhum endpoint HTTP neste bolt. Contratos REST reservados para `003-knowledge-base`:

| Endpoint (futuro) | Method | Notas |
|-------------------|--------|-------|
| `/api/v1/knowledge/topics/:slug` | GET | Auth Firebase — bolt 003 |
| `/api/v1/knowledge/search` | GET | `?q=` — bolt 003 |

**Preparação neste bolt**: repositório e seed permitem que `003` implemente use cases `GetTopicBySlug` e `SearchTopics` sem alterar schema.

---

## Data Persistence

### Prisma Schema

```prisma
model KnowledgeTopic {
  id           String          @id @default(cuid())
  slug         String          @unique @db.VarChar(64)
  title        String          @db.VarChar(120)
  summary      String          @db.VarChar(500)
  keywords     String[]
  displayOrder Int             @map("display_order")
  isActive     Boolean         @default(true) @map("is_active")
  createdAt    DateTime        @default(now()) @map("created_at")
  updatedAt    DateTime        @updatedAt @map("updated_at")
  steps        KnowledgeStep[]

  @@map("knowledge_topics")
}

model KnowledgeStep {
  id                 String         @id @default(cuid())
  topicId            String         @map("topic_id")
  order              Int
  instruction        String         @db.VarChar(500)
  checkpointQuestion String?        @map("checkpoint_question") @db.VarChar(300)
  checkpointHints    String[]       @map("checkpoint_hints")
  topic              KnowledgeTopic @relation(fields: [topicId], references: [id], onDelete: Cascade)

  @@unique([topicId, order])
  @@map("knowledge_steps")
}
```

### Relacionamentos

| Tabela | PK | FK | Cardinalidade |
|--------|----|----|---------------|
| `knowledge_topics` | `id` | — | 1 → N steps |
| `knowledge_steps` | `id` | `topic_id` → `knowledge_topics.id` | N → 1 topic |

### Índices

- `knowledge_topics.slug` — UNIQUE (busca por slug)
- `knowledge_steps.(topic_id, order)` — UNIQUE (ordenação)
- GIN em `keywords` (opcional pós-MVP) — busca full-text simples via `ILIKE` no MVP

### Migrations

1. `pnpm prisma migrate dev --name init_knowledge_base` em `apps/api`
2. `DATABASE_URL` + `DIRECT_URL` do Supabase (`.env.example` existente)
3. Deploy: `prisma migrate deploy` no pipeline Render

### Seed Strategy

| Aspecto | Decisão |
|---------|---------|
| **Arquivo** | `prisma/seed.ts` + `mvp-topics.data.ts` (conteúdo revisável) |
| **Idempotência** | Se `count(topics) === 6` e slugs MVP presentes → skip; senão upsert por `slug` |
| **Execução** | `pnpm prisma db seed` (script no `package.json` da API) |
| **Validação** | `KnowledgeContentPolicy` antes de cada insert/update |
| **Conteúdo** | 6 slugs do domain model; ≥3 passos; checkpoint em passos-chave |

**Slugs seed** (fixos): `fazer-pix`, `codigo-govbr`, `whatsapp-contato-localizacao`, `wifi-qr-code`, `segunda-via-boleto`, `alerta-golpe`.

---

## Bootstrap API (pré-requisito de implementação)

Como `apps/api` está vazio, o bolt inclui scaffold mínimo:

| Pacote | Versão (sugestão) | Uso |
|--------|-------------------|-----|
| `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express` | ^10 | HTTP server |
| `@prisma/client`, `prisma` | ^6 | ORM |
| `typescript`, `ts-node` | latest stable | build/seed |
| `pino`, `nestjs-pino` | opcional MVP | logging (pode ser console no primeiro commit) |

**Scripts** (`apps/api/package.json`):
- `dev`: `nest start --watch`
- `build`: `nest build`
- `prisma:migrate`: `prisma migrate dev`
- `prisma:seed`: `prisma db seed`

**Monorepo raiz**: workspace pnpm apontando `apps/api` (atualizar `package.json` raiz com `workspaces`).

---

## Security Design

| Concern | Approach |
|---------|----------|
| **Authentication** | N/A neste bolt (sem endpoints) |
| **Seed em produção** | Rodar seed apenas em deploy inicial ou job manual; não expor endpoint de seed |
| **Content safety** | `KnowledgeContentPolicy` bloqueia padrões de senha/token/OTP no texto dos passos |
| **Gov.br** | Validação extra no slug `codigo-govbr`: sem "faça login", "digite senha", "autentique" |
| **DB credentials** | `DATABASE_URL` apenas no servidor; nunca no Flutter |

---

## NFR Implementation

| Requirement | Design Approach |
|-------------|-----------------|
| **Performance** | Leitura por slug = 1 query com `include: { steps: { orderBy: { order: 'asc' } } }` |
| **Scalability** | 6 tópicos fixos no MVP; tabela pequena; sem cache |
| **Reliability** | Migration versionada; seed idempotente |
| **Maintainability** | Conteúdo em `mvp-topics.data.ts` separado do use case |
| **RAG readiness** | Steps expõem `instruction` + `checkpointQuestion` + `checkpointHints` para chunking no bolt 003 |

---

## Error Handling

| Error Type | Code (domínio) | Quando |
|------------|----------------|--------|
| `InvalidTopicSlugError` | `INVALID_SLUG` | Slug fora do padrão kebab-case |
| `ContentPolicyViolationError` | `CONTENT_POLICY` | Passo pede credencial ou Gov.br inválido |
| `DuplicateSlugError` | `DUPLICATE_SLUG` | Insert com slug existente (seed upsert trata) |
| Prisma errors | — | Mapeados no adapter; não vazam para domínio |

Domínio usa `Result<T, E>` nos use cases; seed CLI pode logar e `process.exit(1)` em falha.

---

## External Dependencies

| Service | Purpose | Integration |
|---------|---------|-------------|
| **Supabase Postgres** | Persistência | Prisma via `DATABASE_URL` / `DIRECT_URL` |
| **Firebase** | — | Não usado neste bolt |

---

## Application Use Cases (este bolt)

| Use Case | Input | Output | Notas |
|----------|-------|--------|-------|
| `SeedKnowledgeBaseUseCase` | — | `Result<{ seeded: number; skipped: boolean }>` | Executado no `prisma/seed.ts` |
| `GetTopicBySlugUseCase` | slug | `Result<KnowledgeTopic>` | Implementado para testes; reutilizado no bolt 003 |

---

## Test Strategy (design → etapa Test)

| Tipo | Alvo |
|------|------|
| **Unit** | `TopicSlug`, `KnowledgeContentPolicy`, entidades |
| **Integration** | `PrismaKnowledgeTopicRepository` com DB de teste ou Testcontainers |
| **Seed smoke** | Após seed: 6 tópicos, cada um ≥3 passos, slug único |

---

## Stories Mapping

| Story | Entregável técnico |
|-------|-------------------|
| **001-topic-entity-schema** | Prisma models + migration + domain entities + repository adapter |
| **002-seed-six-mvp-topics** | `mvp-topics.data.ts` + `seed.ts` idempotente + policy validation |

---

## Implement Checklist (Etapa 4)

- [ ] Criar `apps/api` NestJS + pnpm workspace
- [ ] `prisma/schema.prisma` + migration
- [ ] Módulo `knowledge-base` (domain, application, infrastructure)
- [ ] Seed dos 6 tópicos com conteúdo PT-BR simples
- [ ] `pnpm prisma db seed` validado localmente (com `DATABASE_URL` configurado)
