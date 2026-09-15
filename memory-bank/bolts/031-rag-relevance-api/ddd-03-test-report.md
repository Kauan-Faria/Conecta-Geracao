---
unit: 001-rag-relevance-api
bolt: 031-rag-relevance-api
stage: test
status: complete
created: 2026-09-15T00:59:00Z
updated: 2026-09-15T00:59:00Z
---

# Test Report - RAG Relevance (Bolt 031)

## Test Summary

| Category | Passed | Failed | Skipped | Coverage |
|----------|--------|--------|---------|----------|
| Unit (matching/policies) | 82 | 0 | 0 | 91.4% stmts (código novo) |
| Integration (retriever + generator, LLM mock) | 7 | 0 | 0 | incluso acima |
| Security (guardrails senha) | 6 | 0 | 0 | — |
| Performance (inferência in-process) | 1 | 0 | 0 | p95 < 50ms |
| Regressão conversations + knowledge-base | 129 | 0 | 0 | — |
| **Total focado 031** | **82** | **0** | **0** | **91.4%** |

Cobertura coletada nos arquivos do matching/RAG (não o monólito inteiro): 91.42% statements, 91.3% lines.

## Acceptance Criteria Validation

| Story | Criteria | Status |
|-------|----------|--------|
| 001 | `wi-fi` / `wifi` / `wi fi` → `wifi-qr-code` | ✅ |
| 001 | `uifi` / `wify` (fuzzy ≥ 4) → Wi-Fi | ✅ |
| 001 | acentos (`código`) ignorados | ✅ |
| 001 | `bom dia` → `none`, slug null | ✅ |
| 002 | corpus FR-2 (grafias por tópico) → slug certo | ✅ |
| 002 | “código QR do wifi” → Wi-Fi, não Gov.br | ✅ |
| 002 | “código do governo” → Gov.br | ✅ |
| 002 | só “código” → não `high` / não Gov.br | ✅ |
| 002 | genéricas sozinhas (`cadastro`, `internet`, `pagamento`, `rede`) → não `high` | ✅ |
| 003 | retrieve Wi-Fi sem passos Gov.br | ✅ |
| 003 | persistido Gov.br + msg Wi-Fi → contexto Wi-Fi | ✅ |
| 003 | `low`/`tie`/`none` → steps vazios | ✅ |
| 003 | prompt Wi-Fi sem instruções Gov.br; generator atualiza slug e zera passo | ✅ |

## Unit Tests

| Suite | Foco | Resultado |
|-------|------|-----------|
| `query-normalizer.spec.ts` | hífen, compact, acento | ✅ |
| `fuzzy-token-matcher.spec.ts` | uifi, pix curto, goovi≠golpi | ✅ |
| `keyword-scoring.policy.spec.ts` | alias QR+wifi vs `codigo` | ✅ |
| `topic-inference.policy.spec.ts` | corpus FR-2, empate, genéricas, p95 | ✅ |

## Integration Tests

Sem endpoint HTTP novo (ADR-015). Integração in-process:

| Suite | Foco | Resultado |
|-------|------|-----------|
| `prisma-knowledge-retriever.spec.ts` | seed real + repo mock; não gruda tópico | ✅ |
| `rag-prompt.builder.spec.ts` | prompt Wi-Fi sem Gov.br | ✅ |
| `gemini-assistant-reply.generator.spec.ts` | troca de slug + passo 0; LLM mock | ✅ |

## Security Tests

| Caso | Resultado |
|------|-----------|
| `minha senha é 1234` continua bloqueado | ✅ |
| OTP / pedido de senha na saída | ✅ |
| “senha do wi-fi” **não** dispara recusa que citava gov.br | ✅ |

## Performance Tests

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Inferência tópico p95 (200 runs, 6 tópicos em memória) | < 50ms | < 50ms (asserção Jest) | ✅ |
| Chat ponta a ponta / Gemini real | < 8s | não medido (sem LLM real neste bolt) | — |

## Coverage Report (arquivos do 031)

| Área | Stmts | Branches | Lines |
|------|-------|----------|-------|
| domain/services (normalizer, fuzzy, scoring, inference, guardrail) | 93.4% | 73.0% | 92.9% |
| topic-match.vo | 100% | 100% | 100% |
| prisma-knowledge-retriever | 96.8% | 92.9% | 96.4% |
| rag-prompt + gemini generator | 85.5% | 67.7% | 86.3% |
| mvp-topics.data (seed) | 100% | 100% | 100% |
| **All files (escopo)** | **91.4%** | **75.0%** | **91.3%** |

Linhas descobertas: ramos de tópico `high` não encontrado no repo, fallback LLM, `describeActiveStep` vazio — caminhos de erro já existentes, não regressão do matching.

## Issues Found

| Issue | Severity | Status |
|-------|----------|--------|
| Fuzzy largo (`goovi` ≈ `golpi`) gerava empate Gov.br/golpe | Medium | Fixed (max dist 1 até 6 chars) |
| Guardrail `\bsenha\b` recusava “senha do Wi-Fi” e citava gov.br | High (causa do relato) | Fixed |
| Coluna `aliases` exige `prisma migrate` no banco local/prod | Medium | Open (ops) |

## Ready for Operations

- [x] All acceptance criteria met (stories 001–003)
- [x] Code coverage > 80% no código novo
- [x] No critical/high severity issues open no matching
- [x] Performance target de inferência met
- [x] Security tests passing
- [ ] Migration + seed aplicados no ambiente (humano)
- [ ] Bolt 032 (esclarecer / conhecimento geral / troca formal) ainda planned

## Setup para validar no app

1. `cd apps/backend && pnpm exec prisma migrate deploy` (ou `prisma migrate dev`)
2. `pnpm prisma:seed`
3. Reiniciar API e perguntar “senha do wi-fi” / “uifi” — deve orientar Wi-Fi, não Gov.br
