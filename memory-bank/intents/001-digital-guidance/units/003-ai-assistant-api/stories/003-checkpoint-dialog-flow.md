---
id: 003-checkpoint-dialog-flow
unit: 003-ai-assistant-api
intent: 001-digital-guidance
status: complete
priority: must
created: 2026-05-28T01:00:00.000Z
assigned_bolt: 005-ai-assistant-api
implemented: true
---

# Story: 003-checkpoint-dialog-flow

## User Story

**As a** usuário executando uma tarefa
**I want** que a IA pergunte se consegui fazer cada passo
**So that** receba ajuda no ponto exato onde travei

## Acceptance Criteria

- [ ] **Given** passo com checkpoint, **When** IA instrui, **Then** inclui pergunta de confirmação (ex.: "Conseguiu abrir o app do banco?")
- [ ] **Given** usuário responde "não", **When** IA processa, **Then** repete ou simplifica o passo anterior sem avançar
- [ ] **Given** usuário responde "sim", **When** IA processa, **Then** avança para próximo passo e atualiza `currentStep` na conversa

## Technical Notes

- System prompt com regra: uma instrução por mensagem + checkpoint
- Estado `currentStep` persistido na Conversation

## Dependencies

### Requires
- 002-rag-orchestration

### Enables
- 005-checkpoint-user-responses (UI)
