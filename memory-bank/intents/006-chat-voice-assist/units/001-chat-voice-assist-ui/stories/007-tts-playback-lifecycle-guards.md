---
id: 007-tts-playback-lifecycle-guards
unit: 001-chat-voice-assist-ui
intent: 006-chat-voice-assist
status: complete
priority: must
created: 2026-08-06T22:45:00.000Z
assigned_bolt: 030-chat-voice-assist-ui
implemented: true
---

# Story: 007-tts-playback-lifecycle-guards

## User Story

**As a** usuário do chat por voz
**I want** que a leitura pare quando eu falar de novo, enviar outra pergunta ou sair da tela
**So that** o app nunca fale por cima de mim nem continue falando em background

## Acceptance Criteria

- [ ] **Given** TTS falando, **When** inicio o STT (começar a falar), **Then** a leitura interrompe imediatamente.
- [ ] **Given** TTS falando, **When** envio outra pergunta, **Then** a leitura interrompe (comportamento já existente permanece).
- [ ] **Given** TTS falando, **When** saio da tela do chat, **Then** a leitura para e listeners/callbacks são cancelados sem erro pós-dispose.
- [ ] **Given** o serviço TTS, **When** o controller encerra, **Then** `dispose()` libera o engine; não há nova instância de `FlutterTts` a cada rebuild.
- [ ] **Given** init/speak falham, **When** uso o chat, **Then** a tela não cai e o texto continua utilizável.
- [ ] **Given** AndroidManifest / setup Android, **When** reviso permissões, **Then** documenta-se se TTS exige algo além do já presente (microfone do STT); aplica-se só o necessário.
- [ ] **Given** rate/volume/pitch, **When** o serviço inicializa, **Then** valores adequados a baixa alfabetização digital estão configurados em `pt-BR`.

## Technical Notes

- Estender `TextToSpeechService` com `dispose()` e `pause()` **somente se** confiável no Android; senão documentar e omitir pause na UI.
- Wiring: `VoiceInputController` / início de escuta → `stopIfSpeaking`; `ChatPage.dispose` → stop + dispose seguro.
- Manter porta abstrata; widget continua sem `FlutterTts`.
- Não refazer STT; apenas conectar interrupção.

## Dependencies

### Requires
- 004-tts-assistant-replies
- 001-stt-tap-to-dictate
- 006-tts-speakable-text-sanitization (preferível; fala só texto limpo)

### Enables
- 008-tts-controls-and-playback-states

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Hot restart com TTS ativo | Volta a idle sem crash |
| Pause não suportado pelo plugin | Só stop; estado `paused` não exposto na UI |
| Troca rápida STT ↔ TTS | Sem áudio sobreposto |

## Out of Scope

- iOS
- Cloud TTS
- Alterar pipeline de envio de mensagens
