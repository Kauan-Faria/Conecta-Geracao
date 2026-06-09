---
stage: plan
bolt: 009-digital-guidance-ui
created: 2026-06-03T01:26:25Z
---

## Implementation Plan: 009-digital-guidance-ui

### Objective

Transformar a aba Início em hub de entrada do assistente: hero CTA, ações rápidas com mensagem contextual e verificações recentes — conforme story **006-home-screen** e mockup.

### Estado atual (pré-bolt)

`HomePage` em `apps/mobile/lib/features/home/presentation/home_page.dart` já implementa a maior parte do layout e fluxos:

- Hero com título, subtítulo e botão "Quero ajuda agora" → `/chat?new=true`
- Grid 2×2 com os 6 atalhos MVP via `mvpTopicShortcuts` → `/chat?topic={slug}`
- Seção "Verificações recentes" com cache/lista (até 4 itens) e "Ver todas" → `/conversations`
- Estado vazio amigável e loading para recentes
- Semântica e alvos de toque ≥ 48dp nos botões principais

Rotas e integrações dos bolts **006** e **007** já disponíveis (`ChatPage` query params, `ConversationListController`, `startWithTopic`).

### Lacunas identificadas

| Critério | Status | Ação |
|----------|--------|------|
| Cabeçalho: logo + nome do app + ícone configurações (≥ 48dp) | Parcial | Completar `_HomeHeader` com título "ConectaGeração" e botão config → `/settings` |
| "Quero ajuda agora" abre chat vazio sem envio automático | OK | Validar em teste widget |
| Atalhos MVP abrem chat com `topicSlug` + mensagem starter | OK | `startWithTopic` usa `starterMessage` de `topic_shortcuts.dart` |
| Recentes: até 4 conversas, data relativa, toque abre chat | OK | Validar em teste widget |
| "Ver todas" → lista completa | OK | `context.push('/conversations')` |
| Offline ao tocar ação rápida | OK | Tratado em `ChatController.startWithTopic` |
| Testes widget (navegação + starters) | Ausente | Criar `home_page_test.dart` |
| `home_quick_actions.dart` separado | Opcional | Reutilizar `topic_shortcuts.dart` (já contém starters); sem arquivo duplicado |
| `startWithMessage` genérico | Opcional | Não necessário — `startWithTopic` cobre todos os 6 atalhos |

### Deliverables

1. **Completar cabeçalho** — logo, nome do app, ícone de configurações acessível
2. **Revisar limites e copy** — alinhar recentes (4 itens conforme AC principal da story)
3. **Testes widget** — `apps/mobile/test/features/home/home_page_test.dart`:
   - Layout: hero, grid de atalhos, seção recentes
   - "Quero ajuda agora" navega para chat vazio (sem mensagem enviada)
   - Toque em atalho navega para chat com topic correto
   - "Ver todas" abre lista de conversas
   - Ícone configurações navega para aba Configurações
4. **Walkthrough e test report** — artefatos dos stages 2 e 3

### Dependencies

- **006-digital-guidance-ui** (complete): chat, checkpoints, `startWithTopic`, query params no router
- **007-digital-guidance-ui** (complete): `ConversationListController`, cache, `/conversations`, formatação de datas

### Technical Approach

- Manter `HomePage` como `ConsumerWidget` em `features/home/presentation/`
- Cabeçalho: `Row` com logo + `Text` título + `IconButton` config (min 48dp, `Semantics`)
- Navegação: `context.go` para chat (mesma stack shell), `context.go('/settings')` ou branch equivalente para config
- Testes: padrão de `chat_page_test.dart` / `app_shell_test.dart` — `ProviderScope` com fakes, `ConectaGeracaoApp`, tap na aba Início
- Não criar `home_quick_actions.dart` — starters já centralizados em `topic_shortcuts.dart`

### Acceptance Criteria

- [ ] Cabeçalho com logo, nome do app e ícone configurações (≥ 48dp) navegando para Configurações
- [ ] Hero CTA "Quero ajuda agora" abre chat vazio sem envio automático
- [ ] 6 atalhos MVP abrem chat com mensagem starter correta (via `startWithTopic`)
- [ ] Verificações recentes: lista/empty state, toque abre conversa, "Ver todas" funcional
- [ ] Alvos de toque ≥ 48dp e semântica nos interativos
- [ ] Testes widget passando para navegação e fluxos principais
