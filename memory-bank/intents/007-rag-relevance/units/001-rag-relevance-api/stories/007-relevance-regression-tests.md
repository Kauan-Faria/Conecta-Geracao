---
id: 007-relevance-regression-tests
unit: 001-rag-relevance-api
intent: 007-rag-relevance
status: complete
priority: must
created: 2026-09-15T00:30:00.000Z
assigned_bolt: 032-rag-relevance-api
implemented: true
---

# Story: 007-relevance-regression-tests

## User Story

**As a** time de produto
**I want** uma suite que trave o bug “Wi-Fi responde Gov.br”
**So that** a correção não recue em regressão

## Acceptance Criteria

- [ ] **Given** o corpus FR-2, **When** roda a suite de inferência, **Then** 100% dos casos acertam o slug (sem LLM)
- [ ] **Given** pares negativos Wi-Fi≠Gov.br, PIX≠boleto (2ª via), WhatsApp≠golpe, **When** retrieve/prompt, **Then** não há passos do tópico errado
- [ ] **Given** empate “código QR”, **When** testa o gerador, **Then** modo clarify e steps vazios
- [ ] **Given** “como usar o Instagram”, **When** testa o gerador, **Then** modo general e steps vazios
- [ ] **Given** sequência Gov.br → Wi-Fi, **When** testa, **Then** segundo contexto é Wi-Fi e `currentStep` 0
- [ ] **Given** a suite, **When** CI/backend test roda, **Then** esses casos estão cobertos em `*.spec.ts` isolados (+ 1 integração de prompt com LLM mockado)

## Technical Notes

- Tabela de casos (it.each) em `topic-inference.policy.spec.ts` e retriever/generator specs
- Não chamar Gemini real
- Pode extrair fixture `relevance-corpus.ts` compartilhada

## Dependencies

### Requires
- 001-normalize-and-fuzzy-match
- 002-topic-alias-corpus
- 003-never-inject-wrong-topic
- 004-low-confidence-clarification
- 005-out-of-catalog-general-knowledge
- 006-immediate-topic-switch

### Enables
- None (contrato de aceite do intent)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Alias novo no seed sem teste | Construction adiciona linha no corpus |

## Out of Scope

- Teste E2E no app Flutter
- Avaliação humana com usuários reais (pós-deploy)
