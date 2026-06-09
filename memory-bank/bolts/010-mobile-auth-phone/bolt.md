---
id: 010-mobile-auth-phone
unit: 001-mobile-auth-shell
intent: 001-digital-guidance
type: simple-construction-bolt
status: complete
stories:
  - 004-phone-otp-primary-login
  - 005-display-name-onboarding
  - 006-alternative-login-methods
  - 007-guest-ephemeral-sessions
created: 2026-06-02T18:00:00.000Z
started: 2026-06-02T21:00:00.000Z
completed: "2026-06-03T02:38:48Z"
current_stage: null
stages_completed:
  - name: plan
    completed: 2026-06-02T21:30:00.000Z
    artifact: implementation-plan.md
  - name: implement
    completed: 2026-06-02T22:30:00.000Z
    artifact: implementation-walkthrough.md
  - name: test
    completed: 2026-06-02T23:00:00.000Z
    artifact: test-walkthrough.md
requires_bolts:
  - 001-mobile-auth-shell
enables_bolts: []
requires_units: []
blocks: false
complexity:
  avg_complexity: 3
  avg_uncertainty: 2
  max_dependencies: 1
  testing_scope: 3
---

# Bolt: 010-mobile-auth-phone

## Overview

Evolução da autenticação: telefone + SMS como caminho principal, onboarding de nome e login alternativo (Google / e-mail opcional).

## Objective

Usuários analfabetos digitais entram sem Google; nome pessoal vinculado à conta; quem prefere Google usa fluxo secundário.

## Stories Included

- **004-phone-otp-primary-login**: Login por telefone SMS (Must)
- **005-display-name-onboarding**: "Como podemos te chamar?" (Must)
- **006-alternative-login-methods**: Tela "Entrar de outra forma" — só Google (Must)
- **007-guest-ephemeral-sessions**: Convidado com IA, sem histórico entre visitas (Must)

## Bolt Type

**Type**: simple-construction-bolt

## Stages

- [x] **1. plan**: Complete → implementation-plan.md
- [x] **2. implement**: Complete → `apps/mobile/lib/features/auth/`
- [x] **3. test**: Complete → test-walkthrough.md

## Dependencies

### Requires
- **001-mobile-auth-shell** (shell, roteamento, Google sign-in base, prefs)

### Enables
- Testes de campo com login acessível ao público-alvo
- Refino da home com saudação por nome

## Success Criteria

- [x] Login por telefone funcional em dev (número de teste Firebase)
- [x] Primeiro acesso coleta nome; retorno não repete
- [x] Google acessível só via "Entrar de outra forma"
- [x] Tela OTP com textos orientativos + autofill SMS
- [x] Convidado: chat com IA, sem persistência remota; nova sessão a cada reentrada
- [ ] TalkBack/VoiceOver no fluxo telefone + modal de nome
- [x] Story `001-firebase-login-google` realinhada na UI (sem regressão de sessão)

## Pré-requisitos de infra

- Phone Auth habilitado no projeto Firebase
- App Check / reCAPTCHA configurado (Android/iOS)
- Política de privacidade menciona uso de telefone para autenticação (LGPD)
