---
unit: 001-notifications-api
bolt: 016-notifications-api
stage: design
status: complete
created: 2026-06-09T12:15:00Z
---

# Technical Design - Notifications API (Bolt 016)

## Architecture Pattern

**Modular monolith NestJS + DDD hexagonal** (alinhado a `system-architecture.md`, `coding-standards.md` e padrão dos módulos existentes em `apps/backend/src/modules/`).

**Rationale**:
- Bolt **016** entrega persistência Prisma + endpoints REST autenticados para token FCM e preferências.
- Domínio isolado de Prisma via ports `DeviceTokenRepository` e `NotificationPreferenceRepository`.
- Port `PushNotificationProvider` declarada sem implementação — adapter FCM no bolt **017**.
- Reutiliza `shared/auth` (Firebase guard + `@CurrentUser()`) já estabelecido no bolt **004**.

---

## Layer Structure

```text
apps/backend/
├── prisma/
│   └── schema.prisma              # + DeviceToken, NotificationPreference
├── src/
│   ├── app.module.ts              # + NotificationsModule
│   └── modules/
│       └── notifications/
│           ├── notifications.module.ts
│           ├── domain/
│           │   ├── entities/
│           │   │   ├── device-token.entity.ts
│           │   │   └── notification-preference.entity.ts
│           │   ├── value-objects/
│           │   │   ├── firebase-uid.vo.ts
│           │   │   ├── fcm-token.vo.ts
│           │   │   ├── device-platform.vo.ts
│           │   │   ├── push-notification.vo.ts
│           │   │   └── notification-type.vo.ts
│           │   ├── services/
│           │   │   └── push-notification-payload.policy.ts
│           │   └── errors/
│           │       └── domain.errors.ts
│           ├── application/
│           │   ├── ports/
│           │   │   ├── device-token.repository.ts
│           │   │   ├── notification-preference.repository.ts
│           │   │   └── push-notification.provider.ts
│           │   └── use-cases/
│           │       ├── register-device-token.use-case.ts
│           │       ├── update-notification-preference.use-case.ts
│           │       ├── deactivate-device-token.use-case.ts
│           │       └── get-notification-preference.use-case.ts
│           ├── infrastructure/
│           │   └── persistence/
│           │       ├── prisma-device-token.repository.ts
│           │       └── prisma-notification-preference.repository.ts
│           └── presentation/
│               ├── notifications.controller.ts
│               ├── mappers/
│               │   └── notifications.mapper.ts
│               └── dto/
│                   ├── register-device-token.dto.ts
│                   ├── update-notification-preference.dto.ts
│                   └── deactivate-device-token.dto.ts
```

**Responsabilidades por camada**:

| Camada | Responsabilidade neste bolt |
|--------|----------------------------|
| **Domain** | Entidades, VOs, `PushNotificationPayloadPolicy`, erros de domínio |
| **Application** | Ports, use cases (register, update preference, deactivate, get preference) |
| **Infrastructure** | Adapters Prisma para repositórios |
| **Presentation** | Controller REST, DTOs, guards, envelope HTTP |
| **Shared/Auth** | Reutilizar `FirebaseAuthGuard` + `@CurrentUser('uid')` |

**Nota**: `PushNotificationProvider` registrada no módulo como token de injeção com implementação **NoOp** ou **NotImplemented** stub que lança erro explícito se invocada — apenas para satisfazer DI até bolt 017. Alternativa preferida: não exportar provider no módulo neste bolt; declarar interface no domain/application apenas.

---

## API Design

Prefixo global: `/api/v1`. Envelope conforme `api-conventions.md`. Tag Swagger: `notifications`.

### Endpoints

| Endpoint | Method | Auth | Request | Response `data` |
|----------|--------|------|---------|-----------------|
| `/notifications/device-token` | PUT | Firebase | `{ "token": string, "platform": "ios" \| "android" }` | `DeviceTokenDto` |
| `/notifications/device-token` | DELETE | Firebase | `{ "token": string }` | `null` (204 ou envelope com `data: null`) |
| `/notifications/preferences` | GET | Firebase | — | `NotificationPreferenceDto` |
| `/notifications/preferences` | PUT | Firebase | `{ "enabled": boolean }` | `NotificationPreferenceDto` |

**Decisões de design**:
- **PUT** (não POST) para registro/atualização idempotente de token — alinhado à story 002 e FR-3.
- **DELETE** com body `{ token }` para logout — app envia token a inativar; idempotente se já inativo.
- **GET preferences** adicionado para sync client (story UI 004); não conflita com escopo backend.

### Schemas (DTOs)

**DeviceTokenDto**:
```json
{
  "id": "cuid",
  "platform": "android",
  "isActive": true,
  "lastSeenAt": "2026-06-09T12:00:00.000Z",
  "createdAt": "2026-06-09T12:00:00.000Z"
}
```

> **Privacidade**: resposta **não** ecoa o token FCM completo — apenas metadados. Token sensível não retorna após persistência.

**NotificationPreferenceDto**:
```json
{
  "enabled": true,
  "updatedAt": "2026-06-09T12:00:00.000Z"
}
```

**Envelope sucesso** (exemplo PUT device-token):
```json
{
  "data": {
    "id": "clxyz...",
    "platform": "android",
    "isActive": true,
    "lastSeenAt": "2026-06-09T12:00:00.000Z",
    "createdAt": "2026-06-09T12:00:00.000Z"
  },
  "meta": {
    "requestId": "uuid"
  }
}
```

**Envelope DELETE** (204 No Content **ou** 200 com `data: null` — seguir padrão já adotado nos outros módulos na implementação).

### OpenAPI / Swagger

- Tag: `notifications`
- Documentar: auth Bearer, envelope, códigos 401/400/500
- DTOs com `@ApiProperty` e `@IsEnum`, `@IsNotEmpty`, `@IsBoolean`

### Rate Limiting

- Endpoints autenticados: **30 req/min** por IP (Throttler global existente)
- PUT device-token: **10 req/min** por usuário (proteção contra loop de re-registro)
- Resposta 429 com `error.code: RATE_LIMITED`

---

## Data Persistence

### Prisma Schema (adição)

```prisma
enum DevicePlatform {
  ios
  android

  @@map("device_platform")
}

model DeviceToken {
  id          String         @id @default(cuid())
  firebaseUid String         @map("firebase_uid") @db.VarChar(128)
  token       String         @db.VarChar(512)
  platform    DevicePlatform
  isActive    Boolean        @default(true) @map("is_active")
  lastSeenAt  DateTime       @default(now()) @map("last_seen_at")
  createdAt   DateTime       @default(now()) @map("created_at")
  updatedAt   DateTime       @updatedAt @map("updated_at")

  @@unique([firebaseUid, token])
  @@index([firebaseUid, isActive])
  @@map("device_tokens")
}

model NotificationPreference {
  firebaseUid String   @id @map("firebase_uid") @db.VarChar(128)
  enabled     Boolean  @default(true)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("notification_preferences")
}
```

### Relacionamentos

| Tabela | PK | FK | Cardinalidade |
|--------|----|----|---------------|
| `device_tokens` | `id` | — | N por `firebase_uid` (múltiplos dispositivos) |
| `notification_preferences` | `firebase_uid` | — | 1 por usuário |

Sem FK explícita entre tabelas — acoplamento lógico via `firebase_uid` (mesmo padrão de `conversations`).

### Índices

- `device_tokens.(firebase_uid, token)` UNIQUE — upsert
- `device_tokens.(firebase_uid, is_active)` — consulta tokens ativos no bolt 017
- `notification_preferences.firebase_uid` PK

### Migrations

1. `pnpm prisma migrate dev --name add_notifications` em `apps/backend`
2. Deploy: `prisma migrate deploy`

### Upsert DeviceToken

```text
UPSERT device_tokens ON (firebase_uid, token)
  SET platform = :platform,
      is_active = true,
      last_seen_at = NOW(),
      updated_at = NOW()
```

Implementação Prisma: `upsert` com `where: { firebaseUid_token: { firebaseUid, token } }`.

### Deactivate on Logout

```text
UPDATE device_tokens
  SET is_active = false, updated_at = NOW()
  WHERE firebase_uid = :uid AND token = :token
```

Idempotente: 0 rows affected → sucesso silencioso.

---

## Security Design

| Concern | Approach |
|---------|----------|
| **Authentication** | `FirebaseAuthGuard` em todos os endpoints `/notifications*`; valida `Authorization: Bearer <id-token>` |
| **Authorization** | `firebaseUid` extraído do token; use cases operam **apenas** no uid autenticado — sem acesso cross-user |
| **Input validation** | `class-validator`: `token` não vazio (min 10 chars); `platform` enum; `enabled` boolean |
| **Data minimization** | Token FCM nunca retornado na resposta API; logs truncam token (primeiros 8 chars + `...`) |
| **Guest users** | Endpoints exigem auth — convidados não registram token (fora de escopo MVP) |
| **Rate limiting** | Throttler NestJS (ver API Design) |
| **Logging** | Logar `requestId`, `firebaseUid`, `deviceTokenId`; **nunca** token FCM completo |

### Variáveis de ambiente

Nenhuma variável nova neste bolt. Firebase Admin já configurado para auth guard.

Variáveis FCM reservadas para bolt **017**:
```env
# Reservado para bolt 017
FCM_ENABLED=true
```

---

## NFR Implementation

| Requirement | Design Approach |
|-------------|-----------------|
| **Performance (p95 registro < 500ms)** | Upsert indexado; sem chamadas externas; transação mínima (upsert token + optional create preference) |
| **Scalability** | Stateless API; até 10k tokens ativos MVP; N tokens por usuário |
| **Reliability** | Upsert idempotente; deactivate idempotente; preferência default lazy-create |
| **Maintainability** | Port `PushNotificationProvider` isolada; bolt 017 pluga adapter FCM |
| **Privacy (LGPD)** | Payload genérico validado no VO; token não exposto em responses/logs |
| **Observability** | `X-Request-Id`; log estruturado em eventos domain (token registered/deactivated) |

---

## Error Handling

| Error Type | HTTP | `error.code` | Quando |
|------------|------|--------------|--------|
| Token ausente/inválido | 401 | `UNAUTHORIZED` | Guard Firebase |
| Validação DTO | 400 | `VALIDATION_ERROR` | token vazio, platform inválida, enabled não boolean |
| Domínio: token inválido | 400 | `VALIDATION_ERROR` | `FcmToken` VO rejeita |
| Domínio: platform inválida | 400 | `VALIDATION_ERROR` | `DevicePlatform` VO rejeita |
| Rate limit | 429 | `RATE_LIMITED` | Throttler |
| Erro interno | 500 | `INTERNAL_ERROR` | Falha Prisma |

**Domain errors**:
- `InvalidFcmTokenError`
- `InvalidDevicePlatformError`
- `InvalidFirebaseUidError`

Use cases retornam `Result<T, E>`; `HttpExceptionFilter` converte para envelope padronizado.

---

## External Dependencies

| Service | Purpose | Integration |
|---------|---------|-------------|
| **Supabase Postgres** | Persistência token/preferência | Prisma |
| **Firebase Admin SDK** | Validar ID token | Reutilizar `shared/auth` |
| **FCM** | — | **Não usado neste bolt** (bolt 017) |

### Pacotes npm

Nenhum pacote novo obrigatório neste bolt — reutiliza stack existente (`firebase-admin`, `class-validator`, `@nestjs/swagger`, `@nestjs/throttler`).

---

## Application Use Cases

| Use Case | Input | Output | Notas |
|----------|-------|--------|-------|
| `RegisterDeviceTokenUseCase` | `firebaseUid`, `token`, `platform` | `Result<DeviceToken>` | Upsert; `getOrCreateDefault` preference se ausente; log `DeviceTokenRegistered` |
| `UpdateNotificationPreferenceUseCase` | `firebaseUid`, `enabled` | `Result<NotificationPreference>` | Upsert; log `NotificationPreferenceUpdated` |
| `DeactivateDeviceTokenUseCase` | `firebaseUid`, `token` | `Result<void>` | Idempotente; log `DeviceTokenDeactivated` |
| `GetNotificationPreferenceUseCase` | `firebaseUid` | `Result<NotificationPreference>` | Retorna existente ou default `enabled=true` |

### Fluxo RegisterDeviceToken

```text
1. Validar VOs (FirebaseUid, FcmToken, DevicePlatform)
2. DeviceTokenRepository.upsert(...)
3. NotificationPreferenceRepository.getOrCreateDefault(firebaseUid)
4. Retornar DeviceToken (sem token na response DTO)
```

---

## Module Wiring

```text
NotificationsModule
  imports: [AuthModule, PrismaModule]
  controllers: [NotificationsController]
  providers: [
    RegisterDeviceTokenUseCase,
    UpdateNotificationPreferenceUseCase,
    DeactivateDeviceTokenUseCase,
    GetNotificationPreferenceUseCase,
    { provide: DEVICE_TOKEN_REPOSITORY, useClass: PrismaDeviceTokenRepository },
    { provide: NOTIFICATION_PREFERENCE_REPOSITORY, useClass: PrismaNotificationPreferenceRepository },
    PushNotificationPayloadPolicy,
  ]
  exports: [
    DEVICE_TOKEN_REPOSITORY,
    NOTIFICATION_PREFERENCE_REPOSITORY,
    // PushNotificationProvider exportado no bolt 017
  ]
```

Registrar `NotificationsModule` em `AppModule`.

---

## Test Strategy (design → Stage 5)

| Tipo | Alvo |
|------|------|
| **Unit** | VOs (`FcmToken`, `DevicePlatform`); `PushNotificationPayloadPolicy`; use cases com mocks de port |
| **Integration** | Repositories Prisma (upsert, deactivate, preference default); controller com guard mockado |
| **Security** | 401 sem token; 401 token inválido; token não vaza na response |
| **E2E smoke** | PUT device-token → GET preferences → PUT preferences → DELETE device-token |

**Coverage target**: domínio + use cases + endpoints críticos (>80% no módulo).

---

## Stories Mapping

| Story | Entregável técnico |
|-------|-------------------|
| **001-notifications-domain-model** | Prisma models + migration; entities; VOs; ports; `PushNotificationPayloadPolicy`; interface `PushNotificationProvider` |
| **002-token-preference-api** | Controller REST; Firebase guard; PUT/DELETE device-token; PUT/GET preferences; envelope; OpenAPI |

---

## Implement Checklist (Stage 4)

- [ ] Adicionar models Prisma + migration
- [ ] Criar módulo `notifications` (domain → presentation)
- [ ] Implementar repositórios Prisma
- [ ] Implementar use cases
- [ ] Controller + DTOs + mapper
- [ ] Declarar port `PushNotificationProvider` (interface only)
- [ ] Registrar `NotificationsModule` em `AppModule`
- [ ] Swagger tag `notifications`

---

## Fora de escopo (bolt 017+)

- `FirebasePushNotificationProvider` adapter
- Jobs lembrete/dicas
- Trigger resposta IA
- Evento analytics `notification_sent`
- Evento `notification_token_registered` (pode ser log-only neste bolt; analytics formal no 018)
