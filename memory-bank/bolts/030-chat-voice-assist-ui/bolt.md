---
id: 030-chat-voice-assist-ui
unit: 001-chat-voice-assist-ui
intent: 006-chat-voice-assist
type: simple-construction-bolt
status: complete
stories:
  - 007-tts-playback-lifecycle-guards
  - 008-tts-controls-and-playback-states
created: 2026-08-06T22:45:00.000Z
started: 2026-08-06T22:55:30.000Z
completed: "2026-08-06T23:05:37Z"
current_stage: null
stages_completed:
  - name: plan
    completed: 2026-08-06T22:56:30.000Z
    artifact: implementation-plan.md
  - name: implement
    completed: 2026-08-06T23:02:30.000Z
    artifact: implementation-walkthrough.md
  - name: test
    completed: 2026-08-06T23:05:37.000Z
    artifact: test-walkthrough.md
requires_bolts:
  - 028-chat-voice-assist-ui
  - 029-chat-voice-assist-ui
enables_bolts: []
requires_units: []
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 2
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: 030-chat-voice-assist-ui

## Overview

Completa o ciclo de vida do TTS e os controles/estados visuais: interrupções
(STT, sair da tela, dispose), parâmetros de voz, estados de playback e
destaque da mensagem ativa — em cima do TTS já entregue (028) e sanitizado (029).

## Objective

TTS robusto no Android: para quando o usuário fala/envia/sai, estados claros,
controles ouvir/parar/replay, sem acoplar `FlutterTts` à UI e sem quebrar STT.

## Stories Included

- **007-tts-playback-lifecycle-guards**: Interrupções, dispose, rate/volume/pitch, Manifest (Must)
- **008-tts-controls-and-playback-states**: Estados + controles + highlight + copy da preferência (Must)

## Bolt Type

**Type**: Simple Construction Bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [ ] **1. Plan**: Pending → implementation-plan.md
- [ ] **2. Implement**: Pending → implementation-walkthrough.md
- [ ] **3. Test**: Pending → test-walkthrough.md

## Dependencies

### Requires
- **028-chat-voice-assist-ui**: Base TTS
- **029-chat-voice-assist-ui**: Sanitização e anti-duplicata

### Enables
- Fechamento do delta de hardening TTS da intent 006

## Success Criteria

- [ ] Stop ao iniciar STT, ao enviar, ao sair da tela e ao trocar de mensagem
- [ ] `dispose()` / listeners seguros; sem fala dupla
- [ ] Estados de domínio alinhados a FR-9 (`pause` só se confiável)
- [ ] Controles + destaque visual da mensagem falando
- [ ] Volume/pitch/rate configurados; Manifest revisado
- [ ] Testes de estados + regressão 027/028/029

## Notes

Se `pause()` do `flutter_tts` for instável no Android, documentar no plan e
entregar só stop (sem estado `paused` na UI). Não recriar o serviço do zero —
estender a porta/controller existentes.
