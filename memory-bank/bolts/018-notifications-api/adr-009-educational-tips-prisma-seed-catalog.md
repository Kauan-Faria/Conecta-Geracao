---
bolt: 018-notifications-api
created: 2026-06-09T23:17:23Z
status: accepted
---

# ADR-009: Catálogo de dicas educativas via Prisma seed

## Context

FR-7 e story **005-tips-and-campaigns** exigem dicas **curadas e pré-aprovadas**, com rejeição explícita de conteúdo gerado por LLM no envio. Technical notes mencionam "YAML/JSON ou tabela seed".

Opções para armazenar o catálogo:
- **Arquivo YAML/JSON** lido em runtime pelo backend
- **Tabela Prisma `educational_tips`** populada via `prisma db seed`
- **Hardcoded** em constantes TypeScript
- **CMS externo** (Contentful, etc.)

Requisitos: conteúdo imutável em runtime; versionamento com deploy; seleção determinística no job semanal; deep links configuráveis por dica.

## Decision

Persistir dicas na tabela **`educational_tips`** e popular via **`prisma/seeds/educational-tips.seed.ts`**:

1. Schema Prisma: `id`, `title`, `body`, `deepLink`, `topicTag?`, `isActive`, `sortOrder`
2. Seed idempotente (upsert por `topicTag` ou título) executado em `prisma db seed`
3. **`EducationalTipCatalogRepository`** read-only em runtime — sem endpoints CRUD
4. **`CuratedContentPolicy.assertFromCatalog(tipId)`** garante que todo envio tipo `tip` referencia ID do catálogo
5. Alteração de conteúdo = PR + migration/seed + deploy — **nunca** LLM em runtime
6. Desativar dica: `isActive=false` via seed/migration, não delete

Arquivo YAML standalone **rejeitado** como fonte runtime; seed TypeScript co-localizado com schema Prisma.

## Rationale

- Versionamento git do conteúdo junto ao código (seed TS)
- Query simples `findAllActive()` via Prisma; índice `(isActive, sortOrder)`
- Alinha com `data-stack.md` (Prisma + Postgres)
- Seed idempotente seguro em deploy repetido
- `topicTag` permite upsert estável sem IDs fixos entre ambientes

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| YAML em `resources/tips.yaml` runtime | Edição sem migration | Parser extra; validação em runtime; não tipado | Duplica fonte de verdade |
| Constantes TS hardcoded | Zero DB | Sem desativar dica sem deploy código; sem auditoria DB | Menos flexível que seed |
| CMS externo | Ops edita sem deploy | Vendor, auth, latência; overkill MVP | Fora de escopo |
| LLM gera dica no job | Conteúdo variado | Viola story e FR-7 explicitamente | Proibido |

## Consequences

### Positive

- Catálogo testável em integração com fixtures seed
- `CuratedContentPolicy` enforcement trivial (tipId must exist)
- Conteúdo revisável em PR como código

### Negative

- Nova dica exige deploy (aceitável para conteúdo curado de baixa frequência)
- Tabela adicional no Postgres

### Risks

- **Seed drift entre ambientes**: mitigado por seed idempotente no pipeline deploy
- **Conteúdo desatualizado**: mitigado por processo editorial; `isActive` para retirar dicas

## Related

- **Stories**: 005-tips-and-campaigns
- **Standards**: `data-stack.md` (Prisma migrations + seed)
- **Previous ADRs**: —
