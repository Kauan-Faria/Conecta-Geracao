---
id: 002-trigger-alert-routine
unit: 002-admin-consumption-ui
intent: 008-admin-oracle-persistence
status: complete
priority: must
created: 2026-09-26T12:43:00.000Z
assigned_bolt: 035-admin-consumption-ui
implemented: true
---

# Story: 002-trigger-alert-routine

## User Story

**As a** operador
**I want** disparar a rotina de alerta a partir da tela
**So that** a procedure rode no Oracle pelo Java e eu veja o resultado sem usar o cliente SQL

## Acceptance Criteria

- [ ] **Given** operador na tela e um usuário com consumo alto, **When** dispara a rotina, **Then** a API é chamada e, ao recarregar, o alerta desse usuário e período aparece
- [ ] **Given** operador e um usuário abaixo do limite, **When** dispara a rotina, **Then** a tela não ganha alerta novo para esse usuário
- [ ] **Given** o alerta já visível, **When** dispara de novo o mesmo usuário e período, **Then** a lista não passa a ter dois alertas iguais

## Technical Notes

- O botão chama o endpoint de disparo da story 006 e em seguida atualiza os blocos
- Enquanto a chamada não volta, o botão não empilha vários cliques

## Dependencies

### Requires
- 001-consumption-screen

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Duplo clique rápido | Uma chamada em voo; a segunda espera ou é ignorada até a primeira terminar |
| API recusa o disparo | A lista anterior permanece e o erro fica para a story 003 |

## Out of Scope

- Implementar a procedure
- Editar o limite na tela
