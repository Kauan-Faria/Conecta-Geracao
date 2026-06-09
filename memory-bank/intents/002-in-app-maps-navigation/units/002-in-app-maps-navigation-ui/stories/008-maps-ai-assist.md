---
id: 008-maps-ai-assist
unit: 002-in-app-maps-navigation-ui
intent: 002-in-app-maps-navigation
status: complete
priority: should
created: 2026-06-08T20:00:00Z
assigned_bolt: 015-in-app-maps-navigation-ui
implemented: true
---

# Story: 008-maps-ai-assist

## User Story

**As a** usuário na aba Mapas com dúvida
**I want** pedir ajuda à IA
**So that** entenda o que buscar ou o que significa cada opção

## Acceptance Criteria

- [ ] **Given** tela de busca Mapas, **When** toco "Pedir ajuda à IA", **Then** abro chat com contexto (aba Mapas, categoria selecionada se houver)
- [ ] **Given** pergunto "O que é UBS?", **When** IA responde, **Then** explica em linguagem simples
- [ ] **Given** digo "quero farmácia perto", **When** IA confirma, **Then** preenche categoria farmácia e sugere buscar
- [ ] **Given** IA sugere raio, **When** confirmo, **Then** seletor de raio atualiza (2/5/10 km)

## Technical Notes

- Deep link chat com query `?context=maps&category=pharmacy`
- Reutilizar `ChatPage` existente; passar `MapsContext` ao controller

## Dependencies

### Requires
- 004-maps-search-screen
- 004-radius-suggestion-response (API)
- 001-chat-screen (intent 001)

### Enables
- None

## Out of Scope

- IA executar busca sem confirmação explícita do usuário
