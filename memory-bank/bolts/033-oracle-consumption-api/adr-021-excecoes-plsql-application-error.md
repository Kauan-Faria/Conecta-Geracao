---
bolt: 033-oracle-consumption-api
created: 2026-09-26T13:10:00Z
status: accepted
---

# ADR-021: Exceções de domínio com RAISE_APPLICATION_ERROR

## Context

Usuário inexistente não pode parecer consumo zero. O mesmo vale para período com início posterior ao fim. As stories pedem bloco de exceção explícito e proíbem um total silencioso incorreto.

Um `RETURN 0` ou um `NULL` deixa o operador e o JDBC futuro sem saber se o consumo foi nulo ou se o pedido era inválido. Usuário que existe e não tem leitura no período é o único caso em que 0 é verdade.

## Decision

A function sinaliza `-20001` ou `-20002` e só devolve 0 quando o usuário existe e não há leituras no período.

- `-20001`: `Usuário de consumo inexistente.` Inclusive quando `p_usuario_id` é nulo.
- `-20002`: `Período inválido: início posterior ao fim.` Inclusive quando início ou fim é nulo.
- A checagem do período vem antes da checagem do usuário.
- O `EXCEPTION` traduz a exceção nomeada com `RAISE_APPLICATION_ERROR`. `WHEN OTHERS THEN RAISE` não engole falha de tabela ausente.
- `FN_CONSUMO_FORMATADO` não converte esses códigos em frase. A exceção sobe.

## Rationale

Código na faixa `-20000` a `-20999` é o contrato Oracle para erro de aplicação. O JDBC do bolt 034 consegue distinguir os dois casos pelo código, sem interpretar texto livre como regra.

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| `RETURN NULL` | Não dispara exceção | O caller trata null como zero | Volta o total silencioso |
| `RETURN -1` | Número fácil de testar | Colide com um sentinela e não é quantidade de tokens | Não é exceção |
| Só `NO_DATA_FOUND` sem código de aplicação | Menos código | Mensagem genérica e difícil de mapear no Java | O operador precisa da causa |

## Consequences

### Positive

- O teste SQL espera ORA-20001 e ORA-20002, não um número.
- Clara Sem Leituras continua podendo receber 0 de verdade.

### Negative

- Quem chamar a function num `SELECT` sem tratamento vê a consulta falhar.
- Os códigos `-20001` e `-20002` ficam reservados para este contexto.

### Risks

- Outro objeto PL/SQL reutilizar os mesmos códigos com outro significado. Mitigação: novos erros deste schema continuam a sequência a partir de `-20003`.

## Related

- **Stories**: 002-token-indicator-function, 003-formatted-consumption-function
- **Standards**: o formato HTTP de `api-conventions.md` não se aplica aqui; o mapeamento para JSON fica no bolt 034
- **Previous ADRs**: ADR-020
