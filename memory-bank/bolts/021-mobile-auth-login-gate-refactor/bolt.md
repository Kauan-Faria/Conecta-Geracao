---
id: 021-mobile-auth-login-gate-refactor
unit: 001-mobile-auth-shell
intent: 001-digital-guidance
type: simple-construction-bolt
status: complete
stories:
  - 002-app-shell-navigation
  - 004-phone-otp-primary-login
  - 007-guest-ephemeral-sessions
created: 2026-06-11T12:30:00.000Z
started: 2026-06-11T14:00:00.000Z
completed: "2026-06-11T21:39:51Z"
current_stage: null
stages_completed:
  - name: plan
    completed: 2026-06-11T14:05:00.000Z
    artifact: implementation-plan.md
  - name: implement
    completed: 2026-06-11T15:00:00.000Z
    artifact: implementation-walkthrough.md
  - name: test
    completed: 2026-06-11T15:05:00.000Z
    artifact: test-walkthrough.md
requires_bolts:
  - 001-mobile-auth-shell
  - 010-mobile-auth-phone
enables_bolts: []
requires_units: []
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: 021-mobile-auth-login-gate-refactor

## Overview

Refatoração do fluxo de entrada do app mobile: **login como porta de entrada**, opção convidado na tela de login e **sessão convidado efêmera** (chat reinicia a cada abertura sem autenticação).

Refina decisão de produto registrada em `inception-log.md` (2026-06-11) e FR-8 / FR-8.2.

## Objective

Alinhar roteamento, UI de auth e persistência guest ao comportamento desejado:

1. Usuário sem login **sempre** cai na tela de login ao abrir o app
2. Na login, escolhe **entrar com telefone** ou **sem cadastro**
3. Modo convidado **não** persiste entre cold starts — chat reinicia a cada visita

## Stories Included

- **002-app-shell-navigation**: Redirect `/login` como gate; remover welcome do fluxo de auth (Must)
- **004-phone-otp-primary-login**: Link "Sem cadastro, sem complicações" na `LoginPage` (Must)
- **007-guest-ephemeral-sessions**: Guest só em memória na visita atual; sem SharedPreferences entre aberturas (Must)

## Bolt Type

**Type**: simple-construction-bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [x] **1. plan**: Complete → `implementation-plan.md`
- [x] **2. implement**: Complete → `apps/mobile/lib/core/routing/`, `apps/mobile/lib/features/auth/`
- [x] **3. test**: Complete → `test-walkthrough.md`

## Scope of Work

### Roteamento (`app_router.dart`)

- `initialLocation`: `/login` (não `/welcome`)
- Redirect sem acesso: `/login` (não `/welcome`)
- Cold start: **não** restaurar `isGuestActive` de SharedPreferences
- Rotas públicas: `/login`, `/login/*`, `/onboarding/display-name` (remover `/welcome` do gate)

### UI

- Mover link convidado de `WelcomePage` → `LoginPage`
- Invalidar `chatControllerProvider` ao `enterAsGuest()`
- Avaliar remoção ou deprecação de `WelcomePage` / rota `/welcome`

### Persistência guest

- Remover retenção de 7 dias em `SharedPreferencesGuestSessionRepository` **ou** limpar sessão guest em todo cold start
- Remover persistência de histórico guest entre visitas (`GuestHistoryRepository`)
- Guest ativo apenas em memória durante a sessão do app

### Testes

- Widget/router: sem auth → `/login`
- Guest: entrar sem conta → home; fechar app → reabrir → `/login` (não auto-guest)
- Guest: segunda entrada sem conta → chat vazio / reiniciado

## Dependencies

### Requires

- **001-mobile-auth-shell** — shell, GoRouter, auth gate base (complete)
- **010-mobile-auth-phone** — login telefone, OTP, fluxo convidado inicial (complete)

### Enables

- Comportamento de produto alinhado a FR-8.2 para testes de campo
- UX consistente: login como única decisão na entrada

## Success Criteria

- [x] Abrir app sem login → tela de login (nunca welcome como gate)
- [x] Link convidado visível na `LoginPage`
- [x] Convidado usa IA na visita atual; ao fechar e reabrir sem login → login de novo + chat reiniciado
- [x] Usuário autenticado continua indo direto para home (sem regressão)
- [x] Testes de roteamento e guest atualizados/passando

## Notes

- Bolt de **refatoração** — stories já tinham implementação parcial no bolt 010; este bolt fecha o gap entre spec refinada e código atual.
- Referência: `memory-bank/intents/001-digital-guidance/inception-log.md`
