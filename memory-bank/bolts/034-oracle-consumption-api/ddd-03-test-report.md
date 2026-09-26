---
unit: 001-oracle-consumption-api
bolt: 034-oracle-consumption-api
stage: test
status: complete
updated: 2026-09-26T14:39:00Z
---

# Test Report - Oracle Consumption API

## Test Summary

| Category | Passed | Failed | Skipped | Coverage |
|----------|--------|--------|---------|----------|
| Unit | 11 | 0 | 0 | ConsumoService 83% das instruções |
| Integration | 44 | 0 | 0 | suíte SQL no container; 005 do bolt 033 reexecutada |
| Security | 6 | 0 | 0 | - |
| Performance | 4 | 0 | 0 | - |
| **Total** | 65 | 0 | 0 | ramos de aceite cobertos |

Ambiente Oracle: container `conecta-oracle-consumo`, imagem `gvenzl/oracle-free:23-slim-faststart`, serviço `FREEPDB1`, usuário `conecta`. A senha não entrou no Git. Java: JDK 22, testes do `admin-api` com perfil `local` em H2 em memória, sem `ORACLE_URL`.

## Acceptance Criteria Validation

| Story | Criteria | Status |
|-------|----------|--------|
| 004-high-consumption-alert-procedure | Bruno no limite grava alerta com total 10000 e a frase de consumo alto | ✅ |
| 004-high-consumption-alert-procedure | Ana abaixo de 10000 não grava e o OUT fica nulo | ✅ |
| 004-high-consumption-alert-procedure | Segunda chamada de Bruno devolve o mesmo id e a contagem continua 1 | ✅ |
| 004-high-consumption-alert-procedure | Usuário 999999, período invertido e limite negativo não deixam linha parcial | ✅ `-20001`, `-20002`, `-20003` |
| 004-high-consumption-alert-procedure | Limite 1500 no ponto de 2000 grava; limite 3000 nesse ponto não grava | ✅ |
| 005-per-user-consumption-report | Três linhas, totais 3500, 10000 e 0 | ✅ antes e depois do alerta |
| 005-per-user-consumption-report | Bruno só marca alerta depois da procedure de registro | ✅ |
| 005-per-user-consumption-report | Período inválido não publica linha | ✅ temporária fica em 0 |
| 006-java-jdbc-procedure-call | `CallableStatement` chama `PR_REGISTRAR_ALERTA_CONSUMO` e o relatório usa `SYS_REFCURSOR` | ✅ |
| 006-java-jdbc-procedure-call | GET e POST sem JWT respondem 401 | ✅ |
| 006-java-jdbc-procedure-call | Período invertido responde 400 sem abrir o pool | ✅ |
| 006-java-jdbc-procedure-call | Sem credencial Oracle a consulta responde 503 e `/health` e `/api/dashboard/stats` seguem 200 | ✅ |
| 007-oracle-model-documentation | `MODELO.md` tem DER, tabelas, functions, procedures, fluxo e o limite 10.000 | ✅ |
| 007-oracle-model-documentation | Scripts e o YAML não contêm connect string nem senha | ✅ |

## Unit Tests

`ConsumoServiceTest` (9) e `OracleConsumoAccessTest` (2), em 2026-09-26:

- Período invertido, usuário inválido e limite negativo não chamam `require()`
- `-20001` vira `ResourceNotFoundException`; `-20002` vira `ValidationException`; código de conexão vira `ORACLE_UNAVAILABLE` com a mensagem fixa
- A consulta lê indicador, texto e o cursor `PR_RELATORIO_CONSUMO`
- O disparo prepara `{ call PR_REGISTRAR_ALERTA_CONSUMO(?, ?, ?, ?, ?) }`, manda o limite padrão 10000 quando o corpo omite o campo, e trata OUT nulo como não gravado
- URL ou usuário em branco não cria pool

## Integration Tests

`006` e `007` aplicados no schema `conecta`. `008_test_procedures.sql` terminou com `OK suite concluida` (44 asserts). No fim a tabela de alerta volta a ficar vazia. `005_test_consumo.sql` rodou de novo e também terminou com `OK suite concluida`.

## Security Tests

- ✅ GET `/api/consumption` e POST `/api/consumption/alerts` sem JWT: 401
- ✅ JWT válido com período invertido: 400 `VALIDATION_ERROR`
- ✅ Sem `ORACLE_URL`: 503 `ORACLE_UNAVAILABLE`; `/health` e `/api/dashboard/stats` continuam 200
- ✅ Nenhum script Oracle contém `CONNECT`, `IDENTIFIED BY` ou `jdbc:oracle:thin`
- ✅ `application.yml` segue com `jdbc:postgresql` e `ddl-auto: validate`

## Performance Tests

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| `PR_REGISTRAR_ALERTA_CONSUMO` de Ana | < 3 s | 0 centésimos | ✅ |
| `PR_RELATORIO_CONSUMO` antes do alerta | < 3 s | 0 centésimos | ✅ |
| `PR_RELATORIO_CONSUMO` depois do alerta | < 3 s | 0 centésimos | ✅ |
| Consulta HTTP com Oracle sem credencial, mais o dashboard | < 3 s | o teste Java recusou se passasse de 3000 ms | ✅ |

`DBMS_UTILITY.GET_TIME` mede em centésimos de segundo. Zero significa menos de 0,01 s no seed local.

## Coverage Report

JaCoCo 0.8.12 nas classes deste bolt, instruções executadas pelos testes Java:

| Classe | Instruções |
|--------|------------|
| ConsumoService | 83% |
| JwtAuthenticationFilter | 98% |
| OracleConsumoAccess | 34% |
| ConsumptionController | 33% |
| GlobalExceptionHandler | 23% |

O ramo que abre o pool Hikari não rodou no JUnit: o teste de API prova a recusa quando a variável está vazia, e a suíte SQL prova as procedures no banco. Não há cobertura de linha do PL/SQL. Os ramos pedidos pelas stories rodaram no `008`.

## Issues Found

| Issue | Severity | Status |
|-------|----------|--------|
| `COMMENT ON PROCEDURE` no Oracle 23 devolve ORA-32594 | Medium | Fixed — o comentário saiu do script; o propósito está no `MODELO.md` |
| Período inválido deixava as linhas da chamada anterior na temporária | Medium | Fixed — o `DELETE` ocorre no início da procedure |
| Pedido sem JWT seguia a cadeia e o Spring respondia como anônimo | Medium | Fixed — o filtro devolve 401 |

## Ready for Operations

- [x] All acceptance criteria met
- [x] Ramos de aceite das procedures e da API executados; ConsumoService acima de 80% das instruções
- [x] No critical/high severity issues open
- [x] Performance targets met
- [x] Security tests passing
