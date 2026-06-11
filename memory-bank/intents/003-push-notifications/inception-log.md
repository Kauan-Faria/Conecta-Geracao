---
intent: 003-push-notifications
created: 2026-06-08T22:00:00Z
completed: null
status: in-progress
---

# Inception Log: 003-push-notifications

## Overview

**Intent**: Integrar Firebase Cloud Messaging para enviar notificações push aos usuários do Conecta-Geração
**Type**: green-field
**Created**: 2026-06-08T22:00:00Z

## Artifacts Created

| Artifact | Status | File |
|----------|--------|------|
| Requirements | complete | requirements.md |
| System Context | complete | system-context.md |
| Units | complete | units.md |
| Stories | complete | units/*/stories/*.md |
| Bolt Plan | complete | memory-bank/bolts/016-020 |

## Summary

| Metric | Count |
|--------|-------|
| Functional Requirements | 10 |
| Non-Functional Requirements | 5 categories |
| Units | 2 |
| Stories | 13 |
| Bolts Planned | 5 |

## Units Breakdown

| Unit | Stories | Bolts | Priority |
|------|---------|-------|----------|
| 001-notifications-api | 6 | 3 | Must |
| 002-push-notifications-ui | 7 | 2 | Must |

## Decision Log

| Date | Decision | Rationale | Approved |
|------|----------|-----------|----------|
| 2026-06-08 | Backend-only sending | Sem painel admin no MVP | Yes |
| 2026-06-08 | Permissão contextual | Não na primeira abertura; após valor no chat | Yes |
| 2026-06-08 | Toggle geral sem categorias | MVP simples; categorias fase futura | Yes |
| 2026-06-08 | Guest fora de escopo | Token vinculado a usuário autenticado | Yes |
| 2026-06-08 | Arquitetura NotificationsModule | Preparada para evolução com ports/entities | Yes |

## Scope Changes

| Date | Change | Reason | Impact |
|------|--------|--------|--------|

## Ready for Construction

**Checklist**:
- [x] All requirements documented
- [x] System context defined
- [x] Units decomposed
- [x] Stories created for all units
- [x] Bolts planned
- [ ] Human review complete

## Next Steps

1. Checkpoint 3: aprovar artefatos
2. Checkpoint 4: iniciar Construction
3. Primeiro bolt: `016-notifications-api`

## Dependencies

```text
001-mobile-auth-shell + 003-ai-assistant-api
         │
         ▼
016-notifications-api → 017-notifications-api → 018-notifications-api
         │
         ▼
019-push-notifications-ui → 020-push-notifications-ui
```

Executar após bolts 001-015 (auth, chat, maps) estáveis.
