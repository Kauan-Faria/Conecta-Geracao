---
id: 001-chat-screen
unit: 004-digital-guidance-ui
intent: 001-digital-guidance
status: draft
priority: must
created: 2026-05-28T01:00:00Z
assigned_bolt: 006-digital-guidance-ui
implemented: false
---

# Story: 001-chat-screen

## User Story

**As a** usuário digital
**I want** conversar com o assistente em uma tela simples
**So that** tire minhas dúvidas digitando como se fosse um chat

## Acceptance Criteria

- [ ] **Given** estou no chat, **When** digito e envio mensagem, **Then** vejo minha mensagem e resposta da IA abaixo
- [ ] **Given** IA está processando, **When** aguardo, **Then** vejo indicador "Pensando..." acessível
- [ ] **Given** resposta da IA, **When** exibida, **Then** texto grande, contraste AA, uma instrução principal por bolha
- [ ] **Given** erro de rede, **When** envio falha, **Then** mensagem simples com opção de tentar de novo

## Technical Notes

- Riverpod + ApiClient; widgets `AppScaffold`, tokens de tema
- Sem cache offline para envio (FR-7 separado)

## Dependencies

### Requires
- 005-chat-message-api
- 003-accessibility-preferences

### Enables
- 003-conversation-history-list
