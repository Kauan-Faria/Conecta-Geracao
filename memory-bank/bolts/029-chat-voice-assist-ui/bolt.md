---
id: 029-chat-voice-assist-ui
unit: 001-chat-voice-assist-ui
intent: 006-chat-voice-assist
type: simple-construction-bolt
status: complete
stories:
  - 006-tts-speakable-text-sanitization
created: 2026-08-06T22:45:00.000Z
started: 2026-08-06T22:49:31.000Z
completed: "2026-08-06T22:54:49Z"
current_stage: null
stages_completed:
  - name: plan
    completed: 2026-08-06T22:50:40.000Z
    artifact: implementation-plan.md
  - name: implement
    completed: 2026-08-06T22:52:39.000Z
    artifact: implementation-walkthrough.md
  - name: test
    completed: 2026-08-06T22:54:49.000Z
    artifact: test-walkthrough.md
requires_bolts:
  - 028-chat-voice-assist-ui
enables_bolts:
  - 030-chat-voice-assist-ui
requires_units: []
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 1
  testing_scope: 2
---

# Bolt: 029-chat-voice-assist-ui

## Overview

Hardening do caminho de fala: sanitizar texto da IA e só disparar TTS em
conteúdo final elegível — sem redesenhar UI nem alterar STT/backend.

## Objective

Garantir que o auto-TTS e o “Ouvir” falem apenas texto limpo e útil, uma vez
por resposta completa, preservando o comportamento já entregue no bolt 028.

## Stories Included

- **006-tts-speakable-text-sanitization**: Sanitização + skip de não-speakable + anti-duplicata (Must)

## Bolt Type

**Type**: Simple Construction Bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [x] **1. Plan**: Done → implementation-plan.md
- [x] **2. Implement**: Done → implementation-walkthrough.md
- [x] **3. Test**: Done → test-walkthrough.md

## Dependencies

### Requires
- **028-chat-voice-assist-ui**: TTS base (serviço, controller, auto-TTS, UI)

### Enables
- **030-chat-voice-assist-ui**: Lifecycle, estados e controles refinados

## Success Criteria

- [x] Helper de sanitização puro com testes unitários
- [x] Speak/auto-TTS usam texto sanitizado; pulam vazios/erros/JSON/sistema
- [x] Sem leitura de mensagens parciais/streaming
- [x] Uma reprodução automática por `messageId` (sem duplicar em rebuild)
- [x] Regressão dos testes TTS do 028 continua passando
- [x] Sem mudanças de API/backend; STT intacto

## Notes

Bolt deliberadamente **estreito** para não quebrar 028: alterar principalmente
domain/data + ponto de entrada do `speak`/`onNewAssistantMessage`. UI de
controles fica para o 030.
