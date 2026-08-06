---
stage: test
bolt: 028-chat-voice-assist-ui
created: 2026-08-06T22:38:16Z
---

## Test Report: chat-voice-assist-ui (TTS)

### Summary

- **Tests**: 40/40 passed (TTS 21 + STT regressão 14 + ChatPage 5)
- **Coverage**: caminhos críticos do TTS (controller, prefs, bolha/header) + regressão STT/chat
- **Analyze**: sem issues nos arquivos TTS do chat (`dart analyze`)

### Test Files

- [x] `apps/mobile/test/features/chat/tts_playback_controller_test.dart` - auto-speak, stop/replay, cancelamento, preferência, falha, não-Android, labels
- [x] `apps/mobile/test/features/chat/auto_tts_prefs_repository_test.dart` - default ligado + persistência
- [x] `apps/mobile/test/features/chat/chat_tts_ui_test.dart` - Ouvir/Parar na bolha; Semantics do toggle no header
- [x] `apps/mobile/test/helpers/fake_text_to_speech_service.dart` - fake TTS compartilhado
- [x] `apps/mobile/test/features/chat/voice_input_controller_test.dart` - regressão STT (bolt 027)
- [x] `apps/mobile/test/features/chat/chat_input_bar_voice_test.dart` - regressão mic
- [x] `apps/mobile/test/features/chat/chat_page_test.dart` - regressão chat (envio/input)

### Acceptance Criteria Validation

Story 004 — TTS das respostas:
- ✅ **Auto-TTS lê nova resposta em pt-BR**: `onNewAssistantMessage speaks when auto-TTS enabled` (`language: pt-BR`)
- ✅ **Parar interrompe**: `toggleForMessage stops when speaking same message`
- ✅ **Ouvir novamente**: `toggleForMessage replays after stop`
- ✅ **Envio interrompe TTS**: `stopIfSpeaking` no controller + chamado em `ChatPage._sendMessage`
- ✅ **Falha TTS → texto ok + feedback**: `speak failure keeps chat usable with friendly feedback`
- ✅ **Mensagens do usuário não lidas**: widget test esconde controles; auto-speak só em `MessageRole.assistant`
- ✅ **Duas respostas rápidas cancelam a anterior**: `new speak cancels previous playback`

Story 005 — Preferência auto-TTS:
- ✅ **Default ligado sem chave**: controller + prefs repository
- ✅ **Desligado → sem auto-leitura; ouvir manual ok**: `skips when auto-TTS disabled` + controles na bolha
- ✅ **Persiste entre sessões**: `persists and reloads` + `loads persisted auto-TTS preference`
- ✅ **TalkBack ligado/desligado**: Semantics no `ChatHeroHeader` (`chat_tts_ui_test`)
- ✅ **Desligar durante leitura interrompe**: `disabling auto-TTS during speech stops playback`

Qualidade / bolt:
- ✅ **`dart analyze` limpo** nos arquivos TTS do chat
- ✅ **TTS on-device** (`flutter_tts`); sem áudio no backend
- ✅ **Fake TTS + prefs** cobrem fluxos principais

### Issues Found

Nenhum bloqueante. Validação em dispositivo/emulador Android real (voz pt-BR do sistema) permanece recomendada fora da suíte automatizada.

### Notes

- Hot restart após adicionar `flutter_tts`.
- Race da carga assíncrona da preferência coberta por `ensurePrefsLoaded` + testes atualizados.
- Com 027 + 028, a unit `001-chat-voice-assist-ui` fica pronta para encerrar após aprovação deste bolt.
