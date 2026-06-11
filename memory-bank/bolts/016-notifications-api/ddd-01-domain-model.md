---
unit: 001-notifications-api
bolt: 016-notifications-api
stage: model
status: complete
created: 2026-06-09T12:00:00Z
---

# Static Model - Notifications API (Bolt 016)

## Bounded Context

**Notifications — Device Registration & Preferences** — contexto responsável por registrar tokens FCM de dispositivos autenticados, gerenciar preferências de opt-in e expor portas para envio futuro de push. Neste bolt (**016**), o escopo limita-se ao **domínio** e à **API REST** de token/preferência/logout. Envio FCM real, jobs e triggers ficam para os bolts **017** e **018**.

**Fronteiras**:
- **Dentro**: entidades `DeviceToken` e `NotificationPreference`; VOs de validação; ports `DeviceTokenRepository`, `NotificationPreferenceRepository` e `PushNotificationProvider` (interface apenas); use cases de registro, atualização de preferência e inativação no logout.
- **Fora**: implementação FCM (`017`), triggers de conversa/IA (`017`), dicas e campanhas (`018`), analytics `notification_sent` (`018`), UI Flutter (`002-push-notifications-ui`).

---

## Domain Entities

| Entity | Properties | Business Rules |
|--------|------------|----------------|
| **DeviceToken** | `id`, `firebaseUid`, `token`, `platform`, `isActive`, `lastSeenAt`, `createdAt`, `updatedAt` | Vinculado a um único `firebaseUid` autenticado; `token` não vazio; `platform` ∈ `ios` \| `android`; `isActive` default `true` no registro; `lastSeenAt` atualizado a cada re-registro; um usuário pode ter **N tokens ativos** (múltiplos dispositivos); upsert por par `(firebaseUid, token)` |
| **NotificationPreference** | `firebaseUid`, `enabled`, `updatedAt`, `createdAt` | Uma preferência por usuário (`firebaseUid` como chave natural); `enabled` default `true` para novos usuários; alteração tem efeito imediato nos envios futuros (respeitada pelo provider no bolt 017) |

---

## Value Objects

| Value Object | Properties | Constraints |
|--------------|------------|-------------|
| **FirebaseUid** | `value: string` | string não vazia; identificador estável do Firebase Auth; chave de ownership em todas as operações |
| **FcmToken** | `value: string` | string não vazia após trim; comprimento mínimo 10 chars (validação defensiva); rejeita string vazia |
| **DevicePlatform** | `value: 'ios' \| 'android'` | apenas valores do enum; case-sensitive lowercase |
| **PushNotification** *(VO para envio futuro)* | `type`, `title`, `body`, `deepLink`, `conversationId?` | `type` ∈ `reminder` \| `ai_response` \| `tip` \| `campaign`; `title` e `body` genéricos (sem conteúdo pessoal completo); **rejeita** payload com campos sensíveis (`password`, `otp`, `token`, conteúdo integral de conversa); `deepLink` rota interna válida; usado pelo port `PushNotificationProvider` (implementação no bolt 017) |
| **NotificationType** | `value: enum` | `reminder`, `ai_response`, `tip`, `campaign` — alinhado a FR-10 analytics |

---

## Aggregates

| Aggregate Root | Members | Invariants |
|----------------|---------|------------|
| **DeviceToken** | *(entidade raiz isolada)* | Pertence a exatamente um `firebaseUid`; unicidade lógica por `(firebaseUid, token)`; re-registro atualiza `lastSeenAt` e garante `isActive=true`; `deactivate()` marca `isActive=false` sem deletar registro (auditoria); apenas o dono (`firebaseUid`) pode registrar/inativar seus tokens |
| **NotificationPreference** | *(entidade raiz isolada)* | Uma instância por `firebaseUid`; `enabled` default `true` na criação; `updateEnabled(boolean)` atualiza `updatedAt`; preferência ausente tratada como `enabled=true` no primeiro registro de token ou consulta |

**Nota de modelagem**: `DeviceToken` e `NotificationPreference` são agregados separados com chave comum `firebaseUid`. Não há transação cross-aggregate obrigatória no MVP; use cases orquestram ambos quando necessário (ex.: criar preferência default no primeiro registro de token).

---

## Domain Events

| Event | Trigger | Payload |
|-------|---------|---------|
| **DeviceTokenRegistered** | Token persistido ou re-registrado com sucesso | `firebaseUid`, `deviceTokenId`, `platform`, `occurredAt` |
| **DeviceTokenDeactivated** | Token inativado no logout | `firebaseUid`, `deviceTokenId`, `token` (hash ou truncado em logs), `occurredAt` |
| **NotificationPreferenceUpdated** | Preferência alterada | `firebaseUid`, `enabled`, `occurredAt` |

*Nota MVP*: eventos log-only na infraestrutura; sem event bus. Evento `notification_token_registered` (FR-10) pode ser emitido na camada de aplicação após `DeviceTokenRegistered`.

---

## Domain Services

| Service | Operations | Dependencies |
|---------|------------|--------------|
| **PushNotificationPayloadPolicy** | `assertSafePayload(notification: PushNotification): void` | Valida que título/corpo/deepLink não contêm dados sensíveis ou conteúdo pessoal completo; lista de padrões proibidos |
| **NotificationEligibilityPolicy** *(usado no bolt 017)* | `canSend(firebaseUid): Promise<boolean>` | Consulta `NotificationPreference` e tokens ativos; retorna `false` se `enabled=false` ou sem token ativo |

---

## Repository Interfaces (Ports)

| Repository / Port | Entity / Contract | Methods |
|-------------------|-------------------|---------|
| **DeviceTokenRepository** | `DeviceToken` | `upsert(token: DeviceToken): Promise<DeviceToken>`; `findActiveByFirebaseUid(firebaseUid): Promise<DeviceToken[]>`; `deactivateByFirebaseUidAndToken(firebaseUid, fcmToken): Promise<void>`; `deactivateAllByFirebaseUid(firebaseUid): Promise<void>` *(opcional MVP)* |
| **NotificationPreferenceRepository** | `NotificationPreference` | `findByFirebaseUid(firebaseUid): Promise<NotificationPreference \| null>`; `upsert(preference: NotificationPreference): Promise<NotificationPreference>`; `getOrCreateDefault(firebaseUid): Promise<NotificationPreference>` |
| **PushNotificationProvider** *(port — interface only)* | `PushNotification` → send result | `send(firebaseUid, notification: PushNotification): Promise<SendResult>`; **Implementação FCM Admin SDK no bolt 017**; neste bolt apenas declaração da interface e tipos de retorno (`SendResult`: `{ success: boolean; messageId?: string; error?: string }`) |

---

## Application Use Cases (implícitos no modelo)

| Use Case | Input | Output | Regras |
|----------|-------|--------|--------|
| **RegisterDeviceToken** | `firebaseUid`, `token`, `platform` | `DeviceToken` | Valida VOs; upsert; atualiza `lastSeenAt`; garante preferência default se ausente; emite `DeviceTokenRegistered` |
| **UpdateNotificationPreference** | `firebaseUid`, `enabled` | `NotificationPreference` | Upsert preferência; emite `NotificationPreferenceUpdated` |
| **DeactivateDeviceToken** | `firebaseUid`, `token` | `void` | Marca `isActive=false`; emite `DeviceTokenDeactivated`; idempotente se token já inativo |
| **GetNotificationPreference** | `firebaseUid` | `NotificationPreference` | Retorna existente ou default `enabled=true` |

---

## Ubiquitous Language

| Term | Definition |
|------|------------|
| **Device Token** | Token FCM do dispositivo, vinculado ao `firebaseUid` do usuário autenticado |
| **Preferência de notificação** | Opt-in global do usuário (`enabled`); sem categorias no MVP |
| **Token ativo** | `isActive=true`; elegível para receber push (quando preferência habilitada) |
| **Re-registro** | App envia novamente o mesmo token; backend atualiza `lastSeenAt` e reativa |
| **Inativação no logout** | Marca token como inativo sem deletar registro |
| **Push genérico** | Título/corpo sem conteúdo pessoal completo — privacidade na lock screen |
| **PushNotificationProvider** | Porta hexagonal para envio FCM; implementação externa ao domínio |

---

## Stories Coverage

| Story | Cobertura no modelo |
|-------|---------------------|
| **001-notifications-domain-model** | Entidades `DeviceToken`, `NotificationPreference`; VOs `FirebaseUid`, `FcmToken`, `DevicePlatform`, `PushNotification`, `NotificationType`; agregados e invariantes; ports `DeviceTokenRepository`, `NotificationPreferenceRepository`, `PushNotificationProvider`; `PushNotificationPayloadPolicy` |
| **002-token-preference-api** | Use cases `RegisterDeviceToken`, `UpdateNotificationPreference`, `DeactivateDeviceToken`, `GetNotificationPreference`; ownership via `firebaseUid` do JWT; suporte a N dispositivos; validação token vazio → erro de domínio |

---

## Diagrama (agregados e ports)

```text
┌──────────────────────────────┐     ┌──────────────────────────────┐
│   DeviceToken (root)         │     │ NotificationPreference (root) │
│  firebaseUid, token,         │     │  firebaseUid, enabled,        │
│  platform, isActive,         │     │  updatedAt                    │
│  lastSeenAt                  │     └──────────────────────────────┘
└──────────────────────────────┘
         │                                      │
         └────────────── firebaseUid ───────────┘

Ports (application):
  DeviceTokenRepository          NotificationPreferenceRepository
  PushNotificationProvider (interface — bolt 017)
```

---

## Edge Cases (domínio)

| Cenário | Comportamento esperado |
|---------|------------------------|
| Token duplicado (mesmo firebaseUid + token) | Upsert: atualiza `lastSeenAt`, `isActive=true` |
| Usuário sem preferência | `getOrCreateDefault` → `enabled=true` |
| Múltiplos dispositivos | N registros `DeviceToken` ativos por `firebaseUid` |
| Token vazio ou platform inválida | Erro de validação de domínio antes de persistir |
| Logout com token já inativo | Operação idempotente, sem erro |
| Requisição sem auth | Fora do domínio — rejeitada na presentation (401) |
| Convidado (guest) | Fora de escopo — endpoints exigem usuário autenticado |

---

## Fora de escopo deste bolt (referência)

- Implementação FCM (`PushNotificationProvider` adapter)
- Jobs de lembrete e dicas
- Trigger resposta IA em background
- Evento `notification_sent` no backend
- Campanhas administrativas
