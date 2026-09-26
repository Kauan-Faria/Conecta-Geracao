---
id: 033-oracle-consumption-api
unit: 001-oracle-consumption-api
intent: 008-admin-oracle-persistence
type: ddd-construction-bolt
status: complete
stories:
  - 001-oracle-schema-and-seed
  - 002-token-indicator-function
  - 003-formatted-consumption-function
created: 2026-09-26T12:43:00.000Z
started: 2026-09-26T12:50:00.000Z
completed: "2026-09-26T14:07:35Z"
current_stage: null
stages_completed:
  - name: domain-model
    completed: 2026-09-26T13:00:00.000Z
    artifact: ddd-01-domain-model.md
  - name: technical-design
    completed: 2026-09-26T13:10:00.000Z
    artifact: ddd-02-technical-design.md
  - name: adr-analysis
    completed: 2026-09-26T13:13:00.000Z
    artifact: adr-019-oracle-isolado-do-postgres.md
  - name: implement
    completed: 2026-09-26T13:34:00.000Z
    artifact: apps/admin-api/src/main/resources/db/oracle/
  - name: test
    completed: 2026-09-26T14:07:35Z
    artifact: ddd-03-test-report.md
requires_bolts: []
enables_bolts:
  - 034-oracle-consumption-api
requires_units: []
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 2
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: 033-oracle-consumption-api

## Overview

Abre o Oracle local para o consumo da IA: tabelas, série simulada e as duas functions.

## Objective

Ter schema, seed com um usuário abaixo e outro acima de 10.000 tokens, `FN_INDICADOR_TOKENS` e `FN_CONSUMO_FORMATADO` consultáveis por SQL.

## Stories Included

- **001-oracle-schema-and-seed**: Tabelas e série simulada (Must)
- **002-token-indicator-function**: Soma de tokens no período (Must)
- **003-formatted-consumption-function**: Texto em português com status (Must)

## Bolt Type

**Type**: DDD Construction Bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/ddd-construction-bolt.md`

## Stages

- [x] **1. Domain Model**: ✅ Concluído → ddd-01-domain-model.md
- [x] **2. Technical Design**: ✅ Concluído → ddd-02-technical-design.md
- [x] **3. ADR Analysis**: ✅ Concluído → adr-019 a adr-024
- [x] **4. Implement**: ✅ Concluído → scripts SQL no admin-api
- [x] **5. Test**: ✅ Concluído → ddd-03-test-report.md

## Dependencies

### Requires
- Nenhuma. O `admin-api` já existe; este bolt ainda não muda o Java.

### Enables
- 034-oracle-consumption-api

## Success Criteria

- [x] Stories 001, 002 e 003 implementadas
- [x] Consultas SQL das functions batem com o seed
- [x] Exceção em usuário inexistente e período inválido coberta

## Notes

A incerteza média é a instância Oracle da máquina (service name, usuário com permissão de CREATE). O desenho deve deixar a URL por ambiente.
