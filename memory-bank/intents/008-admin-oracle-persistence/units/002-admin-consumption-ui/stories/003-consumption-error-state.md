---
id: 003-consumption-error-state
unit: 002-admin-consumption-ui
intent: 008-admin-oracle-persistence
status: complete
priority: must
created: 2026-09-26T12:43:00.000Z
assigned_bolt: 035-admin-consumption-ui
implemented: true
---

# Story: 003-consumption-error-state

## User Story

**As a** operador
**I want** ver uma mensagem quando o consumo não carrega
**So that** eu saiba que o Oracle ou a API falhou e o resto do painel continue utilizável

## Acceptance Criteria

- [ ] **Given** a API de consumo responde erro, **When** a tela tenta carregar, **Then** mostra mensagem clara e não deixa a área em carregamento infinito
- [ ] **Given** essa falha, **When** o operador volta para a home, **Then** conteúdos, dicas e campanhas continuam carregando pelo fluxo que já existe
- [ ] **Given** a API volta a responder, **When** o operador pede para carregar de novo, **Then** os quatro blocos aparecem

## Technical Notes

- Tratar erro no subscribe do serviço, no mesmo estilo da home quando uma chamada falha
- Não limpar o JWT nem redirecionar para login por falha do Oracle

## Dependencies

### Requires
- 001-consumption-screen

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Erro só no disparo, com dados já na tela | Os blocos já carregados permanecem e a mensagem explica a falha do disparo |
| Sessão expirada (401) | O fluxo de autenticação já existente trata o 401; esta story não inventa outro login |

## Out of Scope

- Retry automático em loop
- Monitorar o Oracle com healthcheck separado
