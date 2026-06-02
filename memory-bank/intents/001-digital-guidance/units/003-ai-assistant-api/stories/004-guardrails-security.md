---
id: 004-guardrails-security
unit: 003-ai-assistant-api
intent: 001-digital-guidance
status: complete
priority: must
created: 2026-05-28T01:00:00.000Z
assigned_bolt: 005-ai-assistant-api
implemented: true
---

# Story: 004-guardrails-security

## User Story

**As a** usuário
**I want** que o app nunca peça minha senha ou código secreto
**So that** me sinta seguro ao pedir ajuda

## Acceptance Criteria

- [ ] **Given** usuário envia senha/token no chat, **When** processado, **Then** IA recusa e orienta a digitar apenas no app oficial
- [ ] **Given** prompt do sistema, **When** IA responde, **Then** nunca solicita senha, OTP, PIN ou credencial bancária
- [ ] **Given** logs da API, **When** mensagem contém padrão sensível, **Then** conteúdo é mascarado ou omitido

## Technical Notes

- Input/output filters + system prompt LGPD
- Lista de padrões: senha, token, OTP, PIN, código de verificação

## Dependencies

### Requires
- 005-chat-message-api

### Enables
- None (cross-cutting)
