---
unit: 001-rag-relevance-api
bolt: 032-rag-relevance-api
stage: test
status: complete
created: 2026-09-15T01:48:00Z
updated: 2026-09-15T01:48:00Z
---

# Test Report - RAG Relevance Orchestration (Bolt 032)

## Test Summary

| Category | Passed | Failed | Skipped | Coverage |
|----------|--------|--------|---------|----------|
| Unit (resolver, policies, VOs) | 24+ | 0 | 0 | incluso no escopo |
| Integration (generator + retriever, LLM mock) | 11 | 0 | 0 | incluso no escopo |
| Security (guardrails senha/token) | 6 | 0 | 0 | — |
| Performance (inferência in-process) | 1 | 0 | 0 | p95 < 50ms |
| Conversations (módulo) | 144 | 0 | 0 | 90.1% stmts (escopo 032) |
| Backend completo | 264+ | 0 | 0 | — |
| **Total focado 032** | **144** | **0** | **0** | **90.1%** |

Cobertura nos arquivos de orquestração (não o monólito): 90.09% statements, 89.9% lines, 77.85% branches.

Nenhum teste chama Gemini real (ADR-016 / FR-8).

## Acceptance Criteria Validation

### 004-low-confidence-clarification

| Criteria | Status | Onde |
|----------|--------|------|
| `tie`/`low` → modo `clarify`, zero RAG, slug não chutado | ✅ | `reply-mode.resolver.spec`, generator (retrieve/LLM não chamados) |
| Empate Wi-Fi vs Gov.br → máx. 2 opções, frases curtas | ✅ | `clarification-question.policy.spec` |
| “me ajuda” / vago sem tópico → pergunta aberta (não lista os 6) | ✅ | substance classifier + question policy |
| 2 clarifys seguidos; 3ª vaga → `general` | ✅ | resolver (`streak` 2) + streak counter |

### 005-out-of-catalog-general-knowledge

| Criteria | Status | Onde |
|----------|--------|------|
| Instagram: nenhum passo dos 6 tópicos no prompt | ✅ | generator spec (LLM mock) |
| System prompt declara “orientação geral”, não base oficial | ✅ | `rag-prompt.builder.spec` + generator |
| Guardrails de senha/token intactos | ✅ | generator (input sensível bloqueia antes) |
| Oferta dos assuntos do app no appendix (1 frase) | ✅ | `GeneralOrientationPolicy` no system appendix |
| `topicSlug` limpo (`null`) no modo geral | ✅ | generator + `send-message.use-case.spec` |

### 006-immediate-topic-switch

| Criteria | Status | Onde |
|----------|--------|------|
| Gov.br persistido + “senha do wi-fi” → slug Wi-Fi, `currentStep` 0 | ✅ | generator integração com retriever real + LLM mock |
| Prompt pós-troca sem passos Gov.br | ✅ | mesmo teste (`portal do governo` ausente) |
| `sim`/`não`/`ok` com tópico **não** trocam | ✅ | resolver checkpoint + generator avança passo |
| `sim` **após clarify** não avança o tutorial antigo | ✅ | `reply-mode.resolver.spec` |
| `uifi` no Wi-Fi permanece; passo não zera | ✅ | `topic-switch.policy.spec` |
| Guest e autenticado persistem o mesmo contrato | ✅ | `reply-guest-message` + `send-message` specs |

### 007-relevance-regression-tests

| Criteria | Status | Onde |
|----------|--------|------|
| Corpus FR-2 100% (sem LLM) | ✅ | `topic-inference.policy.spec` |
| Pares negativos Wi-Fi≠Gov.br, PIX≠boleto, WhatsApp≠golpe, 2ª via≠PIX | ✅ | `NEGATIVE_PAIRS` + inference spec |
| Empate “código QR” → clarify, steps vazios | ✅ | generator spec |
| “como usar o Instagram” → general, steps vazios | ✅ | generator spec |
| Sequência Gov.br → Wi-Fi → segundo contexto Wi-Fi e step 0 | ✅ | generator integração |
| CI `*.spec.ts` + 1 integração de prompt com LLM mock | ✅ | Jest no módulo conversations |

## Unit Tests

| Suite | Foco | Resultado |
|-------|------|-----------|
| `reply-mode.resolver.spec.ts` | máquina de 8 regras | ✅ |
| `message-substance.classifier.spec.ts` | vacuous / instagran / checkpoint | ✅ |
| `clarification-streak.counter.spec.ts` | 0/1/2; zera após rag | ✅ |
| `clarification-question.policy.spec.ts` | ≤ 2 opções; vago sem os 6 | ✅ |
| `topic-switch.policy.spec.ts` | keep vs reset 0 | ✅ |
| `topic-inference.policy.spec.ts` | FR-2 + pares FR-8 + p95 | ✅ |

## Integration Tests

Sem endpoint HTTP novo (ADR-015 / ADR-018). Integração in-process:

| Suite | Foco | Resultado |
|-------|------|-----------|
| `gemini-assistant-reply.generator.spec.ts` | clarify skip retrieve/LLM; general; troca; maps inalterados | ✅ |
| `prisma-knowledge-retriever.spec.ts` | `inferMatch` Instagram = `none` | ✅ |
| `rag-prompt.builder.spec.ts` | `buildGeneral` sem passos oficiais | ✅ |
| `send-message.use-case.spec.ts` | persiste `topicSlug: null` + `replyMode` | ✅ |
| `reply-guest-message.use-case.spec.ts` | paridade slug/step/metadata | ✅ |
| `conversation.mapper.spec.ts` | `metadata.replyMode` no DTO | ✅ |

## Security Tests

| Caso | Resultado |
|------|-----------|
| Input com senha bloqueado **antes** de infer/retrieve/LLM | ✅ |
| Clarify é template — não interpola KB | ✅ |
| General reusa `SensitiveContentPolicy` na saída | ✅ (caminho existente; recusa no input coberta) |
| `map_action` não é emitido em clarify/general | ✅ (só no ramo geográfico) |

## Performance Tests

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Inferência tópico p95 (200 runs) | < 50ms | < 50ms (Jest) | ✅ |
| Clarify extra LLM / retrieve | 0 | 0 (asserção `not.toHaveBeenCalled`) | ✅ |
| Chat ponta a ponta / Gemini real | < 8s | não medido (sem LLM real) | — |

## Coverage Report (arquivos do 032)

| Área | Stmts | Branches | Lines |
|------|-------|----------|-------|
| domain/services (resolver, substance, streak, question, switch, general) | 91.6% | 79.3% | 91.0% |
| domain/value-objects (reply-plan, streak, metadata, mode) | 90.0% | 65.2% | 90.0% |
| send-message + reply-guest | 95.7% | 100% | 97.6% |
| prisma-knowledge-retriever | 97.3% | 92.9% | 97.0% |
| rag-prompt + gemini generator | 85.6% | 69.7% | 85.3% |
| conversation.mapper | 77.8% | 100% | 77.8% |
| **All files (escopo)** | **90.1%** | **77.9%** | **89.9%** |

Linhas descobertas: fallbacks de LLM/erro (`failClosed`), `describeActiveStep` vazio, `fromMapAction` legado, summaries de conversa no mapper — caminhos de erro já existentes, não regressão dos modos.

## Issues Found

| Issue | Severity | Status |
|-------|----------|--------|
| `resolvedTopicSlug ?? owned.topicSlug` tratava `null` (clear) como “manter slug” | High | Fixed nos use cases (null é valor) |
| `sim` após clarify podia avançar o tutorial antigo | High | Fixed (`streak > 0` não é checkpoint de tutorial) |
| Guest history sem `replyMode` zera a streak no cliente | Low | Open (campo opcional no DTO; Flutter precisa ecoar) |
| Cobertura de `isReplyMode` / `fromMapAction` baixa | Low | Aceito (helpers de borda) |

## Ready for Operations

- [x] All acceptance criteria met (stories 004–007)
- [x] Code coverage > 80% no código do bolt (90.1% stmts)
- [x] No critical/high severity issues open na orquestração
- [x] Performance target de inferência met; clarify sem LLM extra
- [x] Security tests passing
- [ ] Guest Flutter ecoar `replyMode` no histórico para o teto de 2 clarifys no modo convidado
- [ ] Smoke manual no app: empate “código QR”, Instagram, Gov.br→Wi-Fi, `sim` no PIX

## Setup para validar no app

1. API com seed do 031 (`aliases`) já aplicada
2. Perguntar “código QR” → deve **perguntar** (não Gov.br)
3. “como usar o Instagram” → orientação geral, sem tutoriais do catálogo
4. No meio do Gov.br, “senha do wi-fi” → Wi-Fi do zero
5. No PIX, “sim” → avança o passo, não troca de assunto
