---
stage: test
bolt: 009-digital-guidance-ui
created: 2026-06-03T01:40:00Z
---

## Test Report: 009-digital-guidance-ui

### Summary

- **Tests**: 5/5 passed
- **Coverage**: widget tests para fluxos principais da Home (sem cobertura de header config — fora de escopo)

### Test Files

- [x] `apps/mobile/test/features/home/home_page_test.dart` — layout hub, CTA vazio, atalho PIX com starter, Ver todas, recente abre chat

### Acceptance Criteria Validation

- ✅ **Hero CTA "Quero ajuda agora" abre chat vazio**: teste confirma `createCalls == 0`
- ✅ **Atalhos MVP abrem chat com mensagem starter**: PIX → `fazer-pix` + `Desejo fazer um PIX`
- ✅ **Verificações recentes e "Ver todas"**: lista fake exibida; tap abre chat; "Ver todas" → Minhas conversas
- ✅ **Layout hub (hero, grid, recentes)**: textos e logo presentes
- ⚠️ **Cabeçalho com ícone configurações**: não implementado (decisão do usuário); config via bottom bar
- ✅ **Testes widget navegação + starters**: 5 cenários passando

### Issues Found

Nenhum bloqueante.

### Notes

Execução: `flutter test test/features/home/home_page_test.dart` — 5/5 OK.
