---
id: 001-oracle-schema-and-seed
unit: 001-oracle-consumption-api
intent: 008-admin-oracle-persistence
status: complete
priority: must
created: 2026-09-26T12:43:00.000Z
assigned_bolt: 033-oracle-consumption-api
implemented: true
---

# Story: 001-oracle-schema-and-seed

## User Story

**As a** operador que vai consultar consumo
**I want** o Oracle local com usuários simulados e uma série de leituras de tokens
**So that** as functions e procedures tenham dados reais de demonstração, sem copiar o Supabase

## Acceptance Criteria

- [ ] **Given** a instância Oracle local acessível, **When** os scripts de DDL rodam, **Then** existem tabelas de usuário simulado, leitura de consumo e alerta, com chave da leitura para o usuário
- [ ] **Given** o seed aplicado, **When** se conta o total de tokens por usuário no período de demonstração, **Then** há pelo menos um usuário com total abaixo de 10.000 e um com total igual ou acima de 10.000
- [ ] **Given** o seed, **When** se inspecionam os identificadores, **Then** nenhum valor é um usuário real importado do Supabase

## Technical Notes

- Scripts SQL no `apps/admin-api`, separados das migrations Prisma
- Usuário simulado: id, nome, identificador externo fictício
- Leitura: id, usuário, quantidade de tokens, instante
- Alerta: id, usuário, início e fim do período, total de tokens, mensagem, data de criação
- Várias leituras por usuário ao longo do tempo

## Dependencies

### Requires
- None

### Enables
- 002-token-indicator-function
- 003-formatted-consumption-function
- 004-high-consumption-alert-procedure
- 005-per-user-consumption-report

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Script executado de novo | Não duplica a série simulada nem quebra a chave primária |
| Oracle desligado | O script falha com erro de conexão, sem alterar o Postgres |

## Out of Scope

- Functions, procedures e API Java
- DER narrado (story 007)
