---
unit: 001-tutorials-ui
intent: 005-tutorials-tab
phase: inception
status: complete
created: 2026-07-20T20:57:00.000Z
updated: 2026-07-20T20:57:00.000Z
---

# Unit Brief: Tutorials UI

## Purpose

Adicionar a aba "Tutoriais" ao app mobile, entre Chat e Configurações, exibindo
uma lista rolável de vídeos-tutoriais do YouTube reproduzidos inline via
`youtube_player_iframe`, com catálogo estático em código (2 vídeos no MVP).

## Scope

### In Scope
- Novo destino de navegação "Tutoriais" e rota `/tutorials` no shell.
- Adição da dependência `youtube_player_iframe`.
- Modelo de domínio `Tutorial` e catálogo estático (2 itens placeholder).
- Tela de lista rolável com título + player inline por item.
- Estados de carregamento e erro do player.

### Out of Scope
- Backend/CMS para gerenciar tutoriais.
- Tela de detalhe por vídeo.
- Descrição, thumbnails customizadas, busca ou categorias.
- Analytics de visualização (pode ser story futura).

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Nova aba "Tutoriais" na navegação principal | Must |
| FR-2 | Reprodução inline de vídeos do YouTube | Must |
| FR-3 | Lista rolável de tutoriais (só título + vídeo) | Must |
| FR-4 | Catálogo em código e fácil de estender | Must |
| FR-5 | Estados de carregamento e erro do player | Should |

---

## Domain Concepts

### Key Entities
| Entity | Description | Attributes |
|--------|-------------|------------|
| Tutorial | Um vídeo-tutorial exibido na aba | id, title, youtubeUrl (ou videoId) |

### Key Operations
| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| extractVideoId | Extrai o ID do vídeo a partir da URL do YouTube | youtubeUrl | videoId |
| loadCatalog | Fornece a lista estática de tutoriais do MVP | — | List<Tutorial> |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 3 |
| Must Have | 3 |
| Should Have | 0 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-add-tutorials-tab | Nova aba e rota "Tutoriais" no shell | Must | Planned |
| 002-youtube-inline-player | Player inline do YouTube | Must | Planned |
| 003-tutorials-catalog-list | Catálogo estático + lista rolável | Must | Planned |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| — | Reutiliza shell/rotas existentes |

### Depended By
| Unit | Reason |
|------|--------|
| — | — |

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| YouTube (iframe embed) | Reprodução dos vídeos | Baixo (vídeos devem permitir embed) |
| Pacote `youtube_player_iframe` | Player inline multiplataforma | Baixo |

---

## Technical Context

### Suggested Technology
- Flutter + Riverpod + go_router (padrões do app).
- `youtube_player_iframe` para o player inline.
- Arquitetura por feature: `lib/features/tutorials/{domain,presentation}`.

### Integration Points
| Integration | Type | Protocol |
|-------------|------|----------|
| YouTube | Embed/iframe | HTTPS |
| AppShell / app_router | Navegação | go_router branches |

### Data Storage
| Data | Type | Volume | Retention |
|------|------|--------|-----------|
| Catálogo de tutoriais | Estático em código | 2 itens (MVP) | N/A |

---

## Constraints

- Manter o padrão `StatefulShellRoute.indexedStack` e inserir a aba no índice 3.
- Seguir tema/`AppSpacing`/acessibilidade do app.
- URLs iniciais são placeholders sinalizados para troca.

---

## Success Criteria

### Functional
- [ ] A `NavigationBar` mostra 5 abas: Início, Mapas, Chat, Tutoriais, Configurações.
- [ ] A aba abre a rota `/tutorials` com estado próprio de branch.
- [ ] Os 2 vídeos reproduzem inline sem sair do app.
- [ ] Adicionar um tutorial exige mexer apenas na lista de dados.

### Non-Functional
- [ ] Sem overflow com fontes grandes; rótulos semânticos presentes.
- [ ] Carregamento não trava a UI; erro exibe mensagem amigável.

### Quality
- [ ] Análise estática (flutter analyze) sem novos erros.
- [ ] Todos os critérios de aceite atendidos.

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 026-tutorials-ui | simple-construction-bolt | 001, 002, 003 | Entregar a aba completa de tutoriais |

---

## Notes

Feature pequena e coesa; um único bolt simples cobre as 3 stories. Ponto de
atenção: configuração de plataforma exigida por `youtube_player_iframe`
(WebView) e escolha de vídeos que permitam incorporação.
