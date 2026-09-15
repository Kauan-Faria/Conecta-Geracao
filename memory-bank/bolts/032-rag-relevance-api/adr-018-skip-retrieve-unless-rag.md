---
bolt: 032-rag-relevance-api
created: 2026-09-15T01:20:00Z
status: accepted
---

# ADR-018: Retrieve de steps só no modo RAG

## Context

O pipeline 005 sempre chama `KnowledgeRetriever` antes do prompt. O 031 já
devolve `steps: []` quando o match não é `high`, o que impede tópico errado —
mas ainda **carrega e monta** contexto (tópico, summary, availableTopics) e
empilha o builder RAG.

FR-3/FR-4 e o NFR pedem: esclarecimento sem buscar KB; modo geral sem passos
dos 6 tópicos e sem fingir “base oficial”. Chamar retrieve nesses modos é
trabalho inútil e risco de o builder reaproveitar summary/steps por engano.

## Decision

O generator **infere o `TopicMatch` primeiro** (`TopicInferencePolicy`, 031).
`ReplyModeResolver` fecha o plano. `KnowledgeRetriever.retrieve` **só executa
se `plan.mode === 'rag'`**.

- `clarify`: template (ADR-016); sem retrieve; sem LLM
- `general`: `RagPromptBuilder.buildGeneral` com steps vazios; Gemini; sem retrieve
- `rag`: retrieve + `buildRag` + Gemini

Carregar a **lista leve** dos 6 tópicos (slug, title, aliases, keywords) para
inferir é permitido — não é retrieve de steps. Títulos dos candidatos alimentam
as ≤ 2 opções do clarify.

`resolvedTopicSlug` devolvido ao use case é o valor **pós-turno** (`set` / `clear`
/ persistido inalterado), para SendMessage e guest gravarem o mesmo contrato.

## Rationale

- NFR “não buscar RAG” no esclarecimento é skip, não “retrieve vazio”
- General não pode receber summary/steps curados nem por acidente de builder
- Inferência continua sem LLM (ADR-012) e < 50ms
- Um único ponto (`mode === rag`) é fácil de testar

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Sempre retrieve; builder ignora steps se não high | Menos ramos no generator | Viola NFR; summary/availableTopics ainda vazam no prompt | Risco FR-1/FR-4 |
| Retrieve só monta se high, mas sempre é chamado | Encapsula no adapter | Generator não expressa a regra de modo; clarify ainda I/O | Menos explícito |
| Nova API `POST /topics/infer` | Contrato visível | Hop extra; chat já tem POST de mensagem | ADR-015 |

## Consequences

### Positive

- Clarify/general não tocam steps da KB
- Testes assertam “retrieve não chamado” via mock
- Troca de tópico: prompt RAG usa só o contexto novo, passo 0

### Negative

- Generator tem três ramos explícitos (mais código de orquestração)
- Lista de tópicos para inferir ainda é I/O — aceitável (já existia no 031)

### Risks

- **Retriever antigo ainda curto-circuita por slug**: mitigado pelo ADR-015;
  este bolt só chama retrieve com intenção `rag` e match `high`
- **Stub generator pular o resolver**: stub deve devolver o mesmo `ReplyPlan`
  (modo/slug/step), não só ecoar texto

## Related

- **Stories**: 004-low-confidence-clarification, 005-out-of-catalog-general-knowledge, 006-immediate-topic-switch, 007-relevance-regression-tests
- **Standards**: `system-architecture.md` (hexagonal; ports na application)
- **Previous ADRs**: ADR-012, ADR-015
