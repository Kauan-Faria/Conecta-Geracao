---
id: 020-push-notifications-ui
unit: 002-push-notifications-ui
intent: 003-push-notifications
type: simple-construction-bolt
status: complete
stories:
  - 004-notification-settings-toggle
  - 005-foreground-in-app-banner
  - 006-notification-deep-links
  - 007-client-analytics-events
created: 2026-06-08T23:30:00.000Z
started: 2026-06-10T23:00:00.000Z
completed: "2026-06-10T22:32:52Z"
current_stage: null
stages_completed:
  - name: plan
    completed: 2026-06-10T23:05:00.000Z
    artifact: implementation-plan.md
  - name: implement
    completed: 2026-06-10T23:30:00.000Z
    artifact: implementation-walkthrough.md
  - name: test
    completed: 2026-06-10T23:45:00.000Z
    artifact: test-walkthrough.md
requires_bolts:
  - 019-push-notifications-ui
  - 017-notifications-api
enables_bolts: []
requires_units:
  - 004-digital-guidance-ui
blocks: true
complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 3
  testing_scope: 3
---

# Bolt: 020-push-notifications-ui

## Overview

UX completa de notificações: toggle nas configurações, banner foreground, deep links e analytics client-side.

## Objective

Experiência end-to-end: usuário configura, recebe, vê banner, toca e navega para destino correto com métricas.

## Stories Included

- **004-notification-settings-toggle**: Toggle configurações (Must)
- **005-foreground-in-app-banner**: Banner in-app (Must)
- **006-notification-deep-links**: Deep link navegação (Must)
- **007-client-analytics-events**: Eventos funil client (Should)

## Bolt Type

**Type**: simple-construction-bolt

## Stages

- [x] **1. plan**: Complete → implementation-plan.md
- [x] **2. implement**: Complete → settings + deep link handler
- [x] **3. test**: Complete → test-walkthrough.md

## Dependencies

### Requires
- 019-push-notifications-ui (FCM base)
- 017-notifications-api (push real para E2E)
- 004-digital-guidance-ui (rotas chat)

### Enables
- Intent 003 completo em produção

## Success Criteria

- [x] Toggle persiste preferência
- [x] Banner foreground acessível
- [x] Deep link abre conversa/home/mapas
- [x] Eventos analytics sem PII

## Notes

- Teste E2E: enviar push do backend → tocar → abrir chat
