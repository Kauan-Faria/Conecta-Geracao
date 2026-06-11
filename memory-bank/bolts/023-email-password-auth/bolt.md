---
id: 023-email-password-auth
unit: 001-mobile-auth-login-ui
intent: 004-auth-login-experience
type: simple-construction-bolt
status: complete
stories:
  - 004-email-password-repository
  - 005-email-registration-screen
  - 006-email-verification-screen
  - 007-auth-routing-integration
  - 008-forgot-password-after-failed-attempts
created: 2026-06-11T22:00:00.000Z
started: 2026-06-12T02:00:00.000Z
completed: "2026-06-11T23:12:34Z"
current_stage: null
stages_completed:
  - name: plan
    completed: 2026-06-12T02:05:00.000Z
    artifact: implementation-plan.md
  - name: implement
    completed: 2026-06-12T02:30:00.000Z
    artifact: implementation-walkthrough.md
  - name: test
    completed: 2026-06-12T02:45:00.000Z
    artifact: test-walkthrough.md
requires_bolts:
  - 022-auth-ui-foundation
enables_bolts: []
requires_units: []
blocks: false
complexity:
  avg_complexity: 3
  avg_uncertainty: 2
  max_dependencies: 2
  testing_scope: 3
---

# Bolt: 023-email-password-auth

## Overview

Cadastro e login por **e-mail e senha** via Firebase Auth, telas conforme mockups `191555` e `191600`, recuperação de senha após 4 erros, e integração completa no GoRouter.

## Objective

Usuários podem se cadastrar ou entrar com e-mail/senha ou Google; verificação de e-mail pós-cadastro; "Esqueci minha senha" após 4 tentativas falhas; fluxos integrados sem regressão.

## Stories Included

- **004-email-password-repository**: Extensão `AuthRepository` + `FirebaseAuthRepository`
- **005-email-registration-screen**: `EmailAuthPage` (cadastro + login toggle)
- **006-email-verification-screen**: `EmailVerificationPage`
- **007-auth-routing-integration**: Rotas, redirects, gate `emailVerified`
- **008-forgot-password-after-failed-attempts**: Contador de erros + `sendPasswordResetEmail` + UX idoso

## Bolt Type

**Type**: simple-construction-bolt

## Stages

- [x] **1. plan** → `implementation-plan.md`
- [x] **2. implement** → `apps/mobile/lib/features/auth/`
- [x] **3. test** → `test-walkthrough.md`

## Scope of Work

### Repositório

- `signUpWithEmailAndPassword`, `signInWithEmailAndPassword`
- `sendEmailVerification`, `sendPasswordResetEmail`, reload + `emailVerified`
- Mapeamento erros PT-BR

### UI

- `email_auth_page.dart` — mockup registro e-mail
- `email_verification_page.dart` — mockup confirmar e-mail (link Firebase)
- `email_auth_controller.dart` — Riverpod

### Router

- `/login/email`, `/login/email-verify`
- Redirect `/login/alternative` → `/login/email`
- Gate usuário logado com e-mail não verificado

## Pré-requisitos de infra

- [ ] Email/Password habilitado no Firebase Console (`conecta-geracao`)
- [ ] Template de e-mail de verificação configurado (opcional, PT-BR)
- [ ] Action URL / deep link para retorno ao app (recomendado)

## Dependencies

### Requires
- **022-auth-ui-foundation** — componentes compartilhados

### Enables
- Testes de campo com familiares que preferem e-mail

## Success Criteria

- [ ] Cadastro e-mail → verificação → onboarding/home
- [ ] Login e-mail para conta existente
- [ ] Google na mesma tela e-mail funciona
- [ ] "Esqueci minha senha" após 4 erros + e-mail de reset Firebase
- [ ] Telefone e convidado sem regressão
- [ ] Testes unitários (repository) + widget (router) passando

## Reference

Mockups: `public/telas/Captura de tela 2026-06-11 191555.png` (e-mail), `191600.png` (confirmar e-mail)
