---
id: 003-never-inject-wrong-topic
unit: 001-rag-relevance-api
intent: 007-rag-relevance
status: complete
priority: must
created: 2026-09-15T00:30:00.000Z
assigned_bolt: 031-rag-relevance-api
implemented: true
---

# Story: 003-never-inject-wrong-topic

## User Story

**As a** usuário perguntando sobre Wi-Fi
**I want** a IA usar só os passos de Wi-Fi
**So that** eu não receba tutorial de Gov.br (ou outro assunto)

## Acceptance Criteria

- [ ] **Given** match `high` em Wi-Fi, **When** o retriever monta contexto, **Then** `steps` são só de `wifi-qr-code` (nenhum passo `codigo-govbr`)
- [ ] **Given** conversa já com `topicSlug=codigo-govbr` e mensagem nova de Wi-Fi com confiança, **When** retrieve, **Then** o contexto é Wi-Fi (não reutiliza o slug antigo como único critério)
- [ ] **Given** confiança `none`/`low`/`tie`, **When** retrieve, **Then** `steps` vazio e `topicSlug` null no contexto
- [ ] **Given** prompt builder com contexto Wi-Fi, **When** monta o user prompt, **Then** não contém instruções do tópico Gov.br

## Technical Notes

- Alterar `PrismaKnowledgeRetriever`: não fazer `slug = input.topicSlug` cego; combinar com `inferTopic` da mensagem atual
- `RagPromptBuilder` só lista passos se o modo for RAG com match único
- Teste de integração do gerador pode mockar LLM e assertar o prompt

## Dependencies

### Requires
- 001-normalize-and-fuzzy-match
- 002-topic-alias-corpus

### Enables
- 005-out-of-catalog-general-knowledge
- 006-immediate-topic-switch
- 007-relevance-regression-tests

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Slug persistido inválido / tópico inativo | Tratar como sem tópico |
| Inferência da mensagem confirma o slug atual | Manter tópico e passos atuais |

## Out of Scope

- Texto da pergunta de esclarecimento (story 004)
- Reset de `currentStep` (story 006)
