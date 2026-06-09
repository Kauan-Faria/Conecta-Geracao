---
id: 003-knowledge-retrieval-api
unit: 002-knowledge-base
intent: 001-digital-guidance
status: draft
priority: must
created: 2026-05-28T01:00:00Z
assigned_bolt: 003-knowledge-base
implemented: true
---

# Story: 003-knowledge-retrieval-api

## User Story

**As a** módulo de IA
**I want** consultar tópicos e passos via API interna
**So that** monte contexto RAG para respostas precisas

## Acceptance Criteria

- [x] **Given** slug válido, **When** GET `/api/v1/knowledge/topics/:slug`, **Then** retorno tópico com passos ordenados (auth required)
- [x] **Given** query de busca, **When** GET `/api/v1/knowledge/search?q=`, **Then** retorno tópicos matching keywords
- [x] **Given** resposta, **When** formato envelope, **Then** segue `api-conventions.md`

## Technical Notes

- Port `KnowledgeRepository` na application layer
- Endpoint usado pelo `003-ai-assistant-api`, não exposto ao mobile diretamente se RAG for só server-side

## Dependencies

### Requires
- 002-seed-six-mvp-topics

### Enables
- 002-rag-orchestration
