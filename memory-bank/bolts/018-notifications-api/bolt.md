---
id: 018-notifications-api
unit: 001-notifications-api
intent: 003-push-notifications
type: ddd-construction-bolt
status: complete
stories:
  - 005-tips-and-campaigns
  - 006-notification-sent-analytics
created: 2026-06-08T23:30:00.000Z
started: 2026-06-09T22:04:59.000Z
completed: "2026-06-09T23:33:14Z"
current_stage: null
stages_completed:
  - name: model
    completed: 2026-06-09T22:04:59.000Z
    artifact: ddd-01-domain-model.md
  - name: design
    completed: 2026-06-09T23:02:42.000Z
    artifact: ddd-02-technical-design.md
  - name: adr
    completed: 2026-06-09T23:17:23.000Z
    artifact: adr-007-notification-sent-via-pino-structured-logger.md, adr-008-internal-service-key-campaign-auth.md, adr-009-educational-tips-prisma-seed-catalog.md, adr-010-synchronous-campaign-processing.md
  - name: implement
    completed: 2026-06-09T23:28:00.000Z
    artifact: apps/backend/src/modules/notifications/
requires_bolts:
  - 017-notifications-api
enables_bolts: []
requires_units: []
blocks: true
complexity:
  avg_complexity: 2
  avg_uncertainty: 2
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: 018-notifications-api

## Overview

Dicas educativas periódicas, API de campanhas administrativas e eventos notification_sent no backend.

## Objective

Completar capacidades Should do backend: conteúdo curado, campanhas internas e observabilidade de envio.

## Stories Included

- **005-tips-and-campaigns**: Dicas + campanhas API (Should)
- **006-notification-sent-analytics**: Evento notification_sent (Must)

## Bolt Type

**Type**: ddd-construction-bolt

## Stages

- [x] **1. model**: Complete → ddd-01-domain-model.md
- [x] **2. design**: Complete → ddd-02-technical-design.md
- [x] **3. adr**: Complete → adr-007..010
- [x] **4. implement**: Complete → tips job + campaigns API + analytics
- [x] **5. test**: Complete → ddd-03-test-report.md

## Dependencies

### Requires
- 017-notifications-api (FCM send)

### Enables
- Funil analytics completo com 020-push-notifications-ui

## Success Criteria

- [x] Dica semanal enviada com rate limit
- [x] Campanha interna com auditoria
- [x] notification_sent emitido em cada envio

## Notes

- Conteúdo dicas pré-aprovado via Prisma seed (ADR-009)
- Campanha: auth interno no MVP
