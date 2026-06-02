---
id: 005-checkpoint-user-responses
unit: 004-digital-guidance-ui
intent: 001-digital-guidance
status: draft
priority: must
created: 2026-05-28T01:00:00Z
assigned_bolt: 006-digital-guidance-ui
implemented: false
---

# Story: 005-checkpoint-user-responses

## User Story

**As a** usuário seguindo um passo a passo
**I want** responder facilmente se consegui ou não
**So that** a IA saiba como me ajudar

## Acceptance Criteria

- [ ] **Given** IA faz pergunta de checkpoint, **When** exibo UI, **Then** botões grandes "Sim" e "Não" com rótulos acessíveis
- [ ] **Given** toco "Não", **When** envio, **Then** mensagem registrada e IA adapta resposta
- [ ] **Given** preciso explicar, **When** digito texto livre, **Then** também posso enviar descrição do problema

## Technical Notes

- Quick replies acima do campo de texto quando última msg assistant contém checkpoint
- Sem forçar só sim/não — texto livre sempre disponível

## Dependencies

### Requires
- 001-chat-screen
- 003-checkpoint-dialog-flow (API)

### Enables
- None
