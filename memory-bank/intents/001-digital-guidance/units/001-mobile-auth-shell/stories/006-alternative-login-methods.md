---
id: 006-alternative-login-methods
unit: 001-mobile-auth-shell
intent: 001-digital-guidance
status: complete
priority: must
created: 2026-06-02T18:00:00Z
assigned_bolt: 010-mobile-auth-phone
implemented: true
---

# Story: 006-alternative-login-methods

## User Story

**As a** usuário que prefere conta Google ou e-mail
**I want** entrar por outro caminho sem perder a opção simples de telefone na tela principal
**So that** eu ou alguém que me ajuda possa usar o método que já conhecemos

## Acceptance Criteria

- [ ] **Given** estou na tela principal de login (telefone), **When** toco "Entrar de outra forma", **Then** abro tela secundária com opções alternativas
- [ ] **Given** tela alternativa, **When** toco "Entrar com Google", **Then** completo login Firebase Google e sigo fluxo de nome se necessário (story 005)
- [ ] **Given** tela alternativa, **When** abro no bolt 010, **Then** vejo apenas **Google** (e-mail/senha **não** neste bolt)
- [ ] **Given** tela alternativa, **When** toco voltar, **Then** retorno à tela de telefone
- [ ] **Given** login Google falha ou é cancelado, **When** retorno, **Then** mensagem simples em português, sem jargão técnico
- [ ] Google e telefone geram o mesmo tipo de sessão (`firebase_uid` + ID token para API)

## Technical Notes

- Reutilizar `signInWithGoogle` de `001-firebase-login-google` — mover botão para tela secundária
- E-mail/senha: **fora do escopo do bolt 010** — vinculação opcional futura em Configurações ("Adicionar e-mail à conta") para quem já entrou por telefone
- Não misturar telefone e Google na mesma tela (progressive disclosure)
- Testes: fluxo alternativo não quebra roteamento guest/autenticado existente

## Dependencies

### Requires
- 004-phone-otp-primary-login (link "Entrar de outra forma")

### Enables
- Familiares/cuidadores informais que configuram conta Google do usuário

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Conta Google já vinculada a outro método Firebase | Firebase pode exigir link de contas — tratar erro com mensagem amigável + suporte futuro |
| E-mail já usado com telefone | Mensagem "Este e-mail já está em uso" |
| Usuário só conhece telefone | Nunca é obrigado a abrir tela alternativa |

## Out of Scope

- E-mail/senha no fluxo "Entrar de outra forma" (fase futura em Configurações)
- Apple Sign-In
- Facebook Login
- SSO empresarial
