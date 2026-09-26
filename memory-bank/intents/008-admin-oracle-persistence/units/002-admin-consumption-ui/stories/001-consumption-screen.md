---
id: 001-consumption-screen
unit: 002-admin-consumption-ui
intent: 008-admin-oracle-persistence
status: complete
priority: must
created: 2026-09-26T12:43:00.000Z
assigned_bolt: 035-admin-consumption-ui
implemented: true
---

# Story: 001-consumption-screen

## User Story

**As a** operador logado
**I want** uma área do admin com indicador, texto, alertas e relatório
**So that** eu acompanhe os tokens simulados sem sair do painel

## Acceptance Criteria

- [ ] **Given** operador autenticado, **When** abre a área de consumo, **Then** vê o total de tokens, o texto formatado, os alertas e uma linha por usuário do relatório, vindos da API
- [ ] **Given** visitante sem JWT, **When** tenta abrir a rota, **Then** não entra na área
- [ ] **Given** a home atual, **When** a área de consumo existe, **Then** há um caminho a partir do painel para chegar nela

## Technical Notes

- Rota protegida pelo `authGuard` já usado em `/home` e `/admin`
- Serviço HttpClient no padrão dos serviços atuais do admin
- O JWT segue no interceptor existente

## Dependencies

### Requires
- 006-java-jdbc-procedure-call (unit `001-oracle-consumption-api`)

### Enables
- 002-trigger-alert-routine
- 003-consumption-error-state

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Relatório vazio | A tela mostra a lista vazia, sem quebrar o indicador |
| Período padrão | A primeira carga usa o período de demonstração do seed |

## Out of Scope

- Botão de disparo (story 002)
- Mensagem de falha da API (story 003)
