---
unit: 003-ai-assistant-api
bolt: 004-ai-assistant-api
stage: design
status: complete
created: 2026-06-01T18:30:00Z
---

# Technical Design - AI Assistant API (Bolt 004)

## Architecture Pattern

**Modular monolith NestJS + DDD hexagonal** (alinhado a `system-architecture.md`, `coding-standards.md` e padrão do módulo `knowledge-base` em `apps/backend`).

**Rationale**:
- Bolt **004** entrega persistência Prisma + endpoints REST autenticados + stub de resposta.
- Domínio isolado de Prisma via ports `ConversationRepository` e `MessageRepository`.
- Autenticação Firebase centralizada em módulo compartilhado `shared/auth` (primeira implementação server-side — mobile já autentica via bolt `001`).
- Port `AssistantReplyGenerator` permite trocar stub por Gemini no bolt **005** sem alterar use cases.

---

## Layer Structure

```text
apps/backend/
├── prisma/
│   └── schema.prisma              # + Conversation, Message
├── src/
│   ├── main.ts                    # + Swagger, global filters, request-id
│   ├── app.module.ts              # + ConversationsModule, AuthModule
│   ├── shared/
│   │   ├── prisma/
│   │   ├── auth/                  # NOVO — Firebase guard + decorator
│   │   │   ├── auth.module.ts
│   │   │   ├── firebase-auth.guard.ts
│   │   │   ├── firebase-admin.provider.ts
│   │   │   └── current-user.decorator.ts
│   │   ├── http/
│   │   │   ├── request-id.middleware.ts
│   │   │   ├── api-response.interceptor.ts
│   │   │   └── http-exception.filter.ts
│   │   └── result.ts
│   └── modules/
│       └── conversations/
│           ├── conversations.module.ts
│           ├── domain/
│           │   ├── entities/
│           │   │   ├── conversation.entity.ts
│           │   │   └── message.entity.ts
│           │   ├── value-objects/
│           │   │   ├── message-content.vo.ts
│           │   │   ├── conversation-status.vo.ts
│           │   │   └── message-role.vo.ts
│           │   ├── services/
│           │   │   └── conversation-ownership.policy.ts
│           │   └── errors/
│           │       └── domain.errors.ts
│           ├── application/
│           │   ├── ports/
│           │   │   ├── conversation.repository.ts
│           │   │   ├── message.repository.ts
│           │   │   └── assistant-reply.generator.ts
│           │   └── use-cases/
│           │       ├── create-conversation.use-case.ts
│           │       ├── list-conversations.use-case.ts
│           │       ├── get-conversation.use-case.ts
│           │       └── send-message.use-case.ts
│           ├── infrastructure/
│           │   ├── persistence/
│           │   │   ├── prisma-conversation.repository.ts
│           │   │   └── prisma-message.repository.ts
│           │   └── assistant/
│           │       └── stub-assistant-reply.generator.ts
│           └── presentation/
│               ├── conversations.controller.ts
│               └── dto/
│                   ├── create-conversation.dto.ts
│                   ├── send-message.dto.ts
│                   └── list-conversations.query.dto.ts
```

**Responsabilidades por camada**:

| Camada | Responsabilidade neste bolt |
|--------|----------------------------|
| **Domain** | Entidades, VOs, `ConversationOwnershipPolicy`, erros de domínio |
| **Application** | Ports, use cases (`Create`, `List`, `Get`, `SendMessage`) |
| **Infrastructure** | Adapters Prisma, `StubAssistantReplyGenerator` |
| **Presentation** | Controller REST, DTOs, guards, envelope HTTP |
| **Shared/Auth** | Firebase Admin SDK, guard global nos endpoints protegidos |

---

## API Design

Prefixo global: `/api/v1` (já configurado). Envelope conforme `api-conventions.md`.

### Endpoints

| Endpoint | Method | Auth | Request | Response `data` |
|----------|--------|------|---------|-----------------|
| `/conversations` | POST | Firebase | `{ "topicSlug"?: string }` | `ConversationSummary` |
| `/conversations` | GET | Firebase | `?page=1&limit=20` | `ConversationSummary[]` + meta paginação |
| `/conversations/:id` | GET | Firebase | — | `ConversationDetail` (com mensagens) |
| `/conversations/:id/messages` | POST | Firebase | `{ "content": string }` | `MessageDto` (assistant reply) |

### Schemas (DTOs)

**ConversationSummary**:
```json
{
  "id": "cuid",
  "topicSlug": "fazer-pix",
  "status": "in_progress",
  "currentStep": 0,
  "createdAt": "2026-06-01T18:00:00.000Z",
  "updatedAt": "2026-06-01T18:00:00.000Z"
}
```

**ConversationDetail** = `ConversationSummary` + `messages: MessageDto[]`

**MessageDto**:
```json
{
  "id": "cuid",
  "role": "assistant",
  "content": "Recebi sua mensagem: ...",
  "createdAt": "2026-06-01T18:01:00.000Z"
}
```

**Envelope sucesso** (exemplo POST message):
```json
{
  "data": {
    "id": "cuid",
    "role": "assistant",
    "content": "Recebi sua mensagem: Olá",
    "createdAt": "2026-06-01T18:01:00.000Z"
  },
  "meta": {
    "requestId": "uuid"
  }
}
```

**Envelope lista**:
```json
{
  "data": [ /* ConversationSummary[] */ ],
  "meta": {
    "requestId": "uuid",
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1
  }
}
```

### OpenAPI / Swagger

- Pacote: `@nestjs/swagger`
- Rota docs: `/api/docs` (dev/staging)
- Tags: `conversations`
- Documentar: auth Bearer, envelope, códigos 401/404/400/409
- DTOs decorados com `@ApiProperty`

### Rate Limiting

- Pacote: `@nestjs/throttler` (MVP básico)
- Limite sugerido: **30 req/min** por IP nos endpoints de chat
- POST `/conversations/:id/messages`: **10 req/min** (proteção contra spam)
- Resposta 429 com `error.code: RATE_LIMITED`

---

## Data Persistence

### Prisma Schema (adição)

```prisma
enum ConversationStatus {
  in_progress
  completed

  @@map("conversation_status")
}

enum MessageRole {
  user
  assistant

  @@map("message_role")
}

model Conversation {
  id           String             @id @default(cuid())
  firebaseUid  String             @map("firebase_uid") @db.VarChar(128)
  topicSlug    String?            @map("topic_slug") @db.VarChar(64)
  status       ConversationStatus @default(in_progress)
  currentStep  Int                @default(0) @map("current_step")
  createdAt    DateTime           @default(now()) @map("created_at")
  updatedAt    DateTime           @updatedAt @map("updated_at")
  messages     Message[]

  @@index([firebaseUid, createdAt(sort: Desc)])
  @@map("conversations")
}

model Message {
  id             String      @id @default(cuid())
  conversationId String      @map("conversation_id")
  role           MessageRole
  content        String      @db.VarChar(4000)
  createdAt      DateTime    @default(now()) @map("created_at")
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@index([conversationId, createdAt(sort: Asc)])
  @@map("messages")
}
```

### Relacionamentos

| Tabela | PK | FK | Cardinalidade |
|--------|----|----|---------------|
| `conversations` | `id` | — | 1 → N messages |
| `messages` | `id` | `conversation_id` → `conversations.id` | N → 1 conversation |

### Índices

- `conversations.(firebase_uid, created_at DESC)` — listagem paginada por usuário
- `messages.(conversation_id, created_at ASC)` — histórico ordenado

### Migrations

1. `pnpm prisma migrate dev --name add_conversations` em `apps/backend`
2. Deploy: `prisma migrate deploy`

### Transação `SendMessage`

```text
BEGIN
  SELECT conversation FOR UPDATE WHERE id = :id AND firebase_uid = :uid
  IF status != in_progress → ROLLBACK (409)
  INSERT message (user)
  CALL stub generator
  INSERT message (assistant)
  UPDATE conversation.updated_at
COMMIT
```

Implementação via `$transaction` do Prisma no adapter ou use case orquestrando repositório unit-of-work.

---

## Security Design

| Concern | Approach |
|---------|----------|
| **Authentication** | `FirebaseAuthGuard` em todos os endpoints `/conversations*`; valida `Authorization: Bearer <id-token>` via Firebase Admin SDK |
| **Authorization** | `firebase_uid` extraído do token (`request.user.uid`); use cases filtram por ownership; 404 (não 403) quando conversa de outro usuário — evita enumeração de IDs |
| **Input validation** | `class-validator` nos DTOs: `content` 1–4000 chars; `topicSlug` kebab-case opcional |
| **Rate limiting** | Throttler NestJS (ver API Design) |
| **Logging** | Logar `requestId`, `firebase_uid`, `conversationId`; **nunca** token ou conteúdo completo de mensagem em produção |
| **Gemini key** | `GEMINI_API_KEY` no `.env`; **não usada** neste bolt; não expor em logs |

### Variáveis de ambiente (`.env.example`)

```env
# Firebase Admin (validação de tokens)
FIREBASE_PROJECT_ID=
# Opcional: caminho para service account JSON (Render/prod)
GOOGLE_APPLICATION_CREDENTIALS=

# Reservado para bolt 005 (não usado neste bolt)
GEMINI_API_KEY=
```

**MVP local**: Firebase Admin pode inicializar com `applicationDefault()` ou credenciais de service account. Documentar setup no README da API.

---

## NFR Implementation

| Requirement | Design Approach |
|-------------|-----------------|
| **Performance** | Listagem paginada (default 20); GET detail com mensagens limitado a conversa única; índices compostos |
| **Scalability** | Stateless API; Postgres Supabase; stub reply sem latência externa |
| **Reliability** | Transação atômica em `SendMessage`; idempotência não exigida no MVP |
| **Maintainability** | Port `AssistantReplyGenerator` desacoplado; substituição por Gemini no bolt 005 |
| **Observability** | `X-Request-Id` middleware; logs estruturados (Pino opcional MVP — console aceitável) |
| **Latência p95 < 8s** | Trivial com stub; meta relevante no bolt 005 com LLM |

---

## Error Handling

| Error Type | HTTP | `error.code` | Quando |
|------------|------|--------------|--------|
| Token ausente/inválido | 401 | `UNAUTHORIZED` | Guard Firebase |
| Validação DTO | 400 | `VALIDATION_ERROR` | `content` vazio, slug inválido |
| Conversa não encontrada / não owner | 404 | `NOT_FOUND` | ID inexistente ou de outro usuário |
| Conversa `completed` | 409 | `CONVERSATION_CLOSED` | POST message em conversa encerrada |
| Rate limit | 429 | `RATE_LIMITED` | Throttler |
| Erro interno | 500 | `INTERNAL_ERROR` | Falha Prisma/Firebase |

Domínio usa `Result<T, E>` nos use cases; `HttpExceptionFilter` converte para envelope padronizado.

**Domain errors**:
- `ConversationNotFoundError`
- `ConversationClosedError`
- `InvalidMessageContentError`
- `ForbiddenConversationAccessError` → mapeado para 404

---

## External Dependencies

| Service | Purpose | Integration |
|---------|---------|-------------|
| **Supabase Postgres** | Persistência conversas/mensagens | Prisma |
| **Firebase Admin SDK** | Validar ID token | `firebase-admin` npm |
| **Gemini** | — | **Não usado neste bolt** (bolt 005) |

### Pacotes npm (adições)

| Pacote | Uso |
|--------|-----|
| `firebase-admin` | Auth guard |
| `@nestjs/swagger` | OpenAPI |
| `class-validator`, `class-transformer` | DTOs |
| `@nestjs/throttler` | Rate limiting |

---

## Application Use Cases

| Use Case | Input | Output | Notas |
|----------|-------|--------|-------|
| `CreateConversationUseCase` | `firebaseUid`, `topicSlug?` | `Result<Conversation>` | Status `in_progress`, `currentStep=0` |
| `ListConversationsUseCase` | `firebaseUid`, pagination | `Result<{ items, total }>` | Ordenado por `updatedAt DESC` |
| `GetConversationUseCase` | `firebaseUid`, `conversationId` | `Result<ConversationWithMessages>` | Ownership check |
| `SendMessageUseCase` | `firebaseUid`, `conversationId`, `content` | `Result<Message>` | Persiste user+assistant; retorna assistant |

---

## Stub Assistant Reply

**Classe**: `StubAssistantReplyGenerator` implements `AssistantReplyGenerator`

**Comportamento MVP**:
```text
input: { conversationId, userMessage, topicSlug? }
output: "Recebi sua mensagem: {userMessage}. (Resposta automática — assistente completo em breve.)"
```

- Sem chamada HTTP externa
- Determinístico para testes
- Substituído por `GeminiAssistantReplyGenerator` no bolt 005

---

## Test Strategy (design → Stage 5)

| Tipo | Alvo |
|------|------|
| **Unit** | VOs (`MessageContent`), `ConversationOwnershipPolicy`, use cases com mocks de port |
| **Integration** | Repositories Prisma; controller com guard mockado |
| **Security** | 401 sem token; 401 token inválido; 404 conversa de outro usuário |
| **E2E smoke** | POST conversation → POST message → GET list |

---

## Stories Mapping

| Story | Entregável técnico |
|-------|-------------------|
| **001-conversation-persistence** | Prisma models + migration; entities; repositories; persistência user/assistant com timestamps |
| **005-chat-message-api** | Controller REST; Firebase guard; envelope; paginação; POST message stub; OpenAPI; rate limit |

---

## Implement Checklist (Stage 4)

- [ ] Adicionar models Prisma + migration
- [ ] Criar `shared/auth` (Firebase Admin + guard + `@CurrentUser()`)
- [ ] Criar módulo `conversations` (domain → presentation)
- [ ] Implementar `StubAssistantReplyGenerator`
- [ ] HTTP layer: request-id, exception filter, response interceptor
- [ ] Swagger em `/api/docs`
- [ ] Atualizar `.env.example` com Firebase vars
- [ ] Registrar `ConversationsModule` e `AuthModule` em `AppModule`
