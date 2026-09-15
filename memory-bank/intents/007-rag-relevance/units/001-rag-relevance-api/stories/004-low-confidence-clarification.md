---
id: 004-low-confidence-clarification
unit: 001-rag-relevance-api
intent: 007-rag-relevance
status: complete
priority: must
created: 2026-09-15T00:30:00.000Z
assigned_bolt: 032-rag-relevance-api
implemented: true
---

# Story: 004-low-confidence-clarification

## User Story

**As a** usuário que escreveu algo vago (“não funciona”, “código QR”)
**I want** a IA perguntar de novo, em português simples, o que eu preciso
**So that** ela não chute um assunto errado

## Acceptance Criteria

- [ ] **Given** confiança `tie` ou `low`, **When** gera resposta, **Then** modo `clarify`: **nenhum** passo RAG no prompt e `topicSlug` **não** é persistido
- [ ] **Given** empate Wi-Fi vs Gov.br, **When** esclarece, **Then** a pergunta oferece no máximo 2 opções concretas, frases curtas
- [ ] **Given** “me ajuda” / “não funciona” sem tópico na conversa, **When** esclarece, **Then** pergunta o que a pessoa está tentando fazer (sem listar os 6 de uma vez como obrigação)
- [ ] **Given** 2 esclarecimentos seguidos ainda sem match `high`, **When** chega a 3ª mensagem vaga, **Then** cai no modo geral (story 005) — não pergunta uma 3ª vez

## Technical Notes

- Contador de esclarecimentos: campo transitório na conversa ou heurística no histórico recente (assistant perguntou e user não fechou tópico)
- Preferir template de pergunta (sem RAG) para cumprir NFR de não buscar KB
- Linguagem alinhada ao `ux-guide` (vocabulário simples)

## Dependencies

### Requires
- 003-never-inject-wrong-topic

### Enables
- 005-out-of-catalog-general-knowledge
- 007-relevance-regression-tests

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Usuário responde a esclarecimento com “wifi” | Match high → RAG Wi-Fi |
| Checkpoint `sim` no meio de tópico | Não é clarify (story 006) |

## Out of Scope

- Conteúdo da orientação geral (story 005)
