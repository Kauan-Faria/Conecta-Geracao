---
bolt: 018-notifications-api
created: 2026-06-09T23:17:23Z
status: accepted
---

# ADR-010: Processamento síncrono de campanhas in-process

## Context

`SendInternalCampaignUseCase` dispara push FCM para um segmento (`all_active` ou `uid_list`). Cada envio passa por `SendPushNotificationUseCase` (elegibilidade, FCM, delivery log, analytics).

Opções de orquestração:
- **Síncrono in-process**: loop no handler HTTP até concluir
- **Fila async** (BullMQ, SQS, pg-boss)
- **Fire-and-forget**: HTTP 202 + job background sem contadores imediatos
- **Batch FCM multicast único** (não por usuário)

Story 005 exige resposta com **id, timestamp e contagem de envios** para auditoria. MVP segmento pequeno (centenas de usuários). Render single instance no MVP.

## Decision

Processar campanhas **síncronamente in-process** no `POST /notifications/campaigns`:

1. Request persiste `Campaign` com `status=processing`
2. Loop sequencial sobre destinatários elegíveis
3. Cada iteração: `SendPushNotificationUseCase.execute(firebaseUid, notification, { campaignId })`
4. Incrementa `sentCount` / `skippedCount` conforme `SendResult`
5. Ao terminar: `status=completed`, `completedAt`, response HTTP **201** com contadores
6. Limite configurável: `NOTIFICATION_CAMPAIGN_BATCH_LIMIT` (default **500**) — acima dispara `422` ou trunca com warning (implementação: rejeitar request se segmento > limit)
7. Timeout HTTP Render (~30s) considerado — campanhas grandes devem usar segmento menor no MVP

Fila async e HTTP 202 ficam **fase futura** quando segmentos ou latência FCM exigirem.

## Rationale

- Atende auditoria imediata da story (contagem na response)
- Sem infra de fila no MVP (alinhado a `@nestjs/schedule` simples do 017)
- Reutiliza `SendPushNotificationUseCase` — analytics e elegibilidade consistentes
- Batch limit protege contra timeout e abuse
- Idempotência por `idempotencyKey` evita reprocessamento acidental

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| BullMQ + Redis | Escalável; não bloqueia HTTP | Redis no Render; complexidade ops | Over-engineering MVP |
| HTTP 202 + polling status | Não timeout | Client precisa polling; UX ops pior | Story pede contagem na conclusão |
| FCM topic messaging | Um send para todos | Requer topic subscription no app; não implementado Flutter | Fora do escopo mobile |
| Paralelo Promise.all | Mais rápido | Rate limit FCM; harder error handling | Sequencial mais previsível MVP |

## Consequences

### Positive

- Response completa para curl/scripts de ops
- Zero dependência externa além de FCM existente
- Testes de integração determinísticos

### Negative

- Request longa para segmentos grandes (>500 ou FCM lento)
- Bloqueia worker HTTP durante campanha

### Risks

- **Timeout Render**: mitigado por `NOTIFICATION_CAMPAIGN_BATCH_LIMIT=500` e doc ops para campanhas múltiplas
- **FCM rate limit em campanha grande**: mitigado por retry existente no provider (017); considerar fila se escala crescer

## Related

- **Stories**: 005-tips-and-campaigns
- **Standards**: `system-architecture.md` (modular monolith MVP)
- **Previous ADRs**: ADR-006 (SendPushNotificationUseCase), ADR-007 (analytics por envio)
