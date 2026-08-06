---
intent: 006-chat-voice-assist
created: 2026-07-24T19:04:00Z
completed: null
status: in-progress
---

# Inception Log: chat-voice-assist

## Overview

**Intent**: Ativar entrada por voz (STT) e leitura em voz alta das respostas da IA (TTS)
no chat, para usuários com baixa ou nenhuma alfabetização.
**Type**: brown-field (enhancement do chat existente)
**Created**: 2026-07-24

## Artifacts Created

| Artifact | Status | File |
|----------|--------|------|
| Requirements | ✅ updated (FR-7/8/9 em 2026-08-06) | requirements.md |
| System Context | ✅ | system-context.md |
| Units | ✅ updated | units.md + units/001-chat-voice-assist-ui/unit-brief.md |
| Stories | ✅ 8 stories | units/001-chat-voice-assist-ui/stories/*.md |
| Bolt Plan | ✅ 4 bolts | memory-bank/bolts/027–030-* |

## Summary

| Metric | Count |
|--------|-------|
| Functional Requirements | 9 |
| Non-Functional Requirements | 5 grupos |
| Units | 1 |
| Stories | 8 |
| Bolts Planned | 4 (2 complete, 2 planned) |

## Units Breakdown

| Unit | Stories | Bolts | Priority |
|------|---------|-------|----------|
| 001-chat-voice-assist-ui | 8 | 4 (027–030) | Must |

## Decision Log

| Date | Decision | Rationale | Approved |
|------|----------|-----------|----------|
| 2026-07-24 | Intent `006-chat-voice-assist` | Cobre STT + TTS | Sim |
| 2026-07-24 | STT/TTS on-device; sem Web Speech API | App Flutter nativo; custo zero | Sim |
| 2026-07-24 | Toggle toque-iniciar / toque-parar | Acessibilidade | Sim |
| 2026-07-24 | Texto preenche campo; envio manual | Usuário confirma | Sim |
| 2026-07-24 | MVP só Android | Escopo | Sim |
| 2026-07-24 | Auto-TTS ligado por padrão + toggle | Público analfabeto | Sim (C2) |
| 2026-07-24 | TTS do rascunho STT fora de escopo | Escopo MVP | Sim (C2) |
| 2026-07-24 | 1 unit UI + 2 bolts (027 STT, 028 TTS) | Separar riscos STT/TTS | Sim |
| 2026-08-06 | **Não** criar intent nova; atualizar 006 | Mesmo domínio TTS; 028 já entregue base | Sim |
| 2026-08-06 | +FR-7/8/9 + stories 006–008 | Gap vs brief (sanitização, lifecycle, estados) | Pending |
| 2026-08-06 | Bolts 029 → 030 (incremental) | Não quebrar 027/028; sanitização antes de UI/lifecycle | Pending |

## Scope Changes

| Date | Change | Reason | Impact |
|------|--------|--------|--------|
| 2026-07-24 | Incluiu TTS além de STT | Público pode não ler | +FR-3, FR-6; bolt 028 |
| 2026-07-24 | TTS do rascunho excluído | Confirmação Checkpoint 2 | Sem story extra |
| 2026-08-06 | Delta hardening TTS | Brief detalhado pós-028 | +FR-7/8/9; +stories 006–008; +bolts 029/030 |

## Ready for Construction

**Checklist**:
- [x] All requirements documented
- [x] System context defined
- [x] Units decomposed
- [x] Stories created for all units
- [x] Bolts planned (incluindo delta 029/030)
- [ ] Human review do delta (Checkpoint)

## Next Steps

1. Aprovar delta FR-7/8/9 + bolts 029/030
2. Construction Agent: iniciar **029-chat-voice-assist-ui** (sanitização)
3. Em seguida **030-chat-voice-assist-ui** (lifecycle + estados)

## Dependencies

027-chat-voice-assist-ui → 028-chat-voice-assist-ui → 029-chat-voice-assist-ui → 030-chat-voice-assist-ui
