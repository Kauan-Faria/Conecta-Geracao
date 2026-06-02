---
unit: 002-knowledge-base
bolt: 002-knowledge-base
stage: test
status: complete
created: 2026-06-01T14:00:00Z
---

# Test Report - Knowledge Base

## Test Summary

| Category | Passed | Failed | Skipped | Coverage |
|----------|--------|--------|---------|----------|
| Unit | 6 | 0 | 0 | 36% lines (domínio focado) |
| Integration | — | — | — | Manual (seed + migrate) |
| Security | 2 | 0 | 0 | Policy tests |
| Performance | — | — | — | N/A MVP |
| **Total** | 6 | 0 | 0 | 36% lines |

## Acceptance Criteria Validation

| Story | Criteria | Status |
|-------|----------|--------|
| **001-topic-entity-schema** | Tabelas `knowledge_topics` e `knowledge_steps` via migration | ✅ |
| **001-topic-entity-schema** | Passos ordenados por `order` | ✅ (repository `orderBy`) |
| **001-topic-entity-schema** | Slug único | ✅ (`@@unique` + constraint) |
| **002-seed-six-mvp-topics** | Exatamente 6 tópicos MVP após seed | ✅ (seed executado) |
| **002-seed-six-mvp-topics** | ≥3 passos com checkpoint em passos-chave | ✅ (4 passos/tópico) |
| **002-seed-six-mvp-topics** | Gov.br educativo, sem login real | ✅ (policy + conteúdo revisado) |

## Unit Tests

| Suite | Tests | Resultado |
|-------|-------|-----------|
| `topic-slug.vo.spec.ts` | 3 | ✅ PASS |
| `knowledge-content-policy.spec.ts` | 3 | ✅ PASS |

**Cobertura destacada**: `TopicSlug`, `KnowledgeContentPolicy` (regras FR-5 e Gov.br).

## Integration Tests

Não automatizados neste bolt. Validação manual:

- `prisma migrate deploy` — migration `init_knowledge_base` aplicada
- `prisma db seed` — saída: *"Seed concluído: 6 tópicos inseridos/atualizados"*
- Reexecução do seed — idempotente (*"Seed ignorado: base MVP já existe"*)

## Security Tests

| Teste | Status |
|-------|--------|
| Rejeita instrução pedindo senha no chat | ✅ |
| Rejeita fluxo de login no slug `codigo-govbr` | ✅ |

## Performance Tests

N/A para este bolt (sem endpoints HTTP).

## Coverage Report

| Camada | Lines | Nota |
|--------|-------|------|
| Domain (VO + policy) | Alta nos arquivos testados | Foco MVP |
| Application / Infrastructure | Baixa | Cobertura prevista no bolt `003-knowledge-base` (API + integração) |

Cobertura global **36%** — abaixo da meta 80%, aceitável para bolt de schema+seed; expandir no bolt 003.

## Issues Found

| Issue | Severity | Status |
|-------|----------|--------|
| Cobertura global < 80% | Low | Open — bolt 003 |
| Testes de integração Prisma não automatizados | Low | Open — bolt 003 |

## Ready for Operations

- [x] All acceptance criteria met
- [ ] Code coverage > 80% (parcial; domínio crítico coberto)
- [x] No critical/high severity issues open
- [x] Performance targets met (N/A)
- [x] Security tests passing (content policy)

**Veredicto**: Bolt **002-knowledge-base** pronto para encerramento. Próximo passo recomendado: bolt **003-knowledge-base** (API REST para RAG).
