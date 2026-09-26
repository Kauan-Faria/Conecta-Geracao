---
id: 035-admin-consumption-ui
unit: 002-admin-consumption-ui
intent: 008-admin-oracle-persistence
type: simple-construction-bolt
status: complete
stories:
  - 001-consumption-screen
  - 002-trigger-alert-routine
  - 003-consumption-error-state
created: 2026-09-26T12:43:00.000Z
started: 2026-09-26T14:42:00.000Z
completed: "2026-09-26T15:01:11Z"
current_stage: null
stages_completed:
  - name: plan
    completed: 2026-09-26T14:44:00.000Z
    artifact: implementation-plan.md
  - name: implement
    completed: 2026-09-26T14:49:00.000Z
    artifact: implementation-walkthrough.md
  - name: test
    completed: 2026-09-26T14:59:00.000Z
    artifact: test-walkthrough.md
requires_bolts:
  - 034-oracle-consumption-api
enables_bolts: []
requires_units:
  - 001-oracle-consumption-api
blocks: true
complexity:
  avg_complexity: 1
  avg_uncertainty: 1
  max_dependencies: 2
  testing_scope: 3
---

# Bolt: 035-admin-consumption-ui

## Overview

Área do painel Angular para o operador ver o consumo e disparar o alerta.

## Objective

Rota autenticada com os quatro blocos, botão que chama a procedure via API e mensagem clara quando o Oracle não responde, sem quebrar a home.

## Stories Included

- **001-consumption-screen**: Quatro blocos e guarda de login (Must)
- **002-trigger-alert-routine**: Disparo e atualização da lista (Must)
- **003-consumption-error-state**: Erro visível e painel restante íntegro (Must)

## Bolt Type

**Type**: Simple Construction Bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [x] **1. Plan**: Complete → implementation-plan.md
- [x] **2. Implement**: Complete → implementation-walkthrough.md
- [x] **3. Test**: Complete → test-walkthrough.md

## Dependencies

### Requires
- **034-oracle-consumption-api**: contrato de consulta e disparo
- **Unit 001-oracle-consumption-api**: API no ar

### Enables
- Nenhuma

## Success Criteria

- [x] Operador logado vê indicador, texto, alertas e relatório
- [x] Disparo de consumo alto mostra o alerta depois da atualização
- [x] Sem login a rota não abre
- [x] Erro da API de consumo não impede a home de conteúdos, dicas e campanhas

## Notes

Verificação no browser faz parte do estágio de teste: login, carga da tela, disparo e falha simulada da API. Nesta sessão não houve browser; os critérios foram cobertos por `ng test` (23/23) com a API simulada.
