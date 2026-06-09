---
unit: 002-knowledge-base
bolt: 003-knowledge-base
stage: design
status: complete
created: 2026-06-02T14:15:00Z
---

# Technical Design - Knowledge Retrieval API

## Architecture Pattern

**Modular monolith NestJS + DDD hexagonal** — adiciona camada **presentation** ao módulo `knowledge-base` existente em `apps/backend`.

**Rationale**:
- Domínio e persistência já implementados no bolt `002`.
- RAG do bolt `005` continua com `PrismaKnowledgeRetriever` (injeção direta); endpoints REST são complementares (debug, futuros consumidores).
- Padrão idêntico ao módulo `conversations` (controller + use cases + mappers + `FirebaseAuthGuard`).

---

## Layer Structure

```text
apps/backend/src/modules/knowledge-base/
├── application/
│   └── use-cases/
│       ├── get-topic-by-slug.use-case.ts      # existente
│       └── search-topics.use-case.ts          # novo
├── domain/
│   └── value-objects/
│       └── search-query.vo.ts                 # novo
├── infrastructure/
│   └── persistence/
│       └── prisma-knowledge-topic.repository.ts  # +searchActive
└── presentation/
    ├── knowledge.controller.ts
    ├── dto/
    │   └── search-knowledge.query.dto.ts
    └── mappers/
        └── knowledge.mapper.ts
```

---

## API Design

| Endpoint | Method | Auth | Request | Response `data` |
|----------|--------|------|---------|-----------------|
| `/api/v1/knowledge/topics/:slug` | GET | Bearer Firebase | `slug` path param | `TopicDetailDto` (passos ordenados) |
| `/api/v1/knowledge/search` | GET | Bearer Firebase | `?q=` (min 2 chars) | `TopicSummaryDto[]` |

### TopicDetailDto

```json
{
  "slug": "fazer-pix",
  "title": "Como fazer um PIX",
  "summary": "...",
  "keywords": ["pix", "transferência"],
  "displayOrder": 1,
  "steps": [
    {
      "order": 1,
      "instruction": "...",
      "checkpointQuestion": "...",
      "checkpointHints": ["sim", "não"]
    }
  ]
}
```

### TopicSummaryDto (busca)

```json
{
  "slug": "fazer-pix",
  "title": "Como fazer um PIX",
  "summary": "...",
  "keywords": ["pix"],
  "displayOrder": 1
}
```

### Erros

| Cenário | HTTP | `error.code` |
|---------|------|--------------|
| Slug inválido | 400 | `VALIDATION_ERROR` |
| Tópico não encontrado | 404 | `NOT_FOUND` |
| Query `q` ausente ou < 2 chars | 400 | `VALIDATION_ERROR` |
| Token ausente/inválido | 401 | `UNAUTHORIZED` |

Envelope via `ApiResponseInterceptor` + `HttpExceptionFilter` existentes.

---

## Search Implementation

**MVP (6 tópicos)**: `searchActive` carrega tópicos ativos e filtra in-memory:

- Match case-insensitive em: `slug`, `title`, `summary`, qualquer item de `keywords`
- Ordenação: `displayOrder` asc
- Sem full-text nos `instruction` dos passos (escopo futuro)

---

## Security Design

| Concern | Approach |
|---------|----------|
| **Authentication** | `FirebaseAuthGuard` em todos os endpoints |
| **Authorization** | Qualquer usuário autenticado pode ler (conteúdo público curado) |
| **Rate limiting** | `ThrottlerGuard` global (30 req/min) |
| **Content exposure** | Apenas tópicos `isActive=true`; sem dados de usuário |

---

## NFR Implementation

| Requirement | Approach |
|-------------|----------|
| **Performance** | 6 tópicos — busca in-memory O(n); get by slug = 1 query Prisma |
| **Swagger** | `@ApiTags('knowledge')`, `@ApiOperation` nos endpoints |

---

## Test Strategy

| Tipo | Alvo |
|------|------|
| **Unit** | `SearchQuery` VO, `SearchTopicsUseCase`, `GetTopicBySlugUseCase` (mock repo) |
| **Unit** | `KnowledgeController.mapDomainError` via use case mocks |
| **Integration** | Manual via Swagger (sem DB de teste automatizado neste bolt) |

---

## Stories Mapping

| Story | Entregável |
|-------|------------|
| **003-knowledge-retrieval-api** | Controller + 2 endpoints + use case search + testes unitários |
