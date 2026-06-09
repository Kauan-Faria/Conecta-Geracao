---
id: 007-chat-to-maps-handoff
unit: 002-in-app-maps-navigation-ui
intent: 002-in-app-maps-navigation
status: complete
priority: must
created: 2026-06-08T20:00:00Z
assigned_bolt: 015-in-app-maps-navigation-ui
implemented: true
---

# Story: 007-chat-to-maps-handoff

## User Story

**As a** usuário no chat
**I want** ser levado ao mapa quando pergunto sobre lugares
**So that** veja o caminho sem configurar busca manualmente

## Acceptance Criteria

- [ ] **Given** IA responde com `map_action`, **When** usuário confirma, **Then** app navega para aba Mapas
- [ ] **Given** redirecionamento, **When** Mapas abre, **Then** categoria e raio do map_action já estão preenchidos
- [ ] **Given** busca retorna múltiplos POIs, **When** no chat, **Then** IA lista opções ou app mostra lista para escolher
- [ ] **Given** redirecionamento, **When** volto ao chat, **Then** conversa intacta com mensagem confirmando ("Abri o mapa para você")
- [ ] **Given** map_action recebido, **When** GPS necessário, **Then** fluxo de permissão (story 003) é acionado

## Technical Notes

- `ChatController` parseia `map_action` da resposta API
- GoRouter `context.go('/maps', extra: mapAction)`
- Botão inline no chat "Ver no mapa" (≥ 48dp)

## Dependencies

### Requires
- 003-location-intent-chat (API)
- 004-maps-search-screen
- 005-poi-results-and-selection

### Enables
- None

## Out of Scope

- Busca automática sem confirmação do usuário
