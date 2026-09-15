---
unit: 001-rag-relevance-api
bolt: 031-rag-relevance-api
stage: design
status: complete
created: 2026-09-15T00:41:00Z
updated: 2026-09-15T00:41:00Z
---

# Technical Design - RAG Relevance (Bolt 031)

## Architecture Pattern

**Hexagonal (já adotado)** no módulo `conversations`, com extensão mínima no
`knowledge-base` (seed + mapeamento de aliases). Sem módulo novo, sem endpoint
novo, sem embeddings.

A classificação de tópico permanece **domínio puro** (sem I/O, sem LLM). O
retriever (adapter) só monta `KnowledgeContext` a partir de um `TopicMatch.high`.

---

## Layer Structure

```text
┌─────────────────────────────────────────────────────────────┐
│ Presentation (inalterada)                                   │
│  POST /conversations/:id/messages  +  guest chat            │
├─────────────────────────────────────────────────────────────┤
│ Application                                                 │
│  SendMessage / ReplyGuest  → AssistantReplyGenerator        │
│  Port KnowledgeRetriever.retrieve({ topicSlug?, userMessage})│
├─────────────────────────────────────────────────────────────┤
│ Domain (conversations)                                      │
│  QueryNormalizer                                            │
│  FuzzyTokenMatcher                                          │
│  KeywordScoringPolicy                                       │
│  TopicInferencePolicy.infer(...) → TopicMatch               │
│  SafeKnowledgeAssembly (função/serviço de domínio)          │
├─────────────────────────────────────────────────────────────┤
│ Infrastructure                                              │
│  PrismaKnowledgeRetriever — infere SEMPRE a mensagem;       │
│    slug persistido é pista, não trava                       │
│  Seed knowledge-base — aliases[] por tópico                 │
└─────────────────────────────────────────────────────────────┘
```

### Arquivos (evoluir, não duplicar)

```text
conversations/domain/
  value-objects/
    match-confidence.vo.ts          # high | low | tie | none
    topic-match.vo.ts               # confidence + slug? + candidates[]
    normalized-query.vo.ts
  services/
    query-normalizer.ts             # NOVO
    fuzzy-token-matcher.ts          # NOVO
    keyword-scoring.policy.ts       # NOVO
    topic-inference.policy.ts       # EVOLUIR (infer → TopicMatch)

conversations/infrastructure/knowledge/
  prisma-knowledge-retriever.ts     # EVOLUIR

knowledge-base/
  domain/entities/knowledge-topic.entity.ts  # aliases[]
  infrastructure/seed/mvp-topics.data.ts     # corpus FR-2
  infrastructure/persistence/...             # mapear aliases
```

---

## Fluxo retrieve (contrato novo)

```text
1. Carregar tópicos ativos (slug, title, keywords, aliases)
2. match = TopicInferencePolicy.infer(userMessage, topics, persistedSlug?)
3. Se match.confidence != high
     → KnowledgeContext vazio de steps, topicSlug null, availableTopics
4. Se high
     → carregar tópico por match.slug
     → steps só desse tópico
     → inferredFromMessage = (match.slug != persistedSlug)
5. NUNCA: if (persistedSlug) return topic(persistedSlug) sem inferir
```

`persistedSlug` só entra na pontuação como **bônus de continuidade** quando a
mensagem atual também casa aquele tópico (ou é vazia de sinais). Se a mensagem
tiver `high` em **outro** slug, o persistido é ignorado (`StaleTopicIgnored`).

---

## Algoritmo de inferência

### 1. Normalização (`QueryNormalizer`)

Sobre a mensagem inteira e sobre cada alias/keyword/slug:

- lowercase
- NFD + remover marcas (acento)
- substituir `[-_.]` por espaço
- colapsar espaços
- tokens = split por espaço, descartar vazios

Assim `Wi-Fi`, `wifi` e `wi fi` → token `wifi`.

### 2. Matching de um termo (`FuzzyTokenMatcher`)

Um termo do tópico casa se:

1. **Exato**: query normalizada contém o termo, **ou** algum token da query
   é igual ao termo
2. **Fuzzy** (somente se `termo.length >= 4`): algum token da query tem
   distância de Levenshtein ≤ 2 (1 se termo tem 4 chars; 2 se ≥ 5)

Tokens curtos (`pix`, `qr`, `zap`) **não** usam fuzzy — só alias/exato.

### 3. Pontuação (`KeywordScoringPolicy`)

Por tópico, somar:

| Sinal | Peso |
|-------|------|
| slug (sem hífen) casa | +5 |
| cada alias casa | +4 |
| cada keyword **específica** casa | +2 |
| cada keyword **genérica** casa | +0.5 |

**Genéricas (constante de domínio, não no seed):**
`codigo`, `cadastro`, `rede`, `internet`, `pagamento`, `conta`, `app`, `site`

Essas palavras podem existir no seed histórico; o scorer as trata como genéricas
mesmo se estiverem em `keywords`.

### 4. Confiança

Seja `best` o maior score e `second` o segundo.

| Condição | Confiança | slug |
|----------|-----------|------|
| `best == 0` | `none` | vazio |
| `best < 2` (só genérico / ruído) | `low` | vazio |
| `best >= 2` e `(best - second) < 2` | `tie` | vazio |
| `best >= 2` e `(best - second) >= 2` | `high` | slug do best |

**Empate nunca usa `displayOrder`.** “código QR” sozinho: genérico `codigo` +
talvez alias `qr` no Wi-Fi (+4) vs Gov.br sem alias QR → Wi-Fi `high`. Se os
dois só tiverem `codigo` (+0.5), fica `low`/`tie` → steps vazios (032 pergunta).

### 5. Corpus mínimo no seed (`aliases`)

| Slug | Aliases (além das keywords específicas) |
|------|-----------------------------------------|
| `wifi-qr-code` | `wifi`, `wi-fi`, `uifi`, `wify`, `wiffi`, `senha do wifi`, `qr do wifi`, `rede wifi` |
| `codigo-govbr` | `gov.br`, `govbr`, `gov br`, `goovi`, `governo`, `codigo do gov`, `gov brasi` |
| `whatsapp-contato-localizacao` | `whatsapp`, `whatsap`, `watsap`, `uatsap`, `zap`, `whats`, `watzap` |
| `fazer-pix` | `pix`, `pics`, `pixx`, `pikis`, `fazer um pix` |
| `segunda-via-boleto` | `boleto`, `boletu`, `boletoo`, `segunda via`, `2 via`, `conta atrasada` |
| `alerta-golpe` | `golpe`, `golpi`, `fraude`, `mensagem estranha`, `link suspeito` |

Keywords do seed devem ser **específicas** do tópico. Remover ou rebaixar
`codigo`, `cadastro`, `rede`, `internet`, `pagamento` para que não fechem tópico
sozinhas (o scorer já as trata como genéricas).

---

## API Design

**Nenhum endpoint novo.** O contrato HTTP de chat permanece.

Comportamento observável:

- Mesmo `POST` de mensagem
- Resposta ainda é texto do assistente
- Neste bolt, se a inferência não for `high`, o prompt RAG **não** recebe
  passos (a frase de esclarecimento / modo geral é o bolt 032; aqui o
  generator existente pode continuar falando, mas **sem** steps errados)

Garantia deste bolt: o **contexto injetado** nunca contém o tópico errado.

---

## Data Persistence

| Tabela | Mudança | Relacionamentos |
|--------|---------|-----------------|
| `KnowledgeTopic` | coluna `aliases String[]` default `[]` | já tem `steps` |
| `KnowledgeStep` | nenhuma | — |
| `Conversation.topicSlug` | nenhuma neste bolt (032 grava/zera na troca) | — |

Migration Prisma pequena + `upsert` do seed preenchendo `aliases`.

Se a migration atrasar a entrega, **fallback**: corpus estático
`topic-alias.corpus.ts` no domínio, keyed por slug — mesmo contrato de
`TopicInferencePolicy`. Preferência: coluna no seed para o aggregate ficar
coeso.

---

## Security Design

| Concern | Approach |
|---------|----------|
| Auth | Inalterado (Firebase guard / guest já existentes) |
| Guardrails senha/token | Fora deste bolt; retriever não muda essa policy |
| Prompt injection via tópico errado | Mitigado: steps só com `high` único |
| Logs | Logar `confidence` + `slug` + `matchedTerms`; **não** logar a mensagem crua se a policy de PII já mascarar |

---

## NFR Implementation

| Requirement | Design Approach |
|-------------|-----------------|
| Inferência < 50ms p95 | 6 tópicos em memória; Levenshtein só em tokens ≥ 4 contra dezenas de aliases — O(pequeno), sem I/O extra além do `findAllActive` já feito |
| Sem regressão de chat < 8s | Sem chamada LLM na inferência |
| 0 tópico errado injetado | `SafeKnowledgeAssembly` recusa steps se não `high` |
| Testes sem Gemini | Policy + retriever + prompt builder com mocks |

---

## Error Handling

| Caso | Comportamento |
|------|----------------|
| Tópico `high` não encontrado no repo | Contexto vazio (como `none`); não fallback para outro slug |
| Seed sem aliases | Keywords específicas + normalizer ainda funcionam; testes de corpus falham até o seed ser preenchido |
| Mensagem vazia | `none` |
| Exceção inesperada no matcher | Falhar fechado: contexto vazio, não o slug persistido |

---

## External Dependencies

| Service | Purpose | Integration |
|---------|---------|-------------|
| Postgres / Prisma | Tópicos + aliases | Já existente |
| Gemini | Fora do caminho de inferência deste bolt | Retriever não chama LLM |

---

## Testes (obrigatórios neste bolt)

| Suite | Casos |
|-------|-------|
| `query-normalizer.spec` | `Wi-Fi` = `wifi` = `wi fi`; acentos |
| `fuzzy-token-matcher.spec` | `uifi`→wifi; `pix` não fuzzy para `pai` |
| `keyword-scoring.policy.spec` | genérico sozinho < 2; alias QR+wifi vence `codigo` |
| `topic-inference.policy.spec` | corpus FR-2; empate não usa displayOrder; `bom dia` → none |
| `prisma-knowledge-retriever` (unit, repo mock) | persistido Gov.br + msg Wi-Fi → steps wifi; `low`/`tie`/`none` → steps `[]` |
| `rag-prompt.builder.spec` | contexto wifi não contém texto de passos gov.br |

---

## Stories Mapping

| Story | Entregável |
|-------|------------|
| 001-normalize-and-fuzzy-match | `QueryNormalizer`, `FuzzyTokenMatcher`, testes |
| 002-topic-alias-corpus | seed `aliases`, `KeywordScoringPolicy`, genéricas |
| 003-never-inject-wrong-topic | `TopicMatch` + retriever sem curto-circuito + assembly seguro |

---

## ADR

Nenhuma decisão nova de padrão/tecnologia. Lexical vs embeddings já está no
inception. Coluna `aliases` vs arquivo de corpus é detalhe de persistência, não
ADR obrigatório — Stage 3 pode ser **skipped** salvo o time querer registrar
os pesos/limiares.
