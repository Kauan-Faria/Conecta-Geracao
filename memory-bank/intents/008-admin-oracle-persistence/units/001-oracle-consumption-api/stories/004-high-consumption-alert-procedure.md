---
id: 004-high-consumption-alert-procedure
unit: 001-oracle-consumption-api
intent: 008-admin-oracle-persistence
status: complete
priority: must
created: 2026-09-26T12:43:00.000Z
assigned_bolt: 034-oracle-consumption-api
implemented: true
---

# Story: 004-high-consumption-alert-procedure

## User Story

**As a** operador
**I want** que o banco registre um alerta quando os tokens do usuário ficam altos
**So that** o consumo crítico fique gravado e não só calculado na hora

## Acceptance Criteria

- [ ] **Given** um usuário cujo total no período é igual ou maior que 10.000, **When** a procedure roda, **Then** existe um alerta com usuário, período, total de tokens e mensagem
- [ ] **Given** um usuário abaixo de 10.000, **When** a procedure roda, **Then** nenhum alerta novo é inserido para esse usuário e período
- [ ] **Given** um alerta já gravado para o mesmo usuário e período, **When** a procedure roda de novo, **Then** continua existindo um único alerta
- [ ] **Given** usuário inexistente ou período inválido, **When** a procedure roda, **Then** a exceção é tratada e não fica linha parcial

## Technical Notes

- Nome previsto: `PR_REGISTRAR_ALERTA_CONSUMO`
- Parâmetros IN: usuário, início, fim e limite (padrão 10.000)
- Usar IF para a decisão de gravar e bloco EXCEPTION
- Esta é a procedure que o Java dispara na story 006

## Dependencies

### Requires
- 001-oracle-schema-and-seed
- 002-token-indicator-function

### Enables
- 005-per-user-consumption-report
- 006-java-jdbc-procedure-call

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Limite informado diferente de 10.000 | A comparação usa o parâmetro, não o literal fixo |
| Falha no INSERT | EXCEPTION desfaz o efeito parcial |

## Out of Scope

- Relatório de todos os usuários (story 005)
- Chamada HTTP (story 006)
