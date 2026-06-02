---
unit: 003-ai-assistant-api
bolt: 004-ai-assistant-api
stage: model
status: complete
created: 2026-06-01T18:00:00Z
---

# Static Model - AI Assistant API (Bolt 004)

## Bounded Context

**AI Assistant — Conversations** — contexto responsável por persistir sessões de chat e expor endpoints REST autenticados para criar conversas, listar histórico e enviar mensagens. Neste bolt (**004**), a resposta do assistente é **stub/echo** (sem orquestração RAG/LLM). Integração Gemini fica para o bolt **005-ai-assistant-api**.

**Fronteiras**:
- **Dentro**: entidades `Conversation` e `Message`; CRUD de conversas; POST mensagem com persistência user + assistant; validação de ownership por `firebase_uid`; port para geração de resposta (stub).
- **Fora**: orquestração RAG (`005`), checkpoints no prompt (`005`), guardrails LGPD completos (`005`), UI mobile (`006-digital-guidance-ui`), curadoria de conteúdo (`002-knowledge-base`).

---

## Domain Entities

| Entity | Properties | Business Rules |
|--------|------------|----------------|
| **Conversation** | `id`, `firebaseUid`, `topicSlug?`, `status`, `currentStep`, `createdAt`, `updatedAt` | Pertence a um único usuário (`firebaseUid` imutável); `status` ∈ `in_progress` \| `completed`; `currentStep` ≥ 0 (0 = início); `topicSlug` opcional, referência lógica a slug da knowledge base (sem FK obrigatória no MVP); usuário só acessa conversas próprias |
| **Message** | `id`, `conversationId`, `role`, `content`, `createdAt` | Pertence a exatamente uma conversa; `role` ∈ `user` \| `assistant`; `content` não vazio (trim); `createdAt` ISO persistido; ordem cronológica por `createdAt`; mensagens imutáveis após criação |

---

## Value Objects

| Value Object | Properties | Constraints |
|--------------|------------|-------------|
| **FirebaseUid** | `value: string` | string não vazia; identificador estável do Firebase Auth; usado como chave de ownership |
| **ConversationStatus** | `value: 'in_progress' \| 'completed'` | transição `in_progress` → `completed` permitida; reversão proibida no MVP |
| **MessageRole** | `value: 'user' \| 'assistant'` | apenas valores do enum |
| **MessageContent** | `value: string` | 1–4000 chars após trim; rejeita string vazia |
| **TopicSlugRef** | `value: string` | opcional; se presente, kebab-case (`^[a-z0-9]+(-[a-z0-9]+)*$`); não valida existência no KB neste bolt |
| **PaginationParams** | `page`, `limit` | `page` ≥ 1; `limit` 1–100 (default 20) |

---

## Aggregates

| Aggregate Root | Members | Invariants |
|----------------|---------|------------|
| **Conversation** | `Message[]` (coleção ordenada por `createdAt`) | `firebaseUid` obrigatório; mensagens só podem ser adicionadas se `status === in_progress`; toda mensagem `user` dispara geração de resposta `assistant` (stub neste bolt); conversa não pode ser deletada por outro usuário; listagem filtrada sempre por `firebaseUid` |

---

## Domain Events

| Event | Trigger | Payload |
|-------|---------|---------|
| **ConversationCreated** | Nova conversa persistida | `conversationId`, `firebaseUid`, `topicSlug?`, `occurredAt` |
| **MessageAdded** | Mensagem user ou assistant salva | `conversationId`, `messageId`, `role`, `occurredAt` |
| **ConversationCompleted** | Status alterado para `completed` | `conversationId`, `occurredAt` |

*Nota MVP*: eventos log-only na infraestrutura; sem event bus.

---

## Domain Services

| Service | Operations | Dependencies |
|---------|------------|--------------|
| **ConversationOwnershipPolicy** | `assertOwner(conversation, firebaseUid)` | Garante que operações só ocorrem no recurso do usuário autenticado |
| **AssistantReplyGenerator** *(port)* | `generateReply(input): Promise<MessageContent>` | **Stub neste bolt**: ecoa prefixo fixo ou mensagem placeholder; **Implementação Gemini no bolt 005** |

---

## Repository Interfaces (Ports)

| Repository | Entity | Methods |
|------------|--------|---------|
| **ConversationRepository** | `Conversation` | `create(conversation): Promise<Conversation>`; `findById(id): Promise<Conversation \| null>`; `findByIdForUser(id, firebaseUid): Promise<Conversation \| null>`; `listByUser(firebaseUid, pagination): Promise<{ items: Conversation[]; total: number }>`; `save(conversation): Promise<void>` |
| **MessageRepository** | `Message` | `create(message): Promise<Message>`; `listByConversationId(conversationId): Promise<Message[]>`; *(alternativa)* métodos encapsulados no repositório de conversa com transação |

**Contrato transacional (sendMessage)**:
- Carregar conversa + ownership
- Persistir mensagem `user`
- Invocar `AssistantReplyGenerator`
- Persistir mensagem `assistant`
- Retornar mensagem assistant ao caller

---

## Ubiquitous Language

| Term | Definition |
|------|------------|
| **Conversa (Conversation)** | Sessão de chat entre usuário e assistente, vinculada ao `firebase_uid` |
| **Mensagem (Message)** | Turno individual com role `user` ou `assistant` |
| **Status da conversa** | `in_progress` (ativa) ou `completed` (encerrada) |
| **Topic slug** | Referência opcional ao tópico da base de conhecimento (ex.: `fazer-pix`) |
| **Stub reply** | Resposta placeholder do assistente sem LLM real (escopo deste bolt) |
| **Ownership** | Regra de que cada conversa pertence a um único `firebase_uid` |

---

## Stories Coverage

| Story | Cobertura no modelo |
|-------|---------------------|
| **001-conversation-persistence** | Entidades `Conversation`, `Message`; VOs `FirebaseUid`, `ConversationStatus`, `MessageRole`, `MessageContent`; agregado com invariantes; ports `ConversationRepository`, `MessageRepository` |
| **005-chat-message-api** | Use cases implícitos: `CreateConversation`, `ListConversations`, `SendMessage`; port `AssistantReplyGenerator` (stub); `ConversationOwnershipPolicy`; paginação via `PaginationParams` |

---

## Diagrama (agregado)

```text
┌─────────────────────────────────────┐
│     Conversation (root)             │
│  firebaseUid, topicSlug?, status    │
│  currentStep, timestamps            │
├─────────────────────────────────────┤
│  messages: Message[]                │
│    ├─ role (user | assistant)       │
│    ├─ content                       │
│    └─ createdAt                     │
└─────────────────────────────────────┘
         │
         ├── ConversationRepository (port)
         ├── MessageRepository (port)
         └── AssistantReplyGenerator (port — stub)
```

---

## Nota sobre Gemini API

A chave `GEMINI_API_KEY` está configurada no ambiente para uso futuro. **Este bolt não invoca Gemini** — apenas define o port `AssistantReplyGenerator` com implementação stub. O bolt **005-ai-assistant-api** substituirá o adapter por integração real (RAG + LLM).
