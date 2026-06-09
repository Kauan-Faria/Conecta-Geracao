---
unit: 002-knowledge-base
bolt: 003-knowledge-base
stage: model
status: complete
created: 2026-06-02T14:00:00Z
---

# Static Model - Knowledge Retrieval API

## Bounded Context

**Knowledge Base — Read Model (Consulta)** — extensão do contexto `002-knowledge-base` que expõe operações de **leitura** via HTTP autenticado. Reutiliza o agregado `KnowledgeTopic` existente; não altera persistência nem seed.

**Fronteiras**:
- **Dentro**: use cases de consulta (`GetTopicBySlug`, `SearchTopics`), contratos REST, mapeamento para envelope API.
- **Fora**: escrita/seed (bolt `002`), orquestração RAG (`005-ai-assistant-api` — continua usando repositório injetado), UI mobile.

---

## Domain Entities (reutilizadas)

| Entity | Properties | Business Rules |
|--------|------------|----------------|
| **KnowledgeTopic** | `id`, `slug`, `title`, `summary`, `keywords[]`, `displayOrder`, `isActive`, `steps[]` | Somente tópicos `isActive=true` retornados na busca; passos ordenados por `order` asc |
| **KnowledgeStep** | `id`, `topicId`, `order`, `instruction`, `checkpointQuestion?`, `checkpointHints?` | Expostos integralmente em `GET topics/:slug`; omitidos em resultados de busca |

---

## Value Objects

| Value Object | Properties | Constraints |
|--------------|------------|-------------|
| **TopicSlug** | `value: string` | Reutilizado do bolt `002`; kebab-case 3–64 chars |
| **SearchQuery** | `value: string` | Trim; mínimo 2 chars; máximo 100 chars; usado em `SearchTopics` |

---

## Aggregates

| Aggregate Root | Members | Invariants |
|----------------|---------|------------|
| **KnowledgeTopic** | `KnowledgeStep[]` | Leitura-only; slug deve existir e tópico ativo para `GetTopicBySlug`; busca retorna zero ou mais tópicos ativos |

---

## Domain Events

Nenhum evento novo neste bolt (read-only).

---

## Domain Services

| Service | Operations | Dependencies |
|---------|------------|--------------|
| **KnowledgeContentPolicy** | *(reutilizado)* | Não aplicado na leitura; conteúdo já validado no seed |

---

## Application Use Cases

| Use Case | Input | Output | Regras |
|----------|-------|--------|--------|
| **GetTopicBySlugUseCase** | `slug: string` | `Result<KnowledgeTopic, DomainError>` | Slug válido; 404 se não encontrado |
| **SearchTopicsUseCase** | `query: string` | `Result<KnowledgeTopic[], DomainError>` | Query ≥ 2 chars; match em slug, title, summary ou keywords (case-insensitive) |

---

## Repository Interface (extensão)

| Repository | Método novo | Descrição |
|------------|-------------|-----------|
| **KnowledgeTopicRepository** | `searchActive(query: string): Promise<KnowledgeTopic[]>` | Retorna tópicos ativos cujo slug/title/summary/keywords contenham a query |

Métodos existentes reutilizados: `findBySlug`, `findAllActive`.

---

## Ubiquitous Language

| Term | Definition |
|------|------------|
| **Consulta por slug** | Recuperação completa de um tópico com passos ordenados |
| **Busca por keywords** | Pesquisa textual sobre metadados do tópico (sem full-text nos passos no MVP) |
| **Envelope API** | Resposta `{ data, meta }` conforme `api-conventions.md` |

---

## Stories Coverage

| Story | Cobertura no modelo |
|-------|---------------------|
| **003-knowledge-retrieval-api** | `GetTopicBySlugUseCase`, `SearchTopicsUseCase`, port estendido, contratos REST |

---

## Diagrama (fluxo de consulta)

```text
HTTP (Firebase Auth)
       │
       ▼
KnowledgeController
       │
       ├─► GetTopicBySlugUseCase ──► KnowledgeTopicRepository.findBySlug
       │
       └─► SearchTopicsUseCase ──► KnowledgeTopicRepository.searchActive
```
