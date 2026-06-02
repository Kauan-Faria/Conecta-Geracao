---
id: 002-topic-shortcuts
unit: 004-digital-guidance-ui
intent: 001-digital-guidance
status: draft
priority: could
created: 2026-05-28T01:00:00Z
assigned_bolt: 008-digital-guidance-ui
implemented: false
---

# Story: 002-topic-shortcuts

## User Story

**As a** usuário que não sabe o que perguntar
**I want** ver botões com assuntos comuns
**So that** comece uma conversa tocando em um tópico

## Acceptance Criteria

- [ ] **Given** tela inicial ou chat vazio, **When** visualizo, **Then** vejo 6 cards: PIX, Gov.br, WhatsApp, Wi-Fi, Boleto, Golpe
- [ ] **Given** toco em um card, **When** ação completa, **Then** nova conversa inicia com contexto do tópico
- [ ] **Given** cards, **When** exibidos, **Then** ícone + rótulo textual, alvo ≥ 48dp

## Technical Notes

- Mapeamento slug → card; POST conversation com topicSlug

## Dependencies

### Requires
- 001-chat-screen

### Enables
- None
