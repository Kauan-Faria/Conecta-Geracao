---
bolt: 031-rag-relevance-api
created: 2026-09-15T00:43:00Z
status: accepted
---

# ADR-013: Aliases no aggregate KnowledgeTopic (Prisma seed)

## Context

O matching precisa de grafias alternativas por tópico (`uifi`, `watsap`,
`govbr`). Essas formas podem viver (a) só em código de policy, (b) numa tabela
CMS ou (c) no próprio tópico da base de conhecimento, versionadas no seed.

O intent deixou CMS fora de escopo. Precisamos de uma fonte única que o
retriever e a policy leiam juntos.

## Decision

**Aliases são campo do aggregate `KnowledgeTopic`**: `aliases: string[]` no
Prisma, preenchido pelo seed `mvp-topics.data.ts` (mesmo fluxo dos 6 tópicos).

Não há tela admin nem arquivo de corpus desconectado da entidade. A policy lê
aliases via tópicos ativos já carregados pelo repositório.

**Fallback aceitável só se a migration bloquear a entrega**: `topic-alias.corpus.ts`
keyed por slug, com o mesmo contrato — depois promover à coluna.

## Rationale

- KnowledgeTopic já é a fonte de `keywords` e `steps`
- Seed é o “CMS do MVP” (padrão ADR-009 para conteúdo curado)
- Retriever não precisa de segunda origem

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Arquivo só no domínio, fora do seed | Zero migration | Duas fontes (keywords DB vs aliases código) | Dessincroniza com o aggregate |
| Tabela `topic_alias` + CMS | Editável em runtime | Fora de escopo; overkill | Intent: seed/código |
| Concatenar aliases em `keywords` | Sem coluna nova | Perde peso alias vs keyword; mistura genéricas | Scoring precisa distinguir |

## Consequences

### Positive

- Uma leitura `findAllActive()` alimenta inferência
- Grafia nova = mudança de seed + teste do corpus
- Coeso com o modelo de domínio do bolt 002/003

### Negative

- Migration Prisma (`aliases String[]` default `[]`)
- Seed precisa de `upsert` que atualize aliases em bases já populadas

### Risks

- **Bases antigas sem coluna**: migration obrigatória no bolt
- **Aliases multilinha tipo “senha do wifi”**: normalizer trata a query inteira com `includes` do alias normalizado, não só token a token

## Related

- **Stories**: 002-topic-alias-corpus
- **Standards**: `data-stack.md` (Prisma)
- **Previous ADRs**: ADR-009 (conteúdo curado via Prisma seed)
