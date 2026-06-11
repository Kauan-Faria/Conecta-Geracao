---
unit: 001-mobile-auth-login-ui
intent: 004-auth-login-experience
unit_type: frontend
default_bolt_type: simple-construction-bolt
phase: inception
status: in-progress
created: 2026-06-11T22:00:00.000Z
updated: 2026-06-11T23:30:00.000Z
---

# Unit Brief: Mobile Auth Login UI

## Purpose

Implementar a experiência visual completa de login/cadastro conforme `public/telas/` e adicionar autenticação por **e-mail e senha** via Firebase, integrando com os fluxos existentes (telefone, Google, convidado).

## Scope

### In Scope
- Componentes compartilhados de auth (header de marca, botões CTA teal/azul)
- Tela welcome (polish final vs mockup)
- Tela cadastro telefone + OTP em caixas (6 dígitos)
- Tela cadastro/login e-mail + senha + Google
- Tela verificação de e-mail pós-cadastro
- Extensão `AuthRepository` com e-mail/senha e reset de senha
- Contador de tentativas falhas + fluxo "Esqueci minha senha" (FR-10)
- Rotas GoRouter: `/login/email`, `/login/email-verify`
- Deprecar `/login/alternative` → redirecionar para `/login/email`

### Out of Scope
- Apple Sign-In
- Link de contas Firebase (phone + email)
- Backend NestJS
- Alteração do onboarding de nome (story 005 intent 001)

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Tela welcome | Must |
| FR-2 | Layout compartilhado | Must |
| FR-3 | Telefone UI | Must |
| FR-4 | OTP UI | Must |
| FR-5 | E-mail/senha | Must |
| FR-6 | Verificação e-mail | Must |
| FR-7 | Roteamento | Must |
| FR-8 | Repositório | Must |
| FR-9 | Segurança senha (Firebase) | Must |
| FR-10 | Esqueci senha após 4 erros | Must |

---

## Domain Concepts

### Key Operations

| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| signUpWithEmailAndPassword | Cadastro e-mail | email, password | AppUser + verification pending |
| signInWithEmailAndPassword | Login e-mail | email, password | AppUser session |
| sendEmailVerification | Enviar link | — | void |
| sendPasswordResetEmail | Enviar link de reset | email | void |
| checkEmailVerified | Confirmar verificação | reload user | boolean |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 8 |
| Must Have | 8 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-auth-shared-components | Componentes compartilhados de auth | Must | Draft |
| 002-phone-screens-redesign | Telas telefone e OTP no design | Must | Draft |
| 003-welcome-screen-polish | Welcome 100% fiel ao mockup | Must | Draft |
| 004-email-password-repository | Firebase e-mail/senha no repositório | Must | Draft |
| 005-email-registration-screen | Tela cadastro/login e-mail | Must | Draft |
| 006-email-verification-screen | Tela verificação de e-mail | Must | Draft |
| 007-auth-routing-integration | Rotas e fluxos integrados | Must | Draft |
| 008-forgot-password-after-failed-attempts | Esqueci senha após 4 erros | Must | Draft |

---

## Dependencies

### Depends On

| Unit | Reason |
|------|--------|
| 001-mobile-auth-shell (intent 001) | Router base, Firebase, convidado, Google |

### Depended By

| Unit | Reason |
|------|--------|
| — | Refino visual; não bloqueia outras units |

### External Dependencies

| System | Purpose | Risk |
|--------|---------|------|
| Firebase Auth Email/Password | Cadastro e login | Baixo (habilitar no console) |
| Firebase Email Verification | Link de verificação | Médio |

---

## Success Criteria

### Functional
- [ ] 5 telas visuais alinhadas a `public/telas/`
- [ ] Cadastro e login por e-mail funcionais
- [ ] "Esqueci minha senha" após 4 tentativas falhas
- [ ] Telefone e Google sem regressão

### Non-Functional
- [ ] TalkBack/VoiceOver nos novos fluxos
- [ ] Alvos ≥ 48dp

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 022-auth-ui-foundation | simple | 001, 002, 003 | Componentes + telefone/OTP + welcome |
| 023-email-password-auth | simple | 004, 005, 006, 007, 008 | E-mail/senha + verificação + esqueci senha + router |
