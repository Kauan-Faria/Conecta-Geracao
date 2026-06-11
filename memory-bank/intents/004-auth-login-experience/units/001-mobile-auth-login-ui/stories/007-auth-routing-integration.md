---
id: 007-auth-routing-integration
unit: 001-mobile-auth-login-ui
intent: 004-auth-login-experience
status: complete
priority: must
created: 2026-06-11T22:00:00.000Z
assigned_bolt: 023-email-password-auth
implemented: true
---

# Story: 007-auth-routing-integration

## User Story

**As a** usuário
**I want** navegar entre todos os métodos de login sem erros ou loops
**So that** eu complete o cadastro pelo caminho que escolhi

## Acceptance Criteria

- [ ] **Given** `app_router.dart`, **When** atualizado, **Then** rotas:
  - `/login` (welcome)
  - `/login/phone`
  - `/login/otp`
  - `/login/email`
  - `/login/email-verify`
- [ ] **Given** `/login/alternative`, **When** acessado, **Then** redirect para `/login/email` (compatibilidade)
- [ ] **Given** usuário logado e-mail não verificado, **When** tenta acessar rotas protegidas, **Then** redirect `/login/email-verify` (exceto logout)
- [ ] **Given** convidado, **When** ativo, **Then** sem regressão — home acessível; push para login ao expirar guest
- [ ] **Given** autenticado telefone/Google/e-mail verificado, **When** cold start, **Then** `/home` (sem passar login)
- [ ] **Given** needs display name, **When** qualquer auth completa, **Then** `/onboarding/display-name` antes de home
- [ ] Testes widget: rotas novas + redirects + guest + email unverified

## Technical Notes

- Atualizar `redirect` em `GoRouter` para gate `emailVerified`
- Provider `needsEmailVerificationProvider` (Riverpod)
- Passar `extra` entre telas quando necessário (email em edição)
- Atualizar links em `PhoneLoginPage` de `/login/alternative` → `/login/email`

## Dependencies

### Requires
- 002-phone-screens-redesign
- 005-email-registration-screen
- 006-email-verification-screen

### Enables
- Intent 004 completa

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Deep link durante login | Não quebra redirect |
| Back button Android | Stack coerente entre telas auth |

## Out of Scope

- Universal links iOS completos (pode ser follow-up)
- Auth web
