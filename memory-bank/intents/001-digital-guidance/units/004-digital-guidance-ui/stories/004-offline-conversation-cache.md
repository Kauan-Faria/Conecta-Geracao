---
id: 004-offline-conversation-cache
unit: 004-digital-guidance-ui
intent: 001-digital-guidance
status: complete
priority: should
created: 2026-05-28T01:00:00.000Z
assigned_bolt: 007-digital-guidance-ui
implemented: true
---

# Story: 004-offline-conversation-cache

## User Story

**As a** usuário sem internet
**I want** ler conversas que já carreguei antes
**So that** relembre o que o assistente me disse

## Acceptance Criteria

- [ ] **Given** sem conexão, **When** abro conversas cacheadas, **Then** leio histórico previamente sincronizado
- [ ] **Given** sem conexão, **When** tento enviar mensagem, **Then** vejo aviso "Precisa de internet para falar com o assistente"
- [ ] **Given** conversa muito longa, **When** offline, **Then** renderizo com paginação/truncamento sem crash

## Technical Notes

- Hive/SharedPreferences para últimas N conversas; não é fonte da verdade
- Invalidar cache ao sync online

## Dependencies

### Requires
- 003-conversation-history-list

### Enables
- None
