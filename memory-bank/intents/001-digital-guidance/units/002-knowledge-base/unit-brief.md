---
unit: 002-knowledge-base
intent: 001-digital-guidance
unit_type: backend
default_bolt_type: ddd-construction-bolt
phase: inception
status: ready
created: 2026-05-28T01:00:00Z
updated: 2026-05-28T01:00:00Z
---

# Unit Brief: Knowledge Base

## Purpose

Armazenar e servir conteúdo curado sobre tarefas digitais (6 tópicos MVP) com passos e checkpoints estruturados para consumo pelo RAG da IA.

## Scope

### In Scope
- Modelo de domínio: Topic, Step, Checkpoint
- Seed dos 6 tópicos MVP (PIX, Gov.br tutorial, WhatsApp, Wi-Fi QR, boleto, golpes)
- API interna de consulta por tópico/slug para RAG

### Out of Scope
- Orquestração LLM (`003-ai-assistant-api`)
- CMS/admin completo (MVP: seed JSON ou migration)
- Integração Gov.br real

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-3 | Base de conhecimento para orientação | Must |
| FR-4 | Tópicos cobertos no MVP (6 assuntos) | Must |

---

## Domain Concepts

### Key Entities
| Entity | Description | Attributes |
|--------|-------------|------------|
| KnowledgeTopic | Assunto (ex.: PIX) | slug, title, summary, keywords |
| KnowledgeStep | Passo numerado | order, instruction, checkpointQuestion |
| Checkpoint | Pergunta de validação | question, expectedAnswers |

### Key Operations
| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| getTopicBySlug | Buscar tópico | slug | topic + steps |
| searchTopics | Busca por keywords | query | topic matches |
| getStepsForRag | Chunks para RAG | topicId | structured chunks |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 3 |
| Must Have | 3 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-topic-entity-schema | Schema de tópicos e passos | Must | Planned |
| 002-seed-six-mvp-topics | Seed dos 6 tópicos MVP | Must | Planned |
| 003-knowledge-retrieval-api | API de consulta para RAG | Must | Planned |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| — | Nenhuma |

### Depended By
| Unit | Reason |
|------|--------|
| 003-ai-assistant-api | RAG consome conteúdo |

---

## Success Criteria

### Functional
- [ ] 6 tópicos disponíveis com passos e checkpoints
- [ ] API retorna conteúdo estruturado para RAG

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 002-knowledge-base | ddd | 001, 002 | Domínio + seed |
| 003-knowledge-base | ddd | 003 | API de consulta |
