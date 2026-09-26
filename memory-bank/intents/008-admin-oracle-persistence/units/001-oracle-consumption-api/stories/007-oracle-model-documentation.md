---
id: 007-oracle-model-documentation
unit: 001-oracle-consumption-api
intent: 008-admin-oracle-persistence
status: complete
priority: must
created: 2026-09-26T12:43:00.000Z
assigned_bolt: 034-oracle-consumption-api
implemented: true
---

# Story: 007-oracle-model-documentation

## User Story

**As a** quem avalia ou mantém o backoffice
**I want** o DER, a lista de tabelas e o funcionamento de cada function e procedure
**So that** fique claro o que o Oracle acrescenta ao dashboard que só conta perguntas no Supabase

## Acceptance Criteria

- [ ] **Given** o schema implantado, **When** se abre o documento, **Then** há DER relacional e a descrição das tabelas e colunas criadas
- [ ] **Given** as duas functions e as duas procedures, **When** se lê o documento, **Then** cada uma tem propósito, parâmetros e o que retorna ou grava
- [ ] **Given** o fluxo da tela, **When** se lê o documento, **Then** está o caminho Angular → Spring → JDBC → Oracle e o limite de 10.000 tokens

## Technical Notes

- Documento no repositório, ao lado dos scripts ou em `memory-bank` da intent, referenciado pelo bolt
- DER em Mermaid ou imagem exportável a partir do modelo
- Não incluir senha, URL com segredo ou dump de produção

## Dependencies

### Requires
- 001-oracle-schema-and-seed
- 004-high-consumption-alert-procedure
- 005-per-user-consumption-report
- 006-java-jdbc-procedure-call

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Nome de coluna mudou no script | O documento descreve o script que está no repositório, não um rascunho anterior |

## Out of Scope

- Manual do app Flutter
- Tutorial de instalação do Oracle na máquina, além do que for preciso para apontar a URL
