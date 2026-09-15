---
bolt: 031-rag-relevance-api
created: 2026-09-15T00:43:00Z
status: accepted
---

# ADR-012: Matching lexical + aliases + fuzzy, sem embeddings

## Context

O RAG atual escolhe tópico por `includes` de keyword. Isso falha com o público
analfabeto digital (`wi-fi` ≠ `wifi`, `uifi`, `watsap`) e, no outro extremo,
mistura assuntos (Wi-Fi recebe passos de Gov.br).

Embeddings / pgvector resolveriam similaridade semântica, mas exigem modelo de
embedding, migração, reindexação e custo por mensagem. O catálogo MVP tem só
**6 tópicos** conhecidos.

## Decision

Neste intent, a identificação de tópico é **lexical**:

- normalização (acento, hífen, espaço)
- aliases curados por tópico (grafias reais do público)
- distância de edição só em tokens com comprimento ≥ 4
- **sem** embeddings, vector DB ou chamada LLM para classificar o tópico

Reavaliar embeddings só se o corpus lexical falhar em testes com usuários.

## Rationale

- 6 tópicos cabem em regras explícitas e testáveis
- Inferência sem I/O extra (< 50ms p95; NFR do intent)
- Casos de regressão (Wi-Fi ≠ Gov.br) são asserções binárias, não limiar de cosseno
- Alinha com a story original de RAG (“embeddings opcional na v2”)

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Embeddings (pgvector / Gemini embed) | Cobre paráfrases novas | Custo, infra, opacidade, latência | Overkill para 6 tópicos; NFR de 50ms |
| Classificar tópico com o próprio LLM | Entende contexto | Latência, custo, não determinístico | Quebra testes sem Gemini e o NFR |
| Keyword `includes` atual | Já existe | Hífen, empate, genéricos | É a causa do bug |

## Consequences

### Positive

- Testes unitários determinísticos (corpus FR-2)
- Sem dependência nova no tech-stack
- Grafias novas = linha no seed, não reindex

### Negative

- Paráfrase sem nenhuma palavra do corpus pode ir para `none`/`low` (bolt 032 esclarece ou usa conhecimento geral)
- Manutenção manual de aliases

### Risks

- **Corpus incompleto**: mitigado por lista expansível + FR-3 (perguntar de novo)
- **Pressão futura por embeddings**: este ADR documenta quando revisitar (falha empírica do corpus)

## Related

- **Stories**: 001-normalize-and-fuzzy-match, 002-topic-alias-corpus
- **Standards**: `tech-stack.md` (Gemini só para geração de resposta)
- **Previous ADRs**: nenhuma de RAG
