---
id: 003-accessibility-preferences
unit: 001-mobile-auth-shell
intent: 001-digital-guidance
status: complete
priority: must
created: 2026-05-28T01:00:00.000Z
assigned_bolt: 001-mobile-auth-shell
implemented: true
---

# Story: 003-accessibility-preferences

## User Story

**As a** usuário com dificuldade visual
**I want** aumentar a fonte e usar alto contraste
**So that** consiga ler as orientações do assistente

## Acceptance Criteria

- [ ] **Given** estou em Configurações, **When** escolho tamanho de fonte (normal/grande/extra grande), **Then** todo o app atualiza imediatamente
- [ ] **Given** ativo alto contraste, **When** navego pelo app, **Then** cores seguem modo alto contraste
- [ ] **Given** altero preferências, **When** fecho e reabro o app, **Then** preferências persistem localmente

## Technical Notes

- ThemeExtension + Riverpod; cache local (SharedPreferences)
- Respeitar `MediaQuery.textScaler` do sistema

## Dependencies

### Requires
- 002-app-shell-navigation

### Enables
- 001-chat-screen (tema aplicado no chat)

## Out of Scope

- Entrada por voz
