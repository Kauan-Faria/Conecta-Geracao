---
id: 017-notifications-api
unit: 001-notifications-api
intent: 003-push-notifications
type: ddd-construction-bolt
status: complete
stories:
  - 003-fcm-push-provider
  - 004-conversation-notification-triggers
created: 2026-06-08T23:30:00.000Z
started: 2026-06-09T21:44:00.000Z
completed: "2026-06-09T22:04:06Z"
current_stage: null
stages_completed:
  - name: model
    completed: 2026-06-09T21:45:00.000Z
    artifact: ddd-01-domain-model.md
  - name: design
    completed: 2026-06-09T21:46:00.000Z
    artifact: ddd-02-technical-design.md
  - name: adr
    completed: 2026-06-09T21:46:44.000Z
    artifact: adr-006-notifications-decoupled-from-conversations-module.md
  - name: implement
    completed: 2026-06-09T21:52:00.000Z
    artifact: apps/backend/src/modules/notifications/
  - name: test
    completed: 2026-06-09T21:58:00.000Z
    artifact: ddd-03-test-report.md
requires_bolts:
  - 016-notifications-api
enables_bolts:
  - 018-notifications-api
  - 020-push-notifications-ui
requires_units:
  - 003-ai-assistant-api
blocks: true
complexity:
  avg_complexity: 3
  avg_uncertainty: 2
  max_dependencies: 3
  testing_scope: 2
---

# Bolt: 017-notifications-api

## Overview

Implementação FCM Admin SDK (PushNotificationProvider) e triggers de conversa: lembrete abandonada e resposta IA em background.

## Objective

Backend capaz de enviar push reais via FCM quando conversas ficam inativas ou IA responde com app em background.

## Stories Included

- **003-fcm-push-provider**: FCM Admin SDK send (Must)
- **004-conversation-notification-triggers**: Jobs + hook resposta IA (Must)

## Bolt Type

**Type**: ddd-construction-bolt

## Stages

- [x] **1. model**: Complete → ddd-01-domain-model.md
- [x] **2. design**: Complete → ddd-02-technical-design.md
- [x] **3. adr**: Complete → adr-006-notifications-decoupled-from-conversations-module.md
- [x] **4. implement**: Complete → FcmPushNotificationProvider + jobs + triggers
- [x] **5. test**: Complete → ddd-03-test-report.md

## Dependencies

### Requires
- 016-notifications-api (token/preferência)
- 003-ai-assistant-api (conversations)

### Enables
- 018-notifications-api (dicas/campanhas)
- 020-push-notifications-ui (E2E deep links)

## Success Criteria

- [x] Push enviado via FCM com payload genérico
- [x] Lembrete 24h funcional com rate limit
- [x] Resposta IA em background dispara notificação

## Notes

- Integrar com conversations via port (baixo acoplamento)
- Default inactivity: 24h
