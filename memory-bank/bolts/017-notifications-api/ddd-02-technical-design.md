---
unit: 001-notifications-api
bolt: 017-notifications-api
stage: design
status: complete
created: 2026-06-09T21:45:21Z
---

# Technical Design - Notifications API (Bolt 017)

## Architecture Pattern

**Modular monolith NestJS + DDD hexagonal** — extensão direta do bolt **016**, alinhado a `system-architecture.md` e `coding-standards.md`.

**Rationale**:
- Bolt **017** implementa o port `PushNotificationProvider` (FCM Admin SDK) e adiciona use cases de envio + triggers automáticos.
- Nova persistência `NotificationDeliveryLog` para cooldown de lembretes.
- Integração com conversas via **ports hexagonais** — sem importar `ConversationsModule` no domínio de notifications (ADR-005).
- Jobs agendados com `@nestjs/schedule` (já adotado no monorepo ou adicionado neste bolt).
- **Sem novos endpoints REST públicos** neste bolt — envio é interno (use cases + cron + hook).

---

## Layer Structure

```text
apps/backend/
├── prisma/
│   └── schema.prisma              # + NotificationDeliveryLog, enums
├── src/
│   ├── app.module.ts              # ScheduleModule.forRoot() se ausente
│   └── modules/
│       ├── notifications/
│       │   ├── notifications.module.ts          # + providers FCM, jobs, exports
│       │   ├── domain/
│       │   │   ├── entities/
│       │   │   │   └── notification-delivery-log.entity.ts   # NOVO
│       │   │   ├── value-objects/
│       │   │   │   ├── send-result.vo.ts                     # NOVO
│       │   │   │   ├── fcm-data-payload.vo.ts                # NOVO
│       │   │   │   ├── inactivity-threshold.vo.ts            # NOVO
│       │   │   │   └── reminder-cooldown.vo.ts               # NOVO
│       │   │   └── services/
│       │   │       ├── notification-eligibility.policy.ts    # NOVO
│       │   │       ├── reminder-cooldown.policy.ts           # NOVO
│       │   │       ├── abandoned-conversation.policy.ts      # NOVO
│       │   │       └── ai-response-notification.policy.ts    # NOVO
│       │   ├── application/
│       │   │   ├── ports/
│       │   │   │   ├── notification-delivery-log.repository.ts  # NOVO
│       │   │   │   ├── abandoned-conversation.query.ts          # NOVO
│       │   │   │   ├── assistant-reply-notification.trigger.ts  # NOVO
│       │   │   │   └── push-notification.provider.ts            # (existente — agora implementado)
│       │   │   └── use-cases/
│       │   │       ├── send-push-notification.use-case.ts           # NOVO
│       │   │       ├── process-abandoned-conversations.use-case.ts  # NOVO
│       │   │       └── notify-ai-response-ready.use-case.ts         # NOVO
│       │   ├── infrastructure/
│       │   │   ├── persistence/
│       │   │   │   └── prisma-notification-delivery-log.repository.ts  # NOVO
│       │   │   ├── fcm/
│       │   │   │   └── fcm-push-notification.provider.ts               # NOVO
│       │   │   ├── conversations/
│       │   │   │   └── prisma-abandoned-conversation.query.ts          # NOVO (adapter)
│       │   │   ├── triggers/
│       │   │   │   └── assistant-reply-notification.trigger.impl.ts    # NOVO
│       │   │   └── jobs/
│       │   │       └── abandoned-conversations.job.ts                  # NOVO
│       │   └── presentation/
│       │       └── (sem alteração — endpoints REST do 016)
│       └── conversations/
│           ├── conversations.module.ts          # import NotificationsModule exports
│           └── application/use-cases/
│               └── send-message.use-case.ts     # + injeta ASSISTANT_REPLY_NOTIFICATION_TRIGGER
```

**Responsabilidades por camada (bolt 017)**:

| Camada | Responsabilidade |
|--------|------------------|
| **Domain** | `NotificationDeliveryLog`; VOs de envio/cooldown; políticas de elegibilidade, cooldown e triggers |
| **Application** | Use cases de envio, job e trigger IA; ports de integração |
| **Infrastructure** | `FcmPushNotificationProvider`; repositório Prisma de delivery log; adapter de conversas abandonadas; cron job |
| **Presentation (conversations)** | Propagar `appInBackground` da request para o trigger (header ou body) |
| **Shared/Firebase** | Reutilizar instância `firebase-admin` já configurada para auth |

---

## API Design

### Endpoints REST

**Nenhum endpoint REST novo** neste bolt. Envio push é **interno** — invocado por use cases, cron job e hook no `SendMessageUseCase`.

Endpoints existentes do bolt **016** permanecem inalterados (`/notifications/device-token`, `/notifications/preferences`).

### Contrato interno — FCM data payload

Payload enviado ao dispositivo (campo `data` do FCM — todas as chaves são strings):

```json
{
  "type": "reminder",
  "route": "/conversations/clxyz123",
  "conversationId": "clxyz123"
}
```

| Campo | Tipo FCM | Valores | Notas |
|-------|----------|---------|-------|
| `type` | string | `reminder` \| `ai_response` | Alinhado a `NotificationType` |
| `route` | string | `/conversations/{id}` | Deep link consumido pelo Flutter |
| `conversationId` | string | cuid | Opcional para tipos futuros (tip/campaign no 018) |

**Notification payload** (campo `notification` do FCM):

```json
{
  "title": "Conecta Geração",
  "body": "Você tem uma conversa aguardando. Toque para continuar."
}
```

> Corpo genérico — sem conteúdo de conversa ou dados pessoais.

### Contrato integração Conversations → Notifications

**Port**: `AssistantReplyNotificationTrigger`

```typescript
interface AssistantReplyReadyEvent {
  conversationId: string;
  firebaseUid: string;
  appInBackground: boolean;
}

interface AssistantReplyNotificationTrigger {
  onAssistantReplyReady(event: AssistantReplyReadyEvent): Promise<void>;
}
```

**Propagação `appInBackground`** (presentation layer de conversations):

| Fonte | Campo | Default |
|-------|-------|---------|
| Header HTTP | `X-App-State: background` \| `foreground` | `foreground` se ausente |
| Body opcional | `{ "appState": "background" }` | header tem precedência |

Mapeamento no controller de `POST /conversations/:id/messages` — **fora** do módulo notifications.

### Contrato integração Notifications → Conversations (query)

**Port**: `AbandonedConversationQuery`

```typescript
interface AbandonedConversationSnapshot {
  conversationId: string;
  firebaseUid: string;
  lastActivityAt: Date;
  status: 'active' | 'closed';
}

interface AbandonedConversationQuery {
  findAbandoned(thresholdHours: number): Promise<AbandonedConversationSnapshot[]>;
}
```

**Implementação adapter** (`PrismaAbandonedConversationQuery`):
- Query Prisma direta na tabela `conversations` + subquery/join em `messages` para `MAX(created_at)` por conversa
- Filtro: `status = 'active'` AND `lastActivityAt < NOW() - interval`
- **Localização**: `notifications/infrastructure/conversations/` — adapter de infra, não importa use cases de chat
- Alternativa aceitável: exportar token `CONVERSATION_REPOSITORY` read-only do conversations module — **rejeitada** para manter ADR-005 (notifications não depende de DI interno de chat)

---

## Data Persistence

### Prisma Schema (adição)

```prisma
enum NotificationDeliveryStatus {
  sent
  skipped

  @@map("notification_delivery_status")
}

enum NotificationDeliveryType {
  reminder
  ai_response
  tip
  campaign

  @@map("notification_delivery_type")
}

model NotificationDeliveryLog {
  id               String                   @id @default(cuid())
  firebaseUid      String                   @map("firebase_uid") @db.VarChar(128)
  conversationId   String?                  @map("conversation_id") @db.VarChar(128)
  notificationType NotificationDeliveryType @map("notification_type")
  status           NotificationDeliveryStatus
  fcmMessageId     String?                  @map("fcm_message_id") @db.VarChar(256)
  skippedReason    String?                  @map("skipped_reason") @db.VarChar(64)
  sentAt           DateTime                 @default(now()) @map("sent_at")

  @@index([conversationId, notificationType, sentAt(sort: Desc)])
  @@index([firebaseUid, sentAt(sort: Desc)])
  @@map("notification_delivery_logs")
}
```

### Relacionamentos

| Tabela | PK | FK | Cardinalidade |
|--------|----|----|---------------|
| `notification_delivery_logs` | `id` | — | N por usuário/conversa |
| `conversations` | `id` | — | Referência lógica via `conversation_id` (sem FK Prisma cross-module) |

### Índices e queries críticas

**Cooldown check** (ReminderCooldownPolicy):
```sql
SELECT 1 FROM notification_delivery_logs
WHERE conversation_id = :id
  AND notification_type = 'reminder'
  AND status = 'sent'
  AND sent_at > NOW() - INTERVAL ':hours hours'
LIMIT 1;
```

**Abandoned conversations** (adapter):
```sql
SELECT c.id, c.firebase_uid, c.status, MAX(m.created_at) AS last_activity_at
FROM conversations c
JOIN messages m ON m.conversation_id = c.id
WHERE c.status = 'active'
GROUP BY c.id
HAVING MAX(m.created_at) < NOW() - INTERVAL ':hours hours';
```

### Migration

1. `pnpm --filter backend prisma migrate dev --name add_notification_delivery_logs`
2. Deploy: `prisma migrate deploy`

---

## FCM Provider Design

### Classe: `FcmPushNotificationProvider`

Implementa `PushNotificationProvider` usando `firebase-admin/messaging`.

**Fluxo `send(firebaseUid, notification)`**:

```text
1. DeviceTokenRepository.findActiveByFirebaseUid(firebaseUid)
2. Se vazio → return SendResult.skipped('no_active_tokens')
3. Montar FcmDataPayload a partir de PushNotification VO
4. Para cada token ativo:
   a. messaging.send({ token, notification: { title, body }, data: payload })
   b. Sucesso → coletar messageId
   c. Erro permanente (invalid-registration-token, registration-token-not-registered)
      → DeviceTokenRepository.deactivateById(tokenId)
   d. Erro rate-limit / unavailable → retry com backoff (max 3, delays 1s/2s/4s)
5. Agregar SendResult: sent | partial | failed
```

**Erros permanentes FCM** (desativar token):

| Código FCM | Ação |
|------------|------|
| `messaging/registration-token-not-registered` | `deactivateById` |
| `messaging/invalid-registration-token` | `deactivateById` |
| Outros | log error; não desativar |

**Multicast**: MVP envia sequencialmente por token (simplicidade); otimização batch (`sendEachForMulticast`) opcional se >1 token frequente.

### Feature flag

```env
FCM_ENABLED=true                    # false → NoOp provider que retorna skipped
NOTIFICATION_INACTIVITY_HOURS=24
NOTIFICATION_REMINDER_COOLDOWN_HOURS=24
ABANDONED_CONVERSATIONS_CRON=0 */6 * * *   # a cada 6h (configurável)
```

Quando `FCM_ENABLED=false` (dev local sem credenciais):
- Registrar `NoOpPushNotificationProvider` que loga e retorna `skipped`
- Permite testar job/triggers sem FCM real

---

## Job Design — Abandoned Conversations

### Classe: `AbandonedConversationsJob`

```typescript
@Cron(process.env.ABANDONED_CONVERSATIONS_CRON ?? '0 */6 * * *')
async handleCron(): Promise<void>
```

**Delegação**: `ProcessAbandonedConversationsUseCase.execute()`

**Fluxo**:

```text
1. threshold = InactivityThreshold.fromEnv()
2. snapshots = AbandonedConversationQuery.findAbandoned(threshold.hours)
3. Para cada snapshot:
   a. ReminderCooldownPolicy.canSendReminder(conversationId) → skip se false
   b. AbandonedConversationPolicy.isEligible(snapshot)
   c. NotificationEligibilityPolicy.canSend(firebaseUid)
   d. Montar PushNotification.reminder(conversationId)
   e. SendPushNotificationUseCase.execute(...)
4. Log summary: { processed, sent, skipped }
5. Job nunca lança exceção não tratada — falha individual não aborta batch
```

**Idempotência**: cooldown + delivery log garantem no máximo 1 lembrete `sent` por conversa a cada 24h.

---

## Hook Design — AI Response Notification

### Implementação: `AssistantReplyNotificationTriggerImpl`

Registrada em `NotificationsModule`:

```typescript
{ provide: ASSISTANT_REPLY_NOTIFICATION_TRIGGER, useClass: AssistantReplyNotificationTriggerImpl }
```

Exportada para `ConversationsModule`:

```typescript
// notifications.module.ts
exports: [ASSISTANT_REPLY_NOTIFICATION_TRIGGER]
```

**Wiring em ConversationsModule**:

```typescript
imports: [NotificationsModule]  // apenas para token exportado — NÃO importa use cases internos
```

**Alteração em `SendMessageUseCase`** (mínima):

```text
Após persistir mensagem assistant e antes de retornar response:
  await this.assistantReplyTrigger.onAssistantReplyReady({
    conversationId,
    firebaseUid,
    appInBackground,
  });
```

Fire-and-forget com `.catch(log)` — falha de push **não** falha resposta de chat (ADR-005: chat independente).

---

## Security Design

| Concern | Approach |
|---------|----------|
| **Authentication** | Sem endpoints novos; job roda server-side; hook interno |
| **Authorization** | `SendPushNotification` opera apenas no `firebaseUid` dono da conversa (validado no snapshot/query) |
| **Data minimization** | FCM data payload sem conteúdo de mensagem; `PushNotificationPayloadPolicy` antes de envio |
| **FCM credentials** | Service account via env `GOOGLE_APPLICATION_CREDENTIALS` ou JSON inline `FIREBASE_SERVICE_ACCOUNT_JSON` (padrão existente firebase-admin) |
| **Logging** | Logar `firebaseUid`, `conversationId`, `notificationType`, `messageId`; **nunca** token FCM completo |
| **Guest users** | Conversas guest não disparam push (firebaseUid ausente ou fora de escopo auth) |

---

## NFR Implementation

| Requirement | Design Approach |
|-------------|-----------------|
| **Performance (p95 envio FCM < 5s)** | Envio sequencial por token; timeout 4s por chamada FCM; retry limitado |
| **Performance (job)** | Batch processamento; limite 500 conversas por execução (configurável `NOTIFICATION_JOB_BATCH_LIMIT`) |
| **Scalability** | Job stateless; delivery log indexado; sem fila externa no MVP |
| **Reliability** | Retry backoff FCM; token inválido desativado; job tolerante a falhas parciais |
| **Reliability (chat)** | Trigger push fire-and-forget — não bloqueia SendMessage |
| **Privacy (LGPD)** | Payload genérico; sem conteúdo IA no push |
| **Observability** | Log estruturado Pino: `PushNotificationSent`, `PushNotificationSkipped`, job summary |

---

## Error Handling

| Error Type | Comportamento | HTTP (se exposto) |
|------------|---------------|-------------------|
| Payload inseguro | `PushNotificationPayloadPolicy` lança domain error | N/A (interno) |
| Preferência off | `SendResult.skipped('preference_disabled')` | N/A |
| Sem tokens | `SendResult.skipped('no_active_tokens')` | N/A |
| Cooldown ativo | `SendResult.skipped('cooldown_active')` | N/A |
| FCM erro permanente | Token desativado; `SendResult.partial` ou `failed` | N/A |
| FCM rate limit | Retry 3x; log warning | N/A |
| Job falha Prisma | Log error; próxima execução cron retenta | N/A |
| Trigger falha | Log error; chat response OK | N/A |

**Domain errors (novos)**:
- `UnsafePushNotificationPayloadError`
- `InvalidInactivityThresholdError`

---

## External Dependencies

| Service | Purpose | Integration |
|---------|---------|-------------|
| **Firebase Admin Messaging** | Envio FCM HTTP v1 | `firebase-admin` (já no projeto) |
| **Supabase Postgres** | Delivery log + query conversas | Prisma |
| **@nestjs/schedule** | Cron job lembretes | NestJS module |

### Pacotes npm

| Pacote | Uso | Novo? |
|--------|-----|-------|
| `firebase-admin` | messaging.send | Existente |
| `@nestjs/schedule` | Cron | Adicionar se ausente |

---

## Module Wiring

```typescript
@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(), // AppModule se global
  ],
  providers: [
    // Use cases (017)
    SendPushNotificationUseCase,
    ProcessAbandonedConversationsUseCase,
    NotifyAiResponseReadyUseCase,

    // Policies (017)
    NotificationEligibilityPolicy,
    ReminderCooldownPolicy,
    AbandonedConversationPolicy,
    AiResponseNotificationPolicy,

    // Repositories
    { provide: NOTIFICATION_DELIVERY_LOG_REPOSITORY, useClass: PrismaNotificationDeliveryLogRepository },

    // FCM provider (conditional)
    {
      provide: PUSH_NOTIFICATION_PROVIDER,
      useFactory: (config, ...) =>
        config.get('FCM_ENABLED') === 'true'
          ? new FcmPushNotificationProvider(...)
          : new NoOpPushNotificationProvider(),
      inject: [ConfigService, DEVICE_TOKEN_REPOSITORY, ...],
    },

    // Integration ports
    { provide: ABANDONED_CONVERSATION_QUERY, useClass: PrismaAbandonedConversationQuery },
    { provide: ASSISTANT_REPLY_NOTIFICATION_TRIGGER, useClass: AssistantReplyNotificationTriggerImpl },

    // Job
    AbandonedConversationsJob,

    // ... providers existentes do 016
  ],
  exports: [
    ASSISTANT_REPLY_NOTIFICATION_TRIGGER,
    SEND_PUSH_NOTIFICATION_USE_CASE, // opcional — para bolt 018 campanhas
    DEVICE_TOKEN_REPOSITORY,
    NOTIFICATION_PREFERENCE_REPOSITORY,
  ],
})
export class NotificationsModule {}
```

**ConversationsModule** (alteração mínima):

```typescript
@Module({
  imports: [NotificationsModule], // importa apenas exports
  // SendMessageUseCase recebe ASSISTANT_REPLY_NOTIFICATION_TRIGGER via DI
})
export class ConversationsModule {}
```

> **Nota ADR-005**: `ConversationsModule` importa `NotificationsModule` apenas pelo token exportado — **não** o inverso. Notifications consulta conversas via Prisma adapter, não via DI de chat.

---

## Application Use Cases (detalhado)

| Use Case | Input | Output | Notas |
|----------|-------|--------|-------|
| `SendPushNotificationUseCase` | `firebaseUid`, `PushNotification` | `SendResult` | Orquestra policies → provider → delivery log |
| `ProcessAbandonedConversationsUseCase` | — | `{ processed, sent, skipped }` | Invocado pelo cron job |
| `NotifyAiResponseReadyUseCase` | `AssistantReplyReadyEvent` | `SendResult \| void` | Invocado pelo trigger port |

### Fluxo SendPushNotification

```text
1. PushNotificationPayloadPolicy.assertSafePayload(notification)
2. NotificationEligibilityPolicy.canSend(firebaseUid) → skip se false
3. Se notification.type === 'reminder' && conversationId:
     ReminderCooldownPolicy.canSendReminder(conversationId) → skip se false
4. PushNotificationProvider.send(firebaseUid, notification)
5. NotificationDeliveryLogRepository.save({ ... status, fcmMessageId, skippedReason })
6. Log domain event (PushNotificationSent | Skipped)
7. Return SendResult
```

### Templates push (constantes application layer)

| Type | title | body |
|------|-------|------|
| `reminder` | Conecta Geração | Você tem uma conversa aguardando. Toque para continuar. |
| `ai_response` | Conecta Geração | Sua orientação está pronta. |

---

## Test Strategy (design → Stage 5)

| Tipo | Alvo |
|------|------|
| **Unit** | Policies (eligibility, cooldown, abandoned, ai-response); VOs (`SendResult`, `FcmDataPayload`); `SendPushNotificationUseCase` com mocks |
| **Unit** | `FcmPushNotificationProvider` — mock `firebase-admin/messaging`; cenários token inválido, rate limit, multicast |
| **Unit** | `ProcessAbandonedConversationsUseCase` — mock query + send use case |
| **Integration** | `PrismaNotificationDeliveryLogRepository` — cooldown query |
| **Integration** | `PrismaAbandonedConversationQuery` — query com fixtures de conversa/mensagem |
| **Integration** | Cron job smoke (manual trigger do handler) |
| **Integration** | `SendMessageUseCase` + trigger mock — verifica chamada com `appInBackground` |

**Coverage target**: domínio + use cases + provider FCM + policies (>80% no módulo notifications).

---

## Stories Mapping

| Story | Entregável técnico |
|-------|-------------------|
| **003-fcm-push-provider** | `FcmPushNotificationProvider`; `SendPushNotificationUseCase`; `SendResult` VO; desativação token; `NoOp` fallback; env vars FCM |
| **004-conversation-notification-triggers** | `AbandonedConversationsJob`; `ProcessAbandonedConversationsUseCase`; `PrismaAbandonedConversationQuery`; `NotificationDeliveryLog` + repo; `AssistantReplyNotificationTrigger`; alteração `SendMessageUseCase`; header `X-App-State` |

---

## Implement Checklist (Stage 4)

- [ ] Adicionar Prisma model `NotificationDeliveryLog` + migration
- [ ] Criar entity/VOs/policies de domínio (017)
- [ ] Implementar `FcmPushNotificationProvider` + `NoOpPushNotificationProvider`
- [ ] Implementar `SendPushNotificationUseCase`
- [ ] Implementar `PrismaNotificationDeliveryLogRepository`
- [ ] Implementar `PrismaAbandonedConversationQuery`
- [ ] Implementar `ProcessAbandonedConversationsUseCase` + `AbandonedConversationsJob`
- [ ] Implementar `NotifyAiResponseReadyUseCase` + trigger impl
- [ ] Exportar `ASSISTANT_REPLY_NOTIFICATION_TRIGGER` do NotificationsModule
- [ ] Alterar ConversationsModule: import + wiring SendMessageUseCase
- [ ] Adicionar propagação `X-App-State` no controller de messages
- [ ] Configurar env vars (`FCM_ENABLED`, thresholds, cron)
- [ ] Adicionar `@nestjs/schedule` se ausente

---

## Fora de escopo (bolt 018+)

- Dicas educativas periódicas (cron separado)
- API campanhas administrativas
- Evento analytics `notification_sent`
- Endpoints REST de envio manual/debug (opcional futuro)

---

## Herança do bolt 016

Este documento **estende** `memory-bank/bolts/016-notifications-api/ddd-02-technical-design.md`. Estrutura de módulo, endpoints REST, models `DeviceToken`/`NotificationPreference` e wiring base permanecem válidos. Bolt 017 adiciona camada de envio FCM, delivery log, jobs e integração desacoplada com conversas.
