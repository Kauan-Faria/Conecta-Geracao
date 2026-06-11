---
unit: 001-notifications-api
bolt: 017-notifications-api
stage: model
status: complete
created: 2026-06-09T21:44:00Z
---

# Static Model - Notifications API (Bolt 017)

## Bounded Context

**Notifications — Push Delivery & Conversation Triggers** — extensão do contexto Notifications iniciado no bolt **016**. Este bolt adiciona **envio real via FCM**, **orquestração de triggers automáticos** (lembrete de conversa abandonada e resposta IA em background) e **controle de rate limit** por conversa.

**Fronteiras**:
- **Dentro**: implementação do port `PushNotificationProvider`; use case `SendPushNotification`; políticas de elegibilidade e cooldown; port de consulta a conversas abandonadas; port de trigger de resposta IA; entidade de registro de entrega (`NotificationDeliveryLog`); job de lembrete; serviços de domínio para payload seguro e cooldown.
- **Fora**: registro de token/preferência (bolt **016**); dicas educativas e campanhas admin (bolt **018**); analytics `notification_sent` formal (bolt **018**); UI Flutter; lógica de LLM/RAG no `ConversationsModule`; decisão de foreground/background no app (delegada ao cliente).

**Princípio de acoplamento** (alinhado a ADR-005): `NotificationsModule` **não importa** `ConversationsModule`. Integração via **ports hexagonais** — o módulo de conversas expõe dados via adapter ou invoca port de notificação; notificações consome apenas contratos, não use cases internos de chat.

---

## Domain Entities (novas e estendidas)

| Entity | Properties | Business Rules |
|--------|------------|----------------|
| **NotificationDeliveryLog** *(novo)* | `id`, `firebaseUid`, `conversationId?`, `notificationType`, `sentAt`, `fcmMessageId?`, `status` | Registra cada tentativa de envio bem-sucedida ou skip explícito; `conversationId` obrigatório para tipos `reminder` e `ai_response`; `status` ∈ `sent` \| `skipped`; usado para **rate limit** de lembrete (cooldown 24h por conversa); imutável após criação |
| **DeviceToken** *(herdado 016)* | — | Sem alteração; provider consulta tokens ativos antes do envio |
| **NotificationPreference** *(herdado 016)* | — | Sem alteração; `enabled=false` bloqueia envio com status `skipped` |

---

## Value Objects

| Value Object | Properties | Constraints |
|--------------|------------|-------------|
| **SendResult** *(novo)* | `status`, `messageIds?`, `skippedReason?`, `failedTokens?` | `status` ∈ `sent` \| `skipped` \| `partial` \| `failed`; `skippedReason` ∈ `preference_disabled` \| `no_active_tokens` \| `cooldown_active` \| `conversation_closed` \| `unsafe_payload`; `messageIds` preenchido quando FCM aceita; `failedTokens` lista tokens marcados inativos após erro permanente FCM |
| **InactivityThreshold** *(novo)* | `hours: number` | Default **24**; mínimo 1, máximo 168 (7 dias); configurável via env `NOTIFICATION_INACTIVITY_HOURS` |
| **ReminderCooldown** *(novo)* | `hours: number` | Default **24**; impede reenvio de lembrete para mesma `conversationId` dentro da janela; configurável via env `NOTIFICATION_REMINDER_COOLDOWN_HOURS` |
| **FcmDataPayload** *(novo)* | `type`, `route`, `conversationId?` | `type` espelha `NotificationType`; `route` deep link interno (ex.: `/conversations/{id}`); **sem** conteúdo de mensagem ou dados sensíveis; serializado como strings no data payload FCM |
| **PushNotification** *(herdado 016)* | — | Reutilizado; validado por `PushNotificationPayloadPolicy` antes de todo envio |
| **NotificationType** *(herdado 016)* | — | Neste bolt: `reminder`, `ai_response` em uso; `tip`, `campaign` reservados para bolt 018 |

---

## Aggregates

| Aggregate Root | Members | Invariants |
|----------------|---------|------------|
| **NotificationDeliveryLog** | *(entidade raiz isolada)* | Uma entrada por evento de entrega ou skip registrado; para `reminder`: no máximo **1 envio `sent` por `conversationId` dentro do `ReminderCooldown`**; consulta de cooldown antes de novo envio; `firebaseUid` deve corresponder ao dono da conversa |
| **DeviceToken** *(herdado)* | — | Provider pode chamar `deactivate()` em token após erro permanente FCM |
| **NotificationPreference** *(herdado)* | — | Consultada em toda operação de envio |

**Nota**: `NotificationDeliveryLog` é agregado separado — não participa de transação com `DeviceToken`; use case orquestra persistência de log após envio ou skip.

---

## Domain Events

| Event | Trigger | Payload |
|-------|---------|---------|
| **PushNotificationSent** | FCM aceita mensagem para ≥1 token | `firebaseUid`, `notificationType`, `conversationId?`, `fcmMessageIds[]`, `occurredAt` |
| **PushNotificationSkipped** | Envio bloqueado por política | `firebaseUid`, `notificationType`, `conversationId?`, `reason`, `occurredAt` |
| **DeviceTokenDeactivatedByFcm** | Erro permanente FCM em token | `firebaseUid`, `deviceTokenId`, `fcmErrorCode`, `occurredAt` |
| **ConversationReminderDispatched** | Job processa conversa elegível | `conversationId`, `firebaseUid`, `inactivityHours`, `occurredAt` |
| **AiResponseNotificationDispatched** | Trigger pós-resposta IA | `conversationId`, `firebaseUid`, `occurredAt` |

*Nota MVP*: eventos log-only; analytics formal `notification_sent` no bolt **018**.

---

## Domain Services

| Service | Operations | Dependencies |
|---------|------------|--------------|
| **PushNotificationPayloadPolicy** *(herdado 016)* | `assertSafePayload(notification): void` | Reutilizado sem alteração |
| **NotificationEligibilityPolicy** | `canSend(firebaseUid): Promise<EligibilityResult>` | `NotificationPreferenceRepository`, `DeviceTokenRepository`; retorna `{ eligible: boolean; reason? }` |
| **ReminderCooldownPolicy** | `canSendReminder(conversationId): Promise<boolean>` | `NotificationDeliveryLogRepository`; retorna `false` se último `sent` de tipo `reminder` dentro do cooldown |
| **AbandonedConversationPolicy** | `isEligible(snapshot): boolean` | Recebe `AbandonedConversationSnapshot`; elegível se: `status=active`, `lastActivityAt` < threshold, sem lembrete recente, preferência habilitada |
| **AiResponseNotificationPolicy** | `shouldNotify(context): boolean` | `context.appInBackground=true` **e** preferência habilitada **e** conversa ativa; foreground → skip (delegado ao app) |

---

## Repository Interfaces (Ports)

| Repository / Port | Entity / Contract | Methods |
|-------------------|-------------------|---------|
| **PushNotificationProvider** *(implementação neste bolt)* | `PushNotification` → `SendResult` | `send(firebaseUid, notification): Promise<SendResult>`; envia para **todos** tokens ativos do usuário; retry com backoff em rate limit FCM; marca token inativo em erro permanente (`registration-token-not-registered`, `invalid-registration-token`) |
| **NotificationDeliveryLogRepository** *(novo)* | `NotificationDeliveryLog` | `save(log): Promise<NotificationDeliveryLog>`; `findLastSentReminder(conversationId): Promise<NotificationDeliveryLog \| null>`; `existsSentWithin(conversationId, type, hours): Promise<boolean>` |
| **AbandonedConversationQuery** *(port integração — novo)* | `AbandonedConversationSnapshot` | `findAbandoned(threshold: InactivityThreshold): Promise<AbandonedConversationSnapshot[]>`; snapshot: `{ conversationId, firebaseUid, lastActivityAt, status }`; **implementação adapter** consulta repositório Prisma de conversas **sem** importar `ConversationsModule` no domínio |
| **AssistantReplyNotificationTrigger** *(port integração — novo)* | callback/handler | `onAssistantReplyReady(event: AssistantReplyReadyEvent): Promise<void>`; event: `{ conversationId, firebaseUid, appInBackground: boolean }`; registrado no `ConversationsModule` via token DI; implementação delega a `NotifyAiResponseReadyUseCase` |
| **DeviceTokenRepository** *(herdado 016)* | — | + `deactivateById(id): Promise<void>` usado pelo provider |
| **NotificationPreferenceRepository** *(herdado 016)* | — | Sem alteração |

---

## Application Use Cases

| Use Case | Input | Output | Regras |
|----------|-------|--------|--------|
| **SendPushNotification** | `firebaseUid`, `PushNotification` | `SendResult` | 1) `NotificationEligibilityPolicy.canSend`; 2) `PushNotificationPayloadPolicy.assertSafePayload`; 3) busca tokens ativos; 4) `PushNotificationProvider.send`; 5) desativa tokens com erro permanente; 6) persiste `NotificationDeliveryLog` se `conversationId` presente |
| **ProcessAbandonedConversations** *(job)* | — (cron) | `{ processed, sent, skipped }` | 1) `AbandonedConversationQuery.findAbandoned`; 2) filtra por `AbandonedConversationPolicy`; 3) monta `PushNotification` tipo `reminder` com corpo genérico; 4) chama `SendPushNotification`; 5) emite `ConversationReminderDispatched` |
| **NotifyAiResponseReady** | `AssistantReplyReadyEvent` | `SendResult \| void` | 1) `AiResponseNotificationPolicy.shouldNotify`; 2) se false, skip; 3) monta push tipo `ai_response` título "Sua orientação está pronta"; 4) chama `SendPushNotification` |

### Push templates (domínio — conteúdo genérico)

| Type | Title | Body | Deep link |
|------|-------|------|-----------|
| `reminder` | "Conecta Geração" | "Você tem uma conversa aguardando. Toque para continuar." | `/conversations/{conversationId}` |
| `ai_response` | "Conecta Geração" | "Sua orientação está pronta." | `/conversations/{conversationId}` |

> Sem conteúdo pessoal, sem trechos de conversa, sem dados sensíveis — conforme FR e story 003/004.

---

## Ubiquitous Language

| Term | Definition |
|------|------------|
| **Envio push** | Operação que entrega notificação FCM a todos os tokens ativos de um `firebaseUid` elegível |
| **Skip** | Envio não realizado por política (preferência off, cooldown, sem token, payload inseguro) — distinto de falha FCM |
| **Conversa abandonada** | Conversa `active` sem mensagem há ≥ `InactivityThreshold` (default 24h) |
| **Cooldown de lembrete** | Janela (default 24h) em que a mesma conversa não recebe segundo lembrete |
| **Trigger de resposta IA** | Hook invocado quando assistant reply completa e app está em background |
| **Payload data FCM** | Mapa `{ type, route, conversationId? }` — contrato com Flutter para deep link |
| **Erro permanente FCM** | Código FCM que indica token inválido/expirado → token marcado `isActive=false` |
| **Port de conversas** | Contrato hexagonal; Notifications não conhece entidades internas de chat |

---

## Stories Coverage

| Story | Cobertura no modelo |
|-------|---------------------|
| **003-fcm-push-provider** | `PushNotificationProvider` implementado; `SendPushNotification` use case; `SendResult` VO; `FcmDataPayload`; `NotificationEligibilityPolicy`; desativação token em erro permanente; `PushNotificationPayloadPolicy` reutilizado |
| **004-conversation-notification-triggers** | `ProcessAbandonedConversations` job; `AbandonedConversationQuery` port; `ReminderCooldownPolicy`; `NotificationDeliveryLog`; `NotifyAiResponseReady`; `AssistantReplyNotificationTrigger` port; templates genéricos reminder/ai_response |

---

## Diagrama (fluxos e ports)

```text
┌─────────────────────────────────────────────────────────────────┐
│                    NotificationsModule (017)                     │
├─────────────────────────────────────────────────────────────────┤
│  Jobs                          Use Cases                         │
│  ┌──────────────────────┐     ┌─────────────────────────────┐ │
│  │ ProcessAbandoned     │────▶│ SendPushNotification        │ │
│  │ Conversations (Cron) │     │ NotifyAiResponseReady       │ │
│  └──────────┬───────────┘     └──────────────┬──────────────┘ │
│             │                                 │                  │
│  Ports IN   │                                 │ Ports OUT        │
│  ┌──────────▼───────────┐     ┌──────────────▼──────────────┐  │
│  │ AbandonedConversation│     │ PushNotificationProvider    │  │
│  │ Query (adapter)      │     │ (FcmPushNotificationProvider)│  │
│  └──────────────────────┘     └─────────────────────────────┘  │
│  ┌──────────────────────┐     ┌─────────────────────────────┐  │
│  │ AssistantReply       │     │ NotificationDeliveryLog     │  │
│  │ NotificationTrigger  │     │ Repository (Prisma)         │  │
│  └──────────────────────┘     └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         ▲                                    │
         │ DI token                           │ FCM HTTP v1
         │                                    ▼
┌────────┴────────────┐              ┌─────────────────┐
│ ConversationsModule │              │ Firebase Admin  │
│ (SendMessage UC)    │              │ Messaging       │
└─────────────────────┘              └─────────────────┘
```

**Integração Conversations → Notifications**:
- `SendMessageUseCase` injeta `AssistantReplyNotificationTrigger` (interface)
- Após persistir resposta assistant, chama `onAssistantReplyReady({ conversationId, firebaseUid, appInBackground })`
- `appInBackground` informado pelo cliente via header/body opcional na request (ex.: `X-App-State: background`) — **fora do domínio de notifications**, mapeado na presentation de conversations

---

## Edge Cases (domínio)

| Cenário | Comportamento esperado |
|---------|------------------------|
| Usuário sem token ativo | `SendResult.status=skipped`, reason=`no_active_tokens`; log warning; job não falha |
| Preferência desativada | Skip imediato; persiste log `skipped` se aplicável |
| Token FCM inválido | Provider marca `isActive=false`; outros tokens do usuário ainda recebem |
| FCM rate limit | Retry com backoff exponencial (max 3 tentativas); falha parcial registrada |
| Conversa encerrada (`status=closed`) | Job ignora; não envia lembrete |
| Lembrete dentro do cooldown | Skip reason=`cooldown_active` |
| Resposta IA com app em foreground | Skip — app exibe inline; sem push |
| Payload com conteúdo sensível | `PushNotificationPayloadPolicy` rejeita antes do FCM |
| Múltiplos dispositivos | Envio multicast para todos tokens ativos |
| Conversa sem `conversationId` no push tip/campaign | Fora deste bolt (018) |

---

## Persistência (modelo conceitual — Prisma no Stage 2)

**NotificationDeliveryLog** (nova tabela):

| Coluna | Tipo | Notas |
|--------|------|-------|
| id | cuid PK | |
| firebase_uid | varchar(128) | |
| conversation_id | varchar nullable | FK lógica, sem constraint cross-module |
| notification_type | enum | reminder, ai_response, tip, campaign |
| status | enum | sent, skipped |
| fcm_message_id | varchar nullable | |
| skipped_reason | varchar nullable | |
| sent_at | timestamptz | |

Índices: `(conversation_id, notification_type, sent_at DESC)` para cooldown; `(firebase_uid, sent_at)`.

---

## Fora de escopo deste bolt

- Dicas educativas periódicas (story 005 — bolt 018)
- Campanhas administrativas (story 005 — bolt 018)
- Evento analytics `notification_sent` (story 006 — bolt 018)
- Rich media / imagens em push
- Push para usuários guest
- Categorias configuráveis de notificação

---

## Herança do bolt 016

Este documento **estende** `memory-bank/bolts/016-notifications-api/ddd-01-domain-model.md`. Entidades, VOs e ports marcados como *herdado* permanecem válidos sem alteração semântica. Bolt 017 adiciona implementação FCM, log de entrega, políticas de trigger e ports de integração com conversas.
