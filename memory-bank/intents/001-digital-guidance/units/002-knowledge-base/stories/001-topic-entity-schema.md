---
id: 001-topic-entity-schema
unit: 002-knowledge-base
intent: 001-digital-guidance
status: complete
priority: must
created: 2026-05-28T01:00:00.000Z
assigned_bolt: 002-knowledge-base
implemented: true
---

# Story: 001-topic-entity-schema

## User Story

**As a** sistema
**I want** armazenar tópicos, passos e checkpoints de forma estruturada
**So that** a IA consulte conteúdo confiável via RAG

## Acceptance Criteria

- [ ] **Given** schema Prisma definido, **When** aplico migration, **Then** existem tabelas Topic, Step (com order, instruction, checkpointQuestion)
- [ ] **Given** um tópico, **When** consulto passos, **Then** retornam ordenados por `order`
- [ ] **Given** slug único, **When** busco por slug, **Then** retorno um único tópico

## Technical Notes

- Módulo NestJS `knowledge-base` com DDD hexagonal
- Slug kebab-case: `fazer-pix`, `codigo-govbr`, etc.

## Dependencies

### Requires
- None

### Enables
- 002-seed-six-mvp-topics
