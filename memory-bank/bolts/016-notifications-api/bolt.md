---
id: 016-notifications-api
unit: 001-notifications-api
intent: 003-push-notifications
type: ddd-construction-bolt
status: complete
stories:
  - 001-notifications-domain-model
  - 002-token-preference-api
created: 2026-06-08T23:30:00.000Z
started: 2026-06-09T12:00:00.000Z
completed: "2026-06-09T21:42:40Z"
current_stage: null
stages_completed:
  - name: model
    completed: 2026-06-09T12:15:00.000Z
    artifact: ddd-01-domain-model.md
  - name: design
    completed: 2026-06-09T12:30:00.000Z
    artifact: ddd-02-technical-design.md
  - name: adr
    completed: 2026-06-09T12:45:00.000Z
    artifact: null
    note: skipped — decisions align with existing standards
  - name: implement
    completed: 2026-06-09T13:00:00.000Z
    artifact: apps/backend/src/modules/notifications/
  - name: test
    completed: 2026-06-09T13:15:00.000Z
    artifact: ddd-03-test-report.md
requires_bolts: []
enables_bolts:
  - 017-notifications-api
  - 019-push-notifications-ui
requires_units:
  - 001-mobile-auth-shell
blocks: true
complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: 016-notifications-api

## Overview

Fundação do NotificationsModule: domínio DeviceToken/NotificationPreference e API REST de registro de token e preferências.

## Objective

Backend pronto para receber tokens FCM e preferências de usuários autenticados, com arquitetura DDD preparada para evolução.

## Stories Included

- **001-notifications-domain-model**: Domínio + Prisma schema (Must)
- **002-token-preference-api**: Endpoints token/preferência/logout (Must)

## Bolt Type

**Type**: ddd-construction-bolt

## Stages

- [x] **1. model**: Complete → ddd-01-domain-model.md
- [x] **2. design**: Complete → ddd-02-technical-design.md
- [x] **3. adr**: Skipped (aligns with existing standards)
- [x] **4. implement**: Complete → apps/backend/src/modules/notifications/
- [x] **5. test**: Complete → ddd-03-test-report.md

## Dependencies

### Requires
- 001-mobile-auth-shell (Firebase Auth guard)

### Enables
- 017-notifications-api (FCM send)
- 019-push-notifications-ui (token sync client)

## Success Criteria

- [x] DeviceToken e NotificationPreference persistidos
- [x] PUT device-token e preferences funcionais com auth
- [x] Token inativado no logout

## Notes

- Executar após auth, chat e maps estáveis
- Próximo bolt global: 017
