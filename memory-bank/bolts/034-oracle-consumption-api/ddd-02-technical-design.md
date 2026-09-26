---
unit: 001-oracle-consumption-api
bolt: 034-oracle-consumption-api
stage: design
status: complete
updated: 2026-09-26T14:12:00Z
---

# Technical Design - Oracle Consumption API

## Architecture Pattern

O PL/SQL continua dono da regra. O Java autentica, valida o pedido e chama Oracle por JDBC. Não soma tokens em memória e não reescreve a frase do bolt 033.

O pool Oracle nasce sob demanda, dentro de um componente que não é bean `DataSource`. O `JdbcTemplate` automático segue no Postgres, que é o que `DashboardStatsService` já usa. `spring.jpa.hibernate.ddl-auto` permanece `validate`.

## Layer Structure

```text
┌─────────────────────────────┐
│      Presentation           │  ConsumptionController. JWT do filtro já existente.
├─────────────────────────────┤
│      Application            │  ConsumoService: valida período e traduz erro.
├─────────────────────────────┤
│        Domain               │  Procedures e functions no Oracle.
├─────────────────────────────┤
│     Infrastructure          │  OracleConsumoAccess + scripts em db/oracle.
└─────────────────────────────┘
```

O `admin-api` já organiza controller, service e dto. Este bolt entra nesse formato, sem um segundo módulo JPA.

| Arquivo | Papel |
|---------|--------|
| `006_pr_registrar_alerta_consumo.sql` | Procedure de alerta |
| `007_pr_relatorio_consumo.sql` | Tabela temporária de sessão e procedure de relatório |
| `MODELO.md` | DER, colunas, objetos e o fluxo até o Java |

As functions e o DDL do bolt 033 não mudam de contrato. O comentário da tabela de alerta passa a dizer que a procedure insere a linha.

## API Design

Rotas novas, no mesmo servidor da porta 8081. Qualquer rota que não seja login, swagger ou `/health` já exige JWT. Estas duas ficam nessa regra. Sem token, o filtro responde 401 e o Oracle não é chamado.

- **GET `/api/consumption`**: consulta. Query: `userId` (inteiro positivo), `periodStart`, `periodEnd` (`LocalDateTime`, sem fuso, no relógio do seed). Response: `userId`, `periodStart`, `periodEnd`, `tokenTotal`, `formattedText`, `alerts[]`, `report[]`.
- **POST `/api/consumption/alerts`**: disparo. Body: `userId`, `periodStart`, `periodEnd`, `limit` opcional. Response: `alertId` (nulo quando o total fica abaixo do limite) e `recorded`.

`alerts[]`: `id`, `userId`, `periodStart`, `periodEnd`, `tokenTotal`, `message`, `createdAt`.

`report[]`: `userId`, `name`, `tokenTotal`, `hasAlert`.

Período de demonstração para o chamador: `2026-09-01T00:00:00` até `2026-09-30T23:59:59`.

| Falha | HTTP | code |
|-------|------|------|
| JSON ou parâmetro ilegível, período invertido, limite negativo | 400 | `VALIDATION_ERROR` |
| Sem JWT | 401 | o filtro atual |
| Usuário de consumo inexistente (`-20001`) | 404 | `NOT_FOUND` |
| Oracle sem variável, fora do ar ou erro de conexão | 503 | `ORACLE_UNAVAILABLE` |

O corpo do 503 não inclui URL, usuário nem senha. A mensagem diz que o restante do painel continua no Postgres.

## Data Persistence

Nenhuma tabela permanente nova. `ALERTA_CONSUMO` já tem a UK `(USUARIO_ID, INICIO, FIM)`.

| Objeto | Colunas ou parâmetros | Papel |
|--------|------------------------|-------|
| `PR_REGISTRAR_ALERTA_CONSUMO` | IN `p_usuario_id`, `p_inicio`, `p_fim`, `p_limite` default 10000; OUT `p_alerta_id` | Chama `FN_INDICADOR_TOKENS`. Abaixo do limite, OUT nulo. No limite ou acima, insere ou devolve o id já gravado. Mensagem: `{nome} consumiu {total} tokens no período. Consumo alto.` O total sai com `TO_CHAR(..., 'FM999999999999')`, igual à function. |
| `RELATORIO_CONSUMO_TMP` | `USUARIO_ID`, `NOME`, `TOTAL_TOKENS`, `TEM_ALERTA` | Global temporary table `ON COMMIT PRESERVE ROWS`. Dado de sessão. Não é série de negócio. |
| `PR_RELATORIO_CONSUMO` | IN `p_inicio`, `p_fim`; OUT `p_resultado SYS_REFCURSOR` | Apaga a temporária no início, também quando o período é inválido. Percorre `USUARIO_CONSUMO` com cursor e loop, preenche total e o IF do alerta, e abre o cursor só no fim. |

Códigos novos e herdados, na faixa já reservada:

| Código | Quando |
|--------|--------|
| `-20001` | Usuário inexistente, vindo da function |
| `-20002` | Período inválido |
| `-20003` | Limite negativo |

`DUP_VAL_ON_INDEX` na UK vira leitura do alerta já inserido, não erro para o Java.

O Java consome o ref cursor dentro da mesma conexão, antes de devolvê-la ao pool.

## Security Design

| Concern | Approach |
|---------|----------|
| Authentication | Filtro JWT existente. Nenhuma rota nova entra em `permitAll`. |
| Authorization | Operador autenticado. Não há papel extra. |
| Segredo | `ORACLE_URL`, `ORACLE_USERNAME`, `ORACLE_PASSWORD` só por ambiente. O YAML não tem URL de exemplo com senha. |
| Isolamento | Pool criado na primeira chamada de consumo. Falha dessa chamada não troca `spring.datasource` nem o `JdbcTemplate` do dashboard. |
| Log | Falha Oracle no log do servidor, sem senha e sem URL. |

## NFR Implementation

| Requirement | Design Approach |
|-------------|-----------------|
| Performance | Seed pequeno. Timeout de conexão e de query em 3 segundos, alinhado à meta da tela. Pool com no máximo 2 conexões. |
| Scalability | Demonstração local. Sem cache e sem fila. |
| Reliability | `initializationFailTimeout` negativo: a API sobe com o Oracle desligado. A primeira rota de consumo é que falha. `/health` e `/api/dashboard/stats` não usam esse pool. |
| Idempotência | Procedure com `CREATE OR REPLACE`. A temporária só é criada se `USER_TABLES` ainda não a tem. |

## External Dependencies

| Service | Purpose | Integration |
|---------|---------|-------------|
| Oracle local | Procedures, functions e tabelas do bolt 033 | JDBC `CallableStatement` e `SELECT ... FROM DUAL` |
| Postgres | Dashboard e CRUD já existentes | `JdbcTemplate` automático, intocado |
| Bolt 035 | Tela do operador | Vai chamar os dois endpoints com o interceptor de JWT |

## Fora deste desenho

- Rota Angular, guard e componentes.
- Suíte que executa o SQL na instância. Isso fica no estágio de teste.
