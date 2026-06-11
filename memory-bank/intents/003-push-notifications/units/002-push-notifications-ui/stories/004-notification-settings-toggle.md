---
id: 004-notification-settings-toggle
unit: 002-push-notifications-ui
intent: 003-push-notifications
status: complete
priority: must
created: 2026-06-08T23:30:00.000Z
assigned_bolt: 020-push-notifications-ui
implemented: true
---

# Story: 004-notification-settings-toggle

## User Story

**As a** usuário
**I want** ligar ou desligar notificações nas configurações
**So that** controle se recebo push sem precisar ir às configurações do sistema

## Acceptance Criteria

- [ ] **Given** tela de configurações, **When** usuário vê toggle "Receber notificações", **Then** alvo ≥ 48dp com rótulo textual e Semantics
- [ ] **Given** toggle desligado, **When** confirma, **Then** chama `PUT /notifications/preferences` com enabled=false
- [ ] **Given** toggle ligado sem permissão OS, **When** ativa, **Then** redireciona para fluxo de permissão contextual
- [ ] **Given** estado carregado, **When** abre configurações, **Then** reflete preferência atual do backend

## Technical Notes

- Riverpod provider para NotificationPreference
- Sincronizar com backend ao alterar toggle
- Sem categorias no MVP — apenas toggle geral

## Dependencies

### Requires
- 003-token-sync-logout
- 002-token-preference-api (backend)

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Falha API ao salvar | Reverter toggle e mostrar mensagem amigável |
| Permissão negada no OS | Toggle mostra estado desabilitado com explicação |

## Out of Scope

- Categorias configuráveis (lembretes, dicas, campanhas)
