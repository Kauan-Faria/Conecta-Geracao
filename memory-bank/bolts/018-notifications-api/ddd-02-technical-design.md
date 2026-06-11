---
unit: 001-notifications-api
bolt: 018-notifications-api
stage: design
status: complete
created: 2026-06-09T23:02:42Z
---

# Technical Design - Notifications API (Bolt 018)

## Architecture Pattern

**Modular monolith NestJS + DDD hexagonal** — extensão direta dos bolts **016** (token/preferência) e **017** (FCM + triggers), alinhado a `system-architecture.md`, `coding-standards.md` e `data-stack.md`.

**Rationale**:
- Bolt **018** adiciona job semanal de dicas, endpoint interno de campanhas e analytics `notification_sent` no fluxo central de envio.
- Catálogo de dicas via **Prisma seed** (tabela `educational_tips`) — conteúdo curado, read-only em runtime.
- Campanhas persistidas em `campaigns` para auditoria mínima (id, timestamps, contadores).
- Analytics MVP via **Pino structured logger** (`NotificationAnalyticsPort`) — sem dependência Firebase Analytics server-side no MVP.
- **Sem importar** `ConversationsModule` (ADR-006); elegibilidade via `ActiveUserQuery` adapter Prisma.

---

## Layer Structure

```text
apps/backend/
├── prisma/
│   ├── schema.prisma                    # + EducationalTip, Campaign, enums
│   └── seeds/
│       └── educational-tips.seed.ts     # NOVO — catálogo curado
├── src/
│   └── modules/
│       └── notifications/
│           ├── notifications.module.ts          # + providers 018, controller campanhas
│           ├── domain/
│           │   ├── entities/
│           │   │   ├── educational-tip.entity.ts           # NOVO
│           │   │   └── campaign.entity.ts                    # NOVO
│           │   ├── value-objects/
│           │   │   ├── campaign-segment.vo.ts                # NOVO
│           │   │   ├── tip-weekly-window.vo.ts               # NOVO
│           │   │   └── notification-sent-event.vo.ts         # NOVO
│           │   └── services/
│           │       ├── curated-content.policy.ts             # NOVO
│           │       ├── tip-weekly-rate-limit.policy.ts       # NOVO
│           │       ├── tip-selection.policy.ts               # NOVO
│           │       ├── campaign-eligibility.policy.ts        # NOVO
│           │       ├── campaign-idempotency.policy.ts        # NOVO
│           │       └── internal-campaign-auth.policy.ts      # NOVO
│           ├── application/
│           │   ├── ports/
│           │   │   ├── educational-tip-catalog.repository.ts # NOVO
│           │   │   ├── campaign.repository.ts                # NOVO
│           │   │   ├── notification-analytics.port.ts        # NOVO
│           │   │   ├── active-user.query.ts                  # NOVO
│           │   │   └── notification-delivery-log.repository.ts # estendido
│           │   └── use-cases/
│           │       ├── send-push-notification.use-case.ts    # ALTERADO — + analytics
│           │       ├── process-weekly-educational-tips.use-case.ts  # NOVO
│           │       └── send-internal-campaign.use-case.ts    # NOVO
│           ├── infrastructure/
│           │   ├── persistence/
│           │   │   ├── prisma-educational-tip-catalog.repository.ts  # NOVO
│           │   │   ├── prisma-campaign.repository.ts                 # NOVO
│           │   │   └── prisma-notification-delivery-log.repository.ts  # estendido
│           │   ├── analytics/
│           │   │   └── pino-notification-analytics.adapter.ts          # NOVO
│           │   ├── users/
│           │   │   └── prisma-active-user.query.ts                     # NOVO
│           │   ├── jobs/
│           │   │   └── weekly-educational-tips.job.ts                  # NOVO
│           │   └── guards/
│           │       └── internal-service-key.guard.ts                   # NOVO
│           └── presentation/
│               ├── notifications.controller.ts           # existente 016
│               ├── internal-campaigns.controller.ts      # NOVO
│               ├── dto/
│               │   └── send-campaign.dto.ts              # NOVO
│               └── mappers/
│                   └── campaigns.mapper.ts               # NOVO
```

**Responsabilidades por camada (bolt 018)**:

| Camada | Responsabilidade |
|--------|------------------|
| **Domain** | `EducationalTip`, `Campaign`; políticas de catálogo, rate limit semanal, segmentação e idempotência |
| **Application** | Use cases de dicas semanais e campanha; extensão de `SendPushNotification` com analytics |
| **Infrastructure** | Repos Prisma; adapter Pino analytics; job cron; guard service key |
| **Presentation** | `POST /notifications/campaigns` protegido por auth interno |

---

## API Design

### Endpoints REST

| Endpoint | Method | Auth | Request | Response |
|----------|--------|------|---------|----------|
| `/notifications/campaigns` | POST | Service key interno | `SendCampaignDto` | `CampaignResponseDto` |
| `/notifications/device-token` | POST | Firebase Auth | *(016 — inalterado)* | — |
| `/notifications/preferences` | PATCH | Firebase Auth | *(016 — inalterado)* | — |

**Nenhum endpoint público** para dicas — envio exclusivamente via job cron.

### POST /notifications/campaigns

**Autenticação MVP**: header `X-Internal-Service-Key: <NOTIFICATIONS_INTERNAL_SERVICE_KEY>`

Validado por `InternalServiceKeyGuard` + `InternalCampaignAuthPolicy`.

**Request body** (`SendCampaignDto`):

```json
{
  "title": "Novidade no Conecta Geração",
  "body": "Confira dicas para usar o app com mais segurança.",
  "deepLink": "/",
  "segment": {
    "type": "all_active"
  },
  "idempotencyKey": "campaign-2026-06-09-lancamento"
}
```

**Segmento `uid_list`**:

```json
{
  "segment": {
    "type": "uid_list",
    "firebaseUids": ["uid-a", "uid-b"]
  }
}
```

**Response 201** (`CampaignResponseDto`):

```json
{
  "id": "clcamp123",
  "status": "completed",
  "requestedAt": "2026-06-09T23:00:00.000Z",
  "completedAt": "2026-06-09T23:00:05.000Z",
  "sentCount": 42,
  "skippedCount": 3
}
```

**Response 200** (idempotência — campanha já existente no mesmo dia):

```json
{
  "id": "clcamp123",
  "status": "completed",
  "sentCount": 42,
  "skippedCount": 3,
  "idempotentReplay": true
}
```

**Erros**:

| Status | Code | Condição |
|--------|------|----------|
| 401 | `UNAUTHORIZED` | Service key ausente ou inválida |
| 400 | `VALIDATION_ERROR` | DTO inválido; segmento `uid_list` vazio |
| 400 | `UNSAFE_PUSH_PAYLOAD` | `PushNotificationPayloadPolicy` rejeitou título/corpo |
| 422 | `EMPTY_SEGMENT` | Segmento resolve 0 destinatários — **retorna 201 com sentCount=0** (não erro) |

### FCM data payload (tip e campaign)

Estende contrato do bolt 017:

```json
{
  "type": "tip",
  "route": "/chat?topic=golpes"
}
```

```json
{
  "type": "campaign",
  "route": "/"
}
```

| Campo | Tipos | Notas |
|-------|-------|-------|
| `type` | `tip` \| `campaign` | Alinhado a `NotificationType` |
| `route` | string | Deep link do catálogo (tip) ou request (campaign) |
| `conversationId` | string | **Ausente** para tip/campaign |

**Notification payload** (campo `notification`):

```json
{
  "title": "Cuidado com golpes",
  "body": "Desconfie de links suspeitos no WhatsApp. Toque para saber mais."
}
```

---

## Data Persistence

### Prisma Schema (adição)

```prisma
model EducationalTip {
  id        String   @id @default(cuid())
  title     String   @db.VarChar(120)
  body      String   @db.Text
  deepLink  String   @map("deep_link") @db.VarChar(256)
  topicTag  String?  @map("topic_tag") @db.VarChar(64)
  isActive  Boolean  @default(true) @map("is_active")
  sortOrder Int      @default(0) @map("sort_order")
  createdAt DateTime @default(now()) @map("created_at")

  @@index([isActive, sortOrder])
  @@map("educational_tips")
}

enum CampaignSegmentType {
  all_active
  uid_list

  @@map("campaign_segment_type")
}

enum CampaignStatus {
  pending
  processing
  completed
  failed

  @@map("campaign_status")
}

model Campaign {
  id              String              @id @default(cuid())
  title           String              @db.VarChar(120)
  body            String              @db.Text
  deepLink        String              @map("deep_link") @db.VarChar(256)
  segmentType     CampaignSegmentType   @map("segment_type")
  segmentPayload  Json?               @map("segment_payload")
  status          CampaignStatus      @default(pending)
  requestedBy     String              @map("requested_by") @db.VarChar(128)
  requestedAt     DateTime            @default(now()) @map("requested_at")
  completedAt     DateTime?           @map("completed_at")
  sentCount       Int                 @default(0) @map("sent_count")
  skippedCount    Int                 @default(0) @map("skipped_count")
  idempotencyKey  String?             @map("idempotency_key") @db.VarChar(128)

  @@index([status, requestedAt(sort: Desc)])
  @@index([idempotencyKey, requestedAt])
  @@map("campaigns")
}
```

**NotificationDeliveryLog** — schema existente (bolt 017); tipos `tip` e `campaign` já no enum.

### Seed — catálogo de dicas

Arquivo: `apps/backend/prisma/seeds/educational-tips.seed.ts`

```typescript
const TIPS = [
  {
    title: 'Cuidado com golpes',
    body: 'Desconfie de links suspeitos no WhatsApp. Toque para saber mais.',
    deepLink: '/chat?topic=golpes',
    topicTag: 'golpes',
    sortOrder: 1,
  },
  {
    title: 'Proteja sua privacidade',
    body: 'Revise permissões do celular regularmente. Toque para dicas.',
    deepLink: '/',
    topicTag: 'privacidade',
    sortOrder: 2,
  },
  {
    title: 'Senhas mais seguras',
    body: 'Use senhas diferentes para cada app. Toque para aprender.',
    deepLink: '/chat?topic=senhas',
    topicTag: 'senhas',
    sortOrder: 3,
  },
];
```

Executado via `prisma db seed` — **única** forma de alterar conteúdo de dicas no MVP.

### Queries críticas

**Rate limit semanal (TipWeeklyRateLimitPolicy)**:

```sql
SELECT 1 FROM notification_delivery_logs
WHERE firebase_uid = :uid
  AND notification_type = 'tip'
  AND status = 'sent'
  AND sent_at > NOW() - INTERVAL ':days days'
LIMIT 1;
```

**Usuários elegíveis (ActiveUserQuery)**:

```sql
SELECT DISTINCT dt.firebase_uid
FROM device_tokens dt
JOIN notification_preferences np ON np.firebase_uid = dt.firebase_uid
WHERE dt.is_active = true
  AND np.enabled = true;
```

**Idempotência campanha**:

```sql
SELECT * FROM campaigns
WHERE idempotency_key = :key
  AND requested_at::date = CURRENT_DATE
LIMIT 1;
```

### Migration

1. `pnpm --filter backend prisma migrate dev --name add_educational_tips_and_campaigns`
2. `pnpm --filter backend prisma db seed`

---

## Analytics Design — notification_sent

### Port: `NotificationAnalyticsPort`

```typescript
interface NotificationSentEvent {
  notificationType: 'reminder' | 'ai_response' | 'tip' | 'campaign';
  occurredAt: Date;
  campaignId?: string;
  tipId?: string;
}

interface NotificationAnalyticsPort {
  trackNotificationSent(event: NotificationSentEvent): Promise<void>;
}
```

### Implementação MVP: `PinoNotificationAnalyticsAdapter`

Emite log estruturado Pino (nível `info`):

```json
{
  "event": "notification_sent",
  "notificationType": "tip",
  "occurredAt": "2026-06-09T23:00:00.000Z",
  "tipId": "cltip123",
  "requestId": "uuid-from-context"
}
```

**Campos proibidos** (nunca logar): `firebaseUid`, token FCM, título/corpo da mensagem, `conversationId`, conteúdo de chat.

**Decisão MVP**: structured logger apenas. Firebase Analytics Measurement Protocol fica **fora de escopo** — extensível via nova implementação do port sem alterar use case.

### Integração em SendPushNotificationUseCase

```text
Fluxo existente (017) + passo 7:
7. Se SendResult.status ∈ { sent, partial } com ≥1 messageId:
     NotificationAnalyticsPort.trackNotificationSent({
       notificationType: notification.type,
       occurredAt: new Date(),
       campaignId: metadata?.campaignId,
       tipId: metadata?.tipId,
     })
8. Skip (preference_disabled, cooldown, no_tokens) → NÃO chama analytics
```

**Retrofit**: envios `reminder` e `ai_response` do bolt 017 passam a emitir `notification_sent` automaticamente após alteração do use case.

**Metadata opcional** no use case input:

```typescript
interface SendPushOptions {
  campaignId?: string;
  tipId?: string;
}
```

---

## Job Design — Weekly Educational Tips

### Classe: `WeeklyEducationalTipsJob`

```typescript
@Cron(process.env.EDUCATIONAL_TIPS_CRON ?? '0 10 * * 1') // seg 10:00 UTC
async handleCron(): Promise<void>
```

**Delegação**: `ProcessWeeklyEducationalTipsUseCase.execute()`

**Fluxo**:

```text
1. catalog = EducationalTipCatalogRepository.findAllActive()
   → se vazio: log warn; return { sent: 0 }
2. users = ActiveUserQuery.findAllWithActiveTokensAndPreference()
3. Para cada firebaseUid:
   a. TipWeeklyRateLimitPolicy.canSendTip(uid) → skip
   b. tip = TipSelectionPolicy.selectTipForUser(uid, catalog)
   c. CuratedContentPolicy.assertFromCatalog(tip.id)
   d. PushNotification.tip({ title, body, deepLink, tipId })
   e. SendPushNotificationUseCase.execute(uid, notification, { tipId: tip.id })
4. Log summary: { processed, sent, skipped }
5. Job tolerante a falhas individuais — não aborta batch
```

### TipSelectionPolicy (determinístico)

```typescript
// weekNumber = ISO week; index = hash(firebaseUid + weekNumber) % activeTips.length
selectTipForUser(firebaseUid, catalog): EducationalTip
```

Garante mesma dica para o usuário na mesma semana; rotação entre semanas.

---

## Campaign Use Case Design

### SendInternalCampaignUseCase

```text
1. InternalCampaignAuthPolicy.assertAuthorized(credentials)
2. PushNotificationPayloadPolicy.assertSafePayload({ title, body, deepLink })
3. Se idempotencyKey:
     CampaignIdempotencyPolicy.findExisting → retorna campanha se exists hoje
4. Campaign.create pending → CampaignRepository.save
5. recipients = CampaignEligibilityPolicy.resolveRecipients(segment)
6. status → processing
7. Para cada firebaseUid:
     result = SendPushNotificationUseCase.execute(uid, campaignNotification, { campaignId })
     sent++ se result.status === 'sent' | 'partial'
     skipped++ caso contrário
8. Campaign.complete(sentCount, skippedCount) → save
9. Log CampaignCompleted
10. Return Campaign
```

**Processamento síncrono MVP**: loop in-process. Batch limit configurável (`NOTIFICATION_CAMPAIGN_BATCH_LIMIT=500`). Fila async futura.

**requestedBy**: valor fixo `internal-service` ou header `X-Requested-By` opcional.

---

## Security Design

| Concern | Approach |
|---------|----------|
| **Campaign auth** | `InternalServiceKeyGuard` — compara header com env `NOTIFICATIONS_INTERNAL_SERVICE_KEY`; **não** expor em docs públicos |
| **Firebase Auth** | Endpoints 016 inalterados; campanhas **não** usam Firebase user token |
| **Data minimization** | Analytics sem PII; FCM payload sem conteúdo sensível |
| **Curated content only** | Dicas só do seed; endpoint campanha valida payload mas não aceita `source: llm` |
| **Rate limiting** | ThrottlerGuard global no endpoint campanhas (ex.: 10 req/min por IP) |
| **Logging** | Campanha loga `campaignId`, contadores; **nunca** lista completa de UIDs em produção |

**Env vars**:

```env
NOTIFICATIONS_INTERNAL_SERVICE_KEY=<secret>
NOTIFICATION_TIP_WEEKLY_DAYS=7
EDUCATIONAL_TIPS_CRON=0 10 * * 1
NOTIFICATION_CAMPAIGN_BATCH_LIMIT=500
```

---

## NFR Implementation

| Requirement | Design Approach |
|-------------|-----------------|
| **Performance (campanha)** | Processamento síncrono com batch limit; timeout global 60s por request |
| **Performance (job dicas)** | Batch usuários; limite 1000/execução (`NOTIFICATION_TIP_JOB_BATCH_LIMIT`) |
| **Reliability** | Idempotência campanha; job tolerante a falhas; analytics fire-and-forget (`.catch(log)`) |
| **Privacy (LGPD)** | `notification_sent` sem PII; catálogo genérico |
| **Observability** | Pino: `notification_sent`, job summary, `CampaignCompleted` |
| **Auditability** | Tabela `campaigns` com contadores e timestamps |

---

## Error Handling

| Error Type | Comportamento | HTTP |
|------------|---------------|------|
| Service key inválida | `UnauthorizedException` | 401 |
| Payload inseguro | `UnsafePushNotificationPayloadError` | 400 |
| Segmento uid_list vazio | `ValidationError` | 400 |
| Catálogo vazio (job) | Log warn; `{ sent: 0 }` | N/A |
| FCM falha individual | Incrementa `skippedCount` | N/A |
| Analytics falha | Log error; envio push **não** revertido | N/A |

**Domain errors (novos)**:
- `DynamicContentNotAllowedError`
- `CampaignAlreadyProcessedError` (idempotência — retorna existente, não erro)

---

## External Dependencies

| Service | Purpose | Integration |
|---------|---------|-------------|
| **Supabase Postgres** | Tips, campaigns, delivery logs | Prisma |
| **Firebase Admin Messaging** | Envio FCM (herdado 017) | `firebase-admin` |
| **@nestjs/schedule** | Cron job dicas | NestJS |
| **Pino** | Analytics MVP | Logger existente |

---

## Module Wiring (adições 018)

```typescript
@Module({
  imports: [PrismaModule, ScheduleModule],
  controllers: [
    NotificationsController,      // 016
    InternalCampaignsController,  // 018
  ],
  providers: [
    // Use cases 018
    ProcessWeeklyEducationalTipsUseCase,
    SendInternalCampaignUseCase,

    // Policies 018
    CuratedContentPolicy,
    TipWeeklyRateLimitPolicy,
    TipSelectionPolicy,
    CampaignEligibilityPolicy,
    CampaignIdempotencyPolicy,
    InternalCampaignAuthPolicy,

    // Repos / ports 018
    { provide: EDUCATIONAL_TIP_CATALOG_REPOSITORY, useClass: PrismaEducationalTipCatalogRepository },
    { provide: CAMPAIGN_REPOSITORY, useClass: PrismaCampaignRepository },
    { provide: NOTIFICATION_ANALYTICS_PORT, useClass: PinoNotificationAnalyticsAdapter },
    { provide: ACTIVE_USER_QUERY, useClass: PrismaActiveUserQuery },

    // Job 018
    WeeklyEducationalTipsJob,

    // Guard 018
    InternalServiceKeyGuard,

    // ... providers existentes 016 + 017
    // SendPushNotificationUseCase — ALTERAR para injetar NOTIFICATION_ANALYTICS_PORT
  ],
  exports: [
    SEND_PUSH_NOTIFICATION_USE_CASE,
    // ... exports existentes
  ],
})
export class NotificationsModule {}
```

**InternalCampaignsController**:

```typescript
@Controller('notifications/campaigns')
@UseGuards(InternalServiceKeyGuard, ThrottlerGuard)
export class InternalCampaignsController {
  @Post()
  async sendCampaign(@Body() dto: SendCampaignDto): Promise<CampaignResponseDto>
}
```

---

## Test Strategy (design → Stage 5)

| Tipo | Alvo |
|------|------|
| **Unit** | `TipWeeklyRateLimitPolicy`, `TipSelectionPolicy`, `CuratedContentPolicy`, `CampaignIdempotencyPolicy` |
| **Unit** | `SendPushNotificationUseCase` — verifica analytics chamado em `sent`, não em `skipped` |
| **Unit** | `ProcessWeeklyEducationalTipsUseCase` — mock catalog + active users + send |
| **Unit** | `SendInternalCampaignUseCase` — idempotência, segmento vazio, contadores |
| **Unit** | `PinoNotificationAnalyticsAdapter` — payload sem campos proibidos |
| **Integration** | `POST /notifications/campaigns` — 401 sem key, 201 com envio mock FCM |
| **Integration** | `PrismaCampaignRepository` — idempotency query |
| **Integration** | Job smoke — trigger manual handler |

**Coverage target**: >80% nas adições do bolt 018.

---

## Stories Mapping

| Story | Entregável técnico |
|-------|-------------------|
| **005-tips-and-campaigns** | `EducationalTip` model + seed; `WeeklyEducationalTipsJob`; `ProcessWeeklyEducationalTipsUseCase`; policies tip; `POST /notifications/campaigns`; `Campaign` model + repo; `InternalServiceKeyGuard` |
| **006-notification-sent-analytics** | `NotificationAnalyticsPort` + `PinoNotificationAnalyticsAdapter`; extensão `SendPushNotificationUseCase`; retrofit reminder/ai_response |

---

## Implement Checklist (Stage 4)

- [ ] Adicionar Prisma models `EducationalTip`, `Campaign` + migration
- [ ] Criar seed `educational-tips.seed.ts`
- [ ] Criar entities/VOs/policies de domínio (018)
- [ ] Estender `PrismaNotificationDeliveryLogRepository` (`findLastSentTip`, `existsSentWithin`)
- [ ] Implementar repos: tips catalog, campaign, active user query
- [ ] Implementar `PinoNotificationAnalyticsAdapter`
- [ ] Alterar `SendPushNotificationUseCase` — analytics após FCM success
- [ ] Implementar `ProcessWeeklyEducationalTipsUseCase` + `WeeklyEducationalTipsJob`
- [ ] Implementar `SendInternalCampaignUseCase`
- [ ] Criar `InternalCampaignsController` + DTOs + guard
- [ ] Configurar env vars (service key, cron, batch limits)
- [ ] Registrar providers no `NotificationsModule`

---

## Herança dos bolts anteriores

Este documento **estende** `memory-bank/bolts/017-notifications-api/ddd-02-technical-design.md`. FCM provider, delivery log, jobs de lembrete, trigger IA e endpoints 016 permanecem válidos. Bolt 018 adiciona catálogo/seed, job semanal, API campanhas interna e analytics integrado ao use case central de envio.
