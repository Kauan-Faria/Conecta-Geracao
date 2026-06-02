---
id: 002-seed-six-mvp-topics
unit: 002-knowledge-base
intent: 001-digital-guidance
status: complete
priority: must
created: 2026-05-28T01:00:00.000Z
assigned_bolt: 002-knowledge-base
implemented: true
---

# Story: 002-seed-six-mvp-topics

## User Story

**As a** usuário digital
**I want** que o assistente saiba orientar sobre tarefas comuns
**So that** receba passos corretos sobre PIX, Gov.br, WhatsApp, Wi-Fi, boleto e golpes

## Acceptance Criteria

- [ ] **Given** seed executado, **When** listo tópicos, **Then** existem exatamente 6: PIX, Gov.br (tutorial), WhatsApp contato/localização, Wi-Fi QR, 2ª via boleto, alerta golpe
- [ ] **Given** cada tópico, **When** consulto passos, **Then** há ≥ 3 passos com checkpointQuestion em passos-chave
- [ ] **Given** tópico Gov.br, **When** leio conteúdo, **Then** é educativo e não menciona integração de login

## Technical Notes

- Seed via Prisma seed ou JSON importado; revisão humana do conteúdo
- Linguagem simples, frases curtas

## Dependencies

### Requires
- 001-topic-entity-schema

### Enables
- 003-knowledge-retrieval-api
