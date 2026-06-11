---
id: 004-email-password-repository
unit: 001-mobile-auth-login-ui
intent: 004-auth-login-experience
status: complete
priority: must
created: 2026-06-11T22:00:00.000Z
assigned_bolt: 023-email-password-auth
implemented: true
---

# Story: 004-email-password-repository

## User Story

**As a** desenvolvedor do app
**I want** operações de e-mail/senha no repositório de auth
**So that** as telas possam cadastrar e autenticar usuários via Firebase

## Acceptance Criteria

- [ ] **Given** `AuthRepository`, **When** estendo interface, **Then** inclui:
  - `signUpWithEmailAndPassword(String email, String password)`
  - `signInWithEmailAndPassword(String email, String password)`
  - `sendEmailVerification()`
  - `sendPasswordResetEmail(String email)`
  - `isEmailVerified()` ou checagem via `reloadCurrentUser()`
- [ ] **Given** cadastro válido, **When** chamo signup, **Then** retorno `AppUser` e Firebase envia e-mail de verificação automaticamente (ou via `sendEmailVerification` explícito)
- [ ] **Given** login válido, **When** chamo signIn, **Then** retorno `AppUser` com ID token para API
- [ ] **Given** reset válido, **When** chamo `sendPasswordResetEmail`, **Then** Firebase envia e-mail com link de redefinição (senha re-hasheada no Firebase após o usuário definir nova senha)
- [ ] **Given** erro Firebase, **When** ocorre, **Then** `AuthException` com mensagem PT-BR:
  - `email-already-in-use` → "Este e-mail já está em uso"
  - `invalid-email` → "E-mail inválido"
  - `weak-password` → "Senha muito fraca. Use pelo menos 6 caracteres"
  - `wrong-password` / `invalid-credential` → "E-mail ou senha incorretos"
  - `user-not-found` → "Conta não encontrada"
  - `network-request-failed` → "Precisa de internet para entrar"
- [ ] **Given** Firebase Console, **When** deploy, **Then** Email/Password provider habilitado
- [ ] Testes unitários para mapeamento de erros

## Technical Notes

- Implementar em `FirebaseAuthRepository`
- `createUserWithEmailAndPassword` + `signInWithEmailAndPassword`
- `sendPasswordResetEmail` — Firebase gerencia hash da nova senha (scrypt); app nunca vê senha em texto após envio
- Após signup: `sendEmailVerification()` se `emailVerified == false`
- Controller Riverpod `EmailAuthController` (ou extensão de `auth_controller.dart`)
- Documentar no `.env.example` / README mobile: habilitar Email/Password no Firebase

## Dependencies

### Requires
- None (pode paralelizar com UI após interface definida)

### Enables
- 005-email-registration-screen
- 006-email-verification-screen
- 008-forgot-password-after-failed-attempts

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Conta existe mas não verificada | Login permitido; gate de verificação na UI |
| Signup cancelado | Sem sessão parcial |

## Out of Scope

- Backend NestJS
- Custom email OTP backend
- Persistência de senha no Postgres
