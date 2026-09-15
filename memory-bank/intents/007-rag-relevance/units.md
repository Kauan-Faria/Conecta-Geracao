---
intent: 007-rag-relevance
phase: inception
status: units-decomposed
updated: 2026-09-15T00:30:00Z
---

# Relevância do RAG — Unit Decomposition

## Requirement-to-Unit Mapping

| FR | Requirement | Unit |
|----|-------------|------|
| FR-1 | Resposta sempre no assunto da pergunta | `001-rag-relevance-api` |
| FR-2 | Inferência tolerante a erros de escrita | `001-rag-relevance-api` |
| FR-3 | Baixa confiança — perguntar de novo | `001-rag-relevance-api` |
| FR-4 | Fora dos 6 tópicos — conhecimento geral | `001-rag-relevance-api` |
| FR-5 | Troca imediata de tópico | `001-rag-relevance-api` |
| FR-6 | Matching não “gruda” em tópico errado | `001-rag-relevance-api` |
| FR-7 | Keywords genéricas não vencem o tópico certo | `001-rag-relevance-api` |
| FR-8 | Casos de teste de relevância | `001-rag-relevance-api` |

**Frontend unit omitida de propósito.** O catálogo `full-stack-web` habilita UI, mas este intent não tem FR de tela: o chat Flutter só consome o texto já existente. Criar `rag-relevance-ui` seria unit vazia.

## Units Overview

Este intent decompõe em **1 unit**:

### Unit 1: `001-rag-relevance-api`

**Description**: Evolui inferência, retrieval e orquestração do assistente para respostas condizentes com a pergunta, com tolerância a erros de escrita.

**Stories**: 7 | **Complexity**: M | **Priority**: Must

**Deliverables**: policy de matching (normalização, aliases, fuzzy), retriever que não gruda tópico, modos esclarecimento / RAG / conhecimento geral, troca imediata de assunto, suite de regressão.

**Dependencies**:
- Depende de código já entregue em `001-digital-guidance` (`002-knowledge-base`, `003-ai-assistant-api`) — não de units deste intent
- Depended by: nenhum neste intent

**Estimated Complexity**: M

## Unit Dependency Graph

```text
[001-rag-relevance-api]
        │
        └── usa código existente:
            knowledge-base + conversations (RAG)
```

## Execution Order

1. Bolt `031-rag-relevance-api` — matching e retrieval correto
2. Bolt `032-rag-relevance-api` — esclarecimento, modo geral, troca de tópico, testes de contrato
