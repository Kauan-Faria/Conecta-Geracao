---
id: 005-display-name-onboarding
unit: 001-mobile-auth-shell
intent: 001-digital-guidance
status: complete
priority: must
created: 2026-06-02T18:00:00Z
assigned_bolt: 010-mobile-auth-phone
implemented: true
---

# Story: 005-display-name-onboarding

## User Story

**As a** usuário que acabou de validar o celular
**I want** informar como quero ser chamado em uma pergunta simples
**So that** o app me trate pelo meu nome e eu sinta que minha conta é minha

## Acceptance Criteria

- [ ] **Given** primeiro login por telefone (sem `displayName` no Firebase), **When** OTP é validado, **Then** exibo modal/sheet com título "Como podemos te chamar?" e um campo de texto
- [ ] **Given** preencho nome com ≥ 2 caracteres, **When** toco "Continuar", **Then** salvo `displayName` via `updateProfile` e navego para a home
- [ ] **Given** nome vazio ou 1 caractere, **When** toco "Continuar", **Then** campo destacado com mensagem "Escreva como quer ser chamado"
- [ ] **Given** já tenho `displayName` no Firebase, **When** faço login por telefone, **Then** vou direto para a home sem o modal
- [ ] **Given** login alternativo (Google) sem nome, **When** autentico, **Then** mesma pergunta de nome (fluxo reutilizado)
- [ ] Home e saudações usam o nome salvo quando disponível

## Technical Notes

- Componente reutilizável: `DisplayNameOnboardingSheet` (modal bottom sheet ou dialog full-width em telas pequenas)
- Persistência: `FirebaseAuth.instance.currentUser?.updateDisplayName(name)`
- `AppUser.displayName` já existe no domínio — propagar após update
- Opcional futuro: `PATCH /api/v1/me` quando existir entidade User no Postgres
- Acessibilidade: foco automático no campo; label "Seu nome ou apelido"

## Dependencies

### Requires
- 004-phone-otp-primary-login (ou 001-firebase-login-google no fluxo alternativo)

### Enables
- Personalização na home (FR-11)
- Futura saudação da IA com nome (Could)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Usuário fecha modal sem nome | Não pode prosseguir — **nome obrigatório** (sem botão "Pular"); pode voltar apenas cancelando login |
| Nome com apenas espaços | Tratado como vazio |
| Caracteres especiais/emoji no nome | Aceitar se Firebase permitir; sanitizar trim |

## Out of Scope

- Foto de perfil
- Edição de nome em Configurações (story futura Should)
- Coleta de idade, CPF ou endereço
