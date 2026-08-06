---
stage: implement
bolt: 030-chat-voice-assist-ui
created: 2026-08-06T23:02:00.000Z
---

## Implementation Walkthrough: chat-voice-assist-ui (TTS lifecycle + controls)

### Summary

Ciclo de vida do TTS e controles/estados visuais no Android: interrupção ao
iniciar STT, dispose seguro ao sair do chat, parâmetros de voz no init,
estados `loading`/`stopped`, destaque da mensagem falando e copy acessível
da preferência — estendendo 028/029 sem rewrite.

### Structure Overview

A porta `TextToSpeechService` ganhou `dispose` e volume/pitch; o controller
expõe `disposePlayback`, estados FR-9 (sem `paused`) e guards pós-cancelamento.
O `VoiceInputController` para TTS antes de ouvir; `ChatPage` libera o engine
no dispose. UI da bolha destaca a mensagem ativa; labels da preferência
alinham a “Ler respostas em voz alta”.

### Completed Work

- [x] `apps/mobile/lib/features/chat/data/text_to_speech_service.dart` - Porta com dispose, rate/volume/pitch; pause omitido
- [x] `apps/mobile/lib/features/chat/domain/tts_playback_state.dart` - Estados idle/loading/speaking/stopped/error + copy a11y
- [x] `apps/mobile/lib/features/chat/presentation/tts_playback_controller.dart` - Lifecycle, loading/stopped, disposePlayback
- [x] `apps/mobile/lib/features/chat/presentation/voice_input_controller.dart` - Stop TTS ao iniciar STT
- [x] `apps/mobile/lib/features/chat/presentation/chat_page.dart` - dispose → disposePlayback
- [x] `apps/mobile/lib/features/chat/presentation/widgets/chat_message_bubble.dart` - Highlight + key da bolha falando
- [x] `apps/mobile/android/app/src/main/AndroidManifest.xml` - Query TTS_SERVICE (Android 11+); sem permissão extra
- [x] `apps/mobile/test/helpers/fake_text_to_speech_service.dart` - Fake com dispose/initialize counts
- [x] `apps/mobile/test/features/chat/tts_playback_controller_test.dart` - stopped + disposePlayback
- [x] `apps/mobile/test/features/chat/voice_input_controller_test.dart` - STT interrompe TTS
- [x] `apps/mobile/test/features/chat/chat_tts_ui_test.dart` - Highlight + labels atualizados
- [x] `apps/mobile/test/features/chat/chat_input_bar_voice_test.dart` - Overrides TTS para regressão STT

### Key Decisions

- **Sem `paused` na UI**: `flutter_tts` pause/resume é inconsistente no Android; só stop.
- **`stopped` vs `idle`**: stop explícito → `stopped`; completion natural → `idle`.
- **STT → TTS no VoiceInputController**: ponto único de entrada da escuta; testes STT passam a mockar TTS.
- **Manifest**: só `<queries>` para `TTS_SERVICE`; TTS on-device não exige permissão além do mic do STT.

### Deviations from Plan

None — pause omitido conforme opção documentada no plan.

### Dependencies Added

- Nenhuma nova dependência pub.

### Developer Notes

- `disposePlayback` pode ser chamado sem await no `State.dispose`; o Notifier
  (escopo app) re-inicializa no próximo `speak`.
- Callbacks de complete/error ignoram gerações já canceladas / status não ativo.
- Regressão smoke dos testes chat voice/TTS passou na Stage 2; Stage 3 formaliza o report.
