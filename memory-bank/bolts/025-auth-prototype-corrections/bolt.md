---
id: 025-auth-prototype-corrections
unit: 001-mobile-auth-login-ui
intent: 004-auth-login-experience
type: simple-construction-bolt
status: complete
stories:
  - 010-auth-prototype-screen-alignment
created: 2026-06-12T12:00:00.000Z
started: 2026-06-12T12:05:00.000Z
completed: 2026-06-12T12:30:00.000Z
current_stage: null
stages_completed:
  - name: plan
    completed: 2026-06-12T12:05:00.000Z
    artifact: implementation-plan.md
  - name: implement
    completed: 2026-06-12T12:20:00.000Z
    artifact: apps/mobile/lib/features/auth/presentation/
  - name: test
    completed: 2026-06-12T12:30:00.000Z
    artifact: test-walkthrough.md
requires_bolts:
  - 023-email-password-auth
  - 024-international-phone-country-selector
enables_bolts: []
requires_units: []
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: 025-auth-prototype-corrections

## Overview

Correção de alinhamento das telas de autenticação com os **6 mockups** atualizados em `public/telas/`, incluindo tela dedicada de login por e-mail, botões de convidado nas telas intermediárias e CTAs revisados na tela de telefone.

## Objective

Fechar o gap entre protótipos e implementação após atualização visual do usuário: separar login e cadastro por e-mail, adicionar `Entrar sem Cadastro` / `Não possuo Cadastro` e Google na tela de telefone.

## Stories Included

- **010-auth-prototype-screen-alignment**: Telas telefone, cadastro e-mail e login e-mail conforme mockups jun/2026

## Bolt Type

**Type**: simple-construction-bolt

## Stages

- [x] **1. plan** → `implementation-plan.md`
- [x] **2. implement** → `phone_login_page.dart`, `email_auth_page.dart`
- [x] **3. test** → `test-walkthrough.md`

## Scope of Work

### `PhoneLoginPage`

- Renomear `Avançar` → `Continuar`
- Substituir `Se cadastrar de outra forma` por `Entra com Email e senha` → `/login/email?mode=signin`
- Adicionar `Se cadastrar com o Google`
- Adicionar `Entrar sem Cadastro` (convidado)

### `EmailAuthPage`

- Modo signup: copy `cadastro_email.png`, botões cadastro + Google + convidado
- Modo signin: copy `login_emailsenha.png`, link `Esqueceu a senha ?`, botões login + `Não possuo Cadastro` + Google
- Remover toggle `Já tenho conta` / `Criar conta` e botão `Voltar`
- Renomear `Avançar` → `Continuar`; labels dos campos conforme mockup

### Testes

- `auth_phone_screens_test.dart`, `auth_routing_test.dart`, `email_auth_controller_test.dart` (se necessário)

## Dependencies

### Requires
- **023-email-password-auth** — base e-mail/senha
- **024-international-phone-country-selector** — campo telefone

### Enables
- Intent 004 com 6/6 telas alinhadas aos mockups

## Success Criteria

- [x] Todos os CTAs e copy das 3 telas alteradas batem com `public/telas/`
- [x] Navegação login ↔ cadastro e-mail via botões dedicados (sem toggle)
- [x] Convidado acessível na welcome, telefone e cadastro e-mail
- [x] Testes widget passando

## Reference

Mockups: `public/telas/primeira_tela.png`, `login_telefone.png`, `token_telefone.png`, `cadastro_email.png`, `login_emailsenha.png`, `token_emailsenha.png`
