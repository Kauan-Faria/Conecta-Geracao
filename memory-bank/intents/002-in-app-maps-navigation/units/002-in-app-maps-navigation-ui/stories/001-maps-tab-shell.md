---
id: 001-maps-tab-shell
unit: 002-in-app-maps-navigation-ui
intent: 002-in-app-maps-navigation
status: complete
priority: must
created: 2026-06-08T20:00:00Z
assigned_bolt: 013-in-app-maps-navigation-ui
implemented: true
---

# Story: 001-maps-tab-shell

## User Story

**As a** usuário ou convidado
**I want** ver uma aba Mapas ao lado do Chat
**So that** encontre lugares próximos facilmente

## Acceptance Criteria

- [ ] **Given** estou logado ou convidado, **When** abro o app, **Then** vejo aba "Mapas" na navegação inferior
- [ ] **Given** toco na aba Mapas, **When** navego, **Then** abro tela de mapas (não app externo)
- [ ] **Given** qualquer aba, **When** vejo ícone Mapas, **Then** há rótulo textual e alvo ≥ 48dp
- [ ] **Given** rota `/maps`, **When** deep link acionado, **Then** aba Mapas fica ativa

## Technical Notes

- Estender `shell_pages.dart` / GoRouter com branch Mapas
- Guest e autenticado têm acesso igual

## Dependencies

### Requires
- 002-app-shell-navigation (intent 001)

### Enables
- 002-flutter-map-base
- 004-maps-search-screen

## Out of Scope

- Conteúdo do mapa (story 002)
- Busca (story 004)
