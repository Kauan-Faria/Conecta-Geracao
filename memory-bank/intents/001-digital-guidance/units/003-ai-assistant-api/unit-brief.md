---
unit: 003-ai-assistant-api
intent: 001-digital-guidance
unit_type: backend
default_bolt_type: ddd-construction-bolt
phase: inception
status: ready
created: 2026-05-28T01:00:00Z
updated: 2026-05-28T01:00:00Z
---

# Unit Brief: AI Assistant API

## Purpose

Orquestrar conversas com IA: RAG sobre base de conhecimento, fluxo de checkpoints, guardrails LGPD e persistência de conversas/mensagens.

## Scope

### In Scope
- Entidades Conversation, Message, SessionCheckpoint
- Endpoint POST /conversations/:id/messages (chat)
- Integração LLM + RAG
- Guardrails (sem pedir senha/token)
- Lógica de checkpoint no prompt/orquestrador
- CRUD de conversas para histórico

### Out of Scope
- UI mobile (`004-digital-guidance-ui`)
- Curadoria de conteúdo (`002-knowledge-base` fornece dados)
- Gov.br OAuth

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-2 | Diagnóstico por etapas (checkpoints) | Must |
| FR-5 | Guardrails de segurança e privacidade | Must |
| FR-6 | Histórico de conversas | Must |

---

## Domain Concepts

### Key Entities
| Entity | Description | Attributes |
|--------|-------------|------------|
| Conversation | Sessão de chat | userId, topicSlug, status, currentStep |
| Message | Mensagem user/assistant | role, content, timestamp |
| SessionCheckpoint | Estado do fluxo | stepOrder, userConfirmed |

### Key Operations
| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| sendMessage | Enviar msg e obter resposta IA | conversationId, text | assistant reply |
| createConversation | Nova sessão | topicSlug? | conversation |
| listConversations | Histórico do usuário | userId | paginated list |
| applyGuardrails | Filtrar input/output | text | safe text or refusal |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 5 |
| Must Have | 5 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-conversation-persistence | Persistência de conversas | Must | Planned |
| 002-rag-orchestration | Orquestração RAG + LLM | Must | Planned |
| 003-checkpoint-dialog-flow | Fluxo de checkpoints | Must | Planned |
| 004-guardrails-security | Guardrails LGPD | Must | Planned |
| 005-chat-message-api | API REST de chat | Must | Planned |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 001-mobile-auth-shell | Firebase guard |
| 002-knowledge-base | Conteúdo RAG |

### Depended By
| Unit | Reason |
|------|--------|
| 004-digital-guidance-ui | Consome API de chat |

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| Provedor LLM | Geração de respostas | Alto |
| Firebase Admin | Validação token | Médio |

---

## Success Criteria

### Functional
- [ ] Usuário envia mensagem e recebe orientação em linguagem simples
- [ ] IA faz checkpoints antes de avançar
- [ ] IA nunca pede senha/token
- [ ] Conversas listáveis e retomáveis

### Non-Functional
- [ ] Latência p95 < 8s
- [ ] Logs sem PII sensível

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 004-ai-assistant-api | ddd | 001, 005 | Persistência + API base |
| 005-ai-assistant-api | ddd | 002, 003, 004 | RAG, checkpoints, guardrails |
