---
stage: test
bolt: 027-chat-voice-assist-ui
created: 2026-07-24T19:54:04Z
---

## Test Report: chat-voice-assist-ui (STT)

### Summary

- **Tests**: 19/19 passed
- **Coverage**: caminhos críticos do STT (controller + ChatInputBar + regressão ChatPage)
- **Analyze**: sem issues em `lib/features/chat`

### Test Files

- [x] `apps/mobile/test/features/chat/voice_input_controller_test.dart` - start/stop, partials, permissão, indisponível, não-Android, labels
- [x] `apps/mobile/test/features/chat/chat_input_bar_voice_test.dart` - UI Gravar/Parar, sem auto-send, Semantics, touch target, fallback não-Android
- [x] `apps/mobile/test/features/chat/chat_page_test.dart` - regressão do chat (input/envio intactos)
- [x] `apps/mobile/test/helpers/fake_speech_recognition_service.dart` - fake STT compartilhado

### Acceptance Criteria Validation

Story 001 — STT toque-iniciar/parar:
- ✅ **Toque Gravar → ouvindo**: coberto por controller + widget test
- ✅ **Toque Parar → texto no campo**: widget test `second tap stops and keeps text`
- ✅ **Sem envio automático**: widget test verifica `sendCount == 0` após STT
- ✅ **Envio via fluxo existente**: `ChatPage._sendMessage` inalterado (só chama `stopIfListening` antes); regressão `chat_page_test`
- ✅ **Parciais sem travar UI**: `emitPartial` atualiza transcript/campo

Story 002 — Permissão e fallbacks:
- ✅ **Pedido de microfone na 1ª gravação**: via `speech_to_text.initialize` (runtime Android); caminho de init testado
- ✅ **Permissão negada → mensagem + teclado**: `permissionDenied` / `permissionPermanentlyDenied` mapeados; TextField permanece habilitado na barra
- ✅ **STT indisponível sem crash**: init falha com permissão ok → `unavailable`
- ✅ **Não-Android**: mensagem “disponível no Android em breve”; não inicia escuta
- ✅ **`RECORD_AUDIO` no Manifest**: declarado + query `RecognitionService`

Story 003 — Estados acessíveis:
- ✅ **SnackBar “Gravação de voz em breve…” removido no Android**: fluxo real usa STT; “em breve” só fora do Android
- ✅ **Ouvindo → Parar (label/ícone/semantics)**: widget + unit de labels
- ✅ **Ocioso → Gravar semantics**: widget test
- ✅ **Erro/indisponível com feedback textual**: SnackBar via `feedbackMessage`
- ✅ **Touch target ≥ `AppSpacing.minTouchTarget`**: assert no widget test

Qualidade / bolt:
- ✅ **`flutter analyze` limpo** em `lib/features/chat`
- ✅ **Sem endpoint de áudio**: só texto no envio existente
- ✅ **Fake STT** cobre estados principais

### Issues Found

Nenhum bloqueante. Validação em dispositivo/emulador Android real (engine de voz + diálogo de permissão) permanece recomendada fora da suíte automatizada.

### Notes

- Hot restart necessário após alteração de Manifest para `RECORD_AUDIO` aparecer no app instalado.
- Bolt `028` cobre TTS; fora do escopo deste relatório.
