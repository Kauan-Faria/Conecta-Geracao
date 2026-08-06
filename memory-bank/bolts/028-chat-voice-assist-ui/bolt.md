---
id: 028-chat-voice-assist-ui
unit: 001-chat-voice-assist-ui
intent: 006-chat-voice-assist
type: simple-construction-bolt
status: complete
stories:
  - 004-tts-assistant-replies
  - 005-auto-tts-preference
created: 2026-07-24T19:12:00.000Z
started: 2026-08-06T21:51:19.000Z
completed: "2026-08-06T22:39:09Z"
current_stage: null
stages_completed:
  - name: plan
    completed: 2026-08-06T22:25:00.000Z
    artifact: implementation-plan.md
  - name: implement
    completed: 2026-08-06T22:36:31.000Z
    artifact: implementation-walkthrough.md
  - name: test
    completed: 2026-08-06T22:39:09Z
    artifact: test-walkthrough.md
requires_bolts:
  - 027-chat-voice-assist-ui
enables_bolts:
  - 029-chat-voice-assist-ui
requires_units: []
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 1
  testing_scope: 2
---

# Bolt: 028-chat-voice-assist-ui

## Overview

Adiciona TTS on-device para ler respostas do assistente em pt-BR, com controles
de parar/repetir e preferência de auto-leitura (ligada por padrão).

## Objective

Permitir que o usuário acompanhe a orientação da IA só ouvindo, com controle
explícito sobre a leitura automática.

## Stories Included

- **004-tts-assistant-replies**: TTS play/stop/replay das respostas (Must)
- **005-auto-tts-preference**: Preferência persistida de auto-TTS (Should)

## Bolt Type

**Type**: Simple Construction Bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [x] **1. Plan**: Done → implementation-plan.md
- [x] **2. Implement**: Done → implementation-walkthrough.md
- [x] **3. Test**: Done → test-walkthrough.md

## Dependencies

### Requires
- **027-chat-voice-assist-ui**: Chat com voz/input estável; mesma feature area

### Enables
- Deploy completo da assistência por voz (STT + TTS)

## Success Criteria

- [x] Auto-TTS lê novas respostas do assistente em pt-BR (padrão ligado)
- [x] Parar e ouvir novamente funcionam
- [x] Envio de nova mensagem interrompe TTS de forma previsível
- [x] Preferência persiste entre sessões
- [x] Falha de TTS não quebra o chat por texto

## Notes

Pode iniciar após 027 para evitar conflitos de UI no mesmo `ChatPage`. TTS do
rascunho STT permanece fora de escopo.
