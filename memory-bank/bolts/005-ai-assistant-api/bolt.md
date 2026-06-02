---
id: 005-ai-assistant-api
unit: 003-ai-assistant-api
intent: 001-digital-guidance
type: ddd-construction-bolt
status: planned
stories:
  - 002-rag-orchestration
  - 003-checkpoint-dialog-flow
  - 004-guardrails-security
created: 2026-05-28T01:00:00Z
started: null
completed: null
current_stage: null
stages_completed: []
requires_bolts:
  - 003-knowledge-base
  - 004-ai-assistant-api
enables_bolts:
  - 006-digital-guidance-ui
requires_units:
  - 002-knowledge-base
blocks: true
complexity:
  avg_complexity: 3
  avg_uncertainty: 2
  max_dependencies: 3
  testing_scope: 3
---

# Bolt: 005-ai-assistant-api

## Overview

Inteligência do assistente: RAG, checkpoints conversacionais e guardrails LGPD.

## Objective

Respostas da IA baseadas na base de conhecimento, com checkpoints e segurança.

## Stories Included

- **002-rag-orchestration**: Orquestração RAG + LLM (Must)
- **003-checkpoint-dialog-flow**: Fluxo de checkpoints (Must)
- **004-guardrails-security**: Guardrails LGPD (Must)

## Dependencies

### Requires
- 003-knowledge-base (conteúdo RAG)
- 004-ai-assistant-api (persistência + endpoints)

### Enables
- 006-digital-guidance-ui (chat completo)

## Success Criteria

- [ ] IA responde sobre 6 tópicos usando RAG
- [ ] Checkpoints funcionam (sim/não adapta fluxo)
- [ ] Guardrails bloqueiam pedidos de credenciais
