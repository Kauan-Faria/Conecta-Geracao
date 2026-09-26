---
id: 034-oracle-consumption-api
unit: 001-oracle-consumption-api
intent: 008-admin-oracle-persistence
type: ddd-construction-bolt
status: complete
stories:
  - 004-high-consumption-alert-procedure
  - 005-per-user-consumption-report
  - 006-java-jdbc-procedure-call
  - 007-oracle-model-documentation
created: 2026-09-26T12:43:00.000Z
started: 2026-09-26T14:08:00.000Z
completed: "2026-09-26T14:40:42Z"
current_stage: null
stages_completed:
  - name: domain-model
    completed: 2026-09-26T14:10:00.000Z
    artifact: ddd-01-domain-model.md
  - name: technical-design
    completed: 2026-09-26T14:12:00.000Z
    artifact: ddd-02-technical-design.md
  - name: adr-analysis
    completed: 2026-09-26T14:14:00.000Z
    artifact: adr-025-datasource-oracle-fora-do-jpa.md
  - name: implement
    completed: 2026-09-26T14:28:00.000Z
    artifact: apps/admin-api/src/main/resources/db/oracle/
  - name: test
    completed: 2026-09-26T14:39:00.000Z
    artifact: ddd-03-test-report.md
requires_bolts:
  - 033-oracle-consumption-api
enables_bolts:
  - 035-admin-consumption-ui
requires_units: []
blocks: true
complexity:
  avg_complexity: 2
  avg_uncertainty: 2
  max_dependencies: 3
  testing_scope: 2
---

# Bolt: 034-oracle-consumption-api

## Overview

Fecha o lado servidor: procedures de alerta e relatório, chamada JDBC autenticada e a documentação do modelo.

## Objective

`PR_REGISTRAR_ALERTA_CONSUMO` e `PR_RELATORIO_CONSUMO` no Oracle. O `admin-api` consulta o consumo e dispara o alerta sem mexer no datasource Postgres. DER e o texto de cada objeto publicados.

## Stories Included

- **004-high-consumption-alert-procedure**: Alerta sem duplicar (Must)
- **005-per-user-consumption-report**: Resumo com cursor (Must)
- **006-java-jdbc-procedure-call**: REST → JDBC → Oracle (Must)
- **007-oracle-model-documentation**: DER e funcionamento (Must)

## Bolt Type

**Type**: DDD Construction Bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/ddd-construction-bolt.md`

## Stages

- ✅ **1. Domain Model**: Concluído → ddd-01-domain-model.md
- ✅ **2. Technical Design**: Concluído → ddd-02-technical-design.md
- ✅ **3. ADR Analysis**: Concluído → adr-025, adr-026, adr-027
- ✅ **4. Implement**: Concluído → PL/SQL + admin-api
- ✅ **5. Test**: Concluído → ddd-03-test-report.md

## Dependencies

### Requires
- **033-oracle-consumption-api**: tabelas, seed e functions

### Enables
- 035-admin-consumption-ui

## Success Criteria

- [ ] Alerta único quando o total atinge o limite
- [ ] Relatório com uma linha por usuário do seed
- [ ] POST com JWT executa a procedure; sem JWT é recusado
- [ ] Falha do Oracle não derruba um endpoint Postgres já existente
- [ ] Documento com DER, tabelas, functions, procedures e o fluxo até o Java

## Notes

O bolt 033 concluiu em 2026-09-26T14:07:35Z. Este bolt herda tabelas, seed e functions. O segundo datasource continua isolado do Postgres.
