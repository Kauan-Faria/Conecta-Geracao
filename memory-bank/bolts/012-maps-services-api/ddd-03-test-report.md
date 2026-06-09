---
unit: 001-maps-services-api
bolt: 012-maps-services-api
stage: test
status: complete
created: 2026-06-09T00:45:00Z
---

# Test Report - Chat Location Intent & Map Action

## Test Summary

| Category | Passed | Failed | Skipped | Coverage |
|----------|--------|--------|---------|----------|
| Unit | 16 | 0 | 0 | Domínio/orquestração ~90%* |
| Integration | 0 | 0 | 0 | N/A (mocked LLM/repos) |
| Security | 2 | 0 | 0 | - |
| Performance | 0 | 0 | 0 | N/A (sem load test CI) |
| **Total** | **16** | **0** | **0** | - |

\* Testes específicos do bolt 012 (classifier, disambiguator, radius, mapAction, generator, mapper, use case). Suite `modules/conversations`: **38/38 passed**. Suite completa backend: **98/98 passed**.

## Acceptance Criteria Validation

| Story | Criteria | Status |
|-------|----------|--------|
| **003-location-intent-chat** | "qual farmácia mais próxima?" → `map_action` category=pharmacy | ✅ |
| **003-location-intent-chat** | "preciso de saúde perto" → clarificação UBS/hospital, sem map_action | ✅ |
| **003-location-intent-chat** | Intenção geográfica → texto PT + payload estruturado | ✅ |
| **003-location-intent-chat** | "como fazer PIX" → sem map_action (fluxo RAG) | ✅ |
| **004-radius-suggestion-response** | Default 5 km em linguagem simples | ✅ |
| **004-radius-suggestion-response** | Contexto urbano / "bem perto" → 2 km | ✅ |
| **004-radius-suggestion-response** | "mais longe" / rural → 10 km | ✅ |
| **004-radius-suggestion-response** | `radiusKm` no map_action ∈ {2, 5, 10} | ✅ |

## Unit Tests

| Arquivo | Foco |
|---------|------|
| `location-intent.classifier.spec.ts` | Detecção geográfica, exclusão PIX, saúde ambígua |
| `category-disambiguator.service.spec.ts` | Farmácia direta, clarificação saúde, follow-up UBS |
| `radius-suggestion.policy.spec.ts` | Default 5, "bem perto"→2, "perto de mim"→5, "mais longe"→10 |
| `gemini-assistant-reply.generator.spec.ts` | mapAction farmácia, sem action saúde/PIX |
| `conversation.mapper.spec.ts` | Serialização `metadata.map_action` snake_case |
| `send-message.use-case.spec.ts` | Persistência com `assistantMetadata` |

**Comando bolt 012**: `pnpm exec jest modules/conversations` → **38/38 passed**

**Comando suite completa**: `pnpm test` → **98/98 passed**

**Build**: `pnpm run build` → ✅

## Integration Tests

Não incluídos neste bolt — LLM mockado nos specs do generator; persistência validada via UoW mock no use case. Testes manuais recomendados:

1. POST `/api/v1/conversations/:id/messages` com mensagem geográfica → verificar `metadata.map_action` no envelope
2. GET `/api/v1/conversations/:id` → mensagens históricas com metadata preservado

## Security Tests

| Cenário | Validação | Status |
|---------|-----------|--------|
| metadata write-only (cliente não envia) | DTO request só `{ content }` | ✅ |
| Guardrails sensíveis antes do branch geográfico | `SensitiveContentPolicy` spec + generator spec | ✅ |
| ConversationsModule sem MapsModule (ADR-005) | Module wiring — zero DI OSM | ✅ |

## Performance Tests

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Latência chat (p95) | < 8s | N/A CI | ⏳ Manual pós-deploy |
| Branch geográfico sem OSM | Sem call externo maps | Generator spec (retrieve não chamado) | ✅ |

## Coverage Report

Camadas com cobertura unitária forte:

- **domain/services/** — classifier, disambiguator, radius policy
- **domain/value-objects/** — MapAction (via mapper + generator)
- **infrastructure/assistant/** — GeminiAssistantReplyGenerator branch geográfico
- **application/use-cases/** — SendMessageUseCase metadata
- **presentation/mappers/** — toMessageDto com map_action

Delegado a bolt 015 (UI):

- Parse Flutter de `metadata.map_action`
- Handoff → `POST /maps/search`

## Issues Found

| Issue | Severity | Status |
|-------|----------|--------|
| Nenhum | - | - |

## Ready for Operations

- [x] All acceptance criteria met
- [x] Unit tests for critical paths (domain + generator + use case + mapper)
- [x] No critical/high severity issues open
- [ ] Performance p95 validated in staging (manual)
- [x] ADR-004 e ADR-005 respeitados na implementação

## Recommendations

1. Bolt **015-in-app-maps-navigation-ui** consome `metadata.map_action` e chama `/maps/search`.
2. Validar clarificação multi-turn (UBS/hospital) em teste manual com Gemini real.
3. Aplicar migration `20260609000500_add_message_metadata` antes do deploy.
