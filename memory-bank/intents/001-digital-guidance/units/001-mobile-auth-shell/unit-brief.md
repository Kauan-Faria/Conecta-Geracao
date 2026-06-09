---
unit: 001-mobile-auth-shell
intent: 001-digital-guidance
unit_type: frontend
default_bolt_type: simple-construction-bolt
phase: inception
status: complete
created: 2026-05-28T01:00:00.000Z
updated: 2026-06-02T18:00:00.000Z
---

# Unit Brief: Mobile Auth Shell

## Purpose

Fornecer a fundação do app Flutter: autenticação acessível (telefone SMS como principal, Google como alternativa), onboarding de nome, shell de navegação e preferências de acessibilidade — pré-requisito para o chat com IA.

## Scope

### In Scope
- Login por telefone + OTP SMS via Firebase Phone Auth (caminho principal)
- Modal "Como podemos te chamar?" após primeiro login
- Login alternativo: Google (Must); e-mail/senha somente futuro em Configurações
- Tela OTP com textos orientativos + autofill do código SMS
- Modo convidado: IA disponível, **sem** histórico remoto; nova sessão a cada reentrada
- Shell de navegação (home, chat, configurações)
- Preferências de acessibilidade (fonte, contraste, densidade)
- Persistência local de preferências (não sensível)

### Out of Scope
- Lógica de chat/IA (`003-ai-assistant-api`, `004-digital-guidance-ui`)
- Base de conhecimento
- Perfil de cuidador

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-8 | Autenticação acessível (telefone + alternativas) | Must |
| FR-8.1 | Perfil mínimo (nome de exibição) | Must |
| FR-8.2 | Modo convidado (sessão efêmera) | Must |
| FR-9 | Preferências de acessibilidade | Must |

---

## Domain Concepts

### Key Entities
| Entity | Description | Attributes |
|--------|-------------|------------|
| AppUser | Usuário autenticado | firebase_uid, displayName, phone (opcional no provider) |
| AccessibilityPrefs | Preferências UX | fontScale, highContrast, reducedDensity |

### Key Operations
| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| signInWithPhoneOtp | Login por SMS | phone, otp | ID token, user session |
| signInWithGoogle | Login alternativo | — | ID token, user session |
| setDisplayName | Onboarding de nome | displayName | perfil Firebase atualizado |
| saveAccessibilityPrefs | Persistir prefs | prefs | void |
| applyTheme | Aplicar tokens | prefs | ThemeData |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 7 |
| Must Have | 7 |
| Should Have | 0 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-firebase-login-google | Login com Google (alternativo) | Must | Complete (refatorar UI) |
| 002-app-shell-navigation | Shell e navegação | Must | Complete |
| 003-accessibility-preferences | Preferências de acessibilidade | Must | Complete |
| 004-phone-otp-primary-login | Login por telefone SMS | Must | Draft |
| 005-display-name-onboarding | Nome após primeiro login | Must | Draft |
| 006-alternative-login-methods | Tela "Entrar de outra forma" | Must | Draft |
| 007-guest-ephemeral-sessions | Convidado sem histórico remoto | Must | Draft |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| — | Nenhuma |

### Depended By
| Unit | Reason |
|------|--------|
| 003-ai-assistant-api | Auth token nos endpoints |
| 004-digital-guidance-ui | Shell e tema do chat |

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| Firebase Auth | Phone OTP + Google | Médio (custo SMS) |

---

## Technical Context

### Suggested Technology
Flutter, Riverpod, Firebase Auth SDK, SharedPreferences/Hive para prefs.

### Integration Points
| Integration | Type | Protocol |
|-------------|------|----------|
| Firebase Auth | SDK | Phone OTP, OAuth Google |

---

## Success Criteria

### Functional
- [ ] Usuário faz login e permanece autenticado
- [ ] Preferências de acessibilidade aplicadas em todo o app

### Non-Functional
- [ ] Alvos de toque ≥ 48dp
- [ ] TalkBack/VoiceOver nos fluxos de login e settings

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 001-mobile-auth-shell | simple | 001, 002, 003 | Auth Google + shell + acessibilidade (entregue) |
| 010-mobile-auth-phone | simple | 004, 005, 006, 007 | Login telefone, nome, Google, convidado efêmero |
