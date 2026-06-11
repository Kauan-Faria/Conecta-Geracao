---
id: 008-forgot-password-after-failed-attempts
unit: 001-mobile-auth-login-ui
intent: 004-auth-login-experience
status: complete
priority: must
created: 2026-06-11T23:30:00.000Z
assigned_bolt: 023-email-password-auth
implemented: true
---

# Story: 008-forgot-password-after-failed-attempts

## User Story

**As a** usuário idoso ou com dificuldade para lembrar a senha
**I want** receber ajuda clara para redefinir minha senha depois de errar várias vezes
**So that** eu consiga entrar no app sem desistir ou pedir ajuda a outra pessoa

## Acceptance Criteria

- [ ] **Given** modo login na `EmailAuthPage`, **When** `signInWithEmailAndPassword` falha com credencial inválida, **Then** incremento contador local de tentativas falhas
- [ ] **Given** 1–3 tentativas falhas, **When** vejo a tela, **Then** mensagem genérica "E-mail ou senha incorretos" + link discreto "Esqueci minha senha" (opcional)
- [ ] **Given** 4ª tentativa falha consecutiva, **When** erro ocorre, **Then** exibo banner destacado em português simples orientando redefinição (ex.: "Parece que você esqueceu a senha. Podemos te ajudar.")
- [ ] **Given** banner ou link "Esqueci minha senha", **When** toco, **Then** chamo `sendPasswordResetEmail(email)` com o e-mail preenchido no formulário
- [ ] **Given** e-mail válido enviado, **When** Firebase confirma, **Then** mostro confirmação: "Enviamos um e-mail para {email}. Siga o link para criar uma nova senha."
- [ ] **Given** login bem-sucedido, **When** autentico, **Then** contador de tentativas zera
- [ ] **Given** reset enviado com sucesso, **When** usuário fecha confirmação, **Then** contador zera
- [ ] **Given** e-mail vazio ao tocar "Esqueci minha senha", **When** valido, **Then** mensagem "Digite seu e-mail primeiro"
- [ ] **Given** erro Firebase no reset, **When** ocorre, **Then** mensagem PT-BR (`invalid-email`, `user-not-found` genérico por segurança)
- [ ] CTA "Esqueci minha senha" com alvo ≥ 48dp e `Semantics` para leitor de tela

## Technical Notes

- Contador em `EmailAuthController` (Riverpod `StateNotifier`) — **não persistir** no disco (estado de sessão da tela)
- Reset via `FirebaseAuth.sendPasswordResetEmail` encapsulado em `AuthRepository.sendPasswordResetEmail(email)`
- Não bloquear conta no Firebase após 4 erros — apenas UX de ajuda (público idoso)
- Banner reutiliza tokens `AuthScreenScaffold` / `AppColors` da story 001
- Template de e-mail de reset configurável no Firebase Console (PT-BR recomendado)

## Dependencies

### Requires
- 004-email-password-repository (`sendPasswordResetEmail`)
- 005-email-registration-screen (modo login na `EmailAuthPage`)

### Enables
- Nenhuma story downstream

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Usuário alterna para modo cadastro | Contador não se aplica / zera |
| Usuário corrige e-mail e tenta de novo | Contador mantém tentativas até sucesso ou reset |
| Rede indisponível no reset | "Precisa de internet para enviar o e-mail" |
| Usuário toca reset antes do 4º erro | Fluxo permitido (link discreto) |

## Out of Scope

- Bloqueio de conta ou CAPTCHA
- Reset por SMS ou telefone
- Backend NestJS para reset
- Persistência do contador entre sessões do app
