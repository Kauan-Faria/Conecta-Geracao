---
stage: test
bolt: 030-chat-voice-assist-ui
created: 2026-08-06T23:04:30.000Z
---

## Test Report: chat-voice-assist-ui (TTS lifecycle + controls)

### Summary

- **Tests**: 57/57 passed
- **Coverage**: lifecycle (STT interrupt, dispose, stale complete), estados FR-9,
  highlight UI, copy preferência, regressão 027/028/029
- **Analyze**: `No issues found!` nos arquivos tocados

### Test Files

- [x] `apps/mobile/test/features/chat/tts_playback_controller_test.dart` - stopped, disposePlayback, stale complete, enum FR-9, labels
- [x] `apps/mobile/test/features/chat/voice_input_controller_test.dart` - STT inicia → para TTS + regressão STT
- [x] `apps/mobile/test/features/chat/chat_tts_ui_test.dart` - Ouvir/Parar, highlight bolha, Semantics auto-TTS
- [x] `apps/mobile/test/features/chat/chat_input_bar_voice_test.dart` - regressão barra de voz com overrides TTS
- [x] `apps/mobile/test/features/chat/tts_speakable_text_test.dart` - regressão sanitização (029)
- [x] `apps/mobile/test/features/chat/auto_tts_prefs_repository_test.dart` - regressão preferência (028)

### Acceptance Criteria Validation

Story 007 — Lifecycle:

- ✅ **STT inicia → TTS para**: `startListening stops TTS if speaking`
- ✅ **Envio → TTS para**: `stopIfSpeaking` (comportamento 028 preservado)
- ✅ **Dispose / sair**: `disposePlayback stops engine and clears handlers`; re-init no speak seguinte
- ✅ **Sem callback pós-cancel**: `stale completion after stop keeps stopped status`
- ✅ **Falha speak → texto ok**: `speak failure keeps chat usable with friendly feedback`
- ✅ **rate/volume/pitch + Manifest**: implementados no serviço; query `TTS_SERVICE` (sem permissão extra)
- ✅ **Sem pause na UI**: documentado; enum sem `paused`

Story 008 — Controles / estados:

- ✅ **Ouvir / Parar / replay**: UI + `toggleForMessage` / `replays after stop`
- ✅ **Highlight mensagem ativa**: `highlights assistant bubble while speaking`
- ✅ **Estados idle/loading/speaking/stopped/error**: enum + testes de status
- ✅ **Preferência TalkBack**: “Ler respostas em voz alta, ligado/desligado”
- ✅ **Usuário sem TTS**: `hides TTS controls for user messages`

Qualidade / bolt:

- ✅ Regressão 027 (STT) + 028 (TTS base) + 029 (sanitize) passou
- ✅ Sem novas deps pub; `dart analyze` limpo no escopo

### Issues Found

None

### Notes

- Comando:  
  `flutter test test/features/chat/tts_speakable_text_test.dart test/features/chat/tts_playback_controller_test.dart test/features/chat/auto_tts_prefs_repository_test.dart test/features/chat/chat_tts_ui_test.dart test/features/chat/voice_input_controller_test.dart test/features/chat/chat_input_bar_voice_test.dart`
- Dispose da `ChatPage` chama `disposePlayback` (sem await); coberto via teste do controller.
- Este bolt fecha o delta de hardening TTS da unit `001-chat-voice-assist-ui`.
