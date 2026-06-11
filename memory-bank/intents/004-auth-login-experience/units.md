---
intent: 004-auth-login-experience
phase: inception
status: units-decomposed
created: 2026-06-11T22:00:00Z
updated: 2026-06-11T23:30:00Z
---

# Auth Login Experience — Unit Decomposition

## Requirement-to-Unit Mapping

| FR | Requirement | Unit |
|----|-------------|------|
| FR-1 | Tela welcome / login gate | `001-mobile-auth-login-ui` |
| FR-2 | Layout compartilhado auth | `001-mobile-auth-login-ui` |
| FR-3 | Cadastro por telefone (UI) | `001-mobile-auth-login-ui` |
| FR-4 | Confirmação SMS (UI + OTP) | `001-mobile-auth-login-ui` |
| FR-5 | Cadastro e login e-mail/senha | `001-mobile-auth-login-ui` |
| FR-6 | Verificação de e-mail | `001-mobile-auth-login-ui` |
| FR-7 | Roteamento integrado | `001-mobile-auth-login-ui` |
| FR-8 | Repositório auth estendido | `001-mobile-auth-login-ui` |
| FR-9 | Segurança de senha (Firebase) | `001-mobile-auth-login-ui` |
| FR-10 | Recuperação de senha após 4 erros | `001-mobile-auth-login-ui` |

## Units Overview

Este intent decompõe em **1 unit**:

### Unit 1: `001-mobile-auth-login-ui`

**Description**: UI Flutter alinhada aos mockups `public/telas/` + Firebase Email/Password + refatoração das telas telefone/OTP + roteamento.

**Stories**: 8 | **Complexity**: M | **Priority**: Must

**Deliverables**: Componentes compartilhados, 5 telas visuais, auth e-mail, router atualizado.

**Dependencies**: `001-mobile-auth-shell` (intent 001), Firebase Email/Password habilitado

## Unit Dependency Graph

```text
001-mobile-auth-shell (intent 001)
         │
         ▼
001-mobile-auth-login-ui (intent 004)
```

## Execution Order

1. **Bolt 022**: Fundação UI + telas telefone/OTP + welcome polish
2. **Bolt 023**: E-mail/senha + verificação + esqueci senha + roteamento final
