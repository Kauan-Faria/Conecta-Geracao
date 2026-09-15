---
id: 002-topic-alias-corpus
unit: 001-rag-relevance-api
intent: 007-rag-relevance
status: complete
priority: must
created: 2026-09-15T00:30:00.000Z
assigned_bolt: 031-rag-relevance-api
implemented: true
---

# Story: 002-topic-alias-corpus

## User Story

**As a** usuário analfabeto digital
**I want** o app entender jeitos comuns de escrever PIX, Zap, Gov.br, boleto e golpe
**So that** eu chegue no assunto certo mesmo errando a palavra

## Acceptance Criteria

- [ ] **Given** cada grafia do corpus mínimo do FR-2, **When** infere, **Then** o slug é o tópico correspondente
- [ ] **Given** “código QR do wifi”, **When** infere, **Then** tópico é Wi-Fi — **não** Gov.br
- [ ] **Given** “código do governo”, **When** infere, **Then** tópico é Gov.br
- [ ] **Given** só a palavra “código”, **When** infere, **Then** confiança `tie` ou `low` — **não** escolhe Gov.br sozinho
- [ ] **Given** keywords genéricas (`codigo`, `cadastro`, `rede`, `internet`, `pagamento`), **When** aparecem sozinhas, **Then** não selecionam tópico (`high`)

## Technical Notes

- Seed / tabela de aliases por slug em `knowledge-base` (código versionado; sem CMS)
- Revisar `MVP_TOPICS_DATA` keywords: específicos sobem de peso; genéricos não pontuam sozinhos
- Empate (`tie`) é input da story 004 — esta story só precisa **não** promover genérico a vencedor
- Construction pode acrescentar aliases extras desde que o corpus mínimo continue verde

## Dependencies

### Requires
- 001-normalize-and-fuzzy-match

### Enables
- 003-never-inject-wrong-topic
- 004-low-confidence-clarification

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| “zap” | WhatsApp (alias explícito) |
| “2 via” / “segunda via” | Boleto, não PIX |
| “pics” / “pixx” | PIX |

## Out of Scope

- Injeção no prompt (story 003)
- Esclarecimento em linguagem natural (story 004)
