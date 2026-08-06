---
intent: 006-chat-voice-assist
phase: inception
status: units-decomposed
updated: 2026-08-06T22:45:00Z
---

# Assistência por voz no chat - Unit Decomposition

## Units Overview

Esta intent decompõe-se em **1 unit** de UI mobile (sem backend):

### Unit 1: 001-chat-voice-assist-ui

**Description**: Integra STT e TTS on-device no chat Android: ativa o botão
Gravar (toque para iniciar/parar), preenche o campo de texto, trata permissão
de microfone e estados acessíveis, lê respostas da IA em voz alta (auto-TTS
ligado por padrão com preferência persistida). Delta pós-028: sanitização de
texto, guards de ciclo de vida e estados/controles refinados.

**Assigned Requirements**: FR-1, FR-2, FR-3, FR-4, FR-5, FR-6, FR-7, FR-8, FR-9

**Stories**:

- 001-stt-tap-to-dictate: STT Android toque-iniciar/parar → preenche campo
- 002-microphone-permission-fallback: Permissão e indisponibilidade
- 003-voice-input-accessible-states: Estados do botão (remove “em breve”)
- 004-tts-assistant-replies: TTS play/stop/replay das respostas
- 005-auto-tts-preference: Preferência de leitura automática
- 006-tts-speakable-text-sanitization: Sanitização e conteúdo elegível
- 007-tts-playback-lifecycle-guards: Interrupções e dispose do TTS
- 008-tts-controls-and-playback-states: Estados e controles visuais

**Deliverables**:

- Dependências STT/TTS no `pubspec.yaml` + permissão Android
- Serviço/adapters de voz na feature chat
- `ChatInputBar` e `ChatPage` com controles STT/TTS
- Persistência local da preferência auto-TTS
- Sanitização de texto speakable + testes
- Lifecycle TTS (STT/envia/sair) + estados de playback

**Dependencies**:

- Depends on: chat UI existente (`001-digital-guidance` / digital-guidance-ui)
- Depended by: nenhuma

**Estimated Complexity**: M

## Requirement-to-Unit Mapping

- **FR-1** → `001-chat-voice-assist-ui`
- **FR-2** → `001-chat-voice-assist-ui`
- **FR-3** → `001-chat-voice-assist-ui`
- **FR-4** → `001-chat-voice-assist-ui`
- **FR-5** → `001-chat-voice-assist-ui`
- **FR-6** → `001-chat-voice-assist-ui`
- **FR-7** → `001-chat-voice-assist-ui`
- **FR-8** → `001-chat-voice-assist-ui`
- **FR-9** → `001-chat-voice-assist-ui`

## Unit Dependency Graph

```text
[001-chat-voice-assist-ui]  (reutiliza chat existente; sem units backend)
```

## Execution Order

1. Unit 001-chat-voice-assist-ui — bolts 027 (STT) → 028 (TTS) → 029 (sanitização) → 030 (lifecycle/estados)
