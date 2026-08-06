---
stage: implement
bolt: 027-chat-voice-assist-ui
created: 2026-07-24T19:51:00Z
---

## Implementation Walkthrough: chat-voice-assist-ui (STT)

### Summary

O botão de voz do chat no Android agora inicia e para STT on-device por toque,
preenche o campo de mensagem sem enviar automaticamente e trata permissão,
indisponibilidade e estados acessíveis. O placeholder “em breve” foi removido
do fluxo Android real; demais plataformas degradam com mensagem clara.

### Structure Overview

Extensão da feature `chat`: domínio de estados/mensagens de voz, porta +
adapter `speech_to_text`, controller Riverpod e `ChatInputBar` reativo. O
`ChatPage` encerra a escuta antes do envio. Permissão `RECORD_AUDIO` e query
do RecognitionService no AndroidManifest.

### Completed Work

- [x] `apps/mobile/pubspec.yaml` - dependência `speech_to_text`
- [x] `apps/mobile/android/app/src/main/AndroidManifest.xml` - `RECORD_AUDIO` + query RecognitionService
- [x] `apps/mobile/lib/features/chat/domain/voice_listening_state.dart` - status, mensagens e labels acessíveis
- [x] `apps/mobile/lib/features/chat/data/speech_recognition_service.dart` - porta STT + adapter on-device
- [x] `apps/mobile/lib/features/chat/presentation/voice_input_controller.dart` - orquestra idle/listening/erro/plataforma
- [x] `apps/mobile/lib/features/chat/presentation/widgets/chat_input_bar.dart` - Gravar/Parar, Semantics, feedback
- [x] `apps/mobile/lib/features/chat/presentation/chat_page.dart` - para STT ao enviar
- [x] `apps/mobile/test/helpers/fake_speech_recognition_service.dart` - fake para testes
- [x] `apps/mobile/test/features/chat/voice_input_controller_test.dart` - unitários do controller
- [x] `apps/mobile/test/features/chat/chat_input_bar_voice_test.dart` - widget tests do botão de voz

### Key Decisions

- **`speech_to_text` + `androidNoBluetooth`**: STT on-device sem exigir permissões Bluetooth extras.
- **Porta `SpeechRecognitionService`**: permite fakes nos testes sem engine nativa.
- **`voiceInputPlatformSupportedProvider`**: Android-only injetável; iOS/desktop degradam sem crash.
- **Prefixo de sessão no campo**: preserva texto já digitado e concatena o reconhecimento.
- **Envio manual**: STT só atualiza o `TextEditingController`; `onSend` permanece o fluxo existente.

### Deviations from Plan

- Nome do arquivo de dados: `speech_recognition_service.dart` (porta + impl) em vez de
  `speech_to_text_service.dart` — mesmo papel, nome alinhado à porta abstrata.
- Testes de widget focados em `ChatInputBar` + unitários do controller (em vez
  de só atualizar `chat_page_test`); `chat_page_test` existente continua passando.

### Dependencies Added

- [x] `speech_to_text` (^7.4.0) - reconhecimento de fala on-device no Android

### Developer Notes

- Validar em dispositivo/emulador Android com engine de voz e permissão de microfone.
- Hot restart (não só hot reload) após mudança de Manifest/`RECORD_AUDIO`.
- TTS e preferência auto-leitura ficam no bolt `028`.
