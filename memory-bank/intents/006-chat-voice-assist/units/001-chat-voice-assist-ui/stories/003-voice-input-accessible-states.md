---
id: 003-voice-input-accessible-states
unit: 001-chat-voice-assist-ui
intent: 006-chat-voice-assist
status: complete
priority: must
created: 2026-07-24T19:12:00.000Z
assigned_bolt: 027-chat-voice-assist-ui
implemented: true
---

# Story: 003-voice-input-accessible-states

## User Story

**As a** usuário (incluindo com TalkBack)
**I want** que o botão de voz mostre claramente se está gravando ou parado
**So that** eu saiba o que vai acontecer no próximo toque

## Acceptance Criteria

- [ ] **Given** o chat aberto, **When** o botão de voz está ocioso, **Then** o SnackBar “Gravação de voz em breve…” **não** aparece mais ao tocar (fluxo real no Android).
- [ ] **Given** modo ouvindo, **When** o botão está visível, **Then** rótulo/ícone/semantics indicam ação de **parar** (ex.: “Parar gravação”).
- [ ] **Given** modo ocioso no Android com STT ok, **When** o botão está visível, **Then** semantics indicam ação de **gravar**/iniciar.
- [ ] **Given** estado de erro ou indisponível, **When** o usuário interage, **Then** há feedback textual claro (SnackBar ou equivalente acessível).
- [ ] **Given** controles de voz, **When** medidos, **Then** alvos de toque respeitam `AppSpacing.minTouchTarget`.

## Technical Notes

- Atualizar `ChatInputBar` (hoje Stateless com placeholder).
- Feedback não deve depender só de cor (ícone + texto/label).

## Dependencies

### Requires
- 001-stt-tap-to-dictate

### Enables
- Experiência acessível completa do mic

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| `isSending == true` | Botão de voz desabilitado (como hoje) |
| Teclado aberto | Layout da barra permanece utilizável |

## Out of Scope

- Redesign completo da barra além dos estados de voz
