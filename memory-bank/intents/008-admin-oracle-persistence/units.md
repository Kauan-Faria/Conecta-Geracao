---
intent: 008-admin-oracle-persistence
phase: inception
status: units-decomposed
updated: 2026-09-26T12:43:00Z
---

# Persistência Oracle e consumo da IA — Unit Decomposition

## Requirement-to-Unit Mapping

| FR | Requirement | Unit |
|----|-------------|------|
| FR-1 | Modelo Oracle, tabelas e seed simulado | `001-oracle-consumption-api` |
| FR-2 | Function de indicador de tokens | `001-oracle-consumption-api` |
| FR-3 | Function de consumo formatado | `001-oracle-consumption-api` |
| FR-4 | Procedure de alerta por consumo alto | `001-oracle-consumption-api` |
| FR-5 | Procedure de relatório por usuário | `001-oracle-consumption-api` |
| FR-6 | Endpoint Java que chama a procedure | `001-oracle-consumption-api` |
| FR-7 | Tela do operador | `002-admin-consumption-ui` |
| FR-8 | DER e documentação do PL/SQL | `001-oracle-consumption-api` |

O catálogo `full-stack-web` pede backend e frontend. O backend fica no `admin-api` (Java). A UI segue o nome curto do projeto (`admin-consumption-ui`), no mesmo espírito de `push-notifications-ui`.

## Units Overview

Este intent decompõe em **2 units**:

### Unit 1: `001-oracle-consumption-api`

**Description**: Modelo, seed, PL/SQL e API JDBC do consumo de tokens no Oracle local.

**Stories**: 7 | **Complexity**: L | **Priority**: Must

**Deliverables**:

- Scripts SQL (tabelas, functions, procedures, seed)
- DER e documentação
- Endpoints autenticados no `admin-api` com segundo datasource

**Dependencies**:

- Depends on: nenhuma unit deste intent. Usa o JWT e o Spring já existentes no `admin-api`
- Depended by: `002-admin-consumption-ui`

**Estimated Complexity**: L

### Unit 2: `002-admin-consumption-ui`

**Description**: Área do painel Angular em que o operador vê o consumo e dispara a rotina de alerta.

**Stories**: 3 | **Complexity**: M | **Priority**: Must

**Deliverables**:

- Rota autenticada, quatro blocos de resultado e ação de disparo

**Dependencies**:

- Depends on: `001-oracle-consumption-api`
- Depended by: nenhuma

**Estimated Complexity**: M

## Unit Dependency Graph

```text
[001-oracle-consumption-api] ──► [002-admin-consumption-ui]
```

## Execution Order

1. Bolt `033-oracle-consumption-api` — tabelas, seed e functions
2. Bolt `034-oracle-consumption-api` — procedures, chamada Java e documentação
3. Bolt `035-admin-consumption-ui` — tela do operador
