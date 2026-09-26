---
bolt: 034-oracle-consumption-api
created: 2026-09-26T14:14:00Z
status: accepted
---

# ADR-025: Pool Oracle fora do bean DataSource

## Context

O `admin-api` já sobe um `DataSource` do Postgres e um `JdbcTemplate` que o dashboard usa. O consumo precisa de um segundo banco. Registrar outro bean `DataSource` faz o Spring Boot recuar da autoconfiguração: o JPA deixa de enxergar um único candidato e o `JdbcTemplate` do Postgres pode passar a apontar para o Oracle.

A instância Oracle local pode estar desligada. Se o pool novo impedir a subida da API, login, saúde e dashboard caem junto, e o Postgres deixa de responder por um banco que não é o dele.

## Decision

O pool Oracle não é um bean `DataSource` nem um segundo `JdbcTemplate` no contexto. Ele vive dentro de `OracleConsumoAccess`, criado na primeira chamada de consumo.

- `spring.datasource` e `ddl-auto: validate` permanecem os do Postgres.
- O `JdbcTemplate` injetado em `DashboardStatsService` continua sendo o automático.
- Sem `ORACLE_URL` e `ORACLE_USERNAME`, o pool nem é criado. A rota de consumo responde erro e a API sobe.
- Com a URL definida e o listener fora, a falha acontece na chamada, com timeout curto, não na inicialização do contexto.
- Credenciais continuam só em `ORACLE_URL`, `ORACLE_USERNAME` e `ORACLE_PASSWORD`.

## Rationale

Isolar o pool do grafo de beans do JPA cumpre o segundo datasource sem reconfigurar o EntityManager que já valida o schema do Supabase.

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Dois beans `DataSource`, um `@Primary` | Padrão de documentação do Spring | A autoconfiguração de JPA exige um único candidato e precisaria ser reescrita | Risco de apontar o dashboard para o Oracle |
| Mesmo `JdbcTemplate` com a URL trocada em runtime | Um bean só | Toda query do painel passaria a depender do Oracle | Derruba o Postgres na prática |
| Falhar o start se o Oracle estiver fora | Erro cedo e visível | Login e dashboard não sobem | A story pede o endpoint antigo de pé |

## Consequences

### Positive

- Oracle desligado não impede `/health` nem `/api/dashboard/stats`.
- Não há ambiguidade de injeção do `JdbcTemplate`.

### Negative

- O pool não aparece no actuator como um `DataSource` gerenciado.
- Quem procurar um `@Bean DataSource` oracle não vai encontrar.

### Risks

- Algum serviço futuro injetar `JdbcTemplate` e receber o do Postgres achando que é o Oracle. Mitigação: só `OracleConsumoAccess` abre conexão Oracle; o serviço de consumo não recebe `JdbcTemplate` no construtor.

## Related

- **Stories**: 006-java-jdbc-procedure-call
- **Standards**: desvio intencional do datasource único descrito em `system-architecture.md` e `data-stack.md`
- **Previous ADRs**: ADR-019, ADR-022
