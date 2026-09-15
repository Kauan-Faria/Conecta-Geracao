---
id: 005-out-of-catalog-general-knowledge
unit: 001-rag-relevance-api
intent: 007-rag-relevance
status: complete
priority: must
created: 2026-09-15T00:30:00.000Z
assigned_bolt: 032-rag-relevance-api
implemented: true
---

# Story: 005-out-of-catalog-general-knowledge

## User Story

**As a** usuário perguntando algo que não é um dos 6 tópicos (ex.: Instagram)
**I want** uma orientação simples mesmo assim
**So that** o app não me empurre PIX ou Gov.br à toa

## Acceptance Criteria

- [ ] **Given** pergunta claramente fora do catálogo (ex.: “como usar o Instagram”), **When** gera resposta, **Then** nenhum passo dos 6 tópicos entra no prompt
- [ ] **Given** modo geral, **When** o system prompt é montado, **Then** deixa explícito “orientação geral” (não “base oficial”) e mantém guardrails de senha/token
- [ ] **Given** resposta geral, **When** o texto sai, **Then** é sobre o assunto perguntado (teste: prompt não lista passos de Wi-Fi/Gov.br/PIX)
- [ ] **Given** o fim da resposta geral, **When** quiser, **Then** pode haver **uma** frase oferecendo os assuntos do app — sem mudar o tema da resposta

## Technical Notes

- Novo appendix no `RagPromptBuilder` (ou builder irmão) para modo `general`
- Reusar `SensitiveContentPolicy` no output
- Não persistir `topicSlug` dos 6 tópicos nesse modo
- Mockar LLM nos testes; assertar system/user prompt

## Dependencies

### Requires
- 003-never-inject-wrong-topic
- 004-low-confidence-clarification (limite de 2 clarifys → general)

### Enables
- 007-relevance-regression-tests

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Pergunta fora do catálogo pedindo senha | Guardrail recusa (já existente) |
| “instagram” escrito “instagran” | Ainda `none` no catálogo → geral, não forçar tópico |

## Out of Scope

- Criar tópico Instagram na base
- Embeddings para descobrir tópico “próximo”
