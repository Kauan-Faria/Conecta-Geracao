---
unit: 003-ai-assistant-api
bolt: 005-ai-assistant-api
stage: model
status: complete
created: 2026-06-01T21:00:00Z
---

# Static Model - AI Assistant Intelligence (Bolt 005)

## Bounded Context

**AI Assistant — Intelligence** — orquestração RAG, fluxo de checkpoints e guardrails LGPD sobre o agregado `Conversation` já persistido no bolt **004**. Substitui o stub `AssistantReplyGenerator` por pipeline Gemini + base de conhecimento.

**Fronteiras**:
- **Dentro**: ports `KnowledgeRetriever`, `LlmProvider`; domain services `SensitiveContentPolicy`, `CheckpointResponsePolicy`; evolução de `currentStep` no agregado.
- **Fora**: persistência de conversas (004), curadoria KB (003), UI (006).

---

## Domain Entities (extensão)

| Entity | Properties | Business Rules |
|--------|------------|----------------|
| **Conversation** | `currentStep` (existente) | `currentStep` = índice 0-based do passo ativo na knowledge base; avança só após confirmação positiva do usuário; em resposta negativa permanece no mesmo passo |
| **Message** | (inalterado) | Histórico recente alimenta contexto LLM (últimos N turnos) |

---

## Value Objects

| Value Object | Properties | Constraints |
|--------------|------------|-------------|
| **KnowledgeContext** | `topicSlug?`, `title`, `steps[]`, `availableTopics[]` | Contexto RAG montado a partir de slug ou inferência por keywords |
| **AssistantReply** | `content`, `nextCurrentStep` | `content` passa por guardrails de saída; `nextCurrentStep` ≥ 0 |
| **CheckpointDecision** | `advance` \| `repeat` \| `unchanged` | Derivado da mensagem do usuário (sim/não) |

---

## Domain Services

| Service | Operations | Dependencies |
|---------|------------|--------------|
| **SensitiveContentPolicy** | `containsSensitiveInput(text)`, `sanitizeForLog(text)`, `refusalMessage()` | Padrões: senha, token, OTP, PIN, código de verificação |
| **CheckpointResponsePolicy** | `evaluate(userMessage): CheckpointDecision` | Regex/heurística PT-BR: sim/não/consegui/travei |
| **TopicInferencePolicy** | `inferSlug(message, topics): slug \| null` | Score por keywords dos 6 tópicos MVP |

---

## Application Ports

| Port | Methods | Implementação |
|------|---------|---------------|
| **KnowledgeRetriever** | `retrieve({ topicSlug?, userMessage })` | `PrismaKnowledgeRetriever` |
| **LlmProvider** | `generate({ systemPrompt, userPrompt })` | `GeminiLlmProvider` |
| **AssistantReplyGenerator** *(estendido)* | `generateReply(input): AssistantReply` | `GeminiAssistantReplyGenerator` (orquestra RAG + policies + LLM) |

---

## Ubiquitous Language

| Term | Definition |
|------|------------|
| **RAG** | Injeção de passos/instruções da knowledge base no prompt |
| **Checkpoint** | Pergunta de confirmação após cada instrução (ex.: "Conseguiu abrir o app?") |
| **Guardrail** | Filtro que bloqueia pedidos/recebimento de credenciais |
| **currentStep** | Índice do passo ativo no fluxo guiado |

---

## Stories Coverage

| Story | Cobertura |
|-------|-----------|
| **002-rag-orchestration** | `KnowledgeRetriever`, `TopicInferencePolicy`, contexto no prompt |
| **003-checkpoint-dialog-flow** | `CheckpointResponsePolicy`, atualização `currentStep`, regra no system prompt |
| **004-guardrails-security** | `SensitiveContentPolicy`, recusa sem LLM, mascaramento em logs |
