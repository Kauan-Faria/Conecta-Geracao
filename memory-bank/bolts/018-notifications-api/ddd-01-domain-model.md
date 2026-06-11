---
unit: 001-notifications-api
bolt: 018-notifications-api
stage: model
status: complete
created: 2026-06-09T22:04:59Z
---

# Static Model - Notifications API (Bolt 018)

## Bounded Context

**Notifications — Curated Tips, Admin Campaigns & Delivery Analytics** — extensão final do contexto Notifications nos bolts **016** (token/preferência) e **017** (FCM + triggers conversa/IA). Este bolt adiciona **dicas educativas periódicas** (conteúdo curado), **campanhas administrativas internas** e **observabilidade formal** do funil via evento `notification_sent`.

**Fronteiras**:
- **Dentro**: catálogo de dicas pré-aprovadas; job semanal de dicas; rate limit semanal por usuário; entidade de auditoria `Campaign`; segmentação MVP (`all_active`, lista de UIDs); endpoint interno `POST /notifications/campaigns`; port `NotificationAnalyticsPort`; emissão de `notification_sent` após confirmação FCM em **todos** os tipos de push.
- **Fora**: UI Flutter e painel admin web; geração dinâmica de dicas via LLM; categorias configuráveis de notificação; push para guest; dashboard analytics; eventos client-side (`notification_opened` — story UI 007); rich media.

**Princípio de acoplamento**: mantém ADR-006 — sem importar `ConversationsModule`. Dicas usam deep links genéricos (home, tópico sugerido); campanhas operam sobre `firebaseUid` + elegibilidade existente (`NotificationEligibilityPolicy` do bolt 017).

---

## Domain Entities (novas e estendidas)

| Entity | Properties | Business Rules |
|--------|------------|----------------|
| **EducationalTip** *(novo — catálogo)* | `id`, `title`, `body`, `deepLink`, `topicTag?`, `isActive`, `sortOrder` | Conteúdo **pré-aprovado** e imutável em runtime; `isActive=true` para inclusão no pool; `deepLink` rota interna válida; **rejeita** origem LLM/dinâmica; carregado via **Prisma seed** (`educational-tips.seed.ts`, ADR-009) |
| **Campaign** *(novo — auditoria)* | `id`, `title`, `body`, `deepLink`, `segmentType`, `segmentPayload?`, `status`, `requestedBy`, `requestedAt`, `completedAt?`, `sentCount`, `skippedCount`, `idempotencyKey?` | `status` ∈ `pending` \| `processing` \| `completed` \| `failed`; `sentCount`/`skippedCount` atualizados ao concluir; `idempotencyKey` opcional impede duplicata no mesmo dia; imutável após `completed`; **sem** PII além de `requestedBy` (operador interno) |
| **NotificationDeliveryLog** *(herdado 017)* | — | Estendido para tipos `tip` e `campaign`; usado para rate limit semanal de dicas (`findLastSentTip`) e auditoria complementar |
| **DeviceToken** *(herdado 016)* | — | Campanhas e dicas consultam tokens ativos via fluxo existente |
| **NotificationPreference** *(herdado 016)* | — | `enabled=false` bloqueia dicas e campanhas |

---

## Value Objects

| Value Object | Properties | Constraints |
|--------------|------------|-------------|
| **CampaignSegment** *(novo)* | `type`, `firebaseUids?` | `type` ∈ `all_active` \| `uid_list`; `uid_list` exige array não vazio de `FirebaseUid`; segmento vazio → 0 envios, sem erro |
| **TipWeeklyWindow** *(novo)* | `days: number` | Default **7**; configurável via env `NOTIFICATION_TIP_WEEKLY_DAYS`; impede >1 dica `sent` por `firebaseUid` dentro da janela |
| **CuratedTipContent** *(novo)* | `title`, `body`, `deepLink` | Validado por `PushNotificationPayloadPolicy` antes do envio; origem deve ser catálogo — `CuratedContentPolicy.assertFromCatalog(tipId)` |
| **CampaignRequest** *(novo)* | `title`, `body`, `deepLink`, `segment`, `idempotencyKey?` | Título/corpo genéricos; deep link interno; operador autenticado via auth interno (service key MVP) |
| **NotificationSentEvent** *(novo — analytics)* | `notificationType`, `occurredAt`, `campaignId?`, `tipId?` | **Sem** `firebaseUid`, token FCM, conteúdo de conversa ou corpo da mensagem; `notificationType` ∈ `reminder` \| `ai_response` \| `tip` \| `campaign`; emitido **somente** após FCM confirmar envio |
| **SendResult** *(herdado 017)* | — | `status=sent` dispara analytics; `skipped` **não** emite `notification_sent` |
| **PushNotification** *(herdado 016)* | — | Tipos `tip` e `campaign` passam a ser usados neste bolt |
| **NotificationType** *(herdado 016)* | — | Todos os quatro valores em uso |

---

## Aggregates

| Aggregate Root | Members | Invariants |
|----------------|---------|------------|
| **EducationalTip** *(catálogo read-mostly)* | *(entidade raiz isolada)* | Conteúdo só via seed/migration; runtime **read-only**; desativação via `isActive=false`, sem delete físico no MVP |
| **Campaign** | *(entidade raiz isolada)* | Transição `pending → processing → completed`; `sentCount + skippedCount` reflete total processado; idempotência: mesma `idempotencyKey` no mesmo dia retorna campanha existente |
| **NotificationDeliveryLog** *(herdado)* | — | Para `tip`: no máximo **1** registro `sent` por `firebaseUid` dentro de `TipWeeklyWindow`; consulta antes do job semanal |

---

## Domain Events

| Event | Trigger | Payload |
|-------|---------|---------|
| **NotificationSent** *(formal analytics — story 006)* | FCM aceita mensagem (`SendResult.status=sent`) | `notificationType`, `occurredAt`, `campaignId?`, `tipId?` — **sem PII** |
| **EducationalTipDispatched** | Job semanal envia dica a usuário elegível | `tipId`, `firebaseUid` (log interno only), `occurredAt` |
| **CampaignCompleted** | Campanha conclui processamento | `campaignId`, `sentCount`, `skippedCount`, `completedAt` |
| **CampaignSkippedRecipient** | Destinatário inelegível na campanha | `campaignId`, `skippedReason`, `occurredAt` — log interno; **não** emite `notification_sent` |
| **PushNotificationSent** *(herdado 017)* | Mantido; analytics port escuta sucesso e emite `NotificationSent` |

*Distinção*: `PushNotificationSent` = evento de domínio interno; `NotificationSent` = contrato analytics FR-10 (`notification_sent`).

---

## Domain Services

| Service | Operations | Dependencies |
|---------|------------|--------------|
| **CuratedContentPolicy** *(novo)* | `assertFromCatalog(tipId): void`; `rejectDynamicContent(source): void` | `EducationalTipCatalogRepository`; rejeita qualquer payload não referenciado ao catálogo ou marcado como LLM |
| **TipWeeklyRateLimitPolicy** *(novo)* | `canSendTip(firebaseUid): Promise<boolean>` | `NotificationDeliveryLogRepository`; retorna `false` se último `sent` tipo `tip` dentro de `TipWeeklyWindow` |
| **TipSelectionPolicy** *(novo)* | `selectTipForUser(firebaseUid, catalog): EducationalTip` | Seleção determinística (ex.: rotação por hash de `firebaseUid + weekNumber`) para distribuir dicas do pool ativo |
| **CampaignEligibilityPolicy** *(novo)* | `resolveRecipients(segment): Promise<FirebaseUid[]>` | `DeviceTokenRepository`, `NotificationPreferenceRepository`; `all_active` = usuários com ≥1 token ativo e preferência habilitada |
| **CampaignIdempotencyPolicy** *(novo)* | `findExisting(key, date): Promise<Campaign \| null>` | `CampaignRepository`; mesma chave no mesmo dia → retorna campanha anterior |
| **InternalCampaignAuthPolicy** *(novo)* | `assertAuthorized(credentials): void` | Valida service key / header interno MVP; falha → `UnauthorizedError` |
| **NotificationEligibilityPolicy** *(herdado 017)* | — | Reutilizado em dicas e campanhas |
| **PushNotificationPayloadPolicy** *(herdado 016)* | — | Valida título/corpo/deepLink de dicas e campanhas |
| **ReminderCooldownPolicy** *(herdado 017)* | — | Sem alteração |

---

## Repository Interfaces (Ports)

| Repository / Port | Entity / Contract | Methods |
|-------------------|-------------------|---------|
| **EducationalTipCatalogRepository** *(novo)* | `EducationalTip` | `findAllActive(): Promise<EducationalTip[]>`; `findById(id): Promise<EducationalTip \| null>`; implementação: `PrismaEducationalTipCatalogRepository` (tabela `educational_tips`) |
| **CampaignRepository** *(novo)* | `Campaign` | `save(campaign): Promise<Campaign>`; `updateCounts(id, sent, skipped): Promise<void>`; `findByIdempotencyKey(key, date): Promise<Campaign \| null>` |
| **NotificationDeliveryLogRepository** *(estendido 017)* | — | + `findLastSentTip(firebaseUid): Promise<NotificationDeliveryLog \| null>`; + `existsSentWithin(firebaseUid, type, days): Promise<boolean>` |
| **NotificationAnalyticsPort** *(novo)* | `NotificationSentEvent` | `trackNotificationSent(event): Promise<void>`; implementação MVP: **structured logger** (Pino) com campo `event=notification_sent`; extensível para Firebase Analytics server-side |
| **ActiveUserQuery** *(novo — port integração)* | `FirebaseUid[]` | `findAllWithActiveTokensAndPreference(): Promise<FirebaseUid[]>`; adapter Prisma read-only sobre `device_tokens` + `notification_preferences` |
| **PushNotificationProvider** *(herdado 017)* | — | Sem alteração |
| **DeviceTokenRepository** *(herdado 016)* | — | Sem alteração |
| **NotificationPreferenceRepository** *(herdado 016)* | — | Sem alteração |

---

## Application Use Cases

| Use Case | Input | Output | Regras |
|----------|-------|--------|--------|
| **SendPushNotification** *(estendido 017)* | `firebaseUid`, `PushNotification` | `SendResult` | Fluxo existente **+** após `status=sent`: chama `NotificationAnalyticsPort.trackNotificationSent({ notificationType, occurredAt, campaignId?, tipId? })`; skip **não** emite analytics |
| **ProcessWeeklyEducationalTips** *(job — novo)* | — (cron semanal) | `{ processed, sent, skipped }` | 1) `ActiveUserQuery`; 2) filtra `TipWeeklyRateLimitPolicy`; 3) `TipSelectionPolicy.selectTipForUser`; 4) monta push tipo `tip`; 5) `SendPushNotification`; 6) log `EducationalTipDispatched` |
| **SendInternalCampaign** *(novo)* | `CampaignRequest`, operador | `Campaign` | 1) `InternalCampaignAuthPolicy`; 2) idempotência; 3) persiste `Campaign` pending; 4) `CampaignEligibilityPolicy.resolveRecipients`; 5) loop `SendPushNotification` tipo `campaign`; 6) atualiza contadores; 7) `CampaignCompleted` |

### Push templates (domínio — conteúdo genérico)

| Type | Title | Body | Deep link |
|------|-------|------|-----------|
| `tip` | Do catálogo `EducationalTip.title` | Do catálogo `EducationalTip.body` | Do catálogo `EducationalTip.deepLink` (ex.: `/`, `/chat?topic=golpes`) |
| `campaign` | Do request `CampaignRequest.title` | Do request `CampaignRequest.body` | Do request `CampaignRequest.deepLink` |

> Dicas **sempre** do catálogo curado. Campanhas aceitam título/corpo do operador, validados por `PushNotificationPayloadPolicy` — sem conteúdo sensível.

---

## Ubiquitous Language

| Term | Definition |
|------|------------|
| **Dica educativa** | Notificação push tipo `tip` com conteúdo pré-aprovado do catálogo, enviada no máximo 1× por usuário por semana |
| **Catálogo curado** | Conjunto fixo de `EducationalTip` em Prisma seed — única fonte válida para dicas |
| **Campanha interna** | Disparo manual via API autenticada internamente, com auditoria (`Campaign`) |
| **Segmento** | Critério MVP: todos usuários elegíveis (`all_active`) ou lista explícita de `firebaseUid` |
| **notification_sent** | Evento analytics FR-10 emitido pelo backend após confirmação FCM; inclui `type` e timestamp; **sem PII** |
| **Skip analytics** | Envio abortado por preferência, cooldown, sem token — **não** gera `notification_sent` |
| **Idempotência de campanha** | Mesmo `idempotencyKey` no mesmo dia retorna resultado anterior sem reenvio |
| **Auth interno MVP** | Service key ou header dedicado — sem painel admin; role admin futuro |

---

## Stories Coverage

| Story | Cobertura no modelo |
|-------|---------------------|
| **005-tips-and-campaigns** | `EducationalTip`, `ProcessWeeklyEducationalTips`, `TipWeeklyRateLimitPolicy`, `CuratedContentPolicy`, `SendInternalCampaign`, `Campaign`, `CampaignSegment`, `CampaignRepository`, endpoint interno, auditoria sent/skipped |
| **006-notification-sent-analytics** | `NotificationSentEvent`, `NotificationAnalyticsPort`, extensão `SendPushNotification` para emitir após FCM success em **todos** os tipos; skip não emite; payload sem PII/token/conteúdo conversa |

---

## Diagrama (fluxos bolt 018)

```text
┌──────────────────────────────────────────────────────────────────────┐
│                    NotificationsModule (018 extension)                │
├──────────────────────────────────────────────────────────────────────┤
│  Jobs                         Use Cases                               │
│  ┌─────────────────────┐     ┌──────────────────────────────────┐   │
│  │ ProcessWeekly       │────▶│ SendPushNotification (extended)  │   │
│  │ EducationalTips     │     │ SendInternalCampaign             │   │
│  └─────────────────────┘     └───────────────┬──────────────────┘   │
│                                               │                       │
│  Presentation (interno)                     │ on FCM success        │
│  ┌─────────────────────┐     ┌───────────────▼──────────────────┐   │
│  │ POST /notifications/│────▶│ NotificationAnalyticsPort      │   │
│  │ campaigns           │     │ → notification_sent (Pino MVP) │   │
│  └─────────────────────┘     └────────────────────────────────┘   │
│                                                                       │
│  Catalog / Persistence                                                │
│  ┌─────────────────────┐     ┌────────────────────────────────┐   │
│  │ EducationalTip      │     │ CampaignRepository             │   │
│  │ CatalogRepository   │     │ NotificationDeliveryLog (+tip) │   │
│  └─────────────────────┘     └────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
         ▲                                    │
         │ Prisma seed                        │ FCM (herdado 017)
         │                                    ▼
┌────────┴────────────────┐          ┌─────────────────┐
│ educational-tips.seed.ts│          │ Firebase Admin  │
│ → educational_tips    │          │ Messaging       │
└───────────────────────┘          └─────────────────┘
```

---

## Edge Cases (domínio)

| Cenário | Comportamento esperado |
|---------|------------------------|
| Usuário já recebeu dica na semana | Skip; não emite `notification_sent` |
| Catálogo vazio ou sem dicas ativas | Job retorna `{ sent: 0 }`; log warn; não falha |
| Segmento campanha vazio | `sentCount=0`, `completed`; HTTP 200 |
| Campanha duplicada (mesmo idempotencyKey, mesmo dia) | Retorna campanha existente; sem reenvio |
| Conteúdo dica via LLM | `CuratedContentPolicy.rejectDynamicContent` → erro de domínio |
| Preferência desativada | Skip; sem `notification_sent` |
| FCM falha em campanha | Incrementa `skippedCount` ou falha parcial; **não** emite `notification_sent` para aquele destinatário |
| Campanha com título sensível | `PushNotificationPayloadPolicy` rejeita antes do envio |
| Operador sem credencial interna | `401 Unauthorized` |
| Reminder/ai_response enviados (bolt 017) | Retrofit: `SendPushNotification` passa a emitir `notification_sent` para tipos existentes |

---

## Persistência (modelo conceitual — Prisma no Stage 2)

**EducationalTip** (seed ou tabela):

| Coluna | Tipo | Notas |
|--------|------|-------|
| id | cuid PK | |
| title | varchar | |
| body | text | |
| deep_link | varchar | |
| topic_tag | varchar nullable | ex.: `golpes`, `privacidade` |
| is_active | boolean | default true |
| sort_order | int | rotação |

**Campaign** (nova tabela):

| Coluna | Tipo | Notas |
|--------|------|-------|
| id | cuid PK | |
| title | varchar | |
| body | text | |
| deep_link | varchar | |
| segment_type | enum | all_active, uid_list |
| segment_payload | jsonb nullable | lista UIDs quando uid_list |
| status | enum | pending, processing, completed, failed |
| requested_by | varchar | operador/service id |
| requested_at | timestamptz | |
| completed_at | timestamptz nullable | |
| sent_count | int | default 0 |
| skipped_count | int | default 0 |
| idempotency_key | varchar nullable | unique com requested_at::date |

Índices: `(idempotency_key, requested_at)`; `(status, requested_at DESC)`.

**NotificationDeliveryLog** — sem alteração de schema; tipos `tip` e `campaign` já previstos no enum do bolt 017.

---

## Fora de escopo deste bolt

- Painel administrativo web
- A/B testing de mensagens
- Geração dinâmica de dicas (LLM)
- Evento `notification_failed` (opcional na story — não obrigatório MVP)
- Firebase Analytics server-side (decisão Stage 2; MVP = structured logger)
- Push para usuários guest

---

## Herança dos bolts anteriores

Este documento **estende** `memory-bank/bolts/017-notifications-api/ddd-01-domain-model.md` (e indiretamente **016**). Entidades, VOs, ports e use cases marcados como *herdado* permanecem válidos. Bolt 018 adiciona catálogo de dicas, campanhas auditáveis, job semanal, auth interno e analytics `notification_sent` integrado ao fluxo central de envio.

**ADR relevante**: ADR-006 — campanhas e dicas não importam `ConversationsModule`; elegibilidade via ports existentes e `ActiveUserQuery`.
