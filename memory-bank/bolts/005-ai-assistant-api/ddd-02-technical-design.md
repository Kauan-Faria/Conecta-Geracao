---
unit: 003-ai-assistant-api
bolt: 005-ai-assistant-api
stage: design
status: complete
created: 2026-06-01T21:15:00Z
---

# Technical Design - AI Assistant Intelligence (Bolt 005)

## Architecture Pattern

**Hexagonal + orquestrador único** no adapter `GeminiAssistantReplyGenerator`, reutilizando módulo `conversations` e export `KNOWLEDGE_TOPIC_REPOSITORY` do `KnowledgeBaseModule`.

## Componentes novos

```text
conversations/
├── domain/services/
│   ├── sensitive-content.policy.ts
│   ├── checkpoint-response.policy.ts
│   └── topic-inference.policy.ts
├── application/ports/
│   ├── knowledge-retriever.ts
│   └── llm-provider.ts
├── infrastructure/
│   ├── knowledge/prisma-knowledge-retriever.ts
│   └── assistant/
│       ├── gemini-llm.provider.ts
│       ├── rag-prompt.builder.ts
│       └── gemini-assistant-reply.generator.ts
```

## Fluxo SendMessage (atualizado)

```text
1. Load conversation + últimas 10 mensagens
2. AssistantReplyGenerator.generateReply({
     conversationId, userMessage, topicSlug, currentStep, messageHistory
   })
   a. SensitiveContentPolicy → recusa se input sensível
   b. KnowledgeRetriever → contexto RAG (slug ou inferência)
   c. CheckpointResponsePolicy → advance | repeat | unchanged
   d. RagPromptBuilder → system + user prompt
   e. GeminiLlmProvider → texto
   f. SensitiveContentPolicy → valida saída
   g. Retorna { content, nextCurrentStep }
3. UnitOfWork persiste user + assistant + currentStep
```

## Variáveis de ambiente

```env
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash
```

## Provider wiring

- `ConversationsModule` importa `KnowledgeBaseModule`
- `ASSISTANT_REPLY_GENERATOR` → `GeminiAssistantReplyGenerator` (se `GEMINI_API_KEY` ausente, falha explícita no bootstrap ou fallback documentado — usar Gemini obrigatório neste bolt)

## Testes

| Suite | Foco |
|-------|------|
| `sensitive-content.policy.spec` | Padrões senha/OTP |
| `checkpoint-response.policy.spec` | sim/não PT-BR |
| `topic-inference.policy.spec` | inferência slug |
| `rag-prompt.builder.spec` | prompt com checkpoint |
| `gemini-assistant-reply.generator.spec` | mock LlmProvider + retriever |

## Stories Mapping

| Story | Entregável |
|-------|------------|
| 002-rag-orchestration | `PrismaKnowledgeRetriever`, `TopicInferencePolicy` |
| 003-checkpoint-dialog-flow | `CheckpointResponsePolicy`, `currentStep` na transação |
| 004-guardrails-security | `SensitiveContentPolicy`, recusa + sanitize logs |
