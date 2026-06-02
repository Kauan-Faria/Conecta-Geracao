---
stage: plan
bolt: 008-digital-guidance-ui
created: 2026-06-02T23:30:00Z
---

## Implementation Plan: 008-digital-guidance-ui

### Objective

Exibir 6 atalhos visuais dos tópicos MVP na tela de chat vazia, permitindo que o usuário inicie uma conversa com contexto de tópico ao tocar em um card.

### Deliverables

- Modelo `TopicShortcut` com slug, rótulo curto e ícone para os 6 tópicos MVP
- Widget `TopicShortcutsGrid` — grade 2×3 acessível (ícone + rótulo, alvo ≥ 48dp)
- `ChatController.startWithTopic(String topicSlug)` — reseta estado, cria conversa com `topicSlug`, envia mensagem inicial contextual
- Integração em `ChatPage`: substituir texto placeholder do chat vazio pela grade de atalhos
- Testes: unitário do modelo/lista de atalhos; widget da grade; controller `startWithTopic` com fake repository

### Dependencies

- **006-digital-guidance-ui** (complete): `ChatPage`, `ChatController`, feature `chat/`
- **005-ai-assistant-api**: `POST /api/v1/conversations` com `{ topicSlug }` — já implementado em `ConversationsApi`
- **007-digital-guidance-ui** (complete): cache/offline no controller — atalhos devem respeitar `isOffline` (desabilitar ou ocultar envio)
- **topic_display_label.dart** (007): rótulos longos para lista; atalhos usam rótulos curtos da story

### Technical Approach

1. **Constantes MVP**: arquivo `topic_shortcuts.dart` em `domain/` com lista fixa alinhada a `MVP_TOPIC_SLUGS` do backend:

   | Rótulo card | Slug API |
   |-------------|----------|
   | PIX | `fazer-pix` |
   | Gov.br | `codigo-govbr` |
   | WhatsApp | `whatsapp-contato-localizacao` |
   | Wi-Fi | `wifi-qr-code` |
   | Boleto | `segunda-via-boleto` |
   | Golpe | `alerta-golpe` |

2. **UI**: `TopicShortcutsGrid` usa `GridView` ou `Wrap` com cards `InkWell`/`Material` — altura mínima `AppSpacing.minTouchTarget` (48dp), `Semantics` com label "Iniciar conversa sobre {rótulo}".

3. **Fluxo ao tocar**:
   - Verificar autenticação (mesmo fluxo de `sendMessage`)
   - `resetForNewConversation()` se necessário
   - `createConversation(topicSlug: slug)`
   - Enviar mensagem inicial: `"Quero ajuda com {rótulo}"` para disparar resposta RAG da API
   - Exibir indicador "Pensando..." durante envio

4. **Visibilidade**: mostrar grade somente quando `messages.isEmpty && !isSending && !isLoadingConversation && !isOffline`.

5. **Ícones**: Material Icons com significado claro (`Icons.pix`, `Icons.account_balance`, `Icons.chat`, `Icons.wifi`, `Icons.receipt_long`, `Icons.warning_amber`) — sempre com rótulo textual visível.

6. **Estilo**: cards com fundo `AppColors.surface`, borda `AppColors.border`, cantos via `BrandTheme`; consistente com `AppButton` e demais widgets do chat.

### Acceptance Criteria

- [ ] **Given** chat vazio autenticado online, **When** visualizo, **Then** vejo 6 cards: PIX, Gov.br, WhatsApp, Wi-Fi, Boleto, Golpe
- [ ] **Given** toco em um card, **When** ação completa, **Then** nova conversa inicia com `topicSlug` correto e resposta do assistente
- [ ] **Given** cards exibidos, **When** inspeciono, **Then** ícone + rótulo textual, alvo de toque ≥ 48dp
- [ ] **Given** modo offline, **When** chat vazio, **Then** atalhos ocultos ou desabilitados (envio exige internet)
