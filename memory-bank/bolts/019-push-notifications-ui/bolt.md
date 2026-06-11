---
id: 019-push-notifications-ui
unit: 002-push-notifications-ui
intent: 003-push-notifications
type: simple-construction-bolt
status: complete
stories:
  - 001-fcm-sdk-integration
  - 002-contextual-permission-prompt
  - 003-token-sync-logout
created: 2026-06-08T23:30:00.000Z
started: 2026-06-10T12:00:00.000Z
completed: "2026-06-10T22:20:07Z"
current_stage: null
stages_completed:
  - name: plan
    completed: 2026-06-10T12:15:00.000Z
    artifact: implementation-plan.md
  - name: implement
    completed: 2026-06-10T13:00:00.000Z
    artifact: implementation-walkthrough.md
  - name: test
    completed: 2026-06-10T13:30:00.000Z
    artifact: test-walkthrough.md
requires_bolts:
  - 016-notifications-api
enables_bolts:
  - 020-push-notifications-ui
requires_units:
  - 001-mobile-auth-shell
blocks: true
complexity:
  avg_complexity: 2
  avg_uncertainty: 2
  max_dependencies: 2
  testing_scope: 3
---

# Bolt: 019-push-notifications-ui

## Overview

Integração FCM no Flutter: SDK, permissão contextual e sincronização de token com backend.

## Objective

App capaz de receber push, pedir permissão no momento certo e registrar token no backend.

## Stories Included

- **001-fcm-sdk-integration**: firebase_messaging setup (Must)
- **002-contextual-permission-prompt**: Permissão após valor (Must)
- **003-token-sync-logout**: Sync + logout cleanup (Must)

## Bolt Type

**Type**: simple-construction-bolt

## Stages

- [x] **1. plan**: Complete → implementation-plan.md
- [x] **2. implement**: Complete → apps/mobile/lib/features/notifications/
- [x] **3. test**: Complete → test-walkthrough.md

## Dependencies

### Requires
- 016-notifications-api (API token)

### Enables
- 020-push-notifications-ui (UX completa)

## Success Criteria

- [x] Token FCM obtido em iOS/Android (com permissão concedida)
- [x] Permissão não pedida na primeira abertura
- [x] Token registrado e removido no logout

## Notes

- Configurar APNs no Firebase para iOS
- Deep links e banner foreground ficam no bolt 020
