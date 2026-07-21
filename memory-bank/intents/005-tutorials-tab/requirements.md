---
intent: 005-tutorials-tab
phase: inception
status: complete
created: 2026-07-20T20:46:00.000Z
updated: 2026-07-20T20:46:00.000Z
---

# Requirements: Aba de Tutoriais

## Intent Overview

Adicionar uma nova aba **Tutoriais** na navegação principal do app mobile,
posicionada **entre as abas Chat e Configurações**. A aba exibe uma lista
rolável de vídeos-tutoriais do YouTube que ensinam, passo a passo, como usar
recursos do dia a dia digital. Para o MVP, a lista traz **2 vídeos** definidos
em código (via URL do YouTube), reproduzidos **inline** dentro do app por meio
de um player embutido, sem sair do aplicativo.

## Business Goals

| Goal | Success Metric | Priority |
|------|----------------|----------|
| Ensinar o usuário com conteúdo em vídeo passo a passo | Usuário consegue abrir a aba e assistir os vídeos sem sair do app | Must |
| Entregar rápido para o MVP | 2 tutoriais renderizados via URL do YouTube, fáceis de trocar/estender | Must |
| Manter consistência de navegação e acessibilidade | Aba integrada à `NavigationBar` seguindo o padrão das demais abas | Must |

---

## Functional Requirements

### FR-1: Nova aba "Tutoriais" na navegação principal
- **Description**: Incluir um novo destino "Tutoriais" na `NavigationBar` do
  `AppShell`, posicionado no índice 3 (entre "Chat" e "Configurações"), com um
  novo `StatefulShellBranch`/rota `/tutorials` no `app_router.dart`.
- **Acceptance Criteria**:
  - A `NavigationBar` passa a exibir 5 abas na ordem: Início, Mapas, Chat,
    Tutoriais, Configurações.
  - Tocar em "Tutoriais" navega para a rota `/tutorials` preservando o
    comportamento de `StatefulShellRoute.indexedStack` (estado por branch).
  - Ícone e rótulo seguem o padrão visual das demais abas (ícone outline +
    selecionado) e possuem `label` acessível.
- **Priority**: Must

### FR-2: Reprodução inline de vídeos do YouTube
- **Description**: Cada tutorial é reproduzido dentro do app por um player
  embutido do YouTube usando a biblioteca `youtube_player_iframe`, a partir da
  URL/ID do vídeo.
- **Acceptance Criteria**:
  - O vídeo carrega e pode ser reproduzido/pausado sem sair do app.
  - A URL do YouTube é convertida corretamente em ID de vídeo para o player.
  - O player respeita a proporção 16:9 e a largura disponível da tela.
- **Priority**: Must

### FR-3: Lista rolável de tutoriais (somente título + vídeo)
- **Description**: A aba apresenta uma lista vertical rolável de cards, cada um
  com o **título** do tutorial acima do player embutido correspondente.
- **Acceptance Criteria**:
  - São exibidos exatamente 2 tutoriais no MVP.
  - Cada item mostra o título e o player do vídeo (sem descrição adicional).
  - A lista rola verticalmente quando o conteúdo excede a altura da tela.
- **Priority**: Must

### FR-4: Catálogo de tutoriais definido em código e fácil de estender
- **Description**: Os tutoriais (título + URL do YouTube) ficam definidos em uma
  fonte de dados estática no código (lista/modelo), permitindo trocar as URLs
  placeholder e adicionar novos itens sem refatorar a UI.
- **Acceptance Criteria**:
  - Existe um modelo de domínio (ex.: `Tutorial`) e uma lista estática dos
    tutoriais do MVP.
  - Adicionar/editar um tutorial exige alterar apenas a lista de dados.
  - As 2 URLs iniciais são placeholders claramente sinalizados para troca.
- **Priority**: Must

### FR-5: Estados de carregamento e erro do player
- **Description**: Enquanto o vídeo inicializa, exibir indicação de
  carregamento; em caso de falha ao carregar, exibir mensagem amigável.
- **Acceptance Criteria**:
  - Há feedback visual durante a inicialização do player.
  - Falha de rede/carregamento não quebra a tela e mostra mensagem de erro.
- **Priority**: Should

---

## Non-Functional Requirements

### Performance
| Requirement | Metric | Target |
|-------------|--------|--------|
| Abertura da aba | Tempo até a lista renderizar | Instantâneo (dados locais) |
| Reprodução | Início do vídeo após toque em play | Depende da rede; sem travar a UI |

### Usabilidade / Acessibilidade
| Requirement | Metric | Target |
|-------------|--------|--------|
| Área de toque da aba | Tamanho mínimo | Segue `AppSpacing.minTouchTarget` |
| Escala de fonte | Respeita `textScaler`/acessibilidade | Sem overflow em fontes grandes |
| Rótulos semânticos | `label`/`semanticLabel` presentes | Sim |

### Compatibilidade
| Requirement | Standard | Notes |
|-------------|----------|-------|
| Plataformas | Android / iOS | `youtube_player_iframe` suporta ambas |

---

## Constraints

### Technical Constraints

**Project-wide standards**: Serão carregados pela Construction Agent a partir de
`memory-bank/standards/` (Flutter + Riverpod + go_router, arquitetura por
feature em `lib/features/...`).

**Intent-specific constraints**:
- Nova dependência obrigatória: `youtube_player_iframe` no `pubspec.yaml`
  (deve ser incluída na execução do bolt).
- Reaproveitar o padrão de `StatefulShellRoute.indexedStack` já existente.
- Manter o padrão de UI (`AppScaffold` ou equivalente, `AppSpacing`, tema).

### Business Constraints
- Escopo MVP: apenas 2 vídeos, definidos em código; sem CMS/backend nesta etapa.

---

## Assumptions

| Assumption | Risk if Invalid | Mitigation |
|------------|-----------------|------------|
| Os vídeos serão públicos no YouTube e permitem embed | Player não carrega | Usar vídeos que permitam incorporação; validar na troca das URLs |
| 2 vídeos placeholder são suficientes para o MVP | Retrabalho | Catálogo em código já fica extensível (FR-4) |
| Reprodução inline é aceitável (sem tela de detalhe) | UX abaixo do esperado | Layout de lista pode evoluir para detalhe depois |

---

## Open Questions

| Question | Owner | Due Date | Resolution |
|----------|-------|----------|------------|
| Quais são as 2 URLs definitivas dos vídeos? | Usuário | Pós-MVP | Pendente — usar placeholders por ora |
