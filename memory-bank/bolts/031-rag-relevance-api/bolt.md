---
id: 031-rag-relevance-api
unit: 001-rag-relevance-api
intent: 007-rag-relevance
type: ddd-construction-bolt
status: complete
stories:
  - 001-normalize-and-fuzzy-match
  - 002-topic-alias-corpus
  - 003-never-inject-wrong-topic
created: 2026-09-15T00:30:00.000Z
started: 2026-09-15T00:39:00.000Z
completed: "2026-09-15T01:01:25Z"
current_stage: null
stages_completed:
  - name: domain-model
    completed: 2026-09-15T00:41:00.000Z
    artifact: ddd-01-domain-model.md
  - name: technical-design
    completed: 2026-09-15T00:43:00.000Z
    artifact: ddd-02-technical-design.md
  - name: adr-analysis
    completed: 2026-09-15T00:43:00.000Z
    artifact: adr-012…015
  - name: implement
    completed: 2026-09-15T00:56:00.000Z
    artifact: apps/backend/src/modules/conversations
requires_bolts: []
enables_bolts:
  - 032-rag-relevance-api
requires_units: []
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: 031-rag-relevance-api

## Overview

Corrige a raiz do matching: normalização (hífen/acento), corpus de aliases,
keywords genéricas sem ganhar sozinhas, e retriever que **não** injeta nem
gruda o tópico errado.

## Objective

Pergunta de Wi-Fi (qualquer grafia do corpus) produz contexto RAG de Wi-Fi —
nunca Gov.br. Inferência sem LLM, < 50ms.

## Stories Included

- **001-normalize-and-fuzzy-match**: Normalização e fuzzy (Must)
- **002-topic-alias-corpus**: Aliases + peso de keywords (Must)
- **003-never-inject-wrong-topic**: Retrieval e prompt só do tópico certo (Must)

## Bolt Type

**Type**: DDD Construction Bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/ddd-construction-bolt.md`

## Stages

- [ ] **1. Domain Model**: Pending → ddd-01-domain-model.md
- [ ] **2. Technical Design**: Pending → ddd-02-technical-design.md
- [ ] **3. ADR Analysis**: Optional → só se surgir decisão (ex.: onde viver aliases)
- [ ] **4. Implement**: Pending → `apps/backend/src/modules/conversations` + seed knowledge-base
- [ ] **5. Test**: Pending → ddd-03-test-report.md

## Dependencies

### Requires
- Código existente de `002-knowledge-base` e `003-ai-assistant-api` (já complete)

### Enables
- **032-rag-relevance-api**: modos clarify/geral, troca de tópico, suite completa

## Success Criteria

- [ ] `wi-fi` / `wifi` / `uifi` inferem Wi-Fi
- [ ] “código QR do wifi” não escolhe Gov.br
- [ ] Keyword `codigo` sozinha não vira Gov.br
- [ ] Retriever não reusa `topicSlug` antigo contra mensagem nova com outro tópico
- [ ] Testes de policy/retriever sem Gemini

## Notes

Três bugs conhecidos a matar neste bolt: `includes('wifi')` vs `wi-fi`; empate
com primeiro da lista (`displayOrder`); `topicSlug` persistido curto-circuita
a inferência.
