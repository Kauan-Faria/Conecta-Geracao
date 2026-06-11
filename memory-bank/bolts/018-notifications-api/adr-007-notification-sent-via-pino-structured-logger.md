---
bolt: 018-notifications-api
created: 2026-06-09T23:17:23Z
status: accepted
---

# ADR-007: Analytics notification_sent via Pino structured logger no MVP

## Context

A story **006-notification-sent-analytics** exige emitir evento `notification_sent` no backend após confirmação FCM, com `type` e timestamp, sem PII. FR-10 lista também eventos client-side e integração com funil de produto.

Opções de destino para o evento backend:
- **Structured logger** (Pino) com campo `event=notification_sent`
- **Firebase Analytics Measurement Protocol** (server-side)
- **Mixpanel / outro vendor** (não adotado no projeto)
- **Tabela de eventos** dedicada no Postgres

O projeto já usa Pino para logging estruturado (`coding-standards.md`). Firebase Analytics server-side exige credenciais adicionais, mapeamento de eventos e validação de contrato com o app Flutter (story 007). No MVP do bolt 018, o foco é **confirmar entrega FCM** e habilitar funil via logs agregáveis (Render logs, futuro Datadog).

## Decision

Implementar `NotificationAnalyticsPort` com adapter **`PinoNotificationAnalyticsAdapter`**:

1. Após `SendResult.status` ∈ `{ sent, partial }` com ≥1 `messageId` FCM, o use case chama `trackNotificationSent({ notificationType, occurredAt, campaignId?, tipId? })`
2. Payload do log: `{ event: "notification_sent", notificationType, occurredAt, campaignId?, tipId?, requestId? }`
3. **Proibido** no payload: `firebaseUid`, token FCM, título/corpo, `conversationId`, conteúdo de chat
4. Skip por preferência/cooldown/sem token **não** emite evento
5. Retrofit no `SendPushNotificationUseCase` cobre tipos `reminder` e `ai_response` (bolt 017)
6. Falha do adapter é **fire-and-forget** (`.catch(log)`) — não reverte envio FCM

Firebase Analytics server-side fica **fora do MVP**; nova implementação do port pode ser adicionada sem alterar use cases.

## Rationale

- Entrega rápida da story 006 com infra existente (Pino)
- Port hexagonal permite trocar destino (Firebase, BigQuery export) sem tocar domínio
- Logs JSON agregáveis atendem observabilidade mínima do funil backend
- Evita dependência e configuração extra no Render MVP
- Alinha com coding standards: Pino para eventos de negócio

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Firebase Analytics Measurement Protocol | Funil unificado com app | Credenciais, mapeamento, latência; story 007 ainda client-side | Complexidade prematura no MVP |
| Tabela `analytics_events` Postgres | Query SQL nativa | Migration, retenção, volume; duplica logs | Over-engineering para MVP |
| Emitir via Mixpanel server | Dashboard pronto | Vendor não adotado no projeto | Fora do tech stack |
| Sem analytics backend (só client) | Zero backend work | Story 006 Must; funil incompleto sem confirmação FCM | Rejeitado por requisito |

## Consequences

### Positive

- Story 006 implementável em horas, não dias
- Contrato estável via port; testes unitários simples (mock logger)
- Retrofit cobre todos os tipos de push existentes

### Negative

- Funil completo depende de agregação de logs (não dashboard pronto)
- Correlação backend↔client requer `requestId` ou timestamps (story 007)

### Risks

- **Logs não consultados**: mitigado documentando query exemplo para Render/log drain; revisitar Firebase server-side pós-MVP
- **Vazamento PII em log**: mitigado por VO `NotificationSentEvent` com campos explícitos e testes que assertam ausência de campos proibidos

## Related

- **Stories**: 006-notification-sent-analytics, 005-tips-and-campaigns
- **Standards**: `coding-standards.md` (logging Pino)
- **Previous ADRs**: ADR-006 (SendPushNotificationUseCase central)
