---
bolt: 034-oracle-consumption-api
created: 2026-09-26T14:14:00Z
status: accepted
---

# ADR-026: Relatório com cursor e SYS_REFCURSOR

## Context

A story pede cursor e loop sobre os usuários, um IF para a presença de alerta e uma saída que o JDBC consiga ler. Um único `SELECT` atenderia o JDBC e esconderia o cursor. Uma collection SQL (`CREATE TYPE`) atende o loop, mas `CREATE OR REPLACE` do type quebra quando já existe dependente.

O relatório não é dado de negócio permanente. Publicar linha parcial no meio de uma falha faria o operador ver um resumo incompleto como se fosse o resultado final.

## Decision

`PR_RELATORIO_CONSUMO` percorre `USUARIO_CONSUMO` com cursor e loop, grava cada linha em `RELATORIO_CONSUMO_TMP` e só então abre um `SYS_REFCURSOR`.

- A temporária é global temporary table `ON COMMIT PRESERVE ROWS`, criada só se ainda não existe.
- O `DELETE` da sessão acontece no início da procedure, antes da validação do período, para um erro não reaproveitar o rascunho da chamada anterior.
- Cada linha usa `FN_INDICADOR_TOKENS` para o total. O IF marca `TEM_ALERTA` 1 ou 0 conforme exista alerta daquele usuário e período.
- O cursor de saída abre depois do loop. No `EXCEPTION`, a temporária da sessão é esvaziada e o erro sobe, sem ref cursor publicado.
- O Java lê o `ResultSet` na mesma conexão, com `OracleTypes.CURSOR`, e devolve a lista já materializada.
- Período inválido continua `-20002`, antes do loop.

## Rationale

O loop fica visível no fonte, que é o que a disciplina pede, e o JDBC recebe um cursor comum. A tabela temporária não guarda histórico e não compete com `ALERTA_CONSUMO`.

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| `OPEN cursor FOR SELECT` único | Curto e sem tabela extra | Não há cursor explícito nem loop | Não cumpre a story |
| `CREATE TYPE` e `TABLE()` | Lista em memória, sem GTT | Substituir o type depois falha por dependência | Pior de reaplicar que um `CREATE OR REPLACE` |
| Tabela permanente de relatório | Fácil de inspecionar no SQL | Vira lixo entre chamadas e parece dado de negócio | O resumo é calculado |

## Consequences

### Positive

- Uma linha por usuário do seed, com total igual ao indicador.
- Usuário sem leitura aparece com total 0.
- Reexecutar o script não apaga alerta já gravado.

### Negative

- A temporária precisa existir antes da procedure.
- Com autocommit, `ON COMMIT DELETE ROWS` esvaziaria o cursor cedo demais; por isso a preservação até o fim da sessão.

### Risks

- Duas chamadas na mesma sessão misturarem linhas. Mitigação: a procedure apaga a temporária da sessão no início, e o pool empresta uma conexão por chamada.

## Related

- **Stories**: 005-per-user-consumption-report, 006-java-jdbc-procedure-call
- **Standards**: objeto Oracle local; não entra no Prisma
- **Previous ADRs**: ADR-020, ADR-023, ADR-024
