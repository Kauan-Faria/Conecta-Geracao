---
id: 027-chat-voice-assist-ui
unit: 001-chat-voice-assist-ui
intent: 006-chat-voice-assist
type: simple-construction-bolt
status: complete
stories:
  - 001-stt-tap-to-dictate
  - 002-microphone-permission-fallback
  - 003-voice-input-accessible-states
created: 2026-07-24T19:12:00.000Z
started: 2026-07-24T19:15:19.000Z
completed: "2026-07-24T19:56:05Z"
current_stage: null
stages_completed:
  - name: plan
    completed: 2026-07-24T19:16:23.000Z
    artifact: implementation-plan.md
  - name: implement
    completed: 2026-07-24T19:51:46.000Z
    artifact: implementation-walkthrough.md
  - name: test
    completed: 2026-07-24T19:56:05Z
    artifact: test-walkthrough.md
requires_bolts: []
enables_bolts:
  - 028-chat-voice-assist-ui
requires_units: []
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 2
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: 027-chat-voice-assist-ui

## Overview

Ativa o botão de voz do chat no Android com STT on-device: toque para
iniciar/parar, preenchimento do campo de texto, permissão de microfone e
estados acessíveis (remove o placeholder “em breve”).

## Objective

Entregar entrada por voz funcional e acessível no `ChatInputBar`/`ChatPage`,
integrada ao envio de texto existente, sem áudio no backend.

## Stories Included

- **001-stt-tap-to-dictate**: STT toque-iniciar/parar → preenche campo (Must)
- **002-microphone-permission-fallback**: Permissão e indisponibilidade (Must)
- **003-voice-input-accessible-states**: Estados acessíveis do botão (Must)

## Bolt Type

**Type**: Simple Construction Bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [x] **1. Plan**: Done → implementation-plan.md
- [x] **2. Implement**: Done → implementation-walkthrough.md
- [x] **3. Test**: Done → test-walkthrough.md

## Dependencies

### Requires
- None

### Enables
- 028-chat-voice-assist-ui (TTS sobre o mesmo chat)

## Success Criteria

- [x] STT Android inicia/para por toque e preenche o campo
- [x] Envio permanece manual via fluxo existente
- [x] Permissão e fallbacks cobertos
- [x] Placeholder “em breve” removido; TalkBack ok
- [x] `flutter analyze` sem novos erros

## Notes

Confirmar pacote STT e permissões Android no Stage Plan. Testar em dispositivo
real ou emulador com engine de voz disponível.
