---
unit: 001-rag-relevance-api
bolt: 031-rag-relevance-api
stage: model
status: complete
created: 2026-09-15T00:39:00Z
updated: 2026-09-15T00:39:00Z
---

# Static Model - RAG Relevance (Bolt 031)

## Bounded Context

**Topic Matching & Safe Retrieval** — classificar a mensagem do usuário contra os
6 tópicos curados (com erros de escrita) e montar contexto RAG **somente** quando
houver um tópico único com confiança alta.

Este bolt **não** modela os modos “perguntar de novo”, “conhecimento geral” nem
a troca de `currentStep` (bolt 032). Só garante: inferência correta + contexto
sem tópico errado.

**Fronteiras**:
- **Dentro**: normalização, aliases, pontuação, resultado `TopicMatch`, contrato
  do retriever que reavalia a mensagem atual.
- **Fora**: persistência de conversa, Gemini, checkpoints, UI.

---

## Domain Entities

| Entity | Properties | Business Rules |
|--------|------------|----------------|
| **KnowledgeTopic** (existente, estendido) | `slug`, `title`, `summary`, `keywords[]`, `aliases[]`, `steps[]`, `displayOrder`, `isActive` | `aliases` são grafias do público (erros, hífen, apelidos). Keywords **específicas** pontuam; keywords **genéricas** nunca vencem sozinhas. Tópico inativo não entra na inferência. |
| **KnowledgeStep** (existente, inalterado) | `order`, `instruction`, `checkpointQuestion?` | Só entra no contexto RAG se o `TopicMatch` for `high` e único |

Não há entidade persistida nova. `TopicMatch` é resultado de domínio (não agregado).

---

## Value Objects

| Value Object | Properties | Constraints |
|--------------|------------|-------------|
| **NormalizedQuery** | `raw`, `normalized`, `tokens[]` | Minúsculas; NFD sem diacríticos; hífen/ponto viram espaço ou são removidos; tokens vazios descartados. `wi-fi`, `wifi` e `wi fi` produzem o mesmo token `wifi`. |
| **TopicAlias** | `surfaceForm`, `weight` | `surfaceForm` normalizada como a query. `weight` > keyword genérica. Lista versionada no seed. |
| **KeywordKind** | `specific` \| `generic` | `generic`: `codigo`, `cadastro`, `rede`, `internet`, `pagamento` (e equivalentes). Genérico **não** pode, sozinho, produzir confiança `high`. |
| **MatchConfidence** | `high` \| `low` \| `tie` \| `none` | `high` = um tópico claramente na frente. `tie` = dois ou mais com score equivalente. `low` = sinal fraco (só genérico). `none` = nenhum sinal. |
| **TopicCandidateScore** | `slug`, `score`, `matchedTerms[]` | Score é soma ponderada (alias > slug > keyword específica >> genérica). Empate se a diferença for menor que o limiar de desempate. |
| **TopicMatch** | `confidence`, `slug?`, `candidates[]` | `slug` preenchido **somente** se `high`. Em `tie`/`low`/`none`, `slug` é vazio e `candidates` pode listar os empatados. |
| **KnowledgeContext** (existente, regra nova) | `topicSlug?`, `topicTitle?`, `summary?`, `steps[]`, `availableTopics[]`, `inferredFromMessage` | Se `TopicMatch` não for `high`, `steps` **obrigatoriamente** vazio e `topicSlug` null no contexto injetável. |

---

## Aggregates

| Aggregate Root | Members | Invariants |
|----------------|---------|------------|
| **KnowledgeTopic** | steps, keywords, aliases | Aliases e keywords pertencem ao tópico. Retrieval nunca mistura steps de dois tópicos no mesmo contexto. |
| **TopicMatch** (resultado, não persistido) | candidates | No máximo um `slug` vencedor. Empate não escolhe o primeiro da lista (`displayOrder` não é desempate). |

**Conversation** permanece no contexto de `003-ai-assistant-api`. Neste bolt a regra de domínio relevante é: **slug persistido na conversa não é fonte da verdade se a mensagem atual tiver outro `TopicMatch.high`**. A orquestração completa da troca (reset de passo) é do 032; o 031 já **não injeta** o tópico antigo nesse caso.

---

## Domain Events

| Event | Trigger | Payload |
|-------|---------|---------|
| **TopicMatched** | Inferência resulta `high` com um slug | `slug`, `matchedTerms`, `fromPersistedSlug: boolean` |
| **TopicAmbiguous** | `tie` ou `low` | `candidateSlugs[]` |
| **TopicUnmatched** | `none` | `normalizedQuery` |
| **StaleTopicIgnored** | Havia `topicSlug` persistido e a mensagem atual deu `high` em **outro** slug | `previousSlug`, `newSlug` |

Eventos são conceituais (para o modelo e logs). Persistência/telemetria não é escopo deste bolt.

---

## Domain Services

| Service | Operations | Dependencies |
|---------|------------|--------------|
| **QueryNormalizer** | `normalize(raw): NormalizedQuery` | Regras de acento, hífen, pontuação, tokens |
| **FuzzyTokenMatcher** | `matches(token, target): boolean` | Igualdade após normalizar; distância de edição 1–2 só se `target.length >= 4`. Tokens curtos (`pix`, `qr`, `zap`) só por alias/exato — nunca fuzzy amplo. |
| **KeywordScoringPolicy** | `score(topic, query): TopicCandidateScore` | Alias peso alto; keyword `specific` peso médio; `generic` peso residual que **não** gera `high` sozinho |
| **TopicInferencePolicy** (evolução) | `infer(query, topics, persistedSlug?): TopicMatch` | Usa normalizer + fuzzy + scoring. **Não** retorna o primeiro tópico em empate. `persistedSlug` só reforça se a mensagem for compatível; não curto-circuita contra match `high` diferente. |
| **SafeKnowledgeAssembly** | `assemble(match, topic?): KnowledgeContext` | Steps só se `match.confidence === high` e o tópico existir. Caso contrário contexto vazio de steps. |

---

## Repository / Ports

| Port | Entity | Methods |
|------|--------|---------|
| **KnowledgeTopicRepository** (existente) | KnowledgeTopic | `findAllActive()`, `findBySlug(slug)` — ativos devem incluir aliases no mapeamento de domínio |
| **KnowledgeRetriever** (contrato evoluído) | KnowledgeContext | `retrieve({ topicSlug?, userMessage })` — **sempre** infere a partir de `userMessage`; `topicSlug` é pista, não trava |

Não há repositório novo. Aliases entram no seed do tópico (mesmo aggregate), não em tabela isolada neste bolt.

---

## Ubiquitous Language

| Term | Definition |
|------|------------|
| **Confiança alta (`high`)** | Um único tópico claramente identificado; único caso em que RAG injeta passos |
| **Empate (`tie`)** | Dois ou mais tópicos com sinal equivalente; **não** se escolhe pelo `displayOrder` |
| **Keyword genérica** | Termo que aparece em vários assuntos (`codigo`, `cadastro`); sozinha não fecha tópico |
| **Alias** | Grafia que o público usa, inclusive errada (`uifi`, `watsap`, `govbr`) |
| **Normalizar** | Tratar `Wi-Fi`, `wifi` e `wi fi` como o mesmo token |
| **Grudar tópico** | Reusar o slug da conversa e ignorar a mensagem nova — **proibido** quando a mensagem tem outro match `high` |
| **Contexto seguro** | KnowledgeContext sem steps de tópico que não foi o match `high` |

---

## Stories Coverage

| Story | Cobertura no modelo |
|-------|---------------------|
| **001-normalize-and-fuzzy-match** | `NormalizedQuery`, `QueryNormalizer`, `FuzzyTokenMatcher` |
| **002-topic-alias-corpus** | `TopicAlias`, `KeywordKind`, `KeywordScoringPolicy`, corpus no seed do aggregate |
| **003-never-inject-wrong-topic** | `TopicMatch` com slug só em `high`; `SafeKnowledgeAssembly`; `StaleTopicIgnored`; retriever sem curto-circuito |

---

## Fora deste bolt (032)

- ReplyMode `clarify` / `general`
- Limite de 2 esclarecimentos
- Reset de `currentStep` na troca
- Suite completa FR-8 (o 031 já testa matching/retrieval; o contrato fechado fica no 032)
