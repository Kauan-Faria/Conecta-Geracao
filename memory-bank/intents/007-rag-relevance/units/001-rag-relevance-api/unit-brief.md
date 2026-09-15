---
unit: 001-rag-relevance-api
intent: 007-rag-relevance
unit_type: backend
default_bolt_type: ddd-construction-bolt
phase: construction
status: complete
created: 2026-09-15T00:30:00.000Z
updated: 2026-09-15T00:39:00.000Z
---

# Unit Brief: RAG Relevance API

## Purpose

Fazer o assistente **identificar o assunto certo** mesmo com erros de escrita e
**só então** injetar RAG. Sem confiança, perguntar; fora do catálogo, orientar
com o LLM; se o usuário mudar de assunto, trocar na hora.

## Scope

### In Scope
- Normalização (acento, hífen, espaço) + fuzzy + aliases por tópico
- Revisão de keywords genéricas no seed (`codigo`, `cadastro`, etc.)
- Retriever que reavalia a mensagem atual (não gruda `topicSlug`)
- Prompt: modo RAG / esclarecimento / orientação geral
- Troca imediata de tópico + reset de `currentStep`
- Testes de relevância (corpus + pares negativos)

### Out of Scope
- Novos tópicos no catálogo
- Embeddings / pgvector
- CMS de aliases
- Mudança de UI Flutter
- Guardrails novos (reusar `SensitiveContentPolicy`)

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Resposta sempre no assunto da pergunta | Must |
| FR-2 | Inferência tolerante a erros de escrita | Must |
| FR-3 | Baixa confiança — perguntar de novo | Must |
| FR-4 | Fora dos 6 tópicos — conhecimento geral | Must |
| FR-5 | Troca imediata de tópico | Must |
| FR-6 | Matching não “gruda” em tópico errado | Must |
| FR-7 | Keywords genéricas não vencem o tópico certo | Must |
| FR-8 | Casos de teste de relevância | Must |

---

## Domain Concepts

### Key Entities
| Entity | Description | Attributes |
|--------|-------------|------------|
| TopicMatch | Resultado da inferência | slug?, confidence (`high`/`low`/`none`/`tie`), candidates[] |
| TopicAlias | Grafia alternativa de um tópico | topicSlug, surfaceForm, weight |
| ReplyMode | Como montar o prompt | `rag` \| `clarify` \| `general` |

### Key Operations
| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| inferTopic | Classifica a mensagem | text, currentSlug?, isCheckpoint? | TopicMatch |
| retrieveForMatch | Contexto RAG só se high+único | TopicMatch | KnowledgeContext (steps vazios se não rag) |
| resolveReplyMode | Escolhe modo do prompt | TopicMatch, clarifyCount | ReplyMode |
| applyTopicSwitch | Atualiza conversa | oldSlug, newMatch | newSlug, currentStep=0 se trocou |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 7 |
| Must Have | 7 |
| Should Have | 0 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-normalize-and-fuzzy-match | Normalização e fuzzy match | Must | Complete |
| 002-topic-alias-corpus | Corpus de aliases e peso de keywords | Must | Complete |
| 003-never-inject-wrong-topic | Não injetar nem grudar tópico errado | Must | Complete |
| 004-low-confidence-clarification | Perguntar de novo na dúvida | Must | Complete |
| 005-out-of-catalog-general-knowledge | Orientação geral fora do catálogo | Must | Complete |
| 006-immediate-topic-switch | Troca imediata de assunto | Must | Complete |
| 007-relevance-regression-tests | Suite de regressão de relevância | Must | Complete |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| `001-digital-guidance` / `002-knowledge-base` | Seed, keywords, steps |
| `001-digital-guidance` / `003-ai-assistant-api` | Retriever, prompt, Gemini generator |

### Depended By
| Unit | Reason |
|------|--------|
| — | Chat UI já consome a API |

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| Gemini | Modos RAG e geral | Alto (modo geral) |

---

## Technical Context

### Suggested Technology
TypeScript / NestJS em `apps/backend/src/modules/conversations` e seed em `knowledge-base`. Evoluir `TopicInferencePolicy` e `PrismaKnowledgeRetriever`; não criar módulo paralelo.

### Integration Points
| Integration | Type | Protocol |
|-------------|------|----------|
| KnowledgeTopicRepository | in-process | porta Nest |
| LlmProvider | API | HTTPS Gemini |
| Conversation persistida | DB | Prisma (`topicSlug`, `currentStep`) |

### Data Storage
| Data | Type | Volume | Retention |
|------|------|--------|-----------|
| Aliases | código/seed JSON | dezenas por tópico | versionado no repo |
| topicSlug da conversa | SQL | 1 por conversa | igual conversas atuais |

---

## Constraints

- Inferência sem chamada LLM (< 50ms p95)
- Máximo 2 esclarecimentos seguidos; depois modo geral
- Checkpoints (`sim`/`não`/`ok`) não disparam troca de tópico
- Keywords genéricas não pontuam sozinhas

---

## Success Criteria

### Functional
- [ ] Corpus mínimo de grafias acerta o tópico
- [ ] Wi-Fi nunca injeta Gov.br (e pares equivalentes)
- [ ] Dúvida → pergunta; fora do catálogo → geral; troca → imediata

### Non-Functional
- [ ] Inferência < 50ms p95
- [ ] Sem regressão de latência do chat
- [ ] Guardrails de credencial intactos

### Quality
- [ ] Testes de policy/retriever sem LLM
- [ ] 1 teste de integração do prompt sem passos do tópico errado
- [ ] Todos os AC das stories

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 031-rag-relevance-api | ddd | 001, 002, 003 | Matching + retrieval correto |
| 032-rag-relevance-api | ddd | 004, 005, 006, 007 | Modos de resposta + troca + testes |

---

## Notes

Bug atual: `TopicInferencePolicy` usa `includes` sem tirar hífen; keyword `codigo` empata com QR e o primeiro tópico (Gov.br) vence; `topicSlug` persistido impede reavaliação. Construction deve tratar esses três pontos no bolt 031.
