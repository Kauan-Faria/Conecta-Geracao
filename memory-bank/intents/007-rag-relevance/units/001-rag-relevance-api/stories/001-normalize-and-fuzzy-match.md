---
id: 001-normalize-and-fuzzy-match
unit: 001-rag-relevance-api
intent: 007-rag-relevance
status: complete
priority: must
created: 2026-09-15T00:30:00.000Z
assigned_bolt: 031-rag-relevance-api
implemented: true
---

# Story: 001-normalize-and-fuzzy-match

## User Story

**As a** usuário que escreve “wi-fi” ou “uifi”
**I want** o assistente reconhecer que estou falando de Wi-Fi
**So that** eu não precise acertar a grafia para ser entendido

## Acceptance Criteria

- [ ] **Given** mensagem com `wi-fi`, `wifi` ou `wi fi`, **When** a policy infere, **Then** o slug é o tópico Wi-Fi
- [ ] **Given** palavra-chave com 1–2 letras erradas e comprimento ≥ 4 (ex.: `uifi`, `wify`), **When** infere, **Then** casa o tópico Wi-Fi
- [ ] **Given** acentos (`código` vs `codigo`), **When** infere, **Then** a comparação ignora diacríticos
- [ ] **Given** mensagem sem nenhum sinal de tópico (`bom dia`), **When** infere, **Then** retorna confiança `none` (não inventa slug)

## Technical Notes

- Evoluir `TopicInferencePolicy` em `apps/backend/src/modules/conversations/domain/services/`
- Normalizar: NFD, remover marcas, minúsculas, remover hífen/pontos, colapsar espaços
- Fuzzy: distância de Levenshtein (ou equivalente) só em tokens ≥ 4; não fuzzy em `qr`, `pix` curtos demais sem alias explícito
- Sem chamada a LLM nesta story

## Dependencies

### Requires
- None

### Enables
- 002-topic-alias-corpus
- 003-never-inject-wrong-topic

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Só “qr” isolado | Não casar Wi-Fi por fuzzy; tratar no alias/empate (stories 002/004) |
| “pix” com 3 letras | Match exato/alias, não fuzzy que pegue “pai” |
| Maiúsculas `WI-FI` | Equivale a `wifi` |

## Out of Scope

- Lista completa de aliases (story 002)
- Prompt / LLM
