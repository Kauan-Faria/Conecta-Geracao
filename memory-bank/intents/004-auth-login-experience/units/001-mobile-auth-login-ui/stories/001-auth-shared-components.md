---
id: 001-auth-shared-components
unit: 001-mobile-auth-login-ui
intent: 004-auth-login-experience
status: draft
priority: must
created: 2026-06-11T22:00:00Z
assigned_bolt: 022-auth-ui-foundation
implemented: false
---

# Story: 001-auth-shared-components

## User Story

**As a** usuário do ConectaGeração
**I want** ver o mesmo visual de marca em todas as telas de cadastro
**So that** eu reconheça o app e me sinta seguro durante o processo

## Acceptance Criteria

- [ ] **Given** qualquer tela interna de auth, **When** abro, **Then** vejo logo + "ConectaGeração" + divisor (mockups `191536`–`191600`)
- [ ] **Given** um CTA primário, **When** renderizado, **Then** usa teal (`AppColors.primary`), texto branco e ícone `arrow_circle_right`
- [ ] **Given** um CTA secundário, **When** renderizado, **Then** usa azul (`AppColors.secondaryCta`), texto branco e ícone seta
- [ ] **Given** `AuthScreenScaffold`, **When** usado, **Then** não exibe AppBar genérico — apenas header de marca + conteúdo scrollável
- [ ] **Given** leitor de tela, **When** foco em botões, **Then** rótulos semânticos descrevem a ação completa
- [ ] Componentes em `apps/mobile/lib/features/auth/presentation/widgets/` (ou `core/widgets/` se reutilizável)

## Technical Notes

- Referência: `public/telas/`
- Reutilizar `AppColors`, `AppSpacing`, `BrandTheme`
- `AuthBrandHeader`, `AuthCtaButton`, `AuthScreenScaffold` como widgets base
- Altura mínima de toque ≥ 48dp (`AppSpacing.minTouchTarget`)

## Dependencies

### Requires
- None (primeira story do bolt 022)

### Enables
- 002-phone-screens-redesign
- 005-email-registration-screen
- 006-email-verification-screen

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Modo alto contraste | Cores via tema; contraste AA |
| Fonte grande | Layout não quebra; scroll habilitado |

## Out of Scope

- Lógica de autenticação
- Campos de formulário específicos (telefone, OTP, e-mail)
