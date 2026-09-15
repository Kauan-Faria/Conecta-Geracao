---
id: 032-rag-relevance-api
unit: 001-rag-relevance-api
intent: 007-rag-relevance
type: ddd-construction-bolt
status: complete
stories:
  - 004-low-confidence-clarification
  - 005-out-of-catalog-general-knowledge
  - 006-immediate-topic-switch
  - 007-relevance-regression-tests
created: 2026-09-15T00:30:00.000Z
started: 2026-09-15T01:10:00.000Z
completed: "2026-09-15T01:50:04Z"
current_stage: null
stages_completed:
  - name: domain-model
    completed: 2026-09-15T01:15:00.000Z
    artifact: ddd-01-domain-model.md
  - name: technical-design
    completed: 2026-09-15T01:20:00.000Z
    artifact: ddd-02-technical-design.md
  - name: adr-analysis
    completed: 2026-09-15T01:25:00.000Z
    artifact: adr-016…018
  - name: implement
    completed: 2026-09-15T01:44:00.000Z
    artifact: apps/backend/src/modules/conversations
  - name: test
    completed: 2026-09-15T01:48:00.000Z
    artifact: ddd-03-test-report.md
requires_bolts:
  - 031-rag-relevance-api
enables_bolts: []
requires_units: []
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 2
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: 032-rag-relevance-api

## Overview

Orquestra os três modos de resposta (esclarecer, RAG, conhecimento geral),
troca de tópico na hora e fecha o contrato de testes do intent.

## Objective

Na dúvida, perguntar (máx. 2 vezes). Fora do catálogo, orientar com o LLM sem
passos curados. Mudou de assunto → troca imediata. Suite de regressão verde.

## Stories Included

- **004-low-confidence-clarification**: Perguntar de novo (Must)
- **005-out-of-catalog-general-knowledge**: Modo geral (Must)
- **006-immediate-topic-switch**: Troca imediata + checkpoints não trocam (Must)
- **007-relevance-regression-tests**: Corpus + pares negativos + integração de prompt (Must)

## Bolt Type

**Type**: DDD Construction Bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/ddd-construction-bolt.md`

## Stages

- ✅ **1. Domain Model**: Complete → ddd-01-domain-model.md
- ✅ **2. Technical Design**: Complete → ddd-02-technical-design.md
- ✅ **3. ADR Analysis**: Complete → ADR-016, 017, 018
- ✅ **4. Implement**: Complete → generator + prompt modes + persistência de troca
- ✅ **5. Test**: Complete → ddd-03-test-report.md

## Dependencies

### Requires
- **031-rag-relevance-api**: matching e retriever corretos

### Enables
- Intent 007 pronto para Construction complete / uso no chat existente

## Success Criteria

- [x] Empate/vago → clarify, sem RAG, sem gravar slug
- [x] 3ª mensagem ainda vaga → modo geral
- [x] Instagram (e similares) → geral, guardrails ok
- [x] Gov.br → Wi-Fi na mesma conversa troca slug e zera passo
- [x] `sim`/`não` não trocam tópico
- [x] Suite FR-8 passando com LLM mockado

## Notes

Dependência 031 completa. Guest chat deve seguir as mesmas regras
do usuário autenticado.
