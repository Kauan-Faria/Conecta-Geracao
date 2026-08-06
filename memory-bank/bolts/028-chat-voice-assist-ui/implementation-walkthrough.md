---
stage: implement
bolt: 028-chat-voice-assist-ui
created: 2026-08-06T22:36:31Z
---

## Implementation Walkthrough: chat-voice-assist-ui (TTS)

### Summary

O chat no Android agora lê respostas do assistente em voz alta (pt-BR) com
auto-TTS ligado por padrão, controles de parar/ouvir na bolha, toggle de
preferência no header e interrupção previsível ao enviar. Falhas de TTS
mantêm o chat por texto utilizável.

### Structure Overview

Extensão da feature `chat` espelhando o padrão STT: domínio de estados/labels,
porta + adapter `flutter_tts`, repositório de preferência local, controller
Riverpod e wiring em `ChatPage` / `ChatMessageBubble` / `ChatHeroHeader`.

### Completed Work

- [x] `apps/mobile/pubspec.yaml` - dependência `flutter_tts`
- [x] `apps/mobile/lib/features/chat/domain/tts_playback_state.dart` - status, mensagens e labels acessíveis
- [x] `apps/mobile/lib/features/chat/data/text_to_speech_service.dart` - porta TTS + adapter on-device
- [x] `apps/mobile/lib/features/chat/data/auto_tts_prefs_repository.dart` - persistência `chat_auto_tts_enabled` (default true)
- [x] `apps/mobile/lib/features/chat/presentation/tts_playback_controller.dart` - auto-speak, stop/replay, preferência, falhas
- [x] `apps/mobile/lib/features/chat/presentation/chat_page.dart` - auto-TTS em novas respostas, stop ao enviar, feedback
- [x] `apps/mobile/lib/features/chat/presentation/widgets/chat_message_bubble.dart` - controles Ouvir/Parar
- [x] `apps/mobile/lib/features/chat/presentation/widgets/chat_hero_header.dart` - toggle auto-TTS com Semantics
- [x] `apps/mobile/test/helpers/fake_text_to_speech_service.dart` - fake para testes
- [x] `apps/mobile/test/features/chat/tts_playback_controller_test.dart` - unitários do controller
- [x] `apps/mobile/test/features/chat/auto_tts_prefs_repository_test.dart` - persistência da preferência
- [x] `apps/mobile/test/features/chat/chat_tts_ui_test.dart` - widget tests de bolha e header

### Key Decisions

- **`flutter_tts` + locale `pt-BR`**: TTS on-device alinhado ao unit-brief e às stories.
- **Porta `TextToSpeechService`**: permite fakes sem engine nativa, igual ao STT.
- **Controles na bolha do assistente**: menos invasivo que a barra de input (já com mic).
- **Toggle no `ChatHeroHeader`**: preferência acessível sem nova tela de settings.
- **Interrupção no envio**: `_sendMessage` chama `stopIfSpeaking` de forma previsível.
- **Race da preferência**: `ensurePrefsLoaded` + flag de override evitam reload assíncrono sobrescrever o toggle do usuário.

### Deviations from Plan

- Toggle ficou no `ChatHeroHeader` (em vez de AppBar genérico) — mesmo papel,
  encaixa no layout existente do chat.
- Testes de widget focados em `ChatMessageBubble` + `ChatHeroHeader` (além dos
  unitários do controller/prefs), sem alterar `chat_page_test` neste stage.

### Dependencies Added

- [x] `flutter_tts` (^4.2.3) - síntese de voz on-device no Android

### Developer Notes

- Validar em dispositivo/emulador Android com engine TTS e voz pt-BR instalada.
- Hot restart após adicionar o pacote `flutter_tts`.
- Stage Test formaliza o relatório; smoke dos testes TTS já passou localmente (21/21).
