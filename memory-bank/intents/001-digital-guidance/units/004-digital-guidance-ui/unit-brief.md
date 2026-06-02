---
unit: 004-digital-guidance-ui
intent: 001-digital-guidance
unit_type: frontend
default_bolt_type: simple-construction-bolt
phase: inception
status: complete
created: 2026-05-28T01:00:00.000Z
updated: 2026-06-02T12:00:00.000Z
---

# Unit Brief: Digital Guidance UI

## Purpose

Interface mobile acessível do assistente: chat conversacional, respostas de checkpoint, atalhos dos 6 tópicos, histórico e cache offline parcial.

## Scope

### In Scope
- Tela de chat (enviar/receber mensagens)
- UI de checkpoint (sim/não/descrever onde parou)
- Lista de conversas anteriores
- Cache local de conversas para offline
- Cards de atalho dos 6 tópicos MVP (chat vazio)
- **Tela inicial (Home)**: hero CTA, ações rápidas com mensagem contextual, verificações recentes

### Out of Scope
- Lógica RAG/LLM (API)
- Curadoria de conteúdo
- Login (unit 001)

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Chat com assistente IA | Must |
| FR-7 | Acesso offline parcial | Should |
| FR-10 | Entrada assistida por sugestões (chat vazio) | Should |
| FR-11 | Tela inicial como hub do assistente | Must |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 6 |
| Must Have | 3 |
| Should Have | 3 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-chat-screen | Tela de chat acessível | Must | Planned |
| 002-topic-shortcuts | Atalhos dos 6 tópicos | Could | Planned |
| 003-conversation-history-list | Lista de conversas | Should | Planned |
| 004-offline-conversation-cache | Cache offline | Should | Planned |
| 005-checkpoint-user-responses | UI de checkpoints | Must | Planned |
| 006-home-screen | Tela inicial (Home) | Must | Draft |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 001-mobile-auth-shell | Auth + tema |
| 003-ai-assistant-api | API de chat/conversas |

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 006-digital-guidance-ui | simple | 001, 005 | Chat + checkpoints |
| 007-digital-guidance-ui | simple | 003, 004 | Histórico + offline |
| 008-digital-guidance-ui | simple | 002 | Atalhos de tópicos |
| 009-digital-guidance-ui | simple | 006 | Tela inicial (Home) |
