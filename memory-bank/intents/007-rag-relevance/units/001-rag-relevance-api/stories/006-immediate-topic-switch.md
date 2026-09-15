---
id: 006-immediate-topic-switch
unit: 001-rag-relevance-api
intent: 007-rag-relevance
status: complete
priority: must
created: 2026-09-15T00:30:00.000Z
assigned_bolt: 032-rag-relevance-api
implemented: true
---

# Story: 006-immediate-topic-switch

## User Story

**As a** usuário no meio do tutorial de Gov.br
**I want** perguntar de Wi-Fi e ser atendido de Wi-Fi na hora
**So that** a conversa não fique presa no assunto antigo

## Acceptance Criteria

- [ ] **Given** conversa com `topicSlug=codigo-govbr` e mensagem “como passo a senha do wi-fi”, **When** gera resposta, **Then** `topicSlug` vira Wi-Fi, `currentStep` volta a 0, contexto RAG só de Wi-Fi
- [ ] **Given** conversa em um tópico e user diz `sim` / `não` / `ok` / `consegui` / `não consegui`, **When** avalia, **Then** **não** troca de tópico (checkpoint)
- [ ] **Given** continuação do mesmo assunto com erro de escrita (`uifi` no tópico Wi-Fi), **When** avalia, **Then** permanece no tópico; não zera o passo à toa
- [ ] **Given** troca efetuada, **When** o prompt é montado, **Then** passos do tópico antigo não aparecem

## Technical Notes

- Reusar `CheckpointResponsePolicy` como sinal de “continuação”
- Persistência: `sendMessage` / UoW já grava `topicSlug` e `nextCurrentStep` — garantir reset explícito na troca
- Guest chat (`reply-guest-message`) deve seguir a mesma regra

## Dependencies

### Requires
- 003-never-inject-wrong-topic

### Enables
- 007-relevance-regression-tests

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Troca para fora do catálogo | `topicSlug` null, modo geral, step irrelevante |
| Primeira mensagem da conversa | Não é “troca”; é inferência inicial |

## Out of Scope

- UI de “você mudou de assunto”
- Histórico visual de tópicos na conversa
