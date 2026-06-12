---
id: 003-welcome-screen-polish
unit: 001-mobile-auth-login-ui
intent: 004-auth-login-experience
status: complete
priority: must
created: 2026-06-11T22:00:00.000Z
assigned_bolt: 022-auth-ui-foundation
implemented: true
---

# Story: 003-welcome-screen-polish

## User Story

**As a** novo usuário
**I want** a primeira tela igual ao design aprovado
**So that** eu entenda o valor do app antes de me cadastrar

## Acceptance Criteria

- [ ] **Given** abro o app sem sessão, **When** vejo `/login`, **Then** layout corresponde ao mockup `191528.png`
- [ ] **Given** welcome, **When** comparo pixel/spacing, **Then** headline, cards de benefício e CTAs estão alinhados ao Figma
- [ ] **Given** destaque "mais segurança", **When** renderizado, **Then** usa cor de destaque da marca (`AppColors.accent` ou token definido)
- [ ] **Given** "Fazer cadastro", **When** toco, **Then** vou para `/login/phone`
- [ ] **Given** "Continua sem Cadastro", **When** toco, **Then** entro como convidado (sem regressão story 007 intent 001)
- [ ] Sem AppBar na welcome — layout full-screen como mockup

## Technical Notes

- `LoginPage` já está ~90% alinhada; polish de spacing, tipografia e possível uso de `AuthCtaButton`
- Não remover `Semantics` existentes
- Assets: `assets/icons/logo.png`, `assets/images/robo.png`, `assets/images/nuvem.png`

## Dependencies

### Requires
- 001-auth-shared-components (opcional para CTAs unificados)

### Enables
- Nenhuma dependência crítica

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Texto grande (acessibilidade) | Scroll vertical; cards legíveis |

## Out of Scope

- Animações de entrada
- Vídeo ou carousel na welcome
