---
id: 002-rag-orchestration
unit: 003-ai-assistant-api
intent: 001-digital-guidance
status: complete
priority: must
created: 2026-05-28T01:00:00.000Z
assigned_bolt: 005-ai-assistant-api
implemented: true
---

# Story: 002-rag-orchestration

## User Story

**As a** usuário com dúvida sobre PIX
**I want** respostas baseadas no conteúdo oficial do app
**So that** receba orientação correta e não inventada

## Acceptance Criteria

- [ ] **Given** mensagem sobre tópico conhecido, **When** IA responde, **Then** contexto inclui chunks da base de conhecimento
- [ ] **Given** tópico inferido, **When** RAG executa, **Then** busca passos relevantes do slug correspondente
- [ ] **Given** tópico desconhecido, **When** usuário pergunta, **Then** IA sugere um dos 6 tópicos disponíveis

## Technical Notes

- Port `LlmProvider` + `KnowledgeRetriever` na application layer
- MVP: retrieval por slug/keywords; embeddings opcional na v2

## Dependencies

### Requires
- 003-knowledge-retrieval-api

### Enables
- 003-checkpoint-dialog-flow
