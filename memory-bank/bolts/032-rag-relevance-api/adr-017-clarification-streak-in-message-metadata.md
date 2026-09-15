---
bolt: 032-rag-relevance-api
created: 2026-09-15T01:20:00Z
status: accepted
---

# ADR-017: Streak de esclarecimento no metadata da mensagem

## Context

FR-3 limita a **2** esclarecimentos seguidos; a 3ª mensagem ainda vaga/empatada
cai em conhecimento geral. O domínio precisa saber quantos assistants `clarify`
ocorreram no fim do histórico.

Opções: coluna em `Conversation`, campo na sessão guest, ou derivar do
histórico. O projeto já persiste `Message.metadata` (ex.: `map_action`, ADR-004).
Guest e autenticado compartilham o mesmo generator.

## Decision

A streak **não** ganha coluna SQL. Cada mensagem assistant grava
`metadata.replyMode` ∈ `rag` | `clarify` | `general`.

`ClarificationStreakCounter` conta assistants **seguidos** com
`replyMode === 'clarify'` no histórico recente. Qualquer `rag`/`general` zera.
Mensagens antigas **sem** `replyMode` contam como 0 (não abrem loop).

O mesmo metadata vale no guest chat. Sem migration Prisma neste bolt.

## Rationale

- Reusa o canal de metadata já no agregado Message
- Paridade guest/auth sem schema paralelo
- Testável com array de mensagens mockadas
- FR-3 é regra de turno, não dado de negócio de longo prazo

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| `Conversation.consecutiveClarifyCount` | O(1) no read | Migration; guest pode não ter a mesma linha; drift se metadata e coluna divergirem | Overkill no MVP |
| Contar só pelo texto (“?” / “tentando fazer”) | Zero persistência extra | Frágil; RAG também pergunta checkpoint | Falso positivo |
| Streak só em memória de request | Simples | Perde entre requests HTTP | Inútil |

## Consequences

### Positive

- Zero migration neste bolt
- Debug: o histórico mostra o modo de cada resposta
- Checkpoint de tutorial só se `streak === 0` (último assistant não foi clarify)

### Negative

- Depende de o use case **sempre** gravar `replyMode` (senão streak some)
- Histórico truncado (últimas N) pode subcontar se N for pequeno demais

### Risks

- **Use case esquecer metadata**: mitigado por teste de persistência em
  SendMessage e ReplyGuest
- **N pequeno demais**: usar as mesmas ~10 mensagens já carregadas no generator
  (2 clarifys cabem folgado)

## Related

- **Stories**: 004-low-confidence-clarification, 006-immediate-topic-switch
- **Standards**: `data-stack.md` (evitar migration sem necessidade)
- **Previous ADRs**: ADR-004 (metadata na mensagem assistant)
