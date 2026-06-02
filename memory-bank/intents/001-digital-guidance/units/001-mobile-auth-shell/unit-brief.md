---
unit: 001-mobile-auth-shell
intent: 001-digital-guidance
unit_type: frontend
default_bolt_type: simple-construction-bolt
phase: inception
status: complete
created: 2026-05-28T01:00:00.000Z
updated: 2026-05-28T01:00:00.000Z
---

# Unit Brief: Mobile Auth Shell

## Purpose

Fornecer a fundação do app Flutter: autenticação Firebase, shell de navegação e preferências de acessibilidade persistidas — pré-requisito para o chat com IA.

## Scope

### In Scope
- Login com Google via Firebase Auth
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
| FR-8 | Autenticação de usuário (Firebase) | Must |
| FR-9 | Preferências de acessibilidade | Must |

---

## Domain Concepts

### Key Entities
| Entity | Description | Attributes |
|--------|-------------|------------|
| AppUser | Usuário autenticado | firebase_uid, displayName |
| AccessibilityPrefs | Preferências UX | fontScale, highContrast, reducedDensity |

### Key Operations
| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| signInWithGoogle | Login social | — | ID token, user session |
| saveAccessibilityPrefs | Persistir prefs | prefs | void |
| applyTheme | Aplicar tokens | prefs | ThemeData |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 3 |
| Must Have | 3 |
| Should Have | 0 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-firebase-login-google | Login com Google | Must | Planned |
| 002-app-shell-navigation | Shell e navegação | Must | Planned |
| 003-accessibility-preferences | Preferências de acessibilidade | Must | Planned |

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
| Firebase Auth | Login Google | Médio |

---

## Technical Context

### Suggested Technology
Flutter, Riverpod, Firebase Auth SDK, SharedPreferences/Hive para prefs.

### Integration Points
| Integration | Type | Protocol |
|-------------|------|----------|
| Firebase Auth | SDK | OAuth Google |

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
| 001-mobile-auth-shell | simple | 001, 002, 003 | Auth + shell + acessibilidade |
