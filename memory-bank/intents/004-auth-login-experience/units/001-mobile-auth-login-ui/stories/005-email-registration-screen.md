---
id: 005-email-registration-screen
unit: 001-mobile-auth-login-ui
intent: 004-auth-login-experience
status: complete
priority: must
created: 2026-06-11T22:00:00.000Z
assigned_bolt: 023-email-password-auth
implemented: true
---

# Story: 005-email-registration-screen

## User Story

**As a** usuário que prefere e-mail
**I want** me cadastrar ou entrar com e-mail e senha
**So that** eu use o método que já conheço, sem depender de SMS

## Acceptance Criteria

- [ ] **Given** toco "Se cadastrar de outra forma" na tela telefone, **When** navego, **Then** abro tela conforme mockup `191555.png`
- [ ] **Given** modo cadastro, **When** vejo formulário, **Then** campos: e-mail, senha, confirmar senha
- [ ] **Given** modo login (link "Já tenho conta"), **When** alterno, **Then** oculto "confirmar senha"; título "Entrar com e-mail"
- [ ] **Given** cadastro, **When** senhas diferem, **Then** mensagem "As senhas não coincidem"
- [ ] **Given** formulário válido (cadastro), **When** toco "Avançar", **Then** crio conta e navego para `/login/email-verify`
- [ ] **Given** login com credenciais erradas, **When** falho, **Then** incremento contador local (story 008); mensagem genérica "E-mail ou senha incorretos"
- [ ] **Given** formulário válido (login), **When** toco "Avançar", **Then** autentico; se e-mail verificado → onboarding/home; se não → `/login/email-verify`; contador de erros zera
- [ ] **Given** tela, **When** toco "Se cadastrar com o Google" (cadastro) ou "Entrar com o Google" (login), **Then** fluxo Google existente
- [ ] **Given** link "Voltar", **When** toco, **Then** retorno à tela telefone ou welcome conforme origem
- [ ] UI usa `AuthScreenScaffold` + componentes story 001

## Technical Notes

- Nova página `EmailAuthPage` em `features/auth/presentation/`
- Estado: `EmailAuthMode { signup, signIn }`
- Validação client-side antes de chamar repository
- Obscurecer senha com toggle acessível ("Mostrar senha")

## Dependencies

### Requires
- 001-auth-shared-components
- 004-email-password-repository

### Enables
- 006-email-verification-screen
- 007-auth-routing-integration
- 008-forgot-password-after-failed-attempts

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| E-mail já cadastrado no signup | Mensagem amigável + sugestão "Já tenho conta" |
| Login com credenciais erradas | Mensagem genérica |

## Out of Scope

- Validação de força de senha avançada (zxcvbn)
- UI completa do banner pós-4 erros (detalhada na story 008)
