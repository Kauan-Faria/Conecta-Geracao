---
bolt: 033-oracle-consumption-api
created: 2026-09-26T13:10:00Z
status: accepted
---

# ADR-024: Contrato das functions de consumo

## Context

Consultas SQL, o teste e o JDBC do bolt 034 precisam de uma frase e de um identificador estáveis. O domínio já fixou intervalo fechado, status alto a partir de 10.000 e preservação de acento. Sem uma frase única, cada caller inventa o texto.

O identificador externo distingue o seed fictício. Usá-lo também como parâmetro da function obriga um lookup a mais dentro de toda chamada.

## Decision

A function recebe o ID numérico, devolve a frase combinada e trata 10.000 tokens como consumo alto.

- Parâmetros: `p_usuario_id NUMBER`, `p_inicio TIMESTAMP`, `p_fim TIMESTAMP`.
- `FN_INDICADOR_TOKENS` retorna `NUMBER`.
- `FN_CONSUMO_FORMATADO` retorna `VARCHAR2(400)` e chama `FN_INDICADOR_TOKENS`.
- Constante local `c_limite NUMBER := 10000`, citada no comentário da function.
- Total maior ou igual ao limite: `{nome} consumiu {total} tokens no período. Consumo alto.`
- Total menor: `{nome} consumiu {total} tokens no período. Consumo normal.`
- `{total}` sai sem separador de milhar.
- Período de demonstração: `2026-09-01 00:00:00` a `2026-09-30 23:59:59`.
- Totais desse período: Ana Clara 3500, Bruno Alves 10000, Clara Sem Leituras 0.
- `ALERTA_CONSUMO` nasce vazia, com UK `(USUARIO_ID, INICIO, FIM)`, para a procedure do bolt 034 não precisar alterar a tabela.

## Rationale

O ID surrogate é o que a FK da leitura já usa. A frase estável deixa o teste de aceite comparar string. A UK antecipada guarda o invariante “um alerta por usuário e período” no schema, enquanto a procedure ainda não existe.

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Parâmetro = identificador externo | O seed não precisa descobrir o ID | Lookup em toda chamada e contrato diferente da FK | O teste obtém o ID por `SELECT` no identificador |
| Status em parâmetro `OUT` separado | Mais fácil de filtrar | O enunciado pede um `VARCHAR2` | Uma frase só |
| Criar a UK só no bolt 034 | Este bolt não mexe em alerta | A procedure passaria a carregar `ALTER TABLE` | A tabela já nasce neste schema |

## Consequences

### Positive

- Bruno Alves no limite prova o status alto sem um quarto usuário.
- Leituras na borda do período e fora dele provam o intervalo fechado.
- O bolt 034 herda a UK e as functions.

### Negative

- Mudar uma palavra da frase quebra o teste de string.
- O caller precisa resolver o ID antes de chamar a function.

### Risks

- Identity gerar IDs diferentes em cada máquina. Mitigação: o teste busca o ID pelo identificador externo, nunca por um número fixo.

## Related

- **Stories**: 001-oracle-schema-and-seed, 002-token-indicator-function, 003-formatted-consumption-function
- **Standards**: contrato local deste bolt; o envelope REST de `api-conventions.md` entra no bolt 034
- **Previous ADRs**: ADR-020, ADR-021, ADR-023
