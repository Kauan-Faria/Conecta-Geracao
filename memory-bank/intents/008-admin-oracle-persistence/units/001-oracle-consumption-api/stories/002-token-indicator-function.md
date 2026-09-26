---
id: 002-token-indicator-function
unit: 001-oracle-consumption-api
intent: 008-admin-oracle-persistence
status: complete
priority: must
created: 2026-09-26T12:43:00.000Z
assigned_bolt: 033-oracle-consumption-api
implemented: true
---

# Story: 002-token-indicator-function

## User Story

**As a** operador
**I want** uma function que some os tokens de um usuário no período
**So that** o indicador da tela venha do banco, não de uma conta feita só no Java

## Acceptance Criteria

- [ ] **Given** o seed da story 001, **When** a consulta chama a function com o usuário e o período, **Then** o retorno é a soma dos tokens das leituras daquele usuário com instante dentro do período
- [ ] **Given** um usuário que não existe, **When** a function é chamada, **Then** a exceção é tratada e o retorno não é um total silencioso como se o consumo fosse zero
- [ ] **Given** início do período posterior ao fim, **When** a function é chamada, **Then** a exceção de período inválido é tratada

## Technical Notes

- Nome previsto: `FN_INDICADOR_TOKENS`
- Parâmetros IN: identificador do usuário, data inicial, data final
- `RETURN NUMBER`
- Comentário de propósito no corpo da function
- Bloco de exceção explícito

## Dependencies

### Requires
- 001-oracle-schema-and-seed

### Enables
- 003-formatted-consumption-function
- 006-java-jdbc-procedure-call

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Usuário sem leituras no período | Total 0, sem exceção, porque o usuário existe |
| Leitura exatamente no instante inicial ou final | Entra na soma (intervalo fechado) |

## Out of Scope

- Texto formatado (story 003)
- Gravação de alerta
