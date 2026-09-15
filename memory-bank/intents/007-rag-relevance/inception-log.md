---
intent: 007-rag-relevance
created: 2026-09-15T00:24:00Z
completed: 2026-09-15T00:39:00Z
status: complete
---

# Inception Log: rag-relevance

## Overview

**Intent**: Respostas da IA sempre no tópico da pergunta, com tolerância a erros de escrita do público analfabeto digital.
**Type**: defect-fix / enhancement (RAG já existente em `001-digital-guidance`)
**Created**: 2026-09-15
**Completed**: 2026-09-15T00:39:00Z

## Artifacts Created

| Artifact | Status | File |
|----------|--------|------|
| Requirements | ✅ | requirements.md |
| System Context | ✅ | system-context.md |
| Units | ✅ | units.md + units/001-rag-relevance-api/unit-brief.md |
| Stories | ✅ 7 stories | units/001-rag-relevance-api/stories/*.md |
| Bolt Plan | ✅ 2 bolts | memory-bank/bolts/031–032-rag-relevance-api |

## Summary

| Metric | Count |
|--------|-------|
| Functional Requirements | 8 |
| Non-Functional Requirements | 4 grupos |
| Units | 1 |
| Stories | 7 (todas Must) |
| Bolts Planned | 2 |

## Units Breakdown

| Unit | Stories | Bolts | Priority |
|------|---------|-------|----------|
| 001-rag-relevance-api | 7 | 2 (031, 032) | Must |

## Decision Log

| Date | Decision | Rationale | Approved |
|------|----------|-----------|----------|
| 2026-09-15 | Novo intent `007-rag-relevance` em vez de reabrir `001` | `001` já tem bolts complete | Yes |
| 2026-09-15 | Sem unit de UI | Nenhum FR de tela | Yes (Checkpoint 3) |
| 2026-09-15 | Não usar embeddings nesta correção | Matching lexical + aliases + fuzzy | Yes |
| 2026-09-15 | Fora do catálogo: conhecimento geral da IA | Não deixar o usuário sem ajuda | Yes |
| 2026-09-15 | Na dúvida: perguntar de novo (máx. 2) | Não chutar tópico | Yes |
| 2026-09-15 | Troca de tópico imediata | Assunto novo não fica preso | Yes |
| 2026-09-15 | Dois bolts DDD (031 matching, 032 orquestração) | Coesão; 032 depende do 031 | Yes (Checkpoint 3) |

## Scope Changes

| Date | Change | Reason | Impact |
|------|--------|--------|--------|
| 2026-09-15 | Incluir tolerância a erros de escrita | Público escreve palavras complexas errado | Matching fuzzy/aliases obrigatório |
| 2026-09-15 | Corpus de grafias além dos exemplos iniciais | “Todos esses e mais um pouco” | Tabela expansível no FR-2 |

## Ready for Construction

**Checklist**:
- [x] All requirements documented
- [x] System context defined
- [x] Units decomposed
- [x] Stories created for all units
- [x] Bolts planned
- [x] Human review complete

## Next Steps

1. Construction no primeiro bolt: `/specsmd-construction-agent --unit="001-rag-relevance-api" --bolt-id="031-rag-relevance-api"`
2. Depois: `032-rag-relevance-api`

## Dependencies

Execução: `031-rag-relevance-api` → `032-rag-relevance-api`

Corrige código já entregue em:
- `001-digital-guidance` / `002-knowledge-base`
- `001-digital-guidance` / `003-ai-assistant-api`
