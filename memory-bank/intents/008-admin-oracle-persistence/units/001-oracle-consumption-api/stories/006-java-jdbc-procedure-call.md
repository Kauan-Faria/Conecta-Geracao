---
id: 006-java-jdbc-procedure-call
unit: 001-oracle-consumption-api
intent: 008-admin-oracle-persistence
status: complete
priority: must
created: 2026-09-26T12:43:00.000Z
assigned_bolt: 034-oracle-consumption-api
implemented: true
---

# Story: 006-java-jdbc-procedure-call

## User Story

**As a** operador autenticado
**I want** que a API Java consulte o consumo e dispare a procedure de alerta
**So that** o painel não fale com o Oracle direto e o enunciado de backend → JDBC → Oracle se cumpra

## Acceptance Criteria

- [ ] **Given** JWT de operador, **When** a consulta de consumo é chamada para um usuário e período, **Then** a resposta traz o indicador, o texto formatado, os alertas e o relatório, lidos do Oracle
- [ ] **Given** JWT de operador e um usuário no limite ou acima, **When** o disparo é chamado, **Then** `PR_REGISTRAR_ALERTA_CONSUMO` executa via JDBC e o alerta fica visível na consulta seguinte
- [ ] **Given** requisição sem JWT, **When** consulta ou disparo é chamado, **Then** a API recusa
- [ ] **Given** Oracle inacessível, **When** a consulta de consumo é chamada, **Then** a API responde erro claro e um endpoint já existente do Postgres continua respondendo

## Technical Notes

- Segundo datasource. Não reutilizar o `JdbcTemplate` do Postgres para SQL Oracle
- URL, usuário e senha por ambiente, sem commit de segredo
- Disparo com `CallableStatement` (ou equivalente Spring) na procedure de alerta
- A consulta pode chamar as functions por SQL e a procedure de relatório por JDBC

## Dependencies

### Requires
- 002-token-indicator-function
- 003-formatted-consumption-function
- 004-high-consumption-alert-procedure
- 005-per-user-consumption-report

### Enables
- 001-consumption-screen (unit `002-admin-consumption-ui`)
- 002-trigger-alert-routine (unit `002-admin-consumption-ui`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Credencial Oracle ausente no ambiente | A API sobe ou falha de forma explícita na rota de consumo, sem apagar a configuração do Postgres |
| Período inválido vindo do cliente | 400 com mensagem, sem chamar a procedure |

## Out of Scope

- Componentes Angular
- Trocar o banco do NestJS
