---
stage: implement
bolt: 009-digital-guidance-ui
created: 2026-06-03T01:40:00Z
---

## Implementation Walkthrough: 009-digital-guidance-ui

### Summary

Tela inicial (Home) operando como hub do assistente: hero CTA, grid 2×2 com os 6 atalhos MVP (mensagem starter via `startWithTopic`), verificações recentes integradas ao `ConversationListController`. Cabeçalho mantém apenas o logo conforme preferência do usuário.

### Structure Overview

Feature `home/presentation/` com `HomePage` e widgets privados de seção. Atalhos e starters em `topic_shortcuts.dart`. Navegação cross-tab via GoRouter (`/chat?new=true`, `/chat?topic=`, `/chat?conversationId=`, `/conversations`).

### Completed Work

- [x] `apps/mobile/lib/features/home/presentation/home_page.dart` — hub completo (hero, atalhos, recentes); header com logo; Material em tiles de recentes para ink splash
- [x] `apps/mobile/test/features/home/home_page_test.dart` — 5 testes widget de layout e navegação

### Key Decisions

- **Reutilizar `topic_shortcuts.dart`**: starters centralizados; sem `home_quick_actions.dart`
- **Header só com logo**: título + ícone config revertidos a pedido do usuário; configurações permanecem na bottom bar

### Deviations from Plan

- Cabeçalho com título + ícone configurações não implementado (decisão do usuário)
- Navegação para configurações via bottom bar em vez de ícone no header

### Dependencies Added

Nenhuma

### Developer Notes

- Testes usam viewport 400×900 e `ensureVisible` para elementos abaixo da dobra
