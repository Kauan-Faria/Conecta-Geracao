---
id: 002-microphone-permission-fallback
unit: 001-chat-voice-assist-ui
intent: 006-chat-voice-assist
status: complete
priority: must
created: 2026-07-24T19:12:00.000Z
assigned_bolt: 027-chat-voice-assist-ui
implemented: true
---

# Story: 002-microphone-permission-fallback

## User Story

**As a** usuário no Android
**I want** que o app peça microfone só quando eu for gravar e explique se eu negar
**So that** eu entenda o que fazer e ainda possa usar o teclado

## Acceptance Criteria

- [ ] **Given** primeira tentativa de gravar sem permissão, **When** toco em Gravar, **Then** o sistema pede permissão de microfone.
- [ ] **Given** permissão negada, **When** tento gravar, **Then** vejo mensagem em linguagem simples e o teclado continua disponível.
- [ ] **Given** STT indisponível no dispositivo, **When** tento gravar, **Then** vejo aviso de indisponibilidade sem crash.
- [ ] **Given** build/plataforma não-Android neste intent, **When** vejo o botão de voz, **Then** ele fica desabilitado ou com mensagem de “em breve”, sem quebrar a UI.
- [ ] **Given** AndroidManifest, **When** inspeciono o app, **Then** `RECORD_AUDIO` (ou equivalente) está declarado com justificativa adequada para store.

## Technical Notes

- Declarar permissão no `AndroidManifest.xml`.
- Tratar permanentlyDenied com orientação para ajustes do sistema, se o app já tiver padrão similar.

## Dependencies

### Requires
- 001-stt-tap-to-dictate (fluxo de início de escuta)

### Enables
- Uso estável do STT em dispositivos reais

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Permissão concedida depois de negada | Próximo toque inicia escuta normalmente |
| App em background durante pedido | Sem crash; estado volta a idle |

## Out of Scope

- iOS permission strings / Info.plist
