---
id: 010-auth-prototype-screen-alignment
unit: 001-mobile-auth-login-ui
intent: 004-auth-login-experience
status: complete
priority: must
created: 2026-06-12T12:00:00.000Z
assigned_bolt: 025-auth-prototype-corrections
implemented: true
---

# Story: 010-auth-prototype-screen-alignment

## User Story

**As a** usuário idoso ou familiar
**I want** telas de auth separadas e com os mesmos botões dos mockups atualizados em `public/telas/`
**So that** eu escolha claramente entre entrar, cadastrar ou usar o app sem conta

## Contexto

Os mockups em `public/telas/` foram atualizados (jun/2026). Principais mudanças em relação à documentação anterior:

| Arquivo | Tela | Mudanças |
|---------|------|----------|
| `primeira_tela.png` | Welcome | Já implementada (sem alteração) |
| `login_telefone.png` | Cadastro telefone | `Continuar`; `Entra com Email e senha`; Google; `Entrar sem Cadastro` |
| `token_telefone.png` | OTP SMS | Sem alteração (Avançar + Voltar) |
| `cadastro_email.png` | Registro e-mail | Tela **somente cadastro**; `Continuar`; Google; `Entrar sem Cadastro` |
| `login_emailsenha.png` | **Login e-mail (nova)** | Tela dedicada; `Esqueceu a senha ?`; `Continuar`; `Não possuo Cadastro`; Google |
| `token_emailsenha.png` | Verificação e-mail | Sem alteração (Avançar + Voltar) |

## Acceptance Criteria

- [ ] **Given** `login_telefone.png`, **When** abro `/login/phone`, **Then** vejo botões: `Continuar`, `Entra com Email e senha`, `Se cadastrar com o Google`, `Entrar sem Cadastro`
- [ ] **Given** telefone, **When** toco `Entra com Email e senha`, **Then** navego para `/login/email?mode=signin` (tela `login_emailsenha.png`)
- [ ] **Given** telefone, **When** toco `Entrar sem Cadastro`, **Then** ativo modo convidado e vou para `/home`
- [ ] **Given** telefone, **When** toco Google, **Then** fluxo Google existente
- [ ] **Given** `cadastro_email.png`, **When** abro `/login/email` (modo signup), **Then** vejo 3 campos (e-mail, senha, confirmar), subtítulo do mockup, botões `Continuar`, Google, `Entrar sem Cadastro` — **sem** toggle "Já tenho conta"
- [ ] **Given** cadastro e-mail, **When** toco `Entrar sem Cadastro`, **Then** modo convidado → `/home`
- [ ] **Given** `login_emailsenha.png`, **When** abro `/login/email?mode=signin`, **Then** vejo título "Entrar com email e senha", 2 campos, link `Esqueceu a senha ?`, botões `Continuar`, `Não possuo Cadastro`, Google — **sem** campo confirmar senha
- [ ] **Given** login e-mail, **When** toco `Não possuo Cadastro`, **Then** navego para `/login/email` (cadastro)
- [ ] **Given** CTAs principais nas telas telefone/cadastro/login e-mail, **When** visualizo, **Then** rótulo primário é `Continuar` (OTP e verificação mantêm `Avançar`)
- [ ] **Given** labels dos mockups, **When** vejo campos e-mail, **Then** placeholders `Digite seu Email:`, `Digite sua senha:`, `Confirme sua senha:` (cadastro)
- [ ] Testes widget/router atualizados para novos rótulos e navegação

## Technical Notes

- Reutilizar `EmailAuthPage` com `initialMode` via query `mode=signin|signup`; remover toggle inline e botão `Voltar` das telas e-mail
- Extrair helper `_enterAsGuest` ou reutilizar padrão de `login_page.dart`
- Google na tela telefone via `authControllerProvider.signInWithGoogle()`
- Story **suplementa** 002 e 005 — não substitui repositório nem verificação de e-mail

## Dependencies

### Requires
- 005-email-registration-screen
- 007-auth-routing-integration

### Enables
- Alinhamento visual 6/6 mockups em `public/telas/`

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Convidado ativo + toca cadastro | `exitGuest` antes de autenticar (comportamento existente) |
| Login → Não possuo Cadastro | Limpa contador de erros ao mudar para signup (`setMode`) |

## Out of Scope

- Botão convidado nas telas OTP/verificação (não estão nos mockups)
- Apple Sign-In
