---
id: 005-per-user-consumption-report
unit: 001-oracle-consumption-api
intent: 008-admin-oracle-persistence
status: complete
priority: must
created: 2026-09-26T12:43:00.000Z
assigned_bolt: 034-oracle-consumption-api
implemented: true
---

# Story: 005-per-user-consumption-report

## User Story

**As a** operador
**I want** um resumo de consumo de cada usuário simulado
**So that** eu compare tokens e veja quem já tem alerta

## Acceptance Criteria

- [ ] **Given** o seed, **When** a procedure de relatório roda para o período, **Then** o resultado tem uma linha por usuário simulado
- [ ] **Given** uma linha do relatório, **When** se soma as leituras daquele usuário no período, **Then** o total da linha é igual a essa soma
- [ ] **Given** um usuário que já tem alerta naquele período, **When** a linha é lida, **Then** ela indica que houve alerta
- [ ] **Given** falha ao percorrer o cursor, **When** a exceção ocorre, **Then** ela é tratada

## Technical Notes

- Nome previsto: `PR_RELATORIO_CONSUMO`
- CURSOR sobre os usuários e LOOP para montar o resumo
- Saída consumível pelo JDBC: tabela de trabalho, collection ou `SYS_REFCURSOR` — a escolha fica no desenho do bolt
- IF para marcar a presença de alerta

## Dependencies

### Requires
- 001-oracle-schema-and-seed
- 004-high-consumption-alert-procedure

### Enables
- 006-java-jdbc-procedure-call

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Usuário sem leituras no período | Linha com total 0 e sem alerta |
| Período inválido | Exceção tratada, sem linhas parciais publicadas como resultado final |

## Out of Scope

- Disparo HTTP
- Layout da tabela no Angular
