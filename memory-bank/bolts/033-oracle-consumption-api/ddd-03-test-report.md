---
unit: 001-oracle-consumption-api
bolt: 033-oracle-consumption-api
stage: test
status: complete
updated: 2026-09-26T14:00:00Z
---

# Test Report - Oracle Consumption API

## Test Summary

| Category | Passed | Failed | Skipped | Coverage |
|----------|--------|--------|---------|----------|
| Unit | 15 | 0 | 0 | ramos das stories executados |
| Integration | 10 | 0 | 0 | suíte + reexecução do seed |
| Security | 4 | 0 | 0 | - |
| Performance | 2 | 0 | 0 | - |
| **Total** | 31 | 0 | 0 | ramos de aceite cobertos |

Ambiente: container `conecta-oracle-consumo`, imagem `gvenzl/oracle-free:23-slim-faststart`, serviço `FREEPDB1`, usuário `conecta`. A instalação nativa em `C:\app\Kauan\product\21c` continua só com restos de desinstalação. A senha não entrou no Git.

Durante a primeira execução, `005_test_consumo.sql` não compilou: variáveis declaradas depois dos subprogramas. O bloco foi corrigido e a suíte passou. Reaplicar `002_seed_consumo.sql` e rodar `005` de novo também passou, com as mesmas 6 leituras.

## Acceptance Criteria Validation

| Story | Criteria | Status |
|-------|----------|--------|
| 001-oracle-schema-and-seed | Três tabelas, FK da leitura, UK de alerta e índice | ✅ |
| 001-oracle-schema-and-seed | Um usuário abaixo de 10.000 (3500) e um no limite (10000) | ✅ |
| 001-oracle-schema-and-seed | Três identificadores `sim-*`, nenhum fora do seed | ✅ |
| 001-oracle-schema-and-seed | Segunda execução do seed não duplica a série | ✅ |
| 002-token-indicator-function | Soma igual às leituras do período fechado | ✅ Ana 3500, Bruno 10000, Clara 0 |
| 002-token-indicator-function | Usuário inexistente e id nulo devolvem `-20001` | ✅ |
| 002-token-indicator-function | Período invertido e data nula devolvem `-20002` | ✅ |
| 003-formatted-consumption-function | Frase com nome, total e status | ✅ |
| 003-formatted-consumption-function | 10000 é consumo alto; 3500 e 0 são normal | ✅ |
| 003-formatted-consumption-function | Usuário inexistente não vira frase de zero (`-20001`) | ✅ |

## Unit Tests

`005_test_consumo.sql` no schema `conecta`, em 2026-09-26:

- Ana Clara: soma crua 3500, function igual à soma, texto de consumo normal
- Bruno Alves: 10000 e `Consumo alto.`
- Clara Sem Leituras: 0 e `Consumo normal.`
- Leitura de 31/08 existe e fica fora da soma; borda de 30/09 23:59:59 está no seed
- `-20001` no indicador e no texto para usuário inexistente
- `-20002` para período invertido no indicador e no texto
- `-20001` para id nulo e `-20002` para data nula

Saída final: `OK suite concluida`.

## Integration Tests

`001` a `004` aplicaram no banco vazio do container: tabelas, functions `VALID` e seed. A suíte conferiu 3 tabelas, a FK, a UK, o índice, 3 usuários, 6 leituras e alerta vazio. A segunda aplicação de `002` manteve esses totais.

## Security Tests

- ✅ Nenhum `CONNECT`, senha ou `jdbc:` nos scripts versionados
- ✅ Nenhum `INSERT` em `ALERTA_CONSUMO`; a suíte contou 0 linhas
- ✅ Identificadores do seed são só `sim-abaixo-limite`, `sim-no-limite` e `sim-sem-leitura`
- ✅ `application.yml` segue com `jdbc:postgresql` e `ddl-auto: validate`

Não há endpoint HTTP neste bolt.

## Performance Tests

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| `FN_INDICADOR_TOKENS` de Bruno no período de demonstração | consulta local imediata | 00:00:00.02 | ✅ |
| `FN_CONSUMO_FORMATADO` de Bruno | consulta local imediata | 00:00:00.00 | ✅ |

A meta de tela abaixo de 3 s pertence ao bolt da API. As duas functions, com seis leituras, ficaram bem abaixo disso.

## Coverage Report

Não há profiler de linhas PL/SQL. Os ramos pedidos pelas stories rodaram: soma com leituras, soma zero, intervalo fechado, status alto no limite, status normal, usuário inexistente, id nulo, período invertido e data nula. O texto de Bruno voltou com o acento de "período".

## Issues Found

| Issue | Severity | Status |
|-------|----------|--------|
| Instância nativa indisponível | High | Fixed — suíte rodou no container local |
| `005_test_consumo.sql` declarava variáveis depois dos subprogramas | High | Fixed |
| O nome do seed não tem acento; o acento verificado é o de "período" na frase | Low | Open |

## Ready for Operations

- [x] All acceptance criteria met
- [x] Ramos de aceite das duas functions executados
- [x] No critical/high severity issues open
- [x] Performance targets met
- [x] Security tests passing
