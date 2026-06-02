---
stage: test
bolt: 006-digital-guidance-ui
created: 2026-06-01T20:30:00Z
---

## Test Report: 006-digital-guidance-ui

### Summary

- **Tests**: 22/22 passed (suite completa do app mobile)
- **Coverage**: não medido (foco em comportamentos do bolt)

### Test Files

- [x] `test/features/chat/checkpoint_detector_test.dart` — heurística de checkpoints
- [x] `test/features/chat/chat_message_test.dart` — parsing JSON
- [x] `test/features/chat/chat_page_test.dart` — hero, envio, Sim/Não, guest CTA

### Acceptance Criteria Validation

- ✅ **Enviar mensagem exibe bolha user + resposta IA**: widget test com FakeChatRepository
- ✅ **Indicador "Pensando..." acessível**: widget com Semantics `liveRegion`
- ✅ **Texto grande e contraste AA**: usa `bodyLarge` do tema + tokens AppColors
- ✅ **Erro de rede com retry**: ChatErrorBanner com "Tentar novamente"
- ✅ **Botões Sim/Não acessíveis**: semantic labels + min 48dp
- ✅ **Texto livre sempre disponível**: input permanece visível com checkpoints

### Issues Found

- Nenhum bloqueante nos testes automatizados.

### Notes

- Testes E2E com backend real e TalkBack ficam para validação manual em dispositivo.
