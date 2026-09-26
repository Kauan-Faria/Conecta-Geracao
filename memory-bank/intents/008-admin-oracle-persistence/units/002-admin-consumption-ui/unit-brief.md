---
unit: 002-admin-consumption-ui
intent: 008-admin-oracle-persistence
unit_type: frontend
default_bolt_type: simple-construction-bolt
phase: inception
status: complete
created: 2026-09-26T12:43:00.000Z
updated: 2026-09-26T12:43:00.000Z
---

# Unit Brief: Admin Consumption UI

## Purpose

Mostrar ao operador, no painel Angular, o consumo de tokens que o `admin-api` lê do Oracle, e permitir disparar a rotina de alerta.

## Scope

### In Scope
- Rota autenticada no `apps/admin`
- Quatro blocos: indicador, texto formatado, alertas e relatório por usuário
- Ação que chama o endpoint de disparo e atualiza a tela
- Estado de carregamento e erro quando o Oracle ou a API falha

### Out of Scope
- SQL, PL/SQL e datasource (`001-oracle-consumption-api`)
- App Flutter
- Alterar a home atual além de um acesso para a nova área

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-7 | Tela do operador | Must |

---

## Domain Concepts

### Key Entities

A tela não persiste entidade. Ela exibe o que a API devolve: indicador, texto, alertas e linhas do relatório.

### Key Operations

| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| Consultar | Carrega os quatro blocos | JWT, usuário, período | Dados na tela |
| Disparar | Pede o registro de alerta e recarrega | JWT, usuário, período | Tela atualizada |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 3 |
| Must Have | 3 |
| Should Have | 0 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-consumption-screen | Tela com os quatro blocos | Must | draft |
| 002-trigger-alert-routine | Disparo da procedure | Must | draft |
| 003-consumption-error-state | Erro visível sem quebrar o painel | Must | draft |

---

## Dependencies

### Depends On

| Unit | Reason |
|------|--------|
| 001-oracle-consumption-api | Contrato REST de consulta e disparo |

### Depended By

Nenhuma.

### External Dependencies

| System | Purpose | Risk |
|--------|---------|------|
| admin-api | Dados e disparo | Médio — a tela depende do Oracle via API |

---

## Technical Context

### Suggested Technology

Angular standalone em `apps/admin`, no mesmo padrão de `home` e `conteudos`: serviço com HttpClient, interceptor Bearer já existente, `authGuard` nas rotas autenticadas.

### Integration Points

| Integration | Type | Protocol |
|-------------|------|----------|
| admin-api consumo | API | REST JSON |

### Data Storage

Nenhum armazenamento novo no browser além do JWT que o login já guarda.

---

## Constraints

- Só o operador logado entra na rota.
- Não chamar o Oracle direto do browser.
- A home de conteúdos, dicas e campanhas continua funcionando se a consulta de consumo falhar.

---

## Success Criteria

### Functional
- [ ] Operador autenticado vê indicador, texto, alertas e relatório
- [ ] O disparo chama a API e a tela mostra o alerta quando o consumo está alto
- [ ] Visitante sem login não abre a área

### Non-Functional
- [ ] Com a API local no ar, os quatro blocos aparecem em menos de 3 s
- [ ] Falha da API mostra mensagem e não esvazia o restante do painel

### Quality
- [ ] Fluxo coberto por teste do componente ou verificação manual descrita no walkthrough do bolt

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 035-admin-consumption-ui | simple-construction-bolt | 001, 002, 003 | Tela, disparo e erro |

---

## Notes

O acesso pode nascer de um link na home. A home em si não passa a depender do Oracle para os contadores que já vêm do Supabase.
