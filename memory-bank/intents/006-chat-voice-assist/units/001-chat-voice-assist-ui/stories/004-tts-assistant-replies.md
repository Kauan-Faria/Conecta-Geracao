---
id: 004-tts-assistant-replies
unit: 001-chat-voice-assist-ui
intent: 006-chat-voice-assist
status: complete
priority: must
created: 2026-07-24T19:12:00.000Z
assigned_bolt: 028-chat-voice-assist-ui
implemented: true
---

# Story: 004-tts-assistant-replies

## User Story

**As a** usuário que não consegue ler bem o texto
**I want** ouvir as respostas da IA em voz alta, poder parar e ouvir de novo
**So that** eu acompanhe a orientação só falando e escutando

## Acceptance Criteria

- [ ] **Given** uma nova mensagem do assistente chegou, **When** auto-TTS está ligado, **Then** o app inicia a leitura em pt-BR do conteúdo.
- [ ] **Given** TTS em andamento, **When** toco em parar, **Then** a leitura interrompe imediatamente.
- [ ] **Given** a última resposta do assistente, **When** toco em ouvir novamente, **Then** a leitura recomeça.
- [ ] **Given** TTS em andamento, **When** envio uma nova mensagem, **Then** a leitura em curso é interrompida (ou substituída de forma previsível, documentada).
- [ ] **Given** falha do engine TTS, **When** a resposta chega, **Then** o chat por texto continua utilizável e há feedback amigável.

## Technical Notes

- Candidato: `flutter_tts` com locale pt-BR.
- Controles visíveis próximos à resposta ou na barra do chat (escolher o menos invasivo no plan do bolt).
- Não ler mensagens do usuário por padrão.

## Dependencies

### Requires
- None (independente de STT)

### Enables
- 005-auto-tts-preference

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Resposta muito longa | Lê o texto completo ou até o usuário parar; UI não trava |
| Duas respostas rápidas | Cancela a anterior antes de iniciar a nova |

## Out of Scope

- TTS do rascunho STT
- Escolha de voz/timbre avançada
- iOS
