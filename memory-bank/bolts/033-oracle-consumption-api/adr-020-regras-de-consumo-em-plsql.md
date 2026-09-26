---
bolt: 033-oracle-consumption-api
created: 2026-09-26T13:10:00Z
status: accepted
---

# ADR-020: Regras de consumo calculadas em PL/SQL

## Context

O padrão do projeto coloca regra de negócio na aplicação, em camadas hexagonais. Nesta intent o operador precisa ler o total de tokens e o texto de status a partir do banco. A story 002 exige que a soma não seja uma conta feita só no Java.

Se o Java somar as leituras e o PL/SQL também somar, os dois resultados divergem. Se só o Java somar, o objeto pedido pelo enunciado fica vazio de regra.

## Decision

`FN_INDICADOR_TOKENS` e `FN_CONSUMO_FORMATADO` calculam a soma e o texto. O Java futuro só chama.

- O indicador soma `QUANTIDADE_TOKENS` no intervalo fechado.
- O texto reutiliza o indicador. Não repete o `SUM`.
- Este bolt não adiciona use case, controller nem `JdbcTemplate`.

## Rationale

A regra fica num lugar só, que é o lugar que o enunciado avalia. O bolt 034 pode chamar a function sem reinterpretar o limite.

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Soma no Java, Oracle só guarda linhas | Encaixa no padrão hexagonal | A function não seria a fonte do indicador | A story pede o retorno da function |
| Soma duplicada no Java e no PL/SQL | A tela funciona mesmo sem chamar a function | Dois limites e dois totais | Risco de divergência |
| View SQL sem function | Consulta simples | Não atende o enunciado de function com exceção e comentário | Forma errada para a disciplina |

## Consequences

### Positive

- Uma consulta em `DUAL` já prova o indicador e o texto.
- O bolt 034 não reimplementa a soma.

### Negative

- A regra não aparece como classe de domínio no `admin-api`.
- Mudar o texto ou o limite exige alterar a function, não um teste Jest.

### Risks

- Um endpoint futuro recalcular tokens em memória. Mitigação: o caller JDBC usa o `RETURN` da function.

## Related

- **Stories**: 002-token-indicator-function, 003-formatted-consumption-function
- **Standards**: desvio intencional de `coding-standards.md` e `system-architecture.md` neste bounded context
- **Previous ADRs**: ADR-019
