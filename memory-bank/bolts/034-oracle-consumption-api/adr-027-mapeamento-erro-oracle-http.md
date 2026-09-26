---
bolt: 034-oracle-consumption-api
created: 2026-09-26T14:14:00Z
status: accepted
---

# ADR-027: Erro PL/SQL mapeado na borda HTTP

## Context

O bolt 033 reservou `-20001` e `-20002` e deixou o JSON para este bolt. O cliente do admin precisa distinguir usuário inexistente, período inválido e Oracle fora do ar. Devolver tudo como 500 faz o painel tratar falha de digitação como pane, e incluir a mensagem crua do driver pode vazar host ou usuário da conexão.

O período invertido que já veio no JSON não deve chegar à procedure.

## Decision

A borda HTTP traduz o código Oracle e recusa o pedido inválido antes do JDBC.

- Período invertido, data ausente, corpo ilegível ou limite negativo: 400 `VALIDATION_ERROR`, sem `CallableStatement`.
- `-20001`: 404 `NOT_FOUND` com `Usuário de consumo inexistente.`
- `-20002`: 400 `VALIDATION_ERROR` com `Período inválido: início posterior ao fim.`
- `-20003`: 400 `VALIDATION_ERROR` com `Limite de consumo inválido.`
- Credencial ausente, timeout ou qualquer outra falha de conexão: 503 `ORACLE_UNAVAILABLE`, mensagem fixa, causa só no log.
- Sem JWT: 401 do filtro já existente. O serviço de consumo não roda.

O código numérico lido do `SQLException` é o valor absoluto, porque o driver reporta 20001 para `RAISE_APPLICATION_ERROR(-20001)`.

## Rationale

Os códigos da ADR-021 viram status que o Angular já sabe mostrar. A mensagem fixa do 503 evita que o operador veja a URL do listener.

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Propagar a mensagem do `SQLException` | Diagnóstico rápido na tela | Pode conter host, usuário ou SQL | Segredo e ruído |
| Tudo 500 | Um handler só | O painel não separa dado inválido de banco fora | A story pede 400 no período e erro claro no Oracle |
| Tratar `-20001` como total zero | A tela sempre desenha um número | Volta o consumo silencioso que a function proibiu | Contradiz a ADR-021 |

## Consequences

### Positive

- O teste da API pode afirmar 401, 400, 404 e 503 sem interpretar ORA- no texto.
- Falha de conexão não passa pelo handler genérico que concatena `ex.getMessage()`.

### Negative

- Um erro Oracle inesperado também vira 503, não 500 com detalhe na resposta.
- O log do servidor é o lugar para ver a causa.

### Risks

- Outro objeto usar `-20003` com outro sentido. Mitigação: o próximo código deste schema continua em `-20004`.

## Related

- **Stories**: 004-high-consumption-alert-procedure, 006-java-jdbc-procedure-call
- **Standards**: aproxima o erro do envelope de `api-conventions.md` no formato que o `admin-api` já usa (`code`, `message`, `timestamp`)
- **Previous ADRs**: ADR-021, ADR-025
