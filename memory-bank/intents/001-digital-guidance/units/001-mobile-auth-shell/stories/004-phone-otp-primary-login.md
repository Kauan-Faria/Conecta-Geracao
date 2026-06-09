---
id: 004-phone-otp-primary-login
unit: 001-mobile-auth-shell
intent: 001-digital-guidance
status: complete
priority: must
created: 2026-06-02T18:00:00Z
assigned_bolt: 010-mobile-auth-phone
implemented: true
---

# Story: 004-phone-otp-primary-login

## User Story

**As a** usuário analfabeto digital
**I want** entrar no app só com meu número de celular e o código que chega por SMS
**So that** eu não precise de conta Google nem de e-mail para usar o Conecta Geração

## Acceptance Criteria

- [ ] **Given** não estou logado, **When** abro a tela de entrar, **Then** vejo primeiro o campo de telefone (máscara +55) e o botão "Receber código" em destaque
- [ ] **Given** informo telefone válido, **When** toco "Receber código", **Then** Firebase Phone Auth envia SMS e exibo tela de código com:
  - Título curto (ex.: "Código no seu celular")
  - Texto explicativo: o código chega por **SMS** no mesmo número digitado; são **6 números**; pode levar alguns segundos; o usuário **não precisa sair do app** se o celular sugerir o código
  - Instrução se não chegar: aguardar, reenviar após cooldown, ou "Entrar de outra forma"
- [ ] **Given** estou na tela do código, **When** o SMS chega no aparelho, **Then** o campo OTP aceita **autofill** (Android SMS Retriever / iOS `oneTimeCode`) ou sugestão do teclado para preencher sem copiar manualmente
- [ ] **Given** código correto, **When** confirmo, **Then** obtenho sessão Firebase e ID token válido para a API
- [ ] **Given** código incorreto ou expirado, **When** confirmo, **Then** vejo mensagem simples em português (ex.: "Código errado. Tente de novo.")
- [ ] **Given** quero outro método, **When** toco "Entrar de outra forma", **Then** navego para tela de login alternativo (story 006)
- [ ] **Given** sem internet, **When** tento receber código, **Then** vejo "Precisa de internet para entrar"
- [ ] UI: alvos ≥ 48dp, rótulos em todos os botões, conforme `ux-guide.md`

## Technical Notes

- Firebase Auth **Phone** no Flutter (`verifyPhoneNumber` / `signInWithCredential`)
- Habilitar Phone Auth no console Firebase; reCAPTCHA/App Check conforme plataforma
- Formato E.164 (+55…) antes de chamar Firebase
- Limitar reenvio de código (cooldown 60s) e contador de tentativas na UI
- Números de teste do Firebase para desenvolvimento (evitar custo SMS)
- `LoginPage` deixa de ser "só Google" — telefone é layout principal
- Welcome: CTA "Começar" pode ir direto para login por telefone
- **Autofill OTP**: `AutofillHints.oneTimeCode` no campo; considerar pacote `sms_autofill` ou `pinput` com listener de SMS no Android; validar em dispositivo real (emulador pode não receber SMS)
- **Copy sugerido (PT-BR simples)** na tela OTP:
  - "Enviamos um código de 6 números por mensagem de texto para o celular que você informou."
  - "Quando a mensagem chegar, digite o código aqui. Se aparecer uma sugestão em cima do teclado, toque nela para preencher sozinho."

## Dependencies

### Requires
- None (evolução do fluxo de login existente)

### Enables
- 005-display-name-onboarding
- Endpoints autenticados da API (mesmo `firebase_uid`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Telefone inválido (menos dígitos) | Botão desabilitado ou mensagem "Número incompleto" |
| Usuário pede reenviar código antes do cooldown | Botão desabilitado com texto "Aguarde X segundos" |
| SMS não chega (operadora) | Opção "Não recebi o código" → reenviar + link "Entrar de outra forma" |
| Mesmo número em outro aparelho | Firebase trata como mesma conta; histórico na nuvem após sync |

## Out of Scope

- Verificação de telefone por voz
- Login por WhatsApp
- Tabela `users` no Postgres (MVP usa só `firebase_uid` + `displayName` no Firebase)
