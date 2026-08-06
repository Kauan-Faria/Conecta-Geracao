---
stage: test
bolt: 029-chat-voice-assist-ui
created: 2026-08-06T22:52:39.000Z
---

## Test Report: chat-voice-assist-ui (TTS sanitization)

### Summary

- **Tests**: 38/38 passed (sanitize 12 + controller/labels 18 + prefs 2 + UI TTS 6)
- **Coverage**: helper speakable + skip/anti-duplicata/isFinal no controller + regressão TTS do 028
- **Analyze**: sem issues nos arquivos tocados (`dart analyze`)

### Test Files

- [x] `apps/mobile/test/features/chat/tts_speakable_text_test.dart` - Markdown, URL, código, emoji, vazio, JSON, ID, erro/sistema
- [x] `apps/mobile/test/features/chat/tts_playback_controller_test.dart` - sanitização no speak, skip JSON, anti-duplicata, isFinal, replay manual + regressão 028
- [x] `apps/mobile/test/features/chat/auto_tts_prefs_repository_test.dart` - regressão preferência auto-TTS
- [x] `apps/mobile/test/features/chat/chat_tts_ui_test.dart` - regressão controles Ouvir/Parar e Semantics

### Acceptance Criteria Validation

Story 006 — Sanitização / speakable:

- ✅ **Markdown/URLs/código → texto limpo**: `strips markdown…`, `keeps link label…`, `removes fenced…` + `speak sanitizes markdown…`
- ✅ **Vazio/erro/JSON/ID → não reproduz sem crash**: testes skip no helper + `speak skips non-speakable JSON without error state`
- ✅ **Parcial / não final → TTS não inicia**: `onNewAssistantMessage skips when isFinal is false`
- ✅ **Uma vez por messageId no auto-TTS**: `speaks only once per messageId`; replay manual ainda ok
- ✅ **Cobertura unitária Markdown/URL/código/vazio/JSON**: `tts_speakable_text_test.dart` (12 casos)

Qualidade / bolt:

- ✅ Regressão TTS 028 (controller, prefs, UI) passou
- ✅ Sem novas deps; STT/backend não alterados neste bolt
- ✅ Skip silencioso (sem `error` / SnackBar por conteúdo inválido)

### Issues Found

None

### Notes

- Comando: `flutter test test/features/chat/tts_speakable_text_test.dart test/features/chat/tts_playback_controller_test.dart test/features/chat/auto_tts_prefs_repository_test.dart test/features/chat/chat_tts_ui_test.dart`
- Lifecycle/dispose e destaque visual permanecem no bolt 030
