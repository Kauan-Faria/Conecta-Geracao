---
stage: test
bolt: 018-notifications-api
status: complete
created: 2026-06-09T23:30:00Z
updated: 2026-06-10T22:20:00Z
---

# Test Report: Notifications API (Bolt 018)

## Summary

- **Unit Tests**: 53/53 passed (módulo notifications, incl. novos specs bolt 018)
- **Integration Tests**: 1/1 passed (`notifications.controller.spec.ts` — endpoints 016 inalterados)
- **Build**: `pnpm build` — sucesso
- **New specs (018)**: analytics adapter, tip selection, send-internal-campaign, send-push analytics retrofit

## Acceptance Criteria Validation

### Story 005-tips-and-campaigns

- ✅ **Catálogo curado + seed**: `educational_tips` + `prisma/seeds/educational-tips.seed.ts` (3 dicas upsert)
- ✅ **Job semanal**: `WeeklyEducationalTipsJob` + `ProcessWeeklyEducationalTipsUseCase` com rate limit semanal
- ✅ **Campanha interna**: `POST /notifications/campaigns` + `InternalServiceKeyGuard` + auditoria `campaigns`
- ✅ **Segmento vazio**: retorna `sentCount=0` sem erro (use case)
- ✅ **Idempotência**: `SendInternalCampaignUseCase` retorna campanha existente com `idempotentReplay: true`
- ✅ **LLM rejeitado**: `CuratedContentPolicy` + `DynamicContentNotAllowedError`

### Story 006-notification-sent-analytics

- ✅ **notification_sent após FCM success**: `PinoNotificationAnalyticsAdapter` + retrofit `SendPushNotificationUseCase`
- ✅ **Skip não emite**: teste confirma `trackNotificationSent` não chamado em `preference_disabled`
- ✅ **Sem PII**: spec asserta ausência de `firebaseUid`, `token`, `conversationId` no payload de log

## Test Coverage (novos arquivos)

| Arquivo | Cenários |
|---------|----------|
| `send-push-notification.use-case.spec.ts` | analytics em sent; skip sem analytics |
| `pino-notification-analytics.adapter.spec.ts` | payload FR-10 sem PII |
| `tip-selection.policy.spec.ts` | seleção determinística por usuário/semana |
| `send-internal-campaign.use-case.spec.ts` | idempotência + contadores sent/skipped |

## Issues Found

Nenhum bloqueador. Migration `20260609231700_add_educational_tips_and_campaigns` criada — requer `prisma migrate deploy` no ambiente.

## Env vars novas

```env
NOTIFICATIONS_INTERNAL_SERVICE_KEY=<secret>
NOTIFICATION_TIP_WEEKLY_DAYS=7
EDUCATIONAL_TIPS_CRON=0 10 * * 1
NOTIFICATION_CAMPAIGN_BATCH_LIMIT=500
NOTIFICATION_TIP_JOB_BATCH_LIMIT=1000
```

## Recommendations

- Adicionar teste e2e de `InternalCampaignsController` com supertest (fase pós-MVP)
- Considerar Firebase Analytics server-side quando story 007 UI exigir funil unificado
