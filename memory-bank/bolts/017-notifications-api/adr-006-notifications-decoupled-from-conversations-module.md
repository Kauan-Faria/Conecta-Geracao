---
bolt: 017-notifications-api
created: 2026-06-09T21:46:44Z
status: accepted
---

# ADR-006: NotificationsModule desacoplado do ConversationsModule nos triggers push

## Context

O bolt `017-notifications-api` precisa enviar push quando conversas ficam inativas (job cron) e quando a IA responde com o app em background (hook pós-`SendMessageUseCase`). Ambos os fluxos dependem de dados de conversas (`conversationId`, `firebaseUid`, `lastActivityAt`, `status`).

Há tentação de:
- Importar `ConversationsModule` no `NotificationsModule` e injetar `SendMessageUseCase` ou repositórios internos de chat
- Ou criar dependência bidirecional entre módulos NestJS

Isso acoplaria bounded contexts (Notifications vs Conversations), dificultaria testes isolados e violaria o princípio já estabelecido em ADR-005 (desacoplamento chat ↔ maps via ports/handoff).

## Decision

Integração **unidirecional e via ports hexagonais**:

1. **`NotificationsModule` NÃO importa `ConversationsModule`**
2. **Leitura de conversas abandonadas**: port `AbandonedConversationQuery` implementado por adapter Prisma (`PrismaAbandonedConversationQuery`) que consulta tabelas `conversations` + `messages` **read-only** — sem injetar use cases de chat
3. **Trigger resposta IA**: port `AssistantReplyNotificationTrigger` **implementado** em Notifications e **exportado**; `ConversationsModule` importa `NotificationsModule` **apenas** para obter o token DI exportado
4. **`SendMessageUseCase`** chama `onAssistantReplyReady(...)` **fire-and-forget** (`.catch(log)`) — falha de push não falha resposta de chat
5. **`appInBackground`** propagado pelo cliente via header `X-App-State` na presentation de conversations — notifications não infere estado do app

## Rationale

- Separação clara: chat = orquestração LLM + persistência mensagens; notifications = elegibilidade + FCM + cooldown
- Job de lembretes roda sem acoplar lifecycle do ConversationsModule
- Falha FCM não degrada UX de chat (resposta HTTP OK)
- Alinha com ADR-005: bounded contexts comunicam por contratos, não por DI interno cruzado
- Adapter Prisma read-only é pragmático no modular monolith MVP — evita event bus inexistente

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Notifications importa ConversationsModule + DI repositório | Tipagem forte via port exportado | Acoplamento NestJS module-level; risco circular | Notifications não deve depender de chat |
| Event bus async (chat emite, notifications consome) | Desacoplamento temporal | Infra inexistente no MVP | Over-engineering |
| Endpoint REST interno GET /conversations/abandoned | Fronteira HTTP explícita | Latência extra; auth interno | Desnecessário no monolith |
| Notifications polling via SendMessageUseCase | Simples | Invertido; chat conhece job schedule | Responsabilidade errada |

## Consequences

### Positive

- `SendMessageUseCase` testável com mock do trigger apenas
- Job de lembretes independente do módulo de chat
- NotificationsModule evolui (FCM, campanhas bolt 018) sem alterar chat

### Negative

- Adapter Prisma lê schema de conversas — acoplamento de schema (não de código DI)
- Mudança de schema em `conversations`/`messages` pode quebrar query do adapter

### Risks

- **Schema drift**: mitigado por testes de integração em `PrismaAbandonedConversationQuery` e documentação do contrato `AbandonedConversationSnapshot`
- **Dependência Conversations → Notifications**: mitigado importando apenas token exportado, não use cases internos de FCM

## Related

- **Stories**: 004-conversation-notification-triggers
- **Standards**: `coding-standards.md` (hexagonal), `system-architecture.md`
- **Previous ADRs**: ADR-005 (ConversationsModule desacoplado do MapsModule)
