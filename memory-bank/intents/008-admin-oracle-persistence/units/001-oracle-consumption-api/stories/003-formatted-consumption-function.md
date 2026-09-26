---
id: 003-formatted-consumption-function
unit: 001-oracle-consumption-api
intent: 008-admin-oracle-persistence
status: complete
priority: must
created: 2026-09-26T12:43:00.000Z
assigned_bolt: 033-oracle-consumption-api
implemented: true
---

# Story: 003-formatted-consumption-function

## User Story

**As a** operador
**I want** uma frase em português com o nome, os tokens e se o consumo está alto
**So that** eu leia o resultado sem interpretar o número cru

## Acceptance Criteria

- [ ] **Given** um usuário do seed e um período, **When** a consulta chama a function, **Then** o retorno é uma única string com o nome, o total de tokens e o status
- [ ] **Given** total de tokens do período maior ou igual a 10.000, **When** a function retorna, **Then** o texto marca consumo alto
- [ ] **Given** total abaixo de 10.000, **When** a function retorna, **Then** o texto marca consumo normal
- [ ] **Given** usuário inexistente, **When** a function é chamada, **Then** a exceção é tratada e não devolve frase de consumo zero

## Technical Notes

- Nome previsto: `FN_CONSUMO_FORMATADO`
- Parâmetros IN e `RETURN VARCHAR2`
- Pode reutilizar `FN_INDICADOR_TOKENS` para não duplicar a soma
- Limite padrão 10.000 documentado no comentário da function

## Dependencies

### Requires
- 002-token-indicator-function

### Enables
- 006-java-jdbc-procedure-call

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Total exatamente 10.000 | Status alto |
| Nome com acento | A string preserva o acento |

## Out of Scope

- Persistir alerta
- Layout da tela
