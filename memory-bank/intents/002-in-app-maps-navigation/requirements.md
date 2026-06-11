---
intent: 002-in-app-maps-navigation
phase: inception
status: inception-complete
created: 2026-06-08T18:00:00Z
updated: 2026-06-10T14:00:00Z
---

# Requirements: Mapas e lugares próximos no app

## Intent Overview

Adicionar uma **nova aba de Mapas** ao lado do Chat no shell do app, integrada ao assistente conversacional. Quando o usuário fizer uma pergunta relacionada a **endereços ou lugares próximos** (ex.: "qual a farmácia mais próxima?"), o chat **detecta a intenção**, solicita **permissão de localização**, busca estabelecimentos **no raio do usuário** e **redireciona para a aba Mapas** dentro do app, exibindo o resultado e **traçando rota estática** até o destino.

O usuário também pode **buscar diretamente na aba Mapas**, com auxílio da IA quando necessário. **Renderização do mapa**: **OpenStreetMap** (tiles) + **flutter_map** no Flutter (gratuito). **Backend proxy**: **Google Maps Platform** — Geocoding API (cidade/bairro/CEP), Places Nearby Search (POIs) e Directions API (rota estática), via chave `GOOGLEMAPS_API_KEY` no servidor.

Esta intent complementa `001-digital-guidance`, estendendo o assistente para necessidades do dia a dia que envolvem geolocalização — com linguagem simples e fluxo acessível para analfabetos digitais.

**Problema que resolve**: usuários precisam encontrar serviços físicos próximos (farmácias, postos de saúde, bancos, etc.) mas não sabem usar apps de mapas sozinhos; o assistente interpreta a pergunta e conduz até a rota visual.

**Beneficiários**: usuários do Conecta Geração (20–70+ anos), incluindo **convidados (guest)** sem cadastro.

## Business Goals

| Goal | Success Metric | Priority |
|------|----------------|----------|
| Usuário encontra lugar próximo a partir do chat | % de buscas por localização que resultam em rota exibida no mapa | Must |
| Usuário encontra lugar pela aba Mapas diretamente | % de buscas manuais na aba que exibem resultado | Must |
| Fluxo acessível sem conhecimento prévio de mapas | Feedback positivo em testes de usabilidade | Must |
| Permissão de localização clara com fallback | Fallback por cidade/bairro funcional quando GPS negado | Must |
| Geocodificação BR (CEP/cidade/bairro) funcional em dev | Busca por CEP e bairro retorna coordenadas via Geocoding API | Must |

---

## Functional Requirements

### FR-1: Nova aba Mapas no shell
- **Description**: O app exibe uma aba "Mapas" ao lado de Início/Chat, acessível pela navegação principal. Disponível para usuários autenticados e convidados (guest).
- **Acceptance Criteria**:
  - Usuário logado **ou** convidado vê a aba Mapas na barra de navegação
  - Alvos de toque ≥ 48dp com rótulo textual (conforme `ux-guide.md`)
  - Aba abre tela de mapa em tela cheia dentro do app (sem abrir app externo no fluxo principal)
  - Mapa renderizado com **flutter_map** e tiles **OpenStreetMap** com atribuição visível
- **Priority**: Must

### FR-2: Detecção de intenção de localização no chat
- **Description**: Quando o usuário pergunta sobre lugares, endereços ou proximidade, o assistente reconhece a intenção e inicia fluxo de busca geográfica.
- **Acceptance Criteria**:
  - Perguntas como "farmácia mais próxima", "onde fica o posto de saúde", "tem banco perto?" acionam o fluxo
  - Assistente confirma o **tipo de lugar** buscado antes de buscar (se ambíguo)
  - Assistente pode sugerir **raio de busca** entre 2 km, 5 km ou 10 km quando relevante (padrão 5 km)
  - Resposta do chat inclui ação clara para abrir o mapa com o resultado
- **Priority**: Must

### FR-3: Permissão de localização e fallback por cidade/bairro
- **Description**: Antes da busca por proximidade, o app solicita permissão de localização com explicação em linguagem simples. Se negada, solicita cidade ou bairro para geocodificar e usar como centro da busca.
- **Acceptance Criteria**:
  - Diálogo explica por que a localização é necessária (frases curtas, sem jargão)
  - **Se concedida**: busca usa coordenadas atuais do usuário (GPS)
  - **Se negada**: assistente/app pergunta **cidade, bairro ou CEP**; geocodifica via **Google Geocoding API** (proxy backend) e usa ponto central para busca no raio
  - Mensagem clara quando geocodificação falha (ex.: "Não encontrei esse lugar. Tente outro bairro ou cidade.")
- **Priority**: Must

### FR-4: Busca de lugares no raio (POI)
- **Description**: Sistema busca estabelecimentos das categorias MVP dentro de um raio a partir do centro (GPS ou geocodificado), via **Google Places Nearby Search** (proxy backend).
- **Acceptance Criteria**:
  - **Raio padrão**: 5 km
  - **Raio configurável** na sessão: 2 km, 5 km ou 10 km (IA pode sugerir; usuário confirma)
  - Retorna lista ordenada por distância
  - Exibe nome, endereço resumido e distância em linguagem acessível (ex.: "a 800 metros")
  - **Categorias MVP** (mapeadas para Google Places `type`):
    1. Farmácia
    2. UBS / Posto de Saúde
    3. Hospital / UPA
    4. Banco / Lotérica
    5. Correios
    6. Supermercado
  - Lista vazia exibe mensagem amigável com sugestão (ex.: aumentar raio ou tentar outra categoria)
- **Priority**: Must

### FR-5: Exibição no mapa e rota estática
- **Description**: Ao selecionar um resultado (chat ou aba Mapas), o mapa centraliza origem e destino e desenha **rota estática** (polilinha) entre eles. Sem navegação turn-by-turn no MVP.
- **Acceptance Criteria**:
  - Mapa exibe marcador de origem (usuário ou centro geocodificado) e destino (POI selecionado)
  - Rota estática visível como linha no mapa (via **Google Directions API**, proxy backend)
  - Usuário pode ampliar/reduzir mapa com gestos; controles acessíveis (≥ 48dp) para centralizar rota
  - Distância e tempo estimado exibidos em texto simples (quando Directions retornar)
  - **Fora de escopo MVP**: instruções passo a passo, voz, recálculo em tempo real
- **Priority**: Must

### FR-6: Redirecionamento chat → Mapas
- **Description**: Após busca bem-sucedida iniciada no chat, o app navega para a aba Mapas com o lugar selecionado (ou lista para escolha se múltiplos resultados).
- **Acceptance Criteria**:
  - Transição preserva contexto (categoria buscada, raio, POI selecionado)
  - Usuário pode voltar ao chat sem perder a conversa
  - Mensagem no chat confirma o redirecionamento em linguagem simples
  - Se múltiplos resultados: chat ou tela intermediária permite escolher antes de traçar rota
- **Priority**: Must

### FR-7: Busca direta na aba Mapas
- **Description**: Usuário pode abrir a aba Mapas e buscar lugares sem passar pelo chat, com interface acessível e opcional auxílio da IA.
- **Acceptance Criteria**:
  - Seletor de categoria (6 categorias MVP) com ícone + rótulo textual
  - Campo ou fluxo para informar localização (GPS ou cidade/bairro, mesmo fallback do FR-3)
  - Seletor de raio (2 / 5 / 10 km), padrão 5 km
  - Lista de resultados e seleção abre mapa com rota estática (FR-5)
  - Botão ou atalho "Pedir ajuda à IA" abre chat contextualizado com a busca em andamento (categoria + local)
- **Priority**: Must

### FR-8: Auxílio da IA na aba Mapas
- **Description**: Na aba Mapas, a IA auxilia o usuário a formular busca, escolher categoria ou entender resultados — em linguagem simples.
- **Acceptance Criteria**:
  - IA responde perguntas como "O que é UBS?" ou "Qual farmácia é mais perto?"
  - IA pode sugerir raio (2, 5 ou 10 km) com base no contexto (ex.: área rural vs urbana)
  - IA **não** substitui a busca técnica: dispara fluxo FR-4 após confirmação do usuário
- **Priority**: Should

---

## Non-Functional Requirements

### Performance
| Requirement | Metric | Target |
|-------------|--------|--------|
| Tempo até mapa visível | p95 após permissão concedida | < 3s |
| Busca de POIs (Places) | p95 latência | < 4s |
| Geocodificação (Geocoding API) | p95 latência | < 3s |
| Rota estática (Directions API) | p95 latência | < 3s |

### Accessibility
| Requirement | Standard | Notes |
|-------------|----------|-------|
| UI do mapa | WCAG 2.1 AA + `ux-guide.md` | Contraste, rótulos, alvos ≥ 48dp |
| Textos | Linguagem simples | Frases curtas; evitar "GPS", "coordenadas" — preferir "sua localização" |
| Atribuição OSM | Obrigatória | Crédito OpenStreetMap visível na tela de mapa |

### Privacy
| Requirement | Standard | Notes |
|-------------|----------|-------|
| Localização | LGPD | Coletar apenas quando necessário para busca; não persistir histórico de trajetos no MVP |
| Geocodificação | Minimização | Enviar apenas cidade/bairro informado; não armazenar em servidor além da sessão |

### Reliability
| Requirement | Metric | Target |
|-------------|--------|--------|
| Google Maps Platform (backend) | Degradação graciosa | Mensagem amigável se Geocoding/Places/Directions indisponível; opção de tentar novamente |
| Rate limiting / quota Google | Proxy NestJS + ThrottlerGuard | Chave no servidor; cache geocode in-memory |

---

## Constraints

### Technical Constraints

**Stack híbrida (decisão atualizada 2026-06-10)**:
| Componente | Tecnologia | Custo |
|------------|------------|-------|
| Mapa (tiles) | `flutter_map` + tiles OSM | Gratuito (atribuição obrigatória) |
| POI search (backend) | Google Places Nearby Search | Chave demo / billing Google |
| Geocoding (backend) | Google Geocoding API | Chave demo / billing Google |
| Rota estática (backend) | Google Directions API | Chave demo / billing Google |

**Intent-specific**:
- Integrar com shell/navegação existente (GoRouter)
- Proxy NestJS com `GOOGLEMAPS_API_KEY` — chave nunca no app mobile
- Detecção de intenção no chat: estender assistente IA existente (`003-ai-assistant-api`)
- Mapeamento categoria → Google Places `type` (ADR-011)

### Business Constraints
- Público-alvo de baixa literacia digital: fluxo guiado, poucos passos
- Complementa `001-digital-guidance`; não substitui orientação passo a passo do chat
- Custo de APIs Google após créditos demo — monitorar billing

---

## Assumptions

| Assumption | Risk if Invalid | Mitigation |
|------------|-----------------|------------|
| Google Places cobre POIs nas regiões dos testes | Resultados incompletos em áreas rurais | Validar em testes; mensagem clara quando vazio |
| Quota Google Maps Platform | Indisponibilidade ou billing | ThrottlerGuard; monitorar console Google |
| Geocoding BR (CEP/bairro) | Endereços ambíguos | `components=country:BR`; fallback mensagem amigável |
| Detecção de intenção via IA + confirmação no chat | Falsos positivos | Confirmação de categoria e raio antes de buscar |

---

## Resolved Decisions

| Question | Resolution | Date |
|----------|------------|------|
| Provedor backend maps | Google Maps Platform (Geocoding + Places + Directions) | 2026-06-10 |
| Provedor tiles mapa | OpenStreetMap + flutter_map (gratuito) | 2026-06-08 |
| Raio padrão | 5 km; IA sugere 2, 5 ou 10 km | 2026-06-08 |
| Categorias MVP | Farmácia, UBS/Posto, Hospital/UPA, Banco/Lotérica, Correios, Supermercado | 2026-06-08 |
| Tipo de rota | Rota estática apenas (sem turn-by-turn) | 2026-06-08 |
| Acesso guest | Sim, aba Mapas disponível sem login | 2026-06-08 |
| Busca na aba | Sim, busca direta + auxílio da IA | 2026-06-08 |
| Fallback sem GPS | Perguntar cidade/bairro e geocodificar | 2026-06-08 |

---

## Out of Scope

- Navegação turn-by-turn, voz ou recálculo em tempo real
- Histórico de lugares visitados ou favoritos
- Compartilhar rota via WhatsApp (intent futura)
- Busca por voz
- Integração com transporte público em tempo real
- SDK Google Maps nativo no Flutter (tiles continuam OSM via flutter_map)
